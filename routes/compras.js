const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/compras/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT c.id, c.descripcion, c.monto, c.fecha, c.meses, c.meses_pagados, t.nombre AS tarjeta
    FROM compras c
    LEFT JOIN tarjetas t ON c.tarjeta_id = t.id
    WHERE c.usuario_id = ?`;
  try {
    const [results] = await db.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar compras' });
  }
});

// POST /api/compras
router.post('/', async (req, res) => {
  const { usuario_id, tarjeta_id, descripcion, monto, meses } = req.body;
  const sql = `
    INSERT INTO compras (usuario_id, tarjeta_id, descripcion, monto, meses, fecha)
    VALUES (?, ?, ?, ?, ?, NOW())`;
  try {
    const [result] = await db.query(sql, [usuario_id, tarjeta_id, descripcion, monto, meses || 1]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la compra' });
  }
});

// DELETE /api/compras/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM compras WHERE id = ?';
  try {
    await db.query(sql, [id]);
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
    // 1. Mueve compras de débito o meses=1 al historial (como antes)
    const moveDebitoToHistorial = `
      INSERT INTO historial_compras (usuario_id, descripcion, monto, fecha, tarjeta, meses, mes_historial, anio_historial)
      SELECT c.usuario_id, c.descripcion, c.monto, c.fecha, t.nombre, c.meses, ?, ?
      FROM compras c
      LEFT JOIN tarjetas t ON c.tarjeta_id = t.id
      WHERE c.usuario_id = ? AND c.meses = 1
    `;
    await db.query(moveDebitoToHistorial, [mes, anio, userId]);
    await db.query('DELETE FROM compras WHERE usuario_id = ? AND meses = 1', [userId]);

    // 2. Para compras a meses, registra el pago mensual en el historial y actualiza meses_pagados
    const [comprasMeses] = await db.query('SELECT * FROM compras WHERE usuario_id = ? AND meses > 1', [userId]);
    for (const compra of comprasMeses) {
      // Registrar el pago de este mes en el historial
      const pagoMensual = compra.monto / compra.meses;
      const movePagoMensualToHistorial = `
        INSERT INTO historial_compras (usuario_id, descripcion, monto, fecha, tarjeta, meses, mes_historial, anio_historial)
        VALUES (?, ?, ?, NOW(), 
          (SELECT nombre FROM tarjetas WHERE id = ?), ?, ?, ?)
      `;
      await db.query(movePagoMensualToHistorial, [
        compra.usuario_id,
        compra.descripcion + ` (Pago mensual ${compra.meses_pagados + 1}/${compra.meses})`,
        pagoMensual,
        compra.tarjeta_id,
        compra.meses,
        mes,
        anio
      ]);

      // Si ya se pagó el último mes, elimina la compra
      if (compra.meses_pagados + 1 >= compra.meses) {
        await db.query('DELETE FROM compras WHERE id = ?', [compra.id]);
      } else {
        // Si no, incrementa meses_pagados
        await db.query('UPDATE compras SET meses_pagados = meses_pagados + 1 WHERE id = ?', [compra.id]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error en cierre de mes:', err);
    res.status(500).json({ error: 'Error al reiniciar el mes' });
  }
});

module.exports = router;
