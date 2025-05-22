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
      listaHistorial.innerHTML = '<li>No hay compras en este periodo.</li>';
    } else {
      listaHistorial.innerHTML = datos.map(h => `
        <li>
          <div>
            <span class="fw-bold">${h.descripcion}</span>
            <span class="text-muted ms-2">${nombreMes(h.mes_historial)} ${h.anio_historial}</span>
            <div class="small text-secondary">${h.fecha ? new Date(h.fecha).toLocaleDateString() : ''}</div>
            <span class="badge bg-${h.meses > 1 ? 'info' : 'secondary'}">
              ${h.meses > 1 ? `A meses (${h.meses})` : 'Pago único'}
            </span>
            <span class="ms-2">${h.tarjeta ? h.tarjeta : ''}</span>
          </div>
          <div class="fw-bold text-success">$${parseFloat(h.monto).toFixed(2)}</div>
        </li>
      `).join('');
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