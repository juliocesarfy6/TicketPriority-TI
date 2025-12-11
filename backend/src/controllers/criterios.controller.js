const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM criterios ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, peso } = req.body;
    const [result] = await db.query('INSERT INTO criterios (nombre, peso) VALUES (?, ?)', [nombre, peso]);
    const [rows] = await db.query('SELECT * FROM criterios WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, peso } = req.body;
    await db.query('UPDATE criterios SET nombre=?, peso=? WHERE id=?', [nombre, peso, req.params.id]);
    const [rows] = await db.query('SELECT * FROM criterios WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM criterios WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};
