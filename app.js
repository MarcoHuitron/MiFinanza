const express = require('express');
const path = require('path');
require('dotenv').config();
require('./db/database'); 

const cors = require('cors'); // <--- Agrega esto

const app = express();

app.use(cors({
  origin: ['https://myfinanza.netlify.app', 'http://localhost:3000'], // <-- Agrega aquí tu dominio de Netlify y local
  credentials: true
}));

const userRoutes = require('./routes/users');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);
app.use('/api/tarjetas', require('./routes/tarjetas'));
app.use('/api/compras', require('./routes/compras'));
const historialRoutes = require('./routes/historial');
app.use('/api/historial', historialRoutes);
const soporteRoutes = require('./routes/soporte');
app.use('/api/soporte', soporteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado a MongoDB y servidor corriendo en http://localhost:${PORT}`);
});
