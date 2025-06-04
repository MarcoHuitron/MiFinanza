const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tarjeta_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tarjeta', required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  meses: { type: Number, default: 1 },
  meses_pagados: { type: Number, default: 0 },
  pagada: { type: Boolean, default: false }
});

module.exports = mongoose.model('Compra', compraSchema);