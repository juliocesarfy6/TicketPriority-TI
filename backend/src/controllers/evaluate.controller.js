const db = require('../db');

// Convierte a número seguro
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// Dado un ticket y un criterio, decide qué valor usar
function getValueForCriterion(ticket, criterio) {
  const name = (criterio.nombre || '').toLowerCase().trim();

  // Heurística según nombre del criterio
  if (name.includes('severidad')) return toNumber(ticket.severidad);
  if (name.includes('impacto')) return toNumber(ticket.impacto);
  if (name.includes('usuario')) return toNumber(ticket.usuarios);

  // Fallback: intentar usar el nombre tal cual como columna
  const directKey = criterio.nombre;
  if (directKey && Object.prototype.hasOwnProperty.call(ticket, directKey)) {
    return toNumber(ticket[directKey]);
  }

  // Último recurso: usar 0
  return 0;
}

/**
 * GET /api/evaluate/matrix
 * Devuelve:
 *  - criterios
 *  - tickets
 *  - matrix: [{ ticket, values: [...] }]
 * Útil para debug visual.
 */
exports.getMatrixPreview = async (req, res) => {
  try {
    const [criterios] = await db.query('SELECT * FROM criterios ORDER BY id');
    const [tickets] = await db.query('SELECT * FROM tickets ORDER BY id');

    const matrix = tickets.map(t => ({
      ticket: t,
      values: criterios.map(c => getValueForCriterion(t, c))
    }));

    res.json({ criterios, tickets, matrix });
  } catch (err) {
    console.error('getMatrixPreview error:', err);
    res.status(500).json({ error: 'DB error en getMatrixPreview' });
  }
};

/**
 * POST /api/evaluate  (o /api/evaluateAll según lo montes en index.js)
 * - Lee criterios y tickets
 * - Normaliza (SAW)
 * - Aplica pesos
 * - Guarda resultados
 * - Actualiza prioridad_saw en tickets
 * - Devuelve ranking
 */
exports.evaluateAll = async (req, res) => {
  const connection = db; // por si luego quieres transacciones

  try {
    const [criterios] = await connection.query('SELECT * FROM criterios ORDER BY id');
    const [tickets] = await connection.query('SELECT * FROM tickets ORDER BY id');

    if (!criterios.length) {
      return res.status(400).json({ error: 'No hay criterios registrados' });
    }

    if (!tickets.length) {
      return res.status(400).json({ error: 'No hay tickets para evaluar' });
    }

    // 1) Normalizar pesos (que sumen 1)
    const pesosOriginales = criterios.map(c => toNumber(c.peso));
    const sumaPesos = pesosOriginales.reduce((acc, p) => acc + p, 0);
    const pesos = sumaPesos > 0
      ? pesosOriginales.map(p => p / sumaPesos)
      : criterios.map(() => 1 / criterios.length); // fallback: todos iguales

    // 2) Construir matriz de valores [ticket][criterio]
    const valuesMatrix = tickets.map(t =>
      criterios.map(c => getValueForCriterion(t, c))
    );

    // 3) Normalizar por columna (criterio) usando SAW
    //    n_ij = v_ij / max_j  (beneficio puro)
    const numTickets = tickets.length;
    const numCriterios = criterios.length;

    const maxPorCriterio = [];
    for (let j = 0; j < numCriterios; j++) {
      let maxVal = 0;
      for (let i = 0; i < numTickets; i++) {
        const v = toNumber(valuesMatrix[i][j]);
        if (v > maxVal) maxVal = v;
      }
      maxPorCriterio[j] = maxVal;
    }

    const normalizedMatrix = valuesMatrix.map((row, i) =>
      row.map((v, j) => {
        const maxVal = maxPorCriterio[j];
        if (maxVal <= 0) return 0;
        return toNumber(v) / maxVal;
      })
    );

    // 4) Calcular score SAW por ticket
    const weightedScores = normalizedMatrix.map(row => {
      return row.reduce((acc, n_ij, j) => acc + n_ij * pesos[j], 0);
    });

    // 5) Limpiar resultados anteriores (opcional)
    await connection.query('DELETE FROM resultados');

    // 6) Guardar resultados e ir actualizando prioridad_saw en tickets
    for (let i = 0; i < tickets.length; i++) {
      const ticketId = tickets[i].id;
      const score = weightedScores[i];

      await connection.query(
        'INSERT INTO resultados (ticket_id, score_saw) VALUES (?, ?)',
        [ticketId, score]
      );

      // Asegúrate de tener la columna prioridad_saw en la tabla tickets
      await connection.query(
        'UPDATE tickets SET prioridad_saw = ? WHERE id = ?',
        [score, ticketId]
      );
    }

    // 7) Construir ranking (ticket + score) ordenado desc
    const ranking = tickets
      .map((t, idx) => ({
        ticket: { ...t, prioridad_saw: weightedScores[idx] },
        score: weightedScores[idx]
      }))
      .sort((a, b) => b.score - a.score);

    res.json({
      ok: true,
      criterios,
      ranking
    });
  } catch (err) {
    console.error('evaluateAll error:', err);
    res.status(500).json({ error: 'DB error en evaluateAll' });
  }
};
