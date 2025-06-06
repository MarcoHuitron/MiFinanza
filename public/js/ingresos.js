const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://mifinanza.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar si el usuario está logueado
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    return window.location.href = '/index.html';
  }
  
  // Establecer el nombre del usuario
  const nombreUsuarioElement = document.getElementById('nombreUsuario');
  if (nombreUsuarioElement) {
    nombreUsuarioElement.textContent = user.nombre;
  }

  // Asignar event listeners a los formularios
  const formIngresoExtra = document.getElementById('formIngresoExtra');
  if (formIngresoExtra) {
    formIngresoExtra.addEventListener('submit', (e) => agregarIngresoExtra(e, user.id));
  }

  // Cargar datos iniciales
  cargarIngresosExtra(user.id);
});

// Obtener y mostrar ingresos extra
async function cargarIngresosExtra(userId) {
  const tbody = document.querySelector('#tablaIngresosExtra tbody');
  const totalElement = document.getElementById('totalIngresos');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr class="empty-state">
      <td colspan="6">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando ingresos...</p>
      </td>
    </tr>`;

  try {
    const res = await fetch(`${API_URL}/ingresos/${userId}/extras`);
    const ingresos = await res.json();
    
    if (!Array.isArray(ingresos) || ingresos.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="6">
            <i class="fas fa-coins"></i>
            <p>No hay ingresos extra registrados</p>
          </td>
        </tr>`;
      if (totalElement) totalElement.textContent = '$0.00';
      return;
    }
    
    tbody.innerHTML = '';
    let total = 0;
    
    ingresos.forEach(ingreso => {
      total += ingreso.monto;
      const tr = document.createElement('tr');
      tr.className = 'fade-in';
      
      // Obtener badge class según categoría
      let badgeClass = 'badge-success';
      if (ingreso.categoria === 'salario') badgeClass = 'badge-primary';
      if (ingreso.categoria === 'inversiones') badgeClass = 'badge-warning';
      
      tr.innerHTML = `
        <td>${ingreso.descripcion}</td>
        <td><span class="amount amount-positive">$${ingreso.monto.toFixed(2)}</span></td>
        <td><span class="badge ${badgeClass}">${ingreso.categoria}</span></td>
        <td>${new Date(ingreso.fechaCreacion).toLocaleDateString()}</td>
        <td>${ingreso.notas || '<span class="text-muted">Sin notas</span>'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="eliminarIngreso('${ingreso._id}', '${userId}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
  } catch (err) {
    console.error('Error cargando ingresos:', err);
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <i class="fas fa-exclamation-triangle text-danger"></i>
          <p class="text-danger">Error al cargar ingresos</p>
        </td>
      </tr>`;
  }
}

// Agregar ingreso extra
async function agregarIngresoExtra(e, userId) {
  e.preventDefault();
  const form = e.target;
  const data = {
    usuario_id: userId,
    tipo: 'ingreso',
    descripcion: form.descripcion.value,
    monto: parseFloat(form.monto.value),
    categoria: form.categoria.value,
    notas: form.notas.value
  };
  try {
    const res = await fetch(`${API_URL}/ingresos/extra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al agregar ingreso');
    form.reset();
    cargarIngresosExtra(userId);
  } catch (err) {
    console.error('Error agregando ingreso:', err);
    alert('No se pudo agregar el ingreso extra');
  }
}

// Eliminar ingreso extra - Función global para llamar desde onclick
window.eliminarIngreso = async function(id, userId) {
  if (!confirm('¿Eliminar este ingreso?')) return;
  try {
    const res = await fetch(`${API_URL}/ingresos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    cargarIngresosExtra(userId);
  } catch (err) {
    console.error('Error eliminando ingreso:', err);
    alert('No se pudo eliminar el ingreso');
  }
}