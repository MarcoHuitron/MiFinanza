const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');

// Registrar usuario
router.post('/register', async (req, res) => {
  console.log('–– llego petición REGISTER ––', req.body);
  const { nombre, email, contraseña } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const query = 'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)';
    await db.query(query, [nombre, email, hashedPassword]);
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ?';

  try {
    const [results] = await db.query(query, [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const usuario = results[0];
    const contraseñaCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
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
  const { id } = req.params;
  const sql = 'SELECT ingresos FROM usuarios WHERE id = ?';
  try {
    const [results] = await db.query(sql, [id]);
    const ingresos = results[0]?.ingresos ?? 0;
    res.json({ ingresos });
  } catch (err) {
    console.error('Error al obtener los ingresos:', err);
    res.status(500).json({ error: 'Error al obtener los ingresos' });
  }
});

// PUT /api/users/:id/ingresos
router.put('/:id/ingresos', async (req, res) => {
  const { id } = req.params;
  const { ingresos } = req.body;
  const sql = 'UPDATE usuarios SET ingresos = ? WHERE id = ?';
  try {
    await db.query(sql, [ingresos, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar los ingresos:', err);
    res.status(500).json({ error: 'Error al actualizar los ingresos' });
  }
});

module.exports = router;
