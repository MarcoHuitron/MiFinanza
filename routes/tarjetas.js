const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Obtener tarjetas de un usuario
// GET /api/tarjetas/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = 'SELECT id, nombre, tipo, numero FROM tarjetas WHERE usuario_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error obteniendo tarjetas:', err);
      return res.status(500).json({ error: 'Error al obtener tarjetas' });
    }
    res.json(results);
  });
});

// Agregar nueva tarjeta
// POST /api/tarjetas
router.post('/', (req, res) => {
  const { usuario_id, nombre, tipo, numero } = req.body;
  if (!usuario_id || !nombre || !tipo || !numero) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const sql = 'INSERT INTO tarjetas (usuario_id, nombre, tipo, numero) VALUES (?, ?, ?, ?)';
  db.query(sql, [usuario_id, nombre, tipo, numero], (err, result) => {
    if (err) {
      console.error('Error agregando tarjeta:', err);
      return res.status(500).json({ error: 'Error al agregar tarjeta' });
    }
    res.status(201).json({ id: result.insertId, usuario_id, nombre, tipo, numero });
  });
});

// Eliminar tarjeta
// DELETE /api/tarjetas/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tarjetas WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar la tarjeta' });
    res.json({ success: true });
  });
});

module.exports = router;
