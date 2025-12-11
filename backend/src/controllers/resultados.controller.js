const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, t.descripcion, t.severidad, t.impacto, t.usuarios
       FROM resultados r
       JOIN tickets t ON t.id = r.ticket_id
       ORDER BY r.score_saw DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};
