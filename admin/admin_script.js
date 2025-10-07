const API_BASE = 'http://localhost:8081';
const token = localStorage.getItem('token');

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const nombreArchivo = document.getElementById("nombreArchivo");
const descripcion = document.getElementById("descripcion");
const statusEl = document.getElementById("status");

uploadBtn.addEventListener("click", async () => {
  if (fileInput.files.length === 0) {
    statusEl.innerText = "Por favor selecciona un archivo CSV";
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  if (nombreArchivo.value) formData.append("nombreArchivo", nombreArchivo.value);
  if (descripcion.value) formData.append("description", descripcion.value);

  try {
    const response = await fetch(`${API_BASE}/api/archivos/upload`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      statusEl.innerText = "Error: " + errText;
      return;
    }

    const data = await response.json();
    statusEl.innerText = "Subida exitosa: " + JSON.stringify(data);
    cargarArchivos();
  } catch (err) {
    statusEl.innerText = "Error en la conexión: " + err.message;
  }
});

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
        <td><span class="btn-link" onclick="verDashboard(${a.id_archivo})">Ver Dashboard</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error cargando archivos:", e);
  }
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

function verDashboard(id) {
  window.location.href = `../app/dashboard.html?id=${id}`;
}

// Validar sesión al cargar
(async function check() {
  if (!token) { window.location.href = '/'; return; }
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      logout();
      return;
    }
    const user = await res.json();
    const roles = (user.roles || []).map(r => r.toUpperCase());
    if (!roles.some(r => r.includes('ADMIN'))) logout();
    else cargarArchivos();
  } catch {
    logout();
  }
})();

/* 🎛️ Panel de accesibilidad */
const accToggle = document.getElementById('accessibilityToggle');
const accOptions = document.getElementById('accessibilityOptions');
const darkToggle = document.getElementById('darkToggle');
const increaseText = document.getElementById('increaseText');
const decreaseText = document.getElementById('decreaseText');
const resetText = document.getElementById('resetText');
const body = document.body;

accToggle.addEventListener('click', () => {
  accOptions.classList.toggle('hidden');
});

// Dark mode persistente
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

// Control de tamaño de fuente
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
