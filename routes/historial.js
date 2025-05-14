const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM historial_compras WHERE usuario_id = ? ORDER BY anio_historial DESC, mes_historial DESC, fecha DESC',
      [userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;