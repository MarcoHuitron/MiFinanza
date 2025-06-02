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
    const mensaje = document.getElementById('helpMessage').value.trim();
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
      // Cierra el modal y muestra mensaje de éxito
      bootstrap.Modal.getOrCreateInstance(document.getElementById('helpModal')).hide();
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
        listaTarjetas.innerHTML = '<div class="alert alert-info">No tienes tarjetas registradas.</div>';
      } else {
        // Create the container for the cards
        listaTarjetas.innerHTML = '<div class="tarjeta-container">' + 
          tarjetas.map(t => {
            // Choose an icon based on card type
            const iconClass = t.tipo === 'credito' ? 'fa-credit-card' : 'fa-money-check-alt';
            
            return `
              <div class="tarjeta-item" data-tipo="${t.tipo}" data-id="${t._id}">
                <div class="tarjeta-buttons">
                  <button class="delete-tarjeta" data-id="${t._id}" title="Eliminar tarjeta">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="tarjeta-bank-logo">
                  <i class="fas ${iconClass}"></i>
                </div>
                
                <div class="tarjeta-chip"></div>
                
                <p class="tarjeta-tipo">${t.tipo === 'credito' ? 'Crédito' : 'Débito'}</p>
                <h3 class="tarjeta-nombre">${t.nombre}</h3>
                <div class="tarjeta-numero">•••• •••• •••• ${t.numero}</div>
              </div>
            `;
          }).join('') +
        '</div>';
      }
      
      // Botones eliminar tarjeta
      document.querySelectorAll('.delete-tarjeta').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering parent click events
          openConfirmModal('¿Estás seguro de que deseas eliminar esta tarjeta?', async () => {
            await fetch(`${API_URL}/tarjetas/${button.dataset.id}`, { method: 'DELETE' });
            await loadTarjetas();
          });
        });
      });
      
      // Optional: Add click event to the entire card (for future functionality)
      document.querySelectorAll('.tarjeta-item').forEach(card => {
        card.addEventListener('click', () => {
          // You could add functionality here in the future,
          // like showing card details or transaction history
          console.log(`Card clicked: ${card.querySelector('.tarjeta-nombre').textContent}`);
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
    try {
      const res = await fetch(`${API_URL}/compras/${user.id}`);
      const compras = await res.json();
      compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (compras.length === 0) {
        listaCompras.innerHTML = '<div class="alert alert-info">No has registrado compras.</div>';
      } else {
        // Create container for purchase cards
        listaCompras.innerHTML = '<div class="compra-container">' + 
          compras.map(c => {
            const meses = c.meses || 1;
            const mesesPagados = c.meses_pagados || 0;
            const tarjeta = c.tarjeta_nombre ? `${c.tarjeta_nombre} (${c.tarjeta_tipo || ''})` : `Tarjeta: ${c.tarjeta_id || c.tarjeta}`;
            const fecha = new Date(c.fecha).toLocaleDateString();
            
            // Choose icons based on payment type
            const paymentIcon = meses === 1 ? 'fa-money-bill-wave' : 'fa-calendar-alt';
            const cardIcon = c.tarjeta_tipo === 'credito' ? 'fa-credit-card' : 'fa-money-check-alt';
            
            // Calculate progress for installment payments
            const progressPercent = meses === 1 ? 100 : ((mesesPagados + 1) / meses) * 100;
            
            // Different classes for different payment types
            const paymentClass = meses === 1 ? 'single-payment' : 'monthly-payment';
            
            if (meses === 1) {
              // Single payment
              return `
                <div class="compra-item ${paymentClass}">
                  <div class="compra-fecha">
                    <i class="far fa-calendar"></i> ${fecha}
                  </div>
                  <div class="compra-descripcion">${c.descripcion}</div>
                  <div class="compra-monto">$${c.monto}</div>
                  <div class="compra-details">
                    <span class="compra-badge payment-type">
                      <i class="fas ${paymentIcon}"></i> Pago único
                    </span>
                    <span class="compra-badge card-type">
                      <i class="fas ${cardIcon}"></i> ${tarjeta}
                    </span>
                  </div>
                  <div class="compra-actions">
                    <button class="delete-compra" data-id="${c.id}">
                      <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                  </div>
                </div>
              `;
            } else {
              // Installment payment
              const pagoMensual = (c.monto / meses).toFixed(2);
              return `
                <div class="compra-item ${paymentClass}">
                  <div class="compra-fecha">
                    <i class="far fa-calendar"></i> ${fecha}
                  </div>
                  <div class="compra-descripcion">${c.descripcion}</div>
                  <div class="compra-monto">$${pagoMensual} <small class="text-muted">por mes</small></div>
                  <div class="compra-details">
                    <span class="compra-badge payment-type">
                      <i class="fas ${paymentIcon}"></i> Pago mensual
                    </span>
                    <span class="compra-badge card-type">
                      <i class="fas ${cardIcon}"></i> ${tarjeta}
                    </span>
                    <span class="compra-badge installment">
                      <i class="fas fa-tasks"></i> ${mesesPagados + 1}/${meses} pagos
                    </span>
                  </div>
                  <div class="compra-progress">
                    <div class="compra-progress-bar" style="width: ${progressPercent}%"></div>
                  </div>
                  <div class="text-muted small">Total: $${c.monto}</div>
                  <div class="compra-actions">
                    <button class="delete-compra" data-id="${c.id}">
                      <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                  </div>
                </div>
              `;
            }
          }).join('') +
        '</div>';

        // Calculate payment totals
        let totalCredito = 0;
        let mensualidadCredito = 0;
        let totalMensualidad = 0;

        compras.forEach(c => {
          const meses = c.meses || 1;
          totalMensualidad += Number(c.monto) / meses;
        });

        const resumenCredito = document.getElementById('resumenCredito');
        if (resumenCredito) {
          if (totalMensualidad > 0) {
            const quincenal = (totalMensualidad / 2).toFixed(2);
            resumenCredito.innerHTML = `
              <div class="alert alert-primary">
                <b>Debes ahorrar quincenal:</b> $${quincenal} para cubrir todos tus gastos mensuales.
              </div>
            `;
          } else {
            resumenCredito.innerHTML = '';
          }
        }
      }
      
      // Event listeners for delete buttons
      document.querySelectorAll('.delete-compra').forEach(btn => {
        btn.onclick = () => {
          openConfirmModal('¿Estás seguro de que deseas eliminar esta compra?', async () => {
            await fetch(`${API_URL}/compras/${btn.dataset.id}`, { method: 'DELETE' });
            await loadCompras();
            await calculateMonthlyExpenses();
          });
        };
      });
      
    } catch (error) {
      console.error('Error cargando compras', error);
      listaCompras.innerHTML = '<div class="alert alert-danger">Error al cargar las compras</div>';
    }
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
      progressBar.setAttribute('data-percent', 'low');
      monthlyIncomeText.textContent = '$0';
      remainingIncomeText.textContent = '$0';
      return;
    }
    
    const percentage = Math.min((monthlyExpenses / monthlyIncome) * 100, 100);
    const remaining = Math.max(monthlyIncome - monthlyExpenses, 0);
    
    if (percentage < 40) {
      progressBar.setAttribute('data-percent', 'low');
    } else if (percentage < 75) {
      progressBar.setAttribute('data-percent', 'medium');
    } else {
      progressBar.setAttribute('data-percent', 'high');
    }
    
    progressBar.style.width = `${percentage}%`;
    document.getElementById('progressPercent').textContent = `${percentage.toFixed(0)}%`;
    
    monthlyIncomeText.textContent = `$${monthlyIncome.toFixed(2)}`;
    remainingIncomeText.textContent = `$${remaining.toFixed(2)}`;
    
    progressBar.classList.add('pulse');
    setTimeout(() => progressBar.classList.remove('pulse'), 700);
  }

  compraTarjeta.addEventListener('change', () => {
    const selected = compraTarjeta.options[compraTarjeta.selectedIndex];
    const tipo = selected ? selected.getAttribute('data-tipo') : '';
    creditoFields.style.display = tipo === 'credito' ? 'block' : 'none';
  });

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

  await loadTarjetas();
  await loadTarjetasForCompra();
  await loadCompras();
  await loadMonthlyIncome();
  await calculateMonthlyExpenses();

});
