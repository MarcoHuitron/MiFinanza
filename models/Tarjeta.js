const mongoose = require('mongoose');

const tarjetaSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  numero: { type: String, required: true }
});

module.exports = mongoose.model('Tarjeta', tarjetaSchema);