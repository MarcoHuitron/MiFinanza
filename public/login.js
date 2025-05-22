// Redirigir si ya hay sesión iniciada
if (localStorage.getItem('usuario')) {
  window.location.href = '/dashboard.html';
}

// URL base de la API según entorno
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://mifinanza.onrender.com/api';

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const contraseña = document.getElementById('password').value;

  const mensaje = document.getElementById('mensaje');

  // Validar email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    mensaje.textContent = 'Por favor, ingresa un correo electrónico válido.';
    mensaje.style.color = 'red';
    return;
  }

  // Validar longitud de contraseña
  if (contraseña.length < 6) {
    mensaje.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    mensaje.style.color = 'red';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.textContent = `Bienvenido, ${data.usuario.nombre}!`;
      mensaje.style.color = 'green';

      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = '/dashboard.html';
    } else {
      mensaje.textContent = data.error;
      mensaje.style.color = 'red';
    }
  } catch (error) {
    mensaje.textContent = 'Error al conectar con el servidor.';
    mensaje.style.color = 'red';
  }
});
