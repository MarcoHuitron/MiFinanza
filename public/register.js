document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const contraseña = document.getElementById('password').value;

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, contraseña })
    });

    const data = await response.json();
    const mensaje = document.getElementById('mensaje');

    if (response.ok) {
      mensaje.textContent = 'Registro exitoso. Te redirigimos al login...';
      mensaje.style.color = 'green';

      // Redirigir a login.html tras 2 segundos
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      mensaje.textContent = data.error || 'Ocurrió un error';
      mensaje.style.color = 'red';
    }
  } catch (error) {
    document.getElementById('mensaje').textContent = 'Error al conectar con el servidor.';
    mensaje.style.color = 'red';
  }
});
