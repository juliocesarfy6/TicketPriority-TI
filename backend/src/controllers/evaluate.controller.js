const db = require('../db');

function toNumber(v){ return Number(v) || 0; }

exports.getMatrixPreview = async (req, res) => {
  try {
    const [criterios] = await db.query('SELECT * FROM criterios ORDER BY id');
    const [tickets] = await db.query('SELECT * FROM tickets ORDER BY id');
    // construir matriz
    const matrix = tickets.map(t => ({
      ticket,
      values: criterios.map(c => {
        if (c.nombre.toLowerCase().includes('severidad')) return t.severidad;
        if (c.nombre.toLowerCase().includes('impacto')) return t.impacto;
        if (c.nombre.toLowerCase().includes('usuarios')) return t.usuarios;
        // fallback: buscar columna con mismo nombre
        return t[c.nombre] ?? 0;
      })
    }));
    res.json({ criterios, tickets, matrix });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.evaluateAll = async (req, res) => {
  try {
    // traer criterios y tickets
    const [criterios] = await db.query('SELECT * FROM criterios ORDER BY id');
    const [tickets] = await db.query('SELECT * FROM tickets ORDER BY id');

    if (criterios.length === 0 || tickets.length === 0) {
      return res.status(400).json({ error: 'Faltan criterios o tickets' });
    }

    // construir matriz de valores (cada fila = ticket, cada columna = criterio)
    const values = tickets.map(t => criterios.map(c => {
      const name = c.nombre.toLowerCase();
      if (name.includes('severidad')) return toNumber(t.severidad);
      if (name.includes('impacto')) return toNumber(t.impacto);
      if (name.includes('usuarios')) return toNumber(t.usuarios);
      // si no coincide, intentar obtener por propiedad
      return toNumber(t[c.nombre]) || 0;
    }));

    // Normalización: para criterios de tipo beneficio: val / max(col)
    const cols = criterios.length;
    const rows = tickets.length;

    // calcular maximos por columna
    const maxPerCol = Array(cols).fill(0);
    for (let j=0;j<cols;j++){
      for (let i=0;i<rows;i++){
        if (values[i][j] > maxPerCol[j]) maxPerCol[j] = values[i][j];
      }
      if (maxPerCol[j] === 0) maxPerCol[j] = 1; // evitar división por 0
    }

    // normalizar y multiplicar por peso
    const weightedScores = []; // por ticket
    for (let i=0;i<rows;i++){
      let sum = 0;
      for (let j=0;j<cols;j++){
        const val = values[i][j];
        const normalized = val / maxPerCol[j];
        const peso = Number(criterios[j].peso) || 0;
        sum += normalized * peso;
      }
      weightedScores.push(sum);
    }

    // guardar resultados en tabla resultados y actualizar prioridad_saw en tickets
    // opcional: limpiar resultados previos
    await db.query('DELETE FROM resultados');

    for (let i=0;i<rows;i++){
      const ticketId = tickets[i].id;
      const score = weightedScores[i];
      await db.query('INSERT INTO resultados (ticket_id, score_saw) VALUES (?, ?)', [ticketId, score]);
      await db.query('UPDATE tickets SET prioridad_saw = ? WHERE id = ?', [score, ticketId]);
    }

    // devolver ranking
    const ranking = tickets.map((t, idx) => ({ ticket: t, score: weightedScores[idx] }))
                         .sort((a,b) => b.score - a.score);

    res.json({ ok: true, ranking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};
