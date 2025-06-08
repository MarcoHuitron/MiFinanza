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
      width: 100px; /* Imagen más grande por defecto */
    }
    .navbar-brand img:hover {
      transform: scale(1.08) rotate(-3deg);
    }

    .navbar .btn {
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      border: none;
      font-weight: 600;
      white-space: nowrap;
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      font-size: 0.9rem;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .navbar .btn.active {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }

    /* Desktop Navigation */
    .nav-items {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Hamburger menu button */
    .navbar-toggler {
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 8px 12px;
      display: none;
      cursor: pointer;
    }
    
    .navbar-toggler:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }
    
    .navbar-toggler-icon {
      display: inline-block;
      width: 1.5em;
      height: 1.5em;
      vertical-align: middle;
      background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.9)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
      background-size: 100% 100%;
    }

    /* Responsive styles */
    @media (max-width: 1199px) {
      .navbar .btn {
        font-size: 0.85rem;
        padding: 0.5rem 0.8rem;
      }
      
      .nav-items {
        gap: 8px;
      }
      
      .navbar-brand span {
        font-size: 1.1rem;
      }
      
      .navbar-brand img {
        width: 100px; /* Imagen un poco más pequeña en pantallas medianas */
      }
    }

    @media (max-width: 991px) {
      .navbar-toggler {
        display: block;
      }
      
      .navbar-collapse {
        position: fixed;
        top: 0;
        right: -300px;
        width: 300px;
        height: 100vh;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        z-index: 1050;
        transition: right 0.3s ease;
        padding: 1.5rem;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      
      .navbar-collapse.show {
        right: 0;
      }
      
      .navbar .nav-items {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 12px;
        margin-top: 0; /* Sin margen superior ya que no hay botón X */
      }
      
      .navbar .btn {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        justify-content: flex-start;
      }
      
      .navbar .badge {
        width: 100%;
        text-align: center;
        padding: 0.75rem;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }
      
      .overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1040;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .overlay.show {
        display: block;
        opacity: 1;
      }
    }

    @media (max-width: 767px) {
      .navbar {
        padding: 0.75rem 0;
      }
      
      .navbar-brand {
        font-size: 1rem;
      }
      
      .navbar-brand img {
        width: 100px; /* Imagen aún visible en tablets */
      }
      
      .navbar-collapse {
        width: 280px;
        padding: 1rem;
      }
      
      .navbar .btn {
        padding: 0.875rem 1rem;
        font-size: 0.95rem;
      }
    }

    @media (max-width: 575px) {
      .navbar-brand span {
        display: none;
      }
      
      .navbar-brand img {
        width: 100px; /* Imagen más pequeña pero visible en móviles */
      }
      
      .navbar-collapse {
        width: 260px;
        right: -260px;
      }
      
      .navbar .btn {
        padding: 1rem;
        font-size: 0.9rem;
      }
      
      .navbar .badge {
        padding: 0.875rem;
        font-size: 0.9rem;
      }
    }

    /* Animations */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(100%);
      }
    }

    .navbar-collapse.show {
      animation: slideIn 0.3s ease;
    }

    /* Better button spacing on desktop */
    @media (min-width: 992px) {
      .nav-items {
        margin-left: auto;
      }
      
      .navbar .container {
        max-width: 1200px;
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
  
  // HTML del navbar con estructura responsive mejorada (sin botón X)
  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow-sm py-2 mb-4">
      <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="dashboard.html">
          <img src="/src/logoMF.png" alt="Logo" style="object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px #0002;">
          <span class="fs-5 ms-2">MyFinanza</span>
        </a>
        
        <button class="navbar-toggler" type="button" id="navbarToggler" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="navbar-collapse" id="navbarCollapse">
          <div class="nav-items">
            <span class="badge bg-light text-primary fw-semibold px-3 py-2 shadow-sm">
              <i class="fas fa-user-circle me-1"></i>
              <span class="d-none d-md-inline">Bienvenid@ </span><span id="nombreUsuario">${user.nombre}</span>
            </span>
            <a class="btn btn-primary fw-bold shadow-sm ${esDashboard ? 'active' : ''}" href="dashboard.html">
              <i class="fas fa-tachometer-alt me-2"></i> Dashboard
            </a>
            <a class="btn btn-info fw-bold shadow-sm ${esIngresos ? 'active' : ''}" href="ingresos.html">
              <i class="fas fa-hand-holding-usd me-2"></i> Ingresos
            </a>
            <a class="btn btn-success fw-bold shadow-sm ${esDeudores ? 'active' : ''}" href="deudores.html">
              <i class="fas fa-users me-2"></i> Deudores
            </a>
            <a class="btn btn-warning fw-bold shadow-sm ${esHistorial ? 'active' : ''}" href="historial.html">
              <i class="fas fa-history me-2"></i> Historial
            </a>
            <button id="logoutButton" class="btn btn-danger fw-bold shadow-sm">
              <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
    <div class="overlay" id="navOverlay"></div>
  `;
  
  // Insertar el navbar en el contenedor
  navbarContainer.innerHTML = navbarHTML;
  
  // Añadir event listeners
  document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });
  
  // Event listeners para el menú móvil (sin botón close)
  const navbarToggler = document.getElementById('navbarToggler');
  const navbarCollapse = document.getElementById('navbarCollapse');
  const navOverlay = document.getElementById('navOverlay');
  
  function openMenu() {
    navbarCollapse.classList.add('show');
    navOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    navbarCollapse.classList.remove('show');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  navbarToggler.addEventListener('click', openMenu);
  navOverlay.addEventListener('click', closeMenu);
  
  // Cerrar menú al hacer clic en un enlace de navegación
  const navLinks = navbarCollapse.querySelectorAll('a.btn');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
      closeMenu();
    }
  });
  
  // Mejorar accesibilidad
  navbarToggler.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }
  });
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', cargarNavbar);