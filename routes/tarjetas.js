const express = require('express');
const router = express.Router();
const Tarjeta = require('../models/Tarjeta');

// Obtener tarjetas de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const tarjetas = await Tarjeta.find({ usuario_id: req.params.userId });
    res.json(tarjetas);
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
  try {
    const nuevaTarjeta = new Tarjeta({ usuario_id, nombre, tipo, numero });
    await nuevaTarjeta.save();
    res.status(201).json(nuevaTarjeta);
  } catch (err) {
    console.error('Error agregando tarjeta:', err);
    res.status(500).json({ error: 'Error al agregar tarjeta' });
  }
});

// Eliminar tarjeta
router.delete('/:id', async (req, res) => {
  try {
    await Tarjeta.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la tarjeta' });
  }
});

module.exports = router;
