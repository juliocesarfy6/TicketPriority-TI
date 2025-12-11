const db = require('../db');

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('getAll tickets error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    console.error('getById ticket error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { descripcion, severidad, impacto, usuarios } = req.body;

    const sev = toNumberOrNull(severidad);
    const imp = toNumberOrNull(impacto);
    const usu = toNumberOrNull(usuarios);

    if (!descripcion || sev === null || imp === null || usu === null) {
      return res.status(400).json({
        error: 'Campos obligatorios: descripcion, severidad, impacto, usuarios (numéricos)'
      });
    }

    const [result] = await db.query(
      'INSERT INTO tickets (descripcion, severidad, impacto, usuarios) VALUES (?, ?, ?, ?)',
      [descripcion, sev, imp, usu]
    );

    res.status(201).json({
      id: result.insertId,
      descripcion,
      severidad: sev,
      impacto: imp,
      usuarios: usu,
      prioridad_saw: 0
    });
  } catch (err) {
    console.error('create ticket error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { descripcion, severidad, impacto, usuarios } = req.body;

    const sev = toNumberOrNull(severidad);
    const imp = toNumberOrNull(impacto);
    const usu = toNumberOrNull(usuarios);

    if (!descripcion || sev === null || imp === null || usu === null) {
      return res.status(400).json({
        error: 'Campos obligatorios: descripcion, severidad, impacto, usuarios (numéricos)'
      });
    }

    const [result] = await db.query(
      'UPDATE tickets SET descripcion = ?, severidad = ?, impacto = ?, usuarios = ? WHERE id = ?',
      [descripcion, sev, imp, usu, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({
      id: Number(req.params.id),
      descripcion,
      severidad: sev,
      impacto: imp,
      usuarios: usu
    });
  } catch (err) {
    console.error('update ticket error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tickets WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('remove ticket error:', err);
    res.status(500).json({ error: 'DB error' });
  }
};
