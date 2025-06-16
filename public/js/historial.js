document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://mifinanza.onrender.com/api';

  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    window.location.href = '/index.html';
    return;
  }

  const listaHistorial = document.getElementById('listaHistorial');
  const filtroMes = document.getElementById('filtroMes');
  let historial = [];

  async function loadHistorial() {
    try {
      const res = await fetch(`${API_URL}/historial/${user.id}`);
      historial = await res.json();
      renderMeses();
      renderHistorial();
    } catch (err) {
      listaHistorial.innerHTML = '<li class="text-danger">Error al cargar historial.</li>';
    }
  }

  function renderMeses() {
    const mesesUnicos = Array.from(
      new Set(historial.map(h => `${h.anio_historial}-${String(h.mes_historial).padStart(2, '0')}`))
    );
    filtroMes.innerHTML = `<option value="">Todos</option>` +
      mesesUnicos.map(m =>
        `<option value="${m}">${nombreMes(m.split('-')[1])} ${m.split('-')[0]}</option>`
      ).join('');
  }

  function renderHistorial() {
    const filtro = filtroMes.value;
    let datos = historial;

    if (filtro) {
      const [anio, mes] = filtro.split('-');
      datos = historial.filter(h =>
        String(h.anio_historial) === anio && String(h.mes_historial).padStart(2, '0') === mes
      );
    }

    if (datos.length === 0) {
      listaHistorial.innerHTML = `
        <div class="empty-state">
          <i class="far fa-calendar-times"></i>
          <p>No hay compras registradas en este periodo.</p>
        </div>
      `;
    } else {
      // Agrupar por mes
      const comprasPorMes = {};
      datos.forEach(item => {
        const key = `${item.anio_historial}-${String(item.mes_historial).padStart(2, '0')}`;
        if (!comprasPorMes[key]) comprasPorMes[key] = [];
        comprasPorMes[key].push(item);
      });

      const mesesOrdenados = Object.keys(comprasPorMes).sort().reverse();
      let html = '';

      mesesOrdenados.forEach(mes => {
        const [year, monthNum] = mes.split('-');
        const monthName = nombreMes(monthNum);

        html += `<div class="historial-mes-label">${monthName} ${year}</div>`;

        const comprasDelMes = comprasPorMes[mes].sort((a, b) =>
          new Date(b.fecha || 0) - new Date(a.fecha || 0)
        );

        comprasDelMes.forEach(item => {
          const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString() : '';
          html += `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="historial-card">
                <div class="historial-card-header">
                  <span class="historial-card-title">${item.descripcion}</span>
                  <span class="historial-card-amount">$${parseFloat(item.monto).toFixed(2)}</span>
                </div>
                <div class="historial-card-details">
                  <span class="historial-card-date"><i class="far fa-calendar-alt"></i> ${fecha}</span>
                  ${item.tarjeta ? `<span class="historial-card-tarjeta"><i class="fas fa-credit-card"></i> ${item.tarjeta}</span>` : ''}
                  <span class="historial-card-meses">
                    <i class="fas ${item.meses > 1 ? 'fa-calendar-alt' : 'fa-money-bill-wave'}"></i>
                    ${item.meses > 1 ? `${item.meses} meses` : 'Pago único'}
                  </span>
                </div>
              </div>
            </div>
          `;
        });
      });

      listaHistorial.innerHTML = html;
    }
  }

  function nombreMes(mes) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes, 10) - 1] || '';
  }

  filtroMes.addEventListener('change', renderHistorial);

  await loadHistorial();
});