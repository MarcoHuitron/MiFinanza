const express = require('express');
const router = express.Router();
const Compra = require('../models/Compra');
const Tarjeta = require('../models/Tarjeta');
const HistorialCompra = require('../models/HistorialCompra');

// GET /api/compras/:userId
router.get('/:userId', async (req, res) => {
  try {
    const compras = await Compra.find({ usuario_id: req.params.userId }).populate('tarjeta_id');
    // Formatea la respuesta para incluir el nombre de la tarjeta
    const result = compras.map(c => ({
      id: c._id,
      descripcion: c.descripcion,
      monto: c.monto,
      fecha: c.fecha,
      meses: c.meses,
      meses_pagados: c.meses_pagados,
      tarjeta: c.tarjeta_id?.nombre || ''
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar compras' });
  }
});

// POST /api/compras
router.post('/', async (req, res) => {
  const { usuario_id, tarjeta_id, descripcion, monto, meses } = req.body;
  console.log('Datos recibidos:', req.body);
  if (!usuario_id || !tarjeta_id || !descripcion || !monto) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const compra = new Compra({
      usuario_id,
      tarjeta_id,
      descripcion,
      monto,
      meses: meses || 1
    });
    await compra.save();
    res.json({ success: true, id: compra._id });
  } catch (err) {
    console.error('Error al guardar la compra:', err);
    res.status(500).json({ error: 'Error al guardar la compra' });
  }
});

// DELETE /api/compras/:id
router.delete('/:id', async (req, res) => {
  try {
    await Compra.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la compra' });
  }
});

// POST /api/compras/reiniciar-mes/:userId
router.post('/reiniciar-mes/:userId', async (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  try {
    // 1. Mueve compras de débito o meses=1 al historial
    const comprasDebito = await Compra.find({ usuario_id: userId, meses: 1 });
    for (const compra of comprasDebito) {
      const tarjeta = await Tarjeta.findById(compra.tarjeta_id);
      await HistorialCompra.create({
        usuario_id: compra.usuario_id,
        descripcion: compra.descripcion,
        monto: compra.monto,
        fecha: compra.fecha,
        tarjeta: tarjeta?.nombre || '',
        meses: compra.meses,
        mes_historial: mes,
        anio_historial: anio
      });
      await compra.deleteOne();
    }

    // 2. Para compras a meses, registra el pago mensual en el historial y actualiza meses_pagados
    const comprasMeses = await Compra.find({ usuario_id: userId, meses: { $gt: 1 } });
    for (const compra of comprasMeses) {
      const tarjeta = await Tarjeta.findById(compra.tarjeta_id);
      const pagoMensual = compra.monto / compra.meses;
      await HistorialCompra.create({
        usuario_id: compra.usuario_id,
        descripcion: `${compra.descripcion} (Pago mensual ${compra.meses_pagados + 1}/${compra.meses})`,
        monto: pagoMensual,
        fecha: new Date(),
        tarjeta: tarjeta?.nombre || '',
        meses: compra.meses,
        mes_historial: mes,
        anio_historial: anio
      });

      if (compra.meses_pagados + 1 >= compra.meses) {
        await compra.deleteOne();
      } else {
        compra.meses_pagados += 1;
        await compra.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error en cierre de mes:', err);
    res.status(500).json({ error: 'Error al reiniciar el mes' });
  }
});

// PUT /api/compras/:id
router.put('/:id', async (req, res) => {
  try {
    const { descripcion, monto, meses } = req.body;
    const compraActualizada = await Compra.findByIdAndUpdate(
      req.params.id,
      { descripcion, monto, meses },
      { new: true }
    );
    res.json({ success: true, compraActualizada });
  } catch (e) {
    res.status(500).json({ error: 'Error actualizando compra' });
  }
});

// GET /api/compras/compra/:id
router.get('/compra/:id', async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(compra);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar la compra' });
  }
});

module.exports = router;
