document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    return window.location.href = '/index.html';
  }
  document.getElementById('nombreUsuario').textContent = user.nombre;

  const listaTarjetas = document.getElementById('listaTarjetas');
  const listaCompras  = document.getElementById('listaCompras');
  const modal         = document.getElementById('cardModal');
  const openBtn       = document.getElementById('openCardModal');
  const closeBtn      = document.getElementById('closeCardModal');
  const form          = document.getElementById('cardForm');
  const logoutButton  = document.getElementById('logoutButton');

  // Funciones para cargar datos
  async function loadTarjetas() {
    try {
      const res = await fetch(`/api/tarjetas/${user.id}`);
      const tarjetas = await res.json();
      if (tarjetas.length === 0) {
        listaTarjetas.innerHTML = '<li>No tienes tarjetas registradas.</li>';
      } else {
        listaTarjetas.innerHTML = tarjetas
          .map(t => `<li>${t.nombre} (${t.tipo}) — •••• ${t.numero}</li>`)
          .join('');
      }
    } catch (e) {
      console.error('Error cargando tarjetas', e);
    }
  }

  async function loadCompras() {
    try {
      const res = await fetch(`/api/compras/${user.id}`);
      const compras = await res.json();
      if (compras.length === 0) {
        listaCompras.innerHTML = '<li>No has registrado compras.</li>';
      } else {
        listaCompras.innerHTML = compras
          .map(c => `<li>[${new Date(c.fecha).toLocaleDateString()}] ${c.descripcion} — $${c.monto} (${c.tarjeta})</li>`)
          .join('');
      }
    } catch (e) {
      console.error('Error cargando compras', e);
    }
  }

  // Inicializa
  await loadTarjetas();
  await loadCompras();

  // Modal: abrir/cerrar
  openBtn.addEventListener('click', () => modal.style.display = 'flex');
  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Logout: limpiar localStorage y redirigir
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });

  // Envío del formulario
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.cardName.value;
    const tipo   = form.cardType.value;
    const numero = form.cardLast4.value;

    try {
      await fetch('/api/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, nombre, tipo, numero })
      });
      form.reset();
      modal.style.display = 'none';
      await loadTarjetas();
    } catch (err) {
      console.error('Error guardando tarjeta', err);
    }
  });
});
