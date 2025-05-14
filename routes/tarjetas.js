const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Obtener tarjetas de un usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const sql = 'SELECT id, nombre, tipo, numero FROM tarjetas WHERE usuario_id = ?';
  try {
    const [results] = await db.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Error obteniendo tarjetas:', err);
    res.status(500).json({ error: 'Error al obtener tarjetas' });
  }
});

// Agregar nueva tarjeta
router.post('/', async (req, res) => {
  const { usuario_id, nombre, tipo, numero } = req.body;
  if (!usuario_id || !nombre || !tipo || !numero) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const sql = 'INSERT INTO tarjetas (usuario_id, nombre, tipo, numero) VALUES (?, ?, ?, ?)';
  try {
    const [result] = await db.query(sql, [usuario_id, nombre, tipo, numero]);
    res.status(201).json({ id: result.insertId, usuario_id, nombre, tipo, numero });
  } catch (err) {
    console.error('Error agregando tarjeta:', err);
    res.status(500).json({ error: 'Error al agregar tarjeta' });
  }
});

// Eliminar tarjeta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tarjetas WHERE id = ?';
  try {
    await db.query(sql, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la tarjeta' });
  }
});

module.exports = router;
