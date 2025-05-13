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
    db.query(query, [nombre, email, hashedPassword], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al registrar' });
      res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al encriptar contraseña' });
  }
});

// Login de usuario
router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la consulta' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];
    const contraseñaCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaCorrecta) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Puedes retornar solo los datos necesarios
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      }
    });
  });
});

// GET /api/users/:id/ingresos
router.get('/:id/ingresos', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT ingresos FROM usuarios WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener los ingresos:', err);
      return res.status(500).json({ error: 'Error al obtener los ingresos' });
    }
    const ingresos = results[0]?.ingresos ?? 0;
    res.json({ ingresos });
  });
});

// PUT /api/users/:id/ingresos
router.put('/:id/ingresos', (req, res) => {
  const { id } = req.params;
  const { ingresos } = req.body;
  const sql = 'UPDATE usuarios SET ingresos = ? WHERE id = ?';
  db.query(sql, [ingresos, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar los ingresos:', err);
      return res.status(500).json({ error: 'Error al actualizar los ingresos' });
    }
    res.json({ success: true });
  });
});


module.exports = router;
