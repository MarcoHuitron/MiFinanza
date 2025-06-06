const express = require('express');
const path = require('path');
require('dotenv').config();
require('./db/database'); 

const cors = require('cors');

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://myfinanza.netlify.app', 'http://localhost:3000', 'http://localhost:5500'], 
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
try {
  app.use('/api/users', require('./routes/users'));
  app.use('/api/tarjetas', require('./routes/tarjetas'));
  app.use('/api/compras', require('./routes/compras'));
  app.use('/api/historial', require('./routes/historial'));
  app.use('/api/soporte', require('./routes/soporte'));
  app.use('/api/ingresos', require('./routes/ingresos'));
  app.use('/api/deudores', require('./routes/deudores'));
  
  console.log('Todas las rutas cargadas correctamente');
} catch (error) {
  console.error('Error cargando rutas:', error.message);
}

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Puerto y arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
