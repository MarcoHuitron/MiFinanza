document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const contraseña = document.getElementById('password').value;

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña })
    });

    const data = await response.json();

    const mensaje = document.getElementById('mensaje');
    if (response.ok) {
      mensaje.textContent = `Bienvenido, ${data.usuario.nombre}!`;
      mensaje.style.color = 'green';

      // Puedes guardar el usuario en localStorage, por ejemplo:
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Redirigir al dashboard o página principal
      window.location.href = '/dashboard.html';
    } else {
      mensaje.textContent = data.error;
      mensaje.style.color = 'red';
    }
  } catch (error) {
    document.getElementById('mensaje').textContent = 'Error al conectar con el servidor.';
  }
});
