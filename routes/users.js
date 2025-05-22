const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/User');

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, email, contraseña } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new Usuario({ nombre, email, contraseña: hashedPassword });
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const contraseñaCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

// GET /api/users/:id/ingresos
router.get('/:id/ingresos', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    res.json({ ingresos: usuario?.ingresos ?? 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los ingresos' });
  }
});

// PUT /api/users/:id/ingresos
router.put('/:id/ingresos', async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, { ingresos: req.body.ingresos });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar los ingresos' });
  }
});

module.exports = router;
