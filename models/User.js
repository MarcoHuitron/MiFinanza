const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  ingresos: { type: Number, default: 0 }
});

module.exports = mongoose.model('Usuario', userSchema);