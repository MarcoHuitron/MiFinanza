const mongoose = require('mongoose');

// Esquema para registrar pagos individuales
const pagoSchema = new mongoose.Schema({
  numeroPago: {
    type: Number,
    required: true
  },
  fechaPago: {
    type: Date,
    default: null
  },
  montoPagado: {
    type: Number,
    required: true
  },
  pagado: {
    type: Boolean,
    default: false
  }
});

// Esquema principal de deudores
const deudorSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  nombre: {
    type: String,
    required: true
  },
  montoTotal: {
    type: Number,
    required: true
  },
  montoPorPago: {
    type: Number,
    required: true
  },
  totalMeses: {
    type: Number,
    required: true,
    min: 1
  },
  diaPago: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  descripcion: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  pagoActual: {
    type: Number,
    default: 1
  },
  proximoPago: {
    type: Date,
    required: true
  },
  pagos: [pagoSchema],
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Índices para mejorar el rendimiento
deudorSchema.index({ usuario_id: 1 });
deudorSchema.index({ proximoPago: 1 });

// Método para calcular la próxima fecha de pago
deudorSchema.methods.calcularProximoPago = function() {
  const fecha = new Date();
  fecha.setDate(this.diaPago);
  
  // Si el día actual es posterior al día de pago, avanzar al mes siguiente
  if (fecha.getDate() > this.diaPago) {
    fecha.setMonth(fecha.getMonth() + 1);
  }
  
  return fecha;
};

// Método para registrar un pago
deudorSchema.methods.registrarPago = function() {
  if (this.pagoActual > this.totalMeses) {
    throw new Error('Todos los pagos ya han sido completados');
  }
  
  // Registrar el pago actual
  const pago = {
    numeroPago: this.pagoActual,
    fechaPago: new Date(),
    montoPagado: this.montoPorPago,
    pagado: true
  };
  
  this.pagos.push(pago);
  
  // Actualizar al siguiente pago
  this.pagoActual += 1;
  
  // Calcular próxima fecha de pago (mes siguiente)
  const proximaFecha = new Date(this.proximoPago);
  proximaFecha.setMonth(proximaFecha.getMonth() + 1);
  this.proximoPago = proximaFecha;
  
  return this;
};

module.exports = mongoose.model('Deudor', deudorSchema);