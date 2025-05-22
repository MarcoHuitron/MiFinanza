const express = require('express');
const router = express.Router();
const HistorialCompra = require('../models/HistorialCompra');

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const historial = await HistorialCompra.find({ usuario_id: userId })
      .sort({ anio_historial: -1, mes_historial: -1, fecha: -1 });
    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;