if (localStorage.getItem('usuario')) {
  window.location.href = '/dashboard.html';
}

// URL base de la API según entorno
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://mifinanza.onrender.com/api';

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const contraseña = document.getElementById('password').value;

  const mensaje = document.getElementById('mensaje');
  const submitButton = document.querySelector('#registerForm button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;

  // Validar email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    mensaje.textContent = 'Por favor, ingresa un correo electrónico válido.';
    mensaje.style.color = 'red';
    return;
  }

  // Sanitizar nombre (solo letras, espacios y acentos)
  const nombreSanitizado = nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
  if (nombreSanitizado.length < 2) {
    mensaje.textContent = 'El nombre debe tener al menos 2 letras y solo puede contener letras y espacios.';
    mensaje.style.color = 'red';
    return;
  }

  // Validar longitud de contraseña
  if (contraseña.length < 6) {
    mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    mensaje.style.color = 'red';
    return;
  }

  // Mostrar estado de carga
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Registrando...
  `;
  mensaje.textContent = '';

  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreSanitizado, email, contraseña })
    });

    const data = await response.json();

    if (response.ok) {
      // Mostrar éxito
      submitButton.innerHTML = `
        <i class="fas fa-check me-2"></i>
        ¡Registrado!
      `;
      submitButton.className = 'btn btn-success w-100';
      
      mensaje.textContent = 'Registro exitoso. Te redirigimos al login...';
      mensaje.style.color = 'green';
      
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      // Restaurar botón en caso de error
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      
      mensaje.textContent = data.error || 'Ocurrió un error';
      mensaje.style.color = 'red';
    }
  } catch (error) {
    // Restaurar botón en caso de error de conexión
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    
    mensaje.textContent = 'Error al conectar con el servidor.';
    mensaje.style.color = 'red';
  }
});
