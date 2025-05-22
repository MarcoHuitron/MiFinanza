const mongoose = require('mongoose');

const soporteSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  email: { type: String, required: true }, // <-- Nuevo campo
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Soporte', soporteSchema);