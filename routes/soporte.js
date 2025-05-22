const express = require('express');
const router = express.Router();
const Soporte = require('../models/Soporte');

router.post('/', async (req, res) => {
  const { usuario_id, email, mensaje } = req.body;
  if (!mensaje || !email) return res.status(400).json({ error: 'Mensaje y correo requeridos' });
  try {
    await Soporte.create({ usuario_id, email, mensaje });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

module.exports = router;