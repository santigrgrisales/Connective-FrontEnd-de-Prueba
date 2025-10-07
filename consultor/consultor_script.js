const API_BASE = 'http://localhost:8081';
const token = localStorage.getItem('token');
const body = document.body;

// === Funciones principales ===
async function cargarArchivos() {
  try {
    const res = await fetch(`${API_BASE}/api/archivos/list`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) return;
    const archivos = await res.json();
    const tbody = document.querySelector("#archivosTable tbody");
    tbody.innerHTML = "";
    archivos.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.id_archivo}</td>
        <td>${a.nombre_archivo || "-"}</td>
        <td>${a.description || "-"}</td>
        <td>${a.created_at || "-"}</td>
        <td><button class="btn-ver" onclick="verDashboard(${a.id_archivo})">Ver</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error cargando archivos:", e);
  }
}

function verDashboard(id) {
  window.location.href = `../app/dashboard.html?id=${id}`;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

// === Validar sesión y mostrar perfil ===
(async function check() {
  if (!token) { logout(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      logout();
      return;
    }
    const user = await res.json();
    document.getElementById('userEmail').textContent = user.email || "Usuario";
    const roles = (user.roles || []).map(r => r.toUpperCase());
    document.getElementById('userRole').textContent = roles.join(", ") || "CONSULTOR";
    if (!roles.some(r => r.includes('CONSULTOR'))) logout();
    else cargarArchivos();
  } catch {
    logout();
  }
})();

// === Barra de logout ===
document.getElementById('logoutBtn').addEventListener('click', logout);

// === Panel de accesibilidad ===
const accToggle = document.getElementById('accessibilityToggle');
const accOptions = document.getElementById('accessibilityOptions');
const darkToggle = document.getElementById('darkToggle');
const increaseText = document.getElementById('increaseText');
const decreaseText = document.getElementById('decreaseText');
const resetText = document.getElementById('resetText');

accToggle.addEventListener('click', () => {
  accOptions.classList.toggle('hidden');
});

// Modo oscuro persistente
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
  darkToggle.textContent = '☀️ Modo claro';
}

darkToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  darkToggle.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Tamaño de texto
let fontSize = parseFloat(localStorage.getItem('fontSize')) || 1;
body.style.fontSize = fontSize + 'em';

increaseText.addEventListener('click', () => {
  fontSize += 0.1;
  body.style.fontSize = fontSize + 'em';
  localStorage.setItem('fontSize', fontSize);
});
decreaseText.addEventListener('click', () => {
  fontSize = Math.max(0.8, fontSize - 0.1);
  body.style.fontSize = fontSize + 'em';
  localStorage.setItem('fontSize', fontSize);
});
resetText.addEventListener('click', () => {
  fontSize = 1;
  body.style.fontSize = '1em';
  localStorage.setItem('fontSize', 1);
});
