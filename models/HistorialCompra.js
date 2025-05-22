const mongoose = require('mongoose');

const historialCompraSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  descripcion: String,
  monto: Number,
  fecha: { type: Date, default: Date.now },
  tarjeta: String,
  meses: Number,
  mes_historial: Number,
  anio_historial: Number
});

module.exports = mongoose.model('HistorialCompra', historialCompraSchema);