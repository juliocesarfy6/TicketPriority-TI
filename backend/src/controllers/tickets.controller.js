const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { descripcion, severidad, impacto, usuarios } = req.body;
    const [result] = await db.query(
      'INSERT INTO tickets (descripcion, severidad, impacto, usuarios) VALUES (?, ?, ?, ?)',
      [descripcion, severidad, impacto, usuarios]
    );
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { descripcion, severidad, impacto, usuarios } = req.body;
    await db.query(
      'UPDATE tickets SET descripcion=?, severidad=?, impacto=?, usuarios=? WHERE id=?',
      [descripcion, severidad, impacto, usuarios, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM tickets WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
};
