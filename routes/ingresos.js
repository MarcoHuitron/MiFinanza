const express = require('express');
const router = express.Router();
// Cambia esta línea para usar el nombre exacto del archivo
const Ingreso = require('../models/Ingresos');

// GET /api/ingresos/:userId
// Obtener todos los ingresos de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const ingresos = await Ingreso.find({ 
      usuario_id: req.params.userId,
      tipo: 'ingreso'
    });
    res.json(ingresos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos', detalles: err.message });
  }
});

// GET /api/ingresos/:userId/extras
// Obtener solo los ingresos extra de un usuario
router.get('/:userId/extras', async (req, res) => {
  try {
    const extras = await Ingreso.find({ 
      usuario_id: req.params.userId,
      tipo: 'ingreso'
    });
    res.json(extras);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos extra', detalles: err.message });
  }
});

// POST /api/ingresos/extra
// Crear un nuevo ingreso extra
router.post('/extra', async (req, res) => {
  try {
    const { 
      usuario_id, 
      descripcion, 
      monto, 
      categoria,
      notas 
    } = req.body;

    if (!usuario_id || !descripcion || !monto || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevoIngreso = new Ingreso({
      usuario_id,
      tipo: 'ingreso',
      descripcion,
      monto,
      categoria,
      notas
    });

    await nuevoIngreso.save();
    res.status(201).json(nuevoIngreso);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ingreso extra', detalles: err.message });
  }
});

// PUT /api/ingresos/:id
// Actualizar un ingreso
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;

    // Evitar cambiar el tipo
    delete actualizacion.tipo;
    
    const ingresoActualizado = await Ingreso.findByIdAndUpdate(
      id, 
      actualizacion,
      { new: true, runValidators: true }
    );

    if (!ingresoActualizado) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    res.json(ingresoActualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ingreso', detalles: err.message });
  }
});

// DELETE /api/ingresos/:id
// Eliminar un ingreso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await Ingreso.findByIdAndDelete(id);

    if (!resultado) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    res.json({ mensaje: 'Ingreso eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ingreso', detalles: err.message });
  }
});

// GET /api/ingresos/resumen/:userId
// Obtener resumen de ingresos
router.get('/resumen/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Ingresos extras del mes
    const ingresosExtraMes = await Ingreso.aggregate([
      { 
        $match: { 
          usuario_id: userId,
          tipo: 'ingreso',
          fechaCreacion: { $gte: inicioMes }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto' }
        }
      }
    ]);

    const resumen = {
      ingresosExtraMes: ingresosExtraMes.length > 0 ? ingresosExtraMes[0].total : 0,
      totalIngresosMes: ingresosExtraMes.length > 0 ? ingresosExtraMes[0].total : 0
    };

    res.json(resumen);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen', detalles: err.message });
  }
});

module.exports = router;