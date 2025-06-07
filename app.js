const express = require('express');
const path = require('path');
require('dotenv').config();
require('./db/database'); 

const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['https://myfinanza.netlify.app', 'http://localhost:3000', 'http://localhost:5500'], 
  credentials: true
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

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

app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
