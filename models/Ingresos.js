const mongoose = require('mongoose');

// Esquema principal simplificado
const ingresoSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  tipo: {
    type: String,
    enum: ['deudor', 'ingreso'],
    required: true
  },
  descripcion: { 
    type: String, 
    required: true 
  },
  monto: { 
    type: Number, 
    required: true 
  },
  
  // Campos específicos para deudores
  pagado: { 
    type: Boolean, 
    default: false 
  },
  proximoPago: { 
    type: Date 
  },
  
  // Campos específicos para ingresos
  categoria: { 
    type: String, 
    enum: ['salario', 'extra', 'inversiones', 'negocio', 'prestamo', 'otro']
  },
  notas: { 
    type: String 
  },
  
  // Fecha de creación para todos los registros
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
});

// Índices para mejorar el rendimiento de las consultas
ingresoSchema.index({ usuario_id: 1, tipo: 1 });
ingresoSchema.index({ fechaCreacion: 1 });

// Validación previa antes de guardar
ingresoSchema.pre('validate', function(next) {
  if (this.tipo === 'deudor') {
    if (this.proximoPago === undefined) {
      this.invalidate('proximoPago', 'La fecha del próximo pago es requerida para deudores');
    }
  } else if (this.tipo === 'ingreso') {
    if (!this.categoria) {
      this.invalidate('categoria', 'La categoría es requerida para los ingresos');
    }
  }
  next();
});

module.exports = mongoose.model('Ingreso', ingresoSchema);