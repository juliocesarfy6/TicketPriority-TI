const db = require("../db");

// Convierte a número seguro
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// Dado un ticket y un criterio, decide qué valor usar
function getValueForCriterion(ticket, criterio) {
  const name = (criterio.nombre || "").toLowerCase().trim();

  // Heurística según nombre del criterio
  if (name.includes("severidad")) return toNumber(ticket.severidad);
  if (name.includes("impacto")) return toNumber(ticket.impacto);
  if (name.includes("usuario")) return toNumber(ticket.usuarios);

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
    const [criterios] = await db.query("SELECT * FROM criterios ORDER BY id");
    const [tickets] = await db.query("SELECT * FROM tickets ORDER BY id");

    const matrix = tickets.map((t) => ({
      ticket: t,
      values: criterios.map((c) => getValueForCriterion(t, c)),
    }));

    res.json({ criterios, tickets, matrix });
  } catch (err) {
    console.error("getMatrixPreview error:", err);
    res.status(500).json({ error: "DB error en getMatrixPreview" });
  }
};

function obtenerCategoria(score) {
  if (score >= 0.8) {
    // Top 20% del rango posible
    return { etiqueta: "URGENTE ", clase: "table-danger" };
  } else if (score >= 0.5) {
    return { etiqueta: "PRIORIDAD ALTA ", clase: "table-warning" };
  } else if (score >= 0.3) {
    return { etiqueta: "MEDIA ", clase: "table-info" };
  } else {
    return { etiqueta: "BAJA ", clase: "" };
  }
}
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
  const connection = db;

  try {
    //  Obtener Criterios
    const [criterios] = await connection.query(
      "SELECT * FROM criterios ORDER BY id"
    );

    // Obtener TODOS los tickets
    let [tickets] = await connection.query("SELECT * FROM tickets ORDER BY id");

    if (!criterios.length) {
      return res.status(400).json({ error: "No hay criterios registrados" });
    }

    const { ticketIds } = req.body;

    // Si el usuario envió una lista de IDs, filtramos los tickets
    if (ticketIds && Array.isArray(ticketIds) && ticketIds.length > 0) {
      const idsPermitidos = ticketIds.map((id) => Number(id));

      tickets = tickets.filter((t) => idsPermitidos.includes(t.id));
    }

    if (!tickets.length) {
      return res.status(400).json({
        error: "No hay tickets para evaluar (seleccione al menos uno)",
      });
    }

    const pesosOriginales = criterios.map((c) => toNumber(c.peso));
    const sumaPesos = pesosOriginales.reduce((acc, p) => acc + p, 0);
    const pesos =
      sumaPesos > 0
        ? pesosOriginales.map((p) => p / sumaPesos)
        : criterios.map(() => 1 / criterios.length);

    //  Construir matriz de valores
    const valuesMatrix = tickets.map((t) =>
      criterios.map((c) => getValueForCriterion(t, c))
    );

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

    // Calcular score SAW final
    const weightedScores = normalizedMatrix.map((row) => {
      return row.reduce((acc, n_ij, j) => acc + n_ij * pesos[j], 0);
    });

    // Limpiar resultados anteriores
    await connection.query("DELETE FROM resultados");

    // Guardar nuevos resultados
    for (let i = 0; i < tickets.length; i++) {
      const ticketId = tickets[i].id;
      const score = weightedScores[i];

      await connection.query(
        "INSERT INTO resultados (ticket_id, score_saw) VALUES (?, ?)",
        [ticketId, score]
      );

      // Actualizamos el ticket con su nuevo score
      await connection.query(
        "UPDATE tickets SET prioridad_saw = ? WHERE id = ?",
        [score, ticketId]
      );
    }

    // Armar respuesta para el Frontend
    const ranking = tickets
      .map((t, idx) => {
        const puntajeFinal = weightedScores[idx];
        const infoCategoria = obtenerCategoria(puntajeFinal); // <--- Calculamos categoría

        return {
          ticket: { ...t, prioridad_saw: puntajeFinal },
          puntaje: puntajeFinal,
          // Agregamos estos datos extra para el HTML:
          categoria_nombre: infoCategoria.etiqueta,
          clase_css: infoCategoria.clase,
        };
      })
      .sort((a, b) => b.puntaje - a.puntaje);

    res.json({
      ok: true,
      criterios,
      ranking,
    });
  } catch (err) {
    console.error("evaluateAll error:", err);
    res.status(500).json({ error: "DB error en evaluateAll" });
  }
};
