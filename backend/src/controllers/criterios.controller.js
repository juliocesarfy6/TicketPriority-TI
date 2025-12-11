const db = require('../db');

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM criterios ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('getAll criterios error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, peso } = req.body;

    const p = toNumberOrNull(peso);

    if (!nombre || p === null) {
      return res.status(400).json({
        error: 'Campos obligatorios: nombre, peso (numérico entre 0 y 1)'
      });
    }

    if (p < 0 || p > 1) {
      return res.status(400).json({ error: 'El peso debe estar entre 0 y 1' });
    }

    const [result] = await db.query(
      'INSERT INTO criterios (nombre, peso) VALUES (?, ?)',
      [nombre, p]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      peso: p
    });
  } catch (err) {
    console.error('create criterio error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, peso } = req.body;

    const p = toNumberOrNull(peso);

    if (!nombre || p === null) {
      return res.status(400).json({
        error: 'Campos obligatorios: nombre, peso (numérico entre 0 y 1)'
      });
    }

    if (p < 0 || p > 1) {
      return res.status(400).json({ error: 'El peso debe estar entre 0 y 1' });
    }

    const [result] = await db.query(
      'UPDATE criterios SET nombre = ?, peso = ? WHERE id = ?',
      [nombre, p, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Criterio no encontrado' });
    }

    res.json({
      id: Number(req.params.id),
      nombre,
      peso: p
    });
  } catch (err) {
    console.error('update criterio error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM criterios WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Criterio no encontrado' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('remove criterio error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};
