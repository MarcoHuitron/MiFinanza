document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    return window.location.href = '/index.html';
  }
  document.getElementById('nombreUsuario').textContent = user.nombre;

   
  const listaTarjetas = document.getElementById('listaTarjetas');
  const listaCompras = document.getElementById('listaCompras');
  const modal = document.getElementById('cardModal');
  const openBtn = document.getElementById('openCardModal');
  const closeBtn = document.getElementById('closeCardModal');
  const form = document.getElementById('cardForm');
  const logoutButton = document.getElementById('logoutButton');

  const compraModal = document.getElementById('compraModal');
  const openCompraModal = document.getElementById('openCompraModal');
  const closeCompraModal = document.getElementById('closeCompraModal');
  const compraForm = document.getElementById('compraForm');
  const compraTarjeta = document.getElementById('compraTarjeta');
  const creditoFields = document.getElementById('creditoFields');

  const confirmModal = document.getElementById('confirmModal');
  const confirmMessage = document.getElementById('confirmMessage');
  const closeConfirmModal = document.getElementById('closeConfirmModal');
  const cancelButton = document.getElementById('cancelButton');
  const confirmButton = document.getElementById('confirmButton');

  const setIncomeButton = document.getElementById('setIncomeButton');
  const incomeModal = document.getElementById('incomeModal');
  const closeIncomeModal = document.getElementById('closeIncomeModal');
  const incomeForm = document.getElementById('incomeForm');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  let deleteCallback = null;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

   // Inicializa
  await loadTarjetas();
  await loadCompras();
  await loadTarjetasForCompra();
  await loadMonthlyIncome();
  await calculateMonthlyExpenses();


  // Función para abrir el modal de confirmación
  function openConfirmModal(message, callback) {
    confirmMessage.textContent = message;
    deleteCallback = callback;
    confirmModal.style.display = 'flex';
  }

  // Cerrar el modal de confirmación
  function closeConfirm() {
    confirmModal.style.display = 'none';
    deleteCallback = null;
  }

  closeConfirmModal.addEventListener('click', closeConfirm);
  cancelButton.addEventListener('click', closeConfirm);
  window.addEventListener('click', e => {
    if (e.target === confirmModal) closeConfirm();
  });

  // Confirmar eliminación
  confirmButton.addEventListener('click', () => {
    if (deleteCallback) deleteCallback();
    closeConfirm();
  });

  // Funciones para cargar datos
  async function loadTarjetas() {
    try {
      const res = await fetch(`/api/tarjetas/${user.id}`);
      const tarjetas = await res.json();
      if (tarjetas.length === 0) {
        listaTarjetas.innerHTML = '<li>No tienes tarjetas registradas.</li>';
      } else {
        listaTarjetas.innerHTML = tarjetas
          .map(t => `
            <li>
              ${t.nombre} (${t.tipo}) — •••• ${t.numero}
              <button class="delete-tarjeta" data-id="${t.id}" style="background: #ff4d4d; color: white;">Eliminar</button>
            </li>
          `)
          .join('');
      }

      // Agregar eventos a los botones de eliminar tarjeta
      document.querySelectorAll('.delete-tarjeta').forEach(button => {
        button.addEventListener('click', () => {
          const tarjetaId = button.getAttribute('data-id');
          openConfirmModal('¿Estás seguro de que deseas eliminar esta tarjeta?', async () => {
            try {
              await fetch(`/api/tarjetas/${tarjetaId}`, { method: 'DELETE' });
              await loadTarjetas();
            } catch (err) {
              console.error('Error eliminando tarjeta', err);
            }
          });
        });
      });
    } catch (e) {
      console.error('Error cargando tarjetas', e);
    }
  }

  async function loadCompras() {
    try {
      const res = await fetch(`/api/compras/${user.id}`);
      const compras = await res.json();
      if (compras.length === 0) {
        listaCompras.innerHTML = '<li>No has registrado compras.</li>';
      } else {
        listaCompras.innerHTML = compras
          .map(c => {
            const meses = c.meses || 1;
            const pagoMensual = (c.monto / meses).toFixed(2); // Divide el monto entre los meses
            const mesActual = Math.min(Math.ceil(new Date().getMonth() + 1), meses); // Calcula el mes actual

            // Verifica si la tarjeta es de débito o si es un pago único
            if (meses === 1) {
              // Compra de débito o pago único
              return `
                <li>
                  [${new Date(c.fecha).toLocaleDateString()}] ${c.descripcion} — 
                  $${c.monto} (Pago único)
                  <button class="delete-compra" data-id="${c.id}" style="background: #ff4d4d; color: white;">Eliminar</button>
                </li>
              `;
            } else {
              // Compra a crédito
              return `
                <li>
                  [${new Date(c.fecha).toLocaleDateString()}] ${c.descripcion} — 
                  $${pagoMensual} (Pago mensual) 
                  <span style="color: gray;">(${mesActual}/${meses} de $${c.monto})</span>
                  <button class="delete-compra" data-id="${c.id}" style="background: #ff4d4d; color: white;">Eliminar</button>
                </li>
              `;
            }
          })
          .join('');
      }

      // Agregar eventos a los botones de eliminar compra
      document.querySelectorAll('.delete-compra').forEach(button => {
        button.addEventListener('click', () => {
          const compraId = button.getAttribute('data-id');
          openConfirmModal('¿Estás seguro de que deseas eliminar esta compra?', async () => {
            try {
              await fetch(`/api/compras/${compraId}`, { method: 'DELETE' });
              await loadCompras();
              await calculateMonthlyExpenses();
            } catch (err) {
              console.error('Error eliminando compra', err);
            }
          });
        });
      });
    } catch (e) {
      console.error('Error cargando compras', e);
    }
  }

  // Cargar tarjetas en el select con el atributo data-tipo
  async function loadTarjetasForCompra() {
    try {
      const res = await fetch(`/api/tarjetas/${user.id}`);
      const tarjetas = await res.json();
      compraTarjeta.innerHTML = tarjetas
        .map(t => `<option value="${t.id}" data-tipo="${t.tipo}">${t.nombre} (${t.tipo})</option>`)
        .join('');
    } catch (e) {
      console.error('Error cargando tarjetas para compras', e);
    }
  }

  // Calcular gastos mensuales
  async function calculateMonthlyExpenses() {
    try {
      const res = await fetch(`/api/compras/${user.id}`);
      const compras = await res.json();
      monthlyExpenses = 0;

      compras.forEach(compra => {
        const meses = compra.meses || 1;
        const pagoMensual = compra.monto / meses;
        monthlyExpenses += pagoMensual; // Suma solo el pago mensual al total de gastos
      });

      updateProgressBar();
    } catch (err) {
      console.error('Error calculando gastos mensuales', err);
    }
  }


  // Cargar ingresos mensuales
async function loadMonthlyIncome() {
  try {
    const res = await fetch(`/api/users/${user.id}/ingresos`);
    const data = await res.json();
    monthlyIncome = parseFloat(data.ingresos) || 0;
    updateProgressBar();
  } catch (err) {
    console.error('Error al cargar ingresos', err);
  }
}

function updateProgressBar() {
  if (monthlyIncome === 0) {
    document.getElementById('progressBar').style.width = '0%';
    progressText.textContent = '0%';
    monthlyIncomeText.textContent = `$0`;
    remainingIncomeText.textContent = `$0`;
    return;
  }
  const percentage = Math.min((monthlyExpenses / monthlyIncome) * 100, 100);
  const remaining = Math.max(monthlyIncome - monthlyExpenses, 0);
  document.getElementById('progressBar').style.width = `${percentage}%`;
  progressText.textContent = `${Math.round(percentage)}%`;
  monthlyIncomeText.textContent = `$${monthlyIncome.toFixed(2)}`;
  remainingIncomeText.textContent = `$${remaining.toFixed(2)}`;
}

  // Modal: abrir/cerrar
  openBtn.addEventListener('click', () => modal.style.display = 'flex');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Abrir y cerrar modal de compras
  openCompraModal.addEventListener('click', () => compraModal.style.display = 'flex');
  closeCompraModal.addEventListener('click', () => compraModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === compraModal) compraModal.style.display = 'none';
  });

  // Abrir y cerrar modal de ingresos
  setIncomeButton.addEventListener('click', () => incomeModal.style.display = 'flex');
  closeIncomeModal.addEventListener('click', () => incomeModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === incomeModal) incomeModal.style.display = 'none';
  });

  // Mostrar/ocultar campos de crédito según el tipo de tarjeta
  compraTarjeta.addEventListener('change', () => {
    const selectedOption = compraTarjeta.options[compraTarjeta.selectedIndex];
    const tipo = selectedOption.getAttribute('data-tipo'); // Asegúrate de que este atributo esté presente
    creditoFields.style.display = tipo === 'credito' ? 'block' : 'none';
  });

  // Logout: limpiar localStorage y redirigir
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });

  // Envío del formulario
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.cardName.value;
    const tipo = form.cardType.value;
    const numero = form.cardLast4.value;

    try {
      await fetch('/api/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, nombre, tipo, numero })
      });
      form.reset();
      modal.style.display = 'none';
      await loadTarjetas();
    } catch (err) {
      console.error('Error guardando tarjeta', err);
    }
  });

  // Enviar formulario de compra
  compraForm.addEventListener('submit', async e => {
    e.preventDefault();
    const tarjetaId = compraTarjeta.value;
    const descripcion = compraForm.compraDescripcion.value;
    const monto = compraForm.compraMonto.value;
    const meses = compraForm.compraMeses ? compraForm.compraMeses.value : 1;

    try {
      await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, tarjeta_id: tarjetaId, descripcion, monto, meses })
      });
      compraForm.reset();
      creditoFields.style.display = 'none';
      compraModal.style.display = 'none';
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
      await fetch(`/api/users/${user.id}/ingresos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingresos })
      });
      monthlyIncome = ingresos;
      incomeModal.style.display = 'none';
      updateProgressBar();
    } catch (err) {
      console.error('Error al guardar ingresos', err);
    }
  });
});
