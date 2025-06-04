document.addEventListener('DOMContentLoaded', async () => {
  // URL base de la API según entorno
  const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://mifinanza.onrender.com/api';

  // Recupera el usuario logueado
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    window.location.href = '/index.html';
    return;
  }

  const listaHistorial = document.getElementById('listaHistorial');
  const filtroMes = document.getElementById('filtroMes');
  let historial = [];

  // Cargar historial desde el backend
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

  // Renderiza las opciones de meses en el filtro
  function renderMeses() {
    const mesesUnicos = Array.from(
      new Set(historial.map(h => `${h.anio_historial}-${String(h.mes_historial).padStart(2, '0')}`))
    );
    filtroMes.innerHTML = `<option value="">Todos</option>` +
      mesesUnicos.map(m =>
        `<option value="${m}">${nombreMes(m.split('-')[1])} ${m.split('-')[0]}</option>`
      ).join('');
  }

  // Renderiza el historial filtrado
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
      // Agrupar compras por mes para una vista de línea de tiempo
      const comprasPorMes = {};
      
      datos.forEach(item => {
        const key = `${item.anio_historial}-${String(item.mes_historial).padStart(2, '0')}`;
        if (!comprasPorMes[key]) {
          comprasPorMes[key] = [];
        }
        comprasPorMes[key].push(item);
      });
      
      // Ordenar los meses cronológicamente
      const mesesOrdenados = Object.keys(comprasPorMes).sort().reverse();
      
      let html = '<ul class="timeline">';
      
      mesesOrdenados.forEach(mes => {
        const [year, monthNum] = mes.split('-');
        const monthName = nombreMes(monthNum);
        
        html += `<div class="month-divider">${monthName} ${year}</div>`;
        
        // Ordenar compras dentro de cada mes por fecha (más reciente primero)
        const comprasDelMes = comprasPorMes[mes].sort((a, b) => 
          new Date(b.fecha || 0) - new Date(a.fecha || 0)
        );
        
        comprasDelMes.forEach(item => {
          const paymentClass = item.meses > 1 ? 'monthly-payment' : 'single-payment';
          const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString() : '';
          const paymentIcon = item.meses > 1 ? 'fa-calendar-alt' : 'fa-money-bill-wave';
          const cardIcon = 'fa-credit-card';
          
          html += `
            <li class="timeline-item ${paymentClass}">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h3 class="timeline-title">${item.descripcion}</h3>
                  <div class="timeline-amount">$${parseFloat(item.monto).toFixed(2)}</div>
                </div>
                <div class="timeline-date">
                  <i class="far fa-calendar-alt"></i> ${fecha}
                </div>
                <div class="timeline-badges">
                  <span class="timeline-badge payment-type">
                    <i class="fas ${paymentIcon}"></i> 
                    ${item.meses > 1 ? `${item.meses} meses` : 'Pago único'}
                  </span>
                  ${item.tarjeta ? `
                  <span class="timeline-badge card-type">
                    <i class="fas ${cardIcon}"></i> ${item.tarjeta}
                  </span>
                  ` : ''}
                </div>
              </div>
            </li>
          `;
        });
      });
      
      html += '</ul>';
      listaHistorial.innerHTML = html;
    }
  }

  // Devuelve el nombre del mes en español
  function nombreMes(mes) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[parseInt(mes, 10) - 1] || '';
  }

  // Evento para filtrar por mes
  filtroMes.addEventListener('change', renderHistorial);

  // Inicializar
  await loadHistorial();
});