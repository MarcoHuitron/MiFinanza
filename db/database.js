require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .catch(err => console.error('Error de conexión a MongoDB:', err));

module.exports = mongoose;
