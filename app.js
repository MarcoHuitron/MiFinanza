// app.js (versión actualizada)
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const userRoutes = require('./routes/users');

// 1) Parsear JSON
app.use(express.json());

// 2) Servir carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// 3) Rutas de API
app.use('/api/users', userRoutes);
app.use('/api/tarjetas', require('./routes/tarjetas'));
app.use('/api/compras', require('./routes/compras'));
const historialRoutes = require('./routes/historial');
app.use('/api/historial', historialRoutes);
const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

// 4) Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado a MySQL y servidor corriendo en http://localhost:${PORT}`);
});
