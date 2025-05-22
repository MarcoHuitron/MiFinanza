// Escoge la URL según el entorno
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://mifinanza.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    return window.location.href = '/index.html';
  }
  document.getElementById('nombreUsuario').textContent = user.nombre;

  // Elementos
  const listaTarjetas = document.getElementById('listaTarjetas');
  const listaCompras = document.getElementById('listaCompras');
  const openBtn = document.getElementById('openCardModal');
  const form = document.getElementById('cardForm');
  const logoutButton = document.getElementById('logoutButton');
  const compraTarjeta = document.getElementById('compraTarjeta');
  const creditoFields = document.getElementById('creditoFields');
  const compraForm = document.getElementById('compraForm');
  const setIncomeButton = document.getElementById('setIncomeButton');
  const incomeForm = document.getElementById('incomeForm');
  const progressBar = document.getElementById('progressBar');
  const monthlyIncomeText = document.getElementById('monthlyIncomeText');
  const remainingIncomeText = document.getElementById('remainingIncomeText');
  
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  // Modales Bootstrap
  const cardModal = new bootstrap.Modal(document.getElementById('cardModal'));
  const compraModalInstance = new bootstrap.Modal(document.getElementById('compraModal'));
  const incomeModalInstance = new bootstrap.Modal(document.getElementById('incomeModal'));
  const confirmModalInstance = new bootstrap.Modal(document.getElementById('confirmModal'));

  // Modal de ayuda
  const helpButton = document.getElementById('helpButton');
  const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
  const helpForm = document.getElementById('helpForm');
  const helpMessage = document.getElementById('helpMessage');

  helpButton.addEventListener('click', () => {
    helpMessage.value = '';
    helpModal.show();
  });

  helpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = helpMessage.value.trim();
    if (!mensaje) return;
    try {
      await fetch(`${API_URL}/soporte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          email: user.email,
          mensaje
        })
      });
      helpModal.hide();
      alert('¡Gracias por tu mensaje! Pronto nos pondremos en contacto.');
    } catch (err) {
      alert('Error al enviar el mensaje de soporte.');
    }
  });

  // Abrir modales
  openBtn.addEventListener('click', () => cardModal.show());
  document.getElementById('openCompraModal').addEventListener('click', () => compraModalInstance.show());
  setIncomeButton.addEventListener('click', () => incomeModalInstance.show());

  // Cerrar sesión
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });

  // Función para cargar tarjetas
  async function loadTarjetas() {
    try {
      const res = await fetch(`${API_URL}/tarjetas/${user.id}`);
      const tarjetas = await res.json();
      if (tarjetas.length === 0) {
        listaTarjetas.innerHTML = '<li>No tienes tarjetas registradas.</li>';
      } else {
        listaTarjetas.innerHTML = tarjetas
          .map(t => `
            <li>
              ${t.nombre} (${t.tipo}) — •••• ${t.numero}
              <button class="btn btn-sm btn-danger delete-tarjeta" data-id="${t.id}">Eliminar</button>
            </li>
          `)
          .join('');
      }
      // Botones eliminar tarjeta
      document.querySelectorAll('.delete-tarjeta').forEach(button => {
        button.addEventListener('click', () => {
          openConfirmModal('¿Estás seguro de que deseas eliminar esta tarjeta?', async () => {
            await fetch(`${API_URL}/tarjetas/${button.dataset.id}`, { method: 'DELETE' });
            await loadTarjetas();
          });
        });
      });
    } catch (e) {
      console.error('Error cargando tarjetas', e);
    }
  }

  // Función para abrir el modal de confirmación
  let confirmCallback = null;
  function openConfirmModal(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    confirmModalInstance.show();
  }
  document.getElementById('confirmButton').onclick = () => {
    if (confirmCallback) confirmCallback();
    confirmModalInstance.hide();
  };

  // Función para cargar compras
  async function loadCompras() {
    const res = await fetch(`${API_URL}/compras/${user.id}`);
    const compras = await res.json();
    if (compras.length === 0) {
      listaCompras.innerHTML = '<li>No has registrado compras.</li>';
    } else {
      listaCompras.innerHTML = compras.map(c => {
        const meses = c.meses || 1;
        const mesesPagados = c.meses_pagados || 0;
        if (meses === 1) {
          return `
            <li>
              [${new Date(c.fecha).toLocaleDateString()}] ${c.descripcion} — 
              $${c.monto} <span class="badge bg-secondary">Pago único</span>
              <button class="btn btn-sm btn-danger delete-compra" data-id="${c.id}">Eliminar</button>
            </li>
          `;
        } else {
          const pagoMensual = (c.monto / meses).toFixed(2);
          return `
            <li>
              [${new Date(c.fecha).toLocaleDateString()}] ${c.descripcion} — 
              $${pagoMensual} <span class="badge bg-info">Pago mensual</span>
              <span class="text-muted"> (${mesesPagados + 1}/${meses} de $${c.monto})</span>
              <button class="btn btn-sm btn-danger delete-compra" data-id="${c.id}">Eliminar</button>
            </li>
          `;
        }
      }).join('');
    }
    // Eventos para eliminar compras
    document.querySelectorAll('.delete-compra').forEach(btn => {
      btn.onclick = () => {
        openConfirmModal('¿Estás seguro de que deseas eliminar esta compra?', async () => {
          await fetch(`${API_URL}/compras/${btn.dataset.id}`, { method: 'DELETE' });
          await loadCompras();
          await calculateMonthlyExpenses();
        });
      };
    });
  }

  // Cargar tarjetas en el select con el atributo data-tipo
  async function loadTarjetasForCompra() {
    const res = await fetch(`${API_URL}/tarjetas/${user.id}`);
    const tarjetas = await res.json();
    compraTarjeta.innerHTML = tarjetas
      .map(t => `<option value="${t._id}" data-tipo="${t.tipo}">${t.nombre} (${t.tipo})</option>`)
      .join('');
    compraTarjeta.dispatchEvent(new Event('change'));
  }

  // Calcular gastos mensuales
  async function calculateMonthlyExpenses() {
    try {
      const res = await fetch(`${API_URL}/compras/${user.id}`);
      const compras = await res.json();
      monthlyExpenses = 0;
      compras.forEach(compra => {
        const meses = compra.meses || 1;
        const pagoMensual = compra.monto / meses;
        monthlyExpenses += pagoMensual;
      });
      updateProgressBar();
    } catch (err) {
      console.error('Error calculando gastos mensuales', err);
    }
  }

  // Cargar ingresos mensuales
  async function loadMonthlyIncome() {
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/ingresos`);
      const data = await res.json();
      monthlyIncome = parseFloat(data.ingresos) || 0;
      updateProgressBar();
    } catch (err) {
      console.error('Error al cargar ingresos', err);
    }
  }

  function updateProgressBar() {
    if (monthlyIncome === 0) {
      progressBar.style.width = '0%';
      progressBar.textContent = '0%';
      monthlyIncomeText.textContent = '$0';
      remainingIncomeText.textContent = '$0';
      return;
    }
    const percentage = Math.min((monthlyExpenses / monthlyIncome) * 100, 100);
    const remaining = Math.max(monthlyIncome - monthlyExpenses, 0);
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage.toFixed(2)}%`;
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressPercent').textContent = `${percentage.toFixed(2)}%`;
    monthlyIncomeText.textContent = `$${monthlyIncome.toFixed(2)}`;
    remainingIncomeText.textContent = `$${remaining.toFixed(2)}`;
  }

  // Mostrar/ocultar campos de crédito según el tipo de tarjeta
  compraTarjeta.addEventListener('change', () => {
    const selected = compraTarjeta.options[compraTarjeta.selectedIndex];
    const tipo = selected ? selected.getAttribute('data-tipo') : '';
    creditoFields.style.display = tipo === 'credito' ? 'block' : 'none';
  });

  // Guardar tarjeta
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.cardName.value;
    const tipo = form.cardType.value;
    const numero = form.cardLast4.value;
    try {
      await fetch(`${API_URL}/tarjetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, nombre, tipo, numero })
      });
      form.reset();
      cardModal.hide();
      await loadTarjetas();
      await loadTarjetasForCompra();
    } catch (err) {
      console.error('Error guardando tarjeta', err);
    }
  });

  // Guardar compra
  compraForm.addEventListener('submit', async e => {
    e.preventDefault();
    const tarjetaId = compraTarjeta.value;
    const descripcion = compraForm.compraDescripcion.value;
    const monto = compraForm.compraMonto.value;
    const meses = compraForm.compraMeses ? compraForm.compraMeses.value : 1;

    try {
      await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, tarjeta_id: tarjetaId, descripcion, monto, meses })
      });
      compraForm.reset();
      creditoFields.style.display = 'none';
      compraModalInstance.hide();
      await loadCompras();
      await calculateMonthlyExpenses();
    } catch (err) {
      console.error('Error guardando compra', err);
    }
  });

  // Guardar ingresos mensuales
  incomeForm.addEventListener('submit', async e => {
    e.preventDefault();
    const ingresos = parseFloat(document.getElementById('monthlyIncome').value);
    try {
      await fetch(`${API_URL}/users/${user.id}/ingresos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingresos })
      });
      incomeModalInstance.hide();
      window.location.reload();
    } catch (err) {
      console.error('Error al guardar ingresos', err);
    }
  });

  // Botón de cierre de mes
  document.getElementById('cierreMesBtn').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que deseas cerrar el mes? Las compras de este mes pasarán al historial.')) {
      try {
        await fetch(`${API_URL}/compras/reiniciar-mes/${user.id}`, { method: 'POST' });
        await loadCompras();
        await calculateMonthlyExpenses();
        alert('¡Cierre de mes realizado! Puedes consultar el historial en la sección correspondiente.');
        // Opcional: window.location.href = 'historial.html';
      } catch (err) {
        alert('Error al realizar el cierre de mes.');
      }
    }
  });

  // Inicialización
  await loadTarjetas();
  await loadTarjetasForCompra();
  await loadCompras();
  await loadMonthlyIncome();
  await calculateMonthlyExpenses();
  await loadHistorial();

});
