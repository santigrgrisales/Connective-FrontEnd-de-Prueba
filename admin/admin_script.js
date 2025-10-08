const API_BASE = 'http://localhost:8081';
const token = localStorage.getItem('token');

// Elementos del formulario
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const nombreArchivo = document.getElementById("nombreArchivo");
const descripcion = document.getElementById("descripcion");
const statusEl = document.getElementById("status");

// Elementos del Modal de Éxito
const successModal = document.getElementById('modal-success');
const btnOk = document.getElementById('btn-ok');


// ------------------ UTIL: logout btn hookup ------------------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    logout();
  });
}

// === LIMPIAR FORMULARIO ===
function resetForm() {
  fileInput.value = '';
  nombreArchivo.value = '';
  descripcion.value = '';
  statusEl.textContent = '';
}

// === MOSTRAR/OCULTAR POPUP DE ÉXITO ===
function showSuccessPopup() {
  if (successModal) {
    successModal.classList.remove('hidden');
    successModal.setAttribute('aria-hidden', 'false');
  }
}

function hideSuccessPopup() {
  if (successModal) {
    successModal.classList.add('hidden');
    successModal.setAttribute('aria-hidden', 'true');
  }
}

if (btnOk) {
  btnOk.addEventListener('click', hideSuccessPopup);
}


// === SUBIR ARCHIVO ===
uploadBtn.addEventListener("click", async () => {
  if (fileInput.files.length === 0) {
    statusEl.innerText = "Por favor selecciona un archivo CSV";
    return;
  }
  
  statusEl.innerText = "Subiendo archivo...";

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

    await response.json();
    
    // --- Lógica de éxito ---
    showSuccessPopup(); // Muestra el pop-up de éxito
    resetForm();        // Limpia el formulario
    cargarArchivos();   // Recarga la lista de archivos
    
  } catch (err) {
    statusEl.innerText = "Error en la conexión: " + err.message;
  }
});

// === CARGAR ARCHIVOS ===
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
        <td class="acciones">
          <button class="btn-action" onclick="verDashboard(${a.id_archivo})">ver </button>
          <button class="btn-delete" onclick="eliminarArchivo(${a.id_archivo})">borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error cargando archivos:", e);
  }
}

// === ELIMINAR ARCHIVO ===
let idArchivoEliminar = null;

function eliminarArchivo(id) {
  idArchivoEliminar = id;
  document.getElementById("modal-confirm").classList.remove("hidden");
}

document.getElementById("btn-cancelar").addEventListener("click", () => {
  document.getElementById("modal-confirm").classList.add("hidden");
  idArchivoEliminar = null;
});

document.getElementById("btn-confirmar").addEventListener("click", async () => {
  if (!idArchivoEliminar) return;
  const id = idArchivoEliminar;
  idArchivoEliminar = null;
  document.getElementById("modal-confirm").classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE}/api/archivos/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    });

    if (res.ok) {
      alert("Archivo eliminado correctamente.");
      cargarArchivos();
    } else {
      const error = await res.text();
      alert("Error al eliminar: " + error);
    }
  } catch (e) {
    console.error("Error eliminando archivo:", e);
    alert("Error de conexión con el servidor.");
  }
});

// === ACCIONES GENERALES ===
function logout() {
  localStorage.removeItem('token');
  // opcional: quitar userEmail/userRole guardados
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  window.location.href = '../index.html';
}

function verDashboard(id) {
  window.location.href = `../app/dashboard.html?id=${id}`;
}

// ------------------ VALIDAR SESIÓN Y OBTENER USUARIO (real desde /api/auth/me) ------------------
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

    // Mostrar email y rol en la top-bar
    const emailEl = document.getElementById('userEmail');
    const roleEl = document.getElementById('userRole');
    if (emailEl) emailEl.textContent = user.email || '';
    // determinar rol amigable
    const roles = (user.roles || []).map(r => (''+r).toUpperCase());
    let friendly = roles.some(r => r.includes('ADMIN')) ? 'Administrador'
                 : roles.some(r => r.includes('CONSULTOR') || r.includes('CONSULTANT')) ? 'Consultor'
                 : (roles.length ? roles.join(', ') : 'Usuario');
    if (roleEl) roleEl.textContent = friendly;
 // almacenar para otras páginas (opcional)
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userRole', friendly);

    // cargar tabla
    cargarArchivos();
  } catch (e) {
    console.error('Error validando sesión:', e);
    logout();
  }
})();

/* === PANEL DE ACCESIBILIDAD === */
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
