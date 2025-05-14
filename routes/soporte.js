const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', async (req, res) => {
  const { usuario_id, mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });
  try {
    await db.query('INSERT INTO soporte (usuario_id, mensaje) VALUES (?, ?)', [usuario_id, mensaje]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el mensaje' });
  }
});

module.exports = router;