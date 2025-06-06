function cargarNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  
  if (!navbarContainer) {
    console.error('No se encontró el elemento con id "navbar-container"');
    return;
  }
  
  // Inyectar estilos del navbar
  const navbarStyles = document.createElement('style');
  navbarStyles.textContent = `
    /* Estilos del navbar */
    .bg-gradient-primary {
      background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
    }

    .navbar-brand img {
      transition: transform 0.2s;
    }
    .navbar-brand img:hover {
      transform: scale(1.08) rotate(-3deg);
    }

    .navbar .btn {
      border-radius: 8px;
      font-size: 1rem;
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
      border: none;
      font-weight: 600;
    }

    .navbar .btn-primary {
      background: linear-gradient(90deg, #4b6cb7 0%, #182848 100%);
    }
    .navbar .btn-primary:hover, .navbar .btn-primary.active {
      background: linear-gradient(90deg, #5d7ec9 0%, #253a5e 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .navbar .btn-warning {
      color: #1e3c72;
      background: linear-gradient(90deg, #ffd600 0%, #ffb300 100%);
    }
    .navbar .btn-warning:hover, .navbar .btn-warning.active {
      background: linear-gradient(90deg, #ffb300 0%, #ffd600 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .navbar .btn-info {
      background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
      color: white;
    }
    .navbar .btn-info:hover, .navbar .btn-info.active {
      background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .navbar .btn-success {
      background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
      color: white;
    }
    .navbar .btn-success:hover, .navbar .btn-success.active {
      background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .navbar .btn-danger {
      background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
    }
    .navbar .btn-danger:hover {
      background: linear-gradient(90deg, #c0392b 0%, #e74c3c 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .navbar .badge {
      font-size: 1rem;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .navbar .btn.active {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 992px) {
      .navbar .container {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }
      .navbar .d-flex {
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        width: 100%;
      }
      .navbar-brand span {
        font-size: 1.1rem;
      }
    }
    
    @media (max-width: 576px) {
      .navbar .d-flex {
        flex-direction: column;
      }
      
      .navbar .btn {
        width: 100%;
        margin-bottom: 0.3rem;
      }
      
      .navbar .badge {
        width: 100%;
        text-align: center;
        margin-bottom: 0.5rem;
      }
    }
  `;
  document.head.appendChild(navbarStyles);
  
  // Obtener la ruta actual para marcar el botón activo
  const currentPath = window.location.pathname;
  
  // Definir qué botón debe tener la clase "active" según la página actual
  const esDashboard = currentPath.includes('dashboard') || currentPath === '/' || currentPath === '';
  const esIngresos = currentPath.includes('ingresos');
  const esDeudores = currentPath.includes('deudores');
  const esHistorial = currentPath.includes('historial');

  // Cargar datos del usuario
  const user = JSON.parse(localStorage.getItem('usuario')) || { nombre: 'Usuario' };
  
  // HTML del navbar
  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-sm py-3 mb-4">
      <div class="container d-flex justify-content-between align-items-center">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="dashboard.html">
          <img src="/src/logoMF.png" alt="Logo" width="100" style="object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px #0002;">
          <span class="fs-4 ms-2">MyFinanza</span>
        </a>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-light text-primary fw-semibold px-3 py-2 fs-6 shadow-sm">
            <i class="fas fa-user-circle me-1"></i>
            Bienvenid@ <span id="nombreUsuario">${user.nombre}</span>
          </span>
          <a class="btn btn-primary fw-bold shadow-sm px-3 ${esDashboard ? 'active' : ''}" href="dashboard.html">
            <i class="fas fa-tachometer-alt me-1"></i> Dashboard
          </a>
          <a class="btn btn-info fw-bold shadow-sm px-3 ${esIngresos ? 'active' : ''}" href="ingresos.html">
            <i class="fas fa-hand-holding-usd me-1"></i> Ingresos
          </a>
          <a class="btn btn-success fw-bold shadow-sm px-3 ${esDeudores ? 'active' : ''}" href="deudores.html">
            <i class="fas fa-users me-1"></i> Deudores
          </a>
          <a class="btn btn-warning fw-bold shadow-sm px-3 ${esHistorial ? 'active' : ''}" href="historial.html">
            <i class="fas fa-history me-1"></i> Historial
          </a>
          <button id="logoutButton" class="btn btn-danger fw-bold shadow-sm px-3">
            <i class="fas fa-sign-out-alt me-1"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `;
  
  // Insertar el navbar en el contenedor
  navbarContainer.innerHTML = navbarHTML;
  
  // Añadir event listeners
  document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', cargarNavbar);