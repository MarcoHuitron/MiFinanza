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
  const formDeudor = document.getElementById('formDeudor');
  if (formDeudor) {
    formDeudor.addEventListener('submit', (e) => agregarDeudor(e, user.id));
  }

  // Cargar datos iniciales
  cargarDeudores(user.id);
});

// Obtener y mostrar deudores
async function cargarDeudores(userId) {
  const tbody = document.querySelector('#tablaDeudores tbody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr class="empty-state">
      <td colspan="8">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando deudores...</p>
      </td>
    </tr>`;

  try {
    const res = await fetch(`${API_URL}/deudores/${userId}`);
    const deudores = await res.json();
    
    if (!Array.isArray(deudores) || deudores.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="8">
            <i class="fas fa-user-friends"></i>
            <p>No hay deudores registrados</p>
          </td>
        </tr>`;
      return;
    }
    
    tbody.innerHTML = '';
    
    deudores.forEach(deudor => {
      const tr = document.createElement('tr');
      tr.className = 'fade-in';
      
      // Calcular progreso
      const progreso = `${deudor.pagoActual - 1}/${deudor.totalMeses}`;
      
      // Determinar si el pago actual está pagado o pendiente
      const estaPagado = deudor.pagos.some(p => p.numeroPago === deudor.pagoActual - 1 && p.pagado);
      
      // Estado con estilo condicional según progreso
      let estadoHTML;
      if (deudor.pagoActual > deudor.totalMeses) {
        estadoHTML = '<span class="badge badge-success">Completado</span>';
      } else if (estaPagado) {
        estadoHTML = '<span class="badge badge-warning">Al día</span>';
      } else {
        // Verificar si el pago está vencido
        const fechaActual = new Date();
        const fechaPago = new Date(deudor.proximoPago);
        if (fechaActual > fechaPago) {
          estadoHTML = '<span class="badge badge-danger">Vencido</span>';
        } else {
          estadoHTML = '<span class="badge badge-info">Pendiente</span>';
        }
      }
      
      tr.innerHTML = `
        <td>${deudor.nombre}</td>
        <td><span class="amount">$${deudor.montoTotal.toFixed(2)}</span></td>
        <td><span class="amount">$${deudor.montoPorPago.toFixed(2)}</span></td>
        <td>${progreso}</td>
        <td>${new Date(deudor.proximoPago).toLocaleDateString()}</td>
        <td>${deudor.descripcion}</td>
        <td>${estadoHTML}</td>
        <td>
          <div class="btn-group">
            ${deudor.pagoActual <= deudor.totalMeses ? 
              `<button class="btn btn-sm btn-success me-1" onclick="registrarPago('${deudor._id}', '${userId}')">
                <i class="fas fa-check"></i> Pagar
              </button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="eliminarDeudor('${deudor._id}', '${userId}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando deudores:', err);
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="8">
          <i class="fas fa-exclamation-triangle text-danger"></i>
          <p class="text-danger">Error al cargar deudores</p>
        </td>
      </tr>`;
  }
}

// Agregar deudor
async function agregarDeudor(e, userId) {
  e.preventDefault();
  const form = e.target;
  
  // Verificar que todos los campos necesarios existan
  if (!form.nombre || !form.montoTotal || !form.totalMeses || !form.diaPago || !form.descripcion) {
    alert('Faltan campos requeridos en el formulario');
    return;
  }
  
  // Crear objeto de datos
  const data = {
    usuario_id: userId,
    nombre: form.nombre.value,
    montoTotal: parseFloat(form.montoTotal.value),
    totalMeses: parseInt(form.totalMeses.value),
    diaPago: parseInt(form.diaPago.value),
    descripcion: form.descripcion.value,
  };
  
  // Validaciones
  if (isNaN(data.montoTotal) || data.montoTotal <= 0) {
    alert('El monto debe ser un número válido mayor a cero');
    return;
  }
  
  if (isNaN(data.totalMeses) || data.totalMeses <= 0) {
    alert('El número de meses debe ser un número válido mayor a cero');
    return;
  }
  
  if (isNaN(data.diaPago) || data.diaPago < 1 || data.diaPago > 31) {
    alert('El día de pago debe ser un número entre 1 y 31');
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/deudores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert(error.error || `Error al agregar deudor (${res.status})`);
      return;
    }
    
    form.reset();
    cargarDeudores(userId);
  } catch (err) {
    console.error('Error agregando deudor:', err);
    alert('No se pudo agregar el deudor: ' + (err.message || 'Error de conexión'));
  }
}

// Registrar pago - Función global para llamar desde onclick
window.registrarPago = async function(id, userId) {
  if (!confirm('¿Registrar pago para este deudor?')) return;
  try {
    const res = await fetch(`${API_URL}/deudores/${id}/pagar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert(error.error || `Error al registrar pago (${res.status})`);
      return;
    }
    
    const resultado = await res.json();
    alert(resultado.mensaje || 'Pago registrado correctamente');
    cargarDeudores(userId);
  } catch (err) {
    console.error('Error registrando pago:', err);
    alert('No se pudo registrar el pago: ' + (err.message || 'Error de conexión'));
  }
}

// Eliminar deudor - Función global para llamar desde onclick
window.eliminarDeudor = async function(id, userId) {
  if (!confirm('¿Eliminar este deudor?')) return;
  try {
    const res = await fetch(`${API_URL}/deudores/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      alert(error.error || `Error al eliminar deudor (${res.status})`);
      return;
    }
    
    alert('Deudor eliminado correctamente');
    cargarDeudores(userId);
  } catch (err) {
    console.error('Error eliminando deudor:', err);
    alert('No se pudo eliminar el deudor: ' + (err.message || 'Error de conexión'));
  }
}