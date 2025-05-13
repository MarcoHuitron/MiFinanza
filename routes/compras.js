const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/compras/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT c.id, c.descripcion, c.monto, c.fecha, c.meses, t.nombre AS tarjeta
    FROM compras c
    LEFT JOIN tarjetas t ON c.tarjeta_id = t.id
    WHERE c.usuario_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar compras' });
    res.json(results);
  });
});

// POST /api/compras
router.post('/', (req, res) => {
  const { usuario_id, tarjeta_id, descripcion, monto, meses } = req.body;
  const sql = `
    INSERT INTO compras (usuario_id, tarjeta_id, descripcion, monto, meses, fecha)
    VALUES (?, ?, ?, ?, ?, NOW())`;
  db.query(sql, [usuario_id, tarjeta_id, descripcion, monto, meses || 1], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar la compra' });
    res.json({ success: true, id: result.insertId });
  });
});

// DELETE /api/compras/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM compras WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar la compra' });
    res.json({ success: true });
  });
});

module.exports = router;
