const mongoose = require('mongoose');

const ingresoSchema = new mongoose.Schema({
  usuario_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  tipo: {
    type: String,
    enum: ['ingreso'], 
    default: 'ingreso',
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
  categoria: { 
    type: String, 
    enum: ['salario', 'extra', 'inversiones', 'negocio', 'prestamo', 'otro'],
    required: true
  },
  notas: { 
    type: String 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }
});

ingresoSchema.index({ usuario_id: 1 });
ingresoSchema.index({ fechaCreacion: 1 });

ingresoSchema.pre('validate', function(next) {
  next();
});

module.exports = mongoose.model('Ingresos', ingresoSchema);