const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/compras/:userId
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT c.id, c.descripcion, c.monto, c.fecha, t.nombre AS tarjeta
    FROM compras c
    LEFT JOIN tarjetas t ON c.tarjeta_id = t.id
    WHERE c.usuario_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar compras' });
    res.json(results);
  });
});

module.exports = router;
