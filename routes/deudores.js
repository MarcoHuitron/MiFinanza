const express = require('express');
const router = express.Router();
const Deudor = require('../models/deudores');

// GET /api/deudores/:userId
// Obtener todos los deudores de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const deudores = await Deudor.find({ usuario_id: req.params.userId });
    res.json(deudores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener deudores', detalles: err.message });
  }
});

// POST /api/deudores
// Crear un nuevo deudor
router.post('/', async (req, res) => {
  try {
    const { 
      usuario_id, 
      nombre, 
      montoTotal,
      totalMeses, 
      diaPago,
      descripcion 
    } = req.body;

    // Validaciones básicas
    if (!usuario_id || !nombre || !montoTotal || !totalMeses || !diaPago || !descripcion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Calcular monto por pago
    const montoPorPago = Math.round((montoTotal / totalMeses) * 100) / 100;
    
    // Calcular fecha del primer pago
    const fechaInicio = new Date();
    const proximoPago = new Date();
    proximoPago.setDate(diaPago);
    if (proximoPago.getDate() < new Date().getDate()) {
      proximoPago.setMonth(proximoPago.getMonth() + 1);
    }

    // Inicializar array de pagos
    const pagos = [];
    for (let i = 1; i <= totalMeses; i++) {
      pagos.push({
        numeroPago: i,
        montoPagado: montoPorPago,
        pagado: false
      });
    }

    const nuevoDeudor = new Deudor({
      usuario_id,
      nombre,
      montoTotal,
      montoPorPago,
      totalMeses,
      diaPago,
      descripcion,
      fechaInicio,
      proximoPago,
      pagos,
    });

    await nuevoDeudor.save();
    res.status(201).json(nuevoDeudor);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear deudor', detalles: err.message });
  }
});

// PUT /api/deudores/:id/pagar
// Registrar un pago para un deudor
router.put('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deudor = await Deudor.findById(id);
    if (!deudor) {
      return res.status(404).json({ error: 'Deudor no encontrado' });
    }

    // Verificar si ya se completaron todos los pagos
    if (deudor.pagoActual > deudor.totalMeses) {
      return res.status(400).json({ error: 'Todos los pagos ya han sido completados' });
    }

    // Registrar el pago
    deudor.registrarPago();
    
    await deudor.save();
    res.json({ 
      mensaje: `Pago ${deudor.pagoActual-1}/${deudor.totalMeses} registrado con éxito`,
      deudor 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar pago', detalles: err.message });
  }
});

// DELETE /api/deudores/:id
// Eliminar un deudor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await Deudor.findByIdAndDelete(id);
    
    if (!resultado) {
      return res.status(404).json({ error: 'Deudor no encontrado' });
    }
    
    res.json({ mensaje: 'Deudor eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar deudor', detalles: err.message });
  }
});

module.exports = router;