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

  let editMode = false;
  let currentEditId = null;

  const cardModal = new bootstrap.Modal(document.getElementById('cardModal'));
  const compraModalInstance = new bootstrap.Modal(document.getElementById('compraModal'));
  const incomeModalInstance = new bootstrap.Modal(document.getElementById('incomeModal'));
  const confirmModalInstance = new bootstrap.Modal(document.getElementById('confirmModal'));

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
      bootstrap.Modal.getOrCreateInstance(document.getElementById('helpModal')).hide();
      alert('¡Gracias por tu mensaje! Pronto nos pondremos en contacto.');
    } catch (err) {
      alert('Error al enviar el mensaje de soporte.');
    }
  });

  openBtn.addEventListener('click', () => cardModal.show());
  document.getElementById('openCompraModal').addEventListener('click', () => compraModalInstance.show());
  setIncomeButton.addEventListener('click', () => incomeModalInstance.show());

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });

  async function loadTarjetas() {
    try {
      const res = await fetch(`${API_URL}/tarjetas/${user.id}`);
      const tarjetas = await res.json();
      
      if (tarjetas.length === 0) {
        listaTarjetas.innerHTML = '<div class="alert alert-info">No tienes tarjetas registradas.</div>';
      } else {
        listaTarjetas.innerHTML = '<div class="tarjeta-container">' + 
          tarjetas.map(t => {
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
      
      document.querySelectorAll('.delete-tarjeta').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation(); 
          openConfirmModal('¿Estás seguro de que deseas eliminar esta tarjeta?', async () => {
            await fetch(`${API_URL}/tarjetas/${button.dataset.id}`, { method: 'DELETE' });
            await loadTarjetas();
          });
        });
      });
      
      document.querySelectorAll('.tarjeta-item').forEach(card => {
        card.addEventListener('click', () => {
          console.log(`Card clicked: ${card.querySelector('.tarjeta-nombre').textContent}`);
        });
      });
      
    } catch (e) {
      console.error('Error cargando tarjetas', e);
    }
  }

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

  async function loadCompras() {
    try {
      const res = await fetch(`${API_URL}/compras/${user.id}`);
      const compras = await res.json();
      compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (compras.length === 0) {
        listaCompras.innerHTML = '<div class="alert alert-info">No has registrado compras.</div>';
      } else {
        listaCompras.innerHTML = '<div class="compra-container">' + 
          compras.map(c => {
            const meses = c.meses || 1;
            const mesesPagados = c.meses_pagados || 0;
            const tarjeta = c.tarjeta_nombre ? `${c.tarjeta_nombre} (${c.tarjeta_tipo || ''})` : `Tarjeta: ${c.tarjeta_id || c.tarjeta}`;
            const fecha = new Date(c.fecha).toLocaleDateString();
            

            const paymentIcon = meses === 1 ? 'fa-money-bill-wave' : 'fa-calendar-alt';
            const cardIcon = c.tarjeta_tipo === 'credito' ? 'fa-credit-card' : 'fa-money-check-alt';
            

            const progressPercent = meses === 1 ? 100 : ((mesesPagados + 1) / meses) * 100;
            
            const paymentClass = meses === 1 ? 'single-payment' : 'monthly-payment';
            
            return `
              <div class="compra-item ${paymentClass} ${c.pagada ? 'pagada' : ''}">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="compra-fecha">
                      <i class="far fa-calendar"></i> ${fecha}
                    </div>
                    <div class="compra-descripcion">${c.descripcion}</div>
                    <div class="compra-monto">
                      ${meses > 1 
                        ? `$${(c.monto / meses).toFixed(2)} <small class="text-muted">de $${c.monto}</small>` 
                        : `$${c.monto}`}
                    </div>
                  </div>
                  <div>
                    <input type="checkbox" class="form-check-input ms-2 mark-paid" data-id="${c._id || c.id}" ${c.pagada ? 'checked' : ''} title="Marcar como pagada">
                  </div>
                </div>
                <div class="compra-details">
                  <span class="compra-badge payment-type">
                    <i class="fas ${paymentIcon}"></i> ${meses === 1 ? 'Pago único' : `Pago a meses (${mesesPagados}/${meses})`}
                  </span>
                  <span class="compra-badge card-type">
                    <i class="fas ${cardIcon}"></i> ${tarjeta}
                  </span>
                  ${meses > 1 ? `
                  <div class="mt-2">
                    <div class="progress" style="height: 10px;">
                      <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%;" 
                          aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                  ` : ''}
                  ${c.nota ? `<div class="compra-nota"><i class="fas fa-sticky-note"></i> ${c.nota}</div>` : ''}
                </div>
                <div class="compra-actions">
                  <button class="edit-compra" data-id="${c._id || c.id}">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="delete-compra" data-id="${c._id || c.id}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                  </button>
                </div>
              </div>
            `;
          }).join('') +
        '</div>';

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
      
      document.querySelectorAll('.delete-compra').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          console.log("Deleting purchase with ID:", id);
          
          openConfirmModal('¿Estás seguro de que deseas eliminar esta compra?', async () => {
            await fetch(`${API_URL}/compras/${id}`, { method: 'DELETE' });
            await loadCompras();
            await calculateMonthlyExpenses();
          });
        };
      });
      
      document.querySelectorAll('.edit-compra').forEach(btn => {
        btn.onclick = async () => {
          const purchaseId = btn.dataset.id;
          console.log("Editing purchase with ID:", purchaseId);

          try {
            const response = await fetch(`${API_URL}/compras/compra/${purchaseId}`);
            const purchase = await response.json();

            editMode = true;
            currentEditId = purchaseId;

            document.getElementById('compraDescripcion').value = purchase.descripcion;
            document.getElementById('compraMonto').value = purchase.monto;
            document.getElementById('compraNota').value = purchase.nota || '';

            // Selecciona la tarjeta correcta
            const cardSelect = document.getElementById('compraTarjeta');
            for (let i = 0; i < cardSelect.options.length; i++) {
              if (cardSelect.options[i].value === purchase.tarjeta_id) {
                cardSelect.selectedIndex = i;
                break;
              }
            }

            // Muestra el campo de meses si la tarjeta es de crédito
            const selectedOption = cardSelect.options[cardSelect.selectedIndex];
            const tipoTarjeta = selectedOption ? selectedOption.getAttribute('data-tipo') : '';
            const creditoFields = document.getElementById('creditoFields');
            if (tipoTarjeta === 'credito') {
              creditoFields.style.display = 'block';
              document.getElementById('compraMeses').value = purchase.meses || 1;
            } else {
              creditoFields.style.display = 'none';
              document.getElementById('compraMeses').value = '';
            }

            document.querySelector('#compraModal .modal-title').textContent = 'Editar Compra';

            compraModalInstance.show();
          } catch (error) {
            console.error('Error fetching purchase for edit:', error);
          }
        };
      });
      
      document.querySelectorAll('.mark-paid').forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
          const id = this.dataset.id;
          const pagada = this.checked;
          
          try {
            const compraItem = this.closest('.compra-item');
            if (pagada) {
              compraItem.classList.add('pagada');
            } else {
              compraItem.classList.remove('pagada');
            }
            
            const response = await fetch(`${API_URL}/compras/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pagada })
            });
            
            if (!response.ok) {
              throw new Error('Error al actualizar');
            }
            
            console.log('Compra marcada como ' + (pagada ? 'pagada' : 'no pagada'));
            
          } catch (err) {
            console.error('Error al marcar como pagada:', err);
            alert('No se pudo actualizar el estado de la compra');
            this.checked = !pagada;
            
            const compraItem = this.closest('.compra-item');
            if (!pagada) {
              compraItem.classList.add('pagada');
            } else {
              compraItem.classList.remove('pagada');
            }
          }
        });
      });
      
    } catch (error) {
      console.error('Error cargando compras', error);
      listaCompras.innerHTML = '<div class="alert alert-danger">Error al cargar las compras</div>';
    }
  }

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
    const meses = compraForm.compraMeses && compraForm.compraMeses.value
      ? parseInt(compraForm.compraMeses.value, 10)
      : 1;
    const nota = compraForm.compraNota ? compraForm.compraNota.value : ''; // <-- Añadido

    try {
      if (editMode) {
        console.log("Updating purchase with ID:", currentEditId);
        
        const response = await fetch(`${API_URL}/compras/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            usuario_id: user.id, 
            tarjeta_id: tarjetaId, 
            descripcion, 
            monto, 
            meses,
            nota // <-- Añadido
          })
        });
        
        console.log("Update response status:", response.status);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log("Update response data:", responseData);
        } else {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 100) + "...");
        }
        
        editMode = false;
        currentEditId = null;
        compraForm.reset();
        compraModalInstance.hide();
        await loadCompras();
        await calculateMonthlyExpenses();
      } else {
        const response = await fetch(`${API_URL}/compras`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            usuario_id: user.id, 
            tarjeta_id: tarjetaId, 
            descripcion, 
            monto, 
            meses,
            nota // <-- Añadido
          })
        });
        
        if (!response.ok) {
          throw new Error('Error al guardar la compra');
        }
        
        compraForm.reset();
        compraModalInstance.hide();
        await loadCompras();
        await calculateMonthlyExpenses();
      }
    } catch (err) {
      console.error('Error guardando compra', err);
    }
  });

  await loadTarjetas();
  await loadCompras();
  await loadMonthlyIncome();
  await calculateMonthlyExpenses();
  await loadTarjetasForCompra();
});
