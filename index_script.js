// ============================
// index_script.js
// Contiene la lógica original de auth + funciones de accesibilidad.
// ============================

/* -------------------- CONFIGURACIÓN GENERAL / DOM -------------------- */
const API_BASE = 'http://localhost:8081';
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const msgEl = document.getElementById('msg');
const loggedInfo = document.getElementById('loggedInfo');
const userEmailEl = document.getElementById('userEmail');

const toggleBtn = document.getElementById('darkToggle'); // botón existente
const body = document.body;

// Accesibilidad: elementos nuevos
const accBtn = document.getElementById('accessibilityBtn');
const accPanel = document.getElementById('accessibilityPanel');
const accDarkToggle = document.getElementById('accDarkToggle');
const accIncreaseFont = document.getElementById('accIncreaseFont');
const accDecreaseFont = document.getElementById('accDecreaseFont');
const accResetFont = document.getElementById('accResetFont');
const accHighContrast = document.getElementById('accHighContrast');
const accReduceMotion = document.getElementById('accReduceMotion');

/* -------------------- SESIÓN / CARGA -------------------- */
window.addEventListener('load', () => {
  // Aplicar ajustes guardados (tema, tamaño, contraste, reducir movimiento)
  applyStoredTheme();
  applyStoredFontSize();
  applyStoredHighContrast();
  applyStoredReduceMotion();

  const token = getToken();
  if (token) {
    fetchMeAndRedirect(token);
  } else {
    showLogin();
  }
});

/* -------------------- LOGIN -------------------- */
if (loginBtn) {
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    clearMsg();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) return showMsg('Completa email y contraseña');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        return showMsg(err.message || 'Login failed');
      }
      const data = await res.json();
      handleAuthSuccess(data);
    } catch (err) {
      showMsg('Error de conexión: ' + err.message);
    }
  });
}

/* -------------------- REGISTRO -------------------- */
if (registerBtn) {
  registerBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    clearMsg();
    const fullname = document.getElementById('regFullname').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    if (!fullname || !email || !password) return showMsg('Completa todos los campos');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ fullname, email, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        return showMsg(err.error || err.message || 'Register failed');
      }
      const data = await res.json();
      handleAuthSuccess(data);
    } catch (err) {
      showMsg('Error de conexión: ' + err.message);
    }
  });
}

/* -------------------- AUTENTICACIÓN (helpers) -------------------- */
function handleAuthSuccess(data) {
  if (!data || !data.token) return showMsg('Respuesta inválida del servidor');
  setToken(data.token);
  const user = data.user || {};
  userEmailEl.textContent = user.email || '';
  loggedInfo.style.display = 'block';
  redirectByRoles(user.roles || []);
}

async function fetchMeAndRedirect(token) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 401) {
      clearAuthAndShowLogin();
      return;
    }
    if (!res.ok) {
      clearAuthAndShowLogin();
      showMsg('Error validando sesión');
      return;
    }
    const user = await res.json();
    userEmailEl.textContent = user.email || '';
    loggedInfo.style.display = 'block';
    redirectByRoles(user.roles || []);
  } catch (err) {
    showMsg('No se pudo validar sesión: ' + err.message);
  }
}

function redirectByRoles(roles) {
  const normalized = (roles || []).map(r => (r || '').toString().toUpperCase());
  const isAdmin = normalized.some(r => r.includes('ADMIN'));
  const isConsultor = normalized.some(r => r.includes('CONSULTOR') || r.includes('CONSULTANT') || r.includes('USER'));
  if (isAdmin) {
    window.location.href = 'app/admin.html';
  } else if (isConsultor) {
    window.location.href = 'app/consultor.html';
  } else {
    window.location.href = '/';
  }
}

/* -------------------- UTILIDADES -------------------- */
function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function clearToken() { localStorage.removeItem('token'); }
function logout() { clearToken(); clearAuthAndShowLogin(); }
function clearAuthAndShowLogin() {
  if (loggedInfo) loggedInfo.style.display = 'none';
  if (userEmailEl) userEmailEl.textContent = '';
  showLogin();
}
function showLogin() {
  const title = document.getElementById('title');
  if (title) title.textContent = 'Iniciar sesión';
  const l = document.getElementById('loginForm');
  const r = document.getElementById('registerForm');
  if (l) l.style.display = 'block';
  if (r) r.style.display = 'none';
  clearMsg();
}
function showRegister() {
  const title = document.getElementById('title');
  if (title) title.textContent = 'Registro';
  const l = document.getElementById('loginForm');
  const r = document.getElementById('registerForm');
  if (l) l.style.display = 'none';
  if (r) r.style.display = 'block';
  clearMsg();
}
function showMsg(m) { if (msgEl) msgEl.textContent = m; }
function clearMsg() { if (msgEl) msgEl.textContent = ''; }

/* -------------------- ACCESIBILIDAD / TEMA / FUENTE -------------------- */

/* Tema (sincroniza los dos botones) */
function setTheme(isDark) {
  if (isDark) {
    body.classList.add('dark');
    if (toggleBtn) toggleBtn.textContent = '☀️';
    if (accDarkToggle) accDarkToggle.textContent = '☀️ Modo claro';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    if (toggleBtn) toggleBtn.textContent = '🌙';
    if (accDarkToggle) accDarkToggle.textContent = '🌙 Modo oscuro';
    localStorage.setItem('theme', 'light');
  }
}

function applyStoredTheme() {
  const theme = localStorage.getItem('theme');
  setTheme(theme === 'dark');
}

/* Event listener para el botón existente (toggle en la UI principal) */
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    setTheme(!body.classList.contains('dark'));
  });
}

/* Accesibilidad: panel abierto/cerrado */
function openPanel() {
  if (!accPanel || !accBtn) return;
  accPanel.classList.add('open');
  accPanel.setAttribute('aria-hidden', 'false');
  accBtn.setAttribute('aria-expanded', 'true');
  // foco al primer botón
  const first = accPanel.querySelector('button');
  if (first) first.focus();
}

function closePanel() {
  if (!accPanel || !accBtn) return;
  accPanel.classList.remove('open');
  accPanel.setAttribute('aria-hidden', 'true');
  accBtn.setAttribute('aria-expanded', 'false');
  accBtn.focus();
}

if (accBtn) {
  accBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (accPanel && accPanel.classList.contains('open')) closePanel();
    else openPanel();
  });
}

/* Cerrar con Escape y clic fuera */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (accPanel && accPanel.classList.contains('open')) closePanel();
  }
});

document.addEventListener('click', (e) => {
  if (!accPanel) return;
  const isOpen = accPanel.classList.contains('open');
  if (!isOpen) return;
  const inside = accPanel.contains(e.target) || (accBtn && accBtn.contains(e.target));
  if (!inside) closePanel();
});

/* Tamaño de fuente (persistente) */
let fontSize = parseFloat(localStorage.getItem('fontSize')) || 1.0;
function applyStoredFontSize() {
  if (fontSize && !isNaN(fontSize)) {
    document.documentElement.style.fontSize = fontSize + 'em';
  } else {
    document.documentElement.style.fontSize = '1em';
  }
}
function setFontSize(size) {
  fontSize = Math.max(0.8, Math.min(2.0, +size.toFixed(2)));
  document.documentElement.style.fontSize = fontSize + 'em';
  localStorage.setItem('fontSize', fontSize);
}
if (accIncreaseFont) {
  accIncreaseFont.addEventListener('click', () => {
    setFontSize(Math.min(2.0, fontSize + 0.1));
  });
}
if (accDecreaseFont) {
  accDecreaseFont.addEventListener('click', () => {
    setFontSize(Math.max(0.8, fontSize - 0.1));
  });
}
if (accResetFont) {
  accResetFont.addEventListener('click', () => {
    fontSize = 1.0;
    document.documentElement.style.fontSize = '1em';
    localStorage.removeItem('fontSize');
  });
}

/* Alto contraste */
function setHighContrast(enabled) {
  body.classList.toggle('high-contrast', !!enabled);
  localStorage.setItem('highContrast', !!enabled ? '1' : '0');
  if (accHighContrast) accHighContrast.textContent = enabled ? '🔆 Alto contraste (ON)' : '🔆 Alto contraste';
}
function applyStoredHighContrast() {
  const v = localStorage.getItem('highContrast');
  setHighContrast(v === '1');
}
if (accHighContrast) {
  accHighContrast.addEventListener('click', () => {
    const isOn = body.classList.contains('high-contrast');
    setHighContrast(!isOn);
  });
}

/* Reducir movimiento */
function setReduceMotion(enabled) {
  body.classList.toggle('reduce-motion', !!enabled);
  localStorage.setItem('reduceMotion', !!enabled ? '1' : '0');
  if (accReduceMotion) accReduceMotion.textContent = enabled ? '⤴ Reducir movimiento (ON)' : '⤴ Reducir movimiento';
}
function applyStoredReduceMotion() {
  const v = localStorage.getItem('reduceMotion');
  setReduceMotion(v === '1');
}
if (accReduceMotion) {
  accReduceMotion.addEventListener('click', () => {
    const isOn = body.classList.contains('reduce-motion');
    setReduceMotion(!isOn);
  });
}

/* Sincronizar botón de accesibilidad para tema con el botón principal */
if (accDarkToggle) {
  accDarkToggle.addEventListener('click', () => {
    setTheme(!body.classList.contains('dark'));
  });
}

// ============================
// PANEL DE ACCESIBILIDAD
// ============================
const toggleThemeBtn = document.getElementById('toggleTheme');
const increaseFontBtn = document.getElementById('increaseFont');
const decreaseFontBtn = document.getElementById('decreaseFont');
const resetFontBtn = document.getElementById('resetFont');
const accessibilityToggle = document.getElementById('accessibilityToggle');
const accessibilityPanel = document.getElementById('accessibilityPanel');

let currentFontSize = 100;

// Mostrar / ocultar panel
accessibilityToggle.addEventListener('click', () => {
  accessibilityPanel.style.display =
    accessibilityPanel.style.display === 'flex' ? 'none' : 'flex';
});

// Aplicar tema guardado
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
  toggleThemeBtn.textContent = '☀️';
}

// Cambiar tema
toggleThemeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  toggleThemeBtn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Control de tamaño de fuente
increaseFontBtn.addEventListener('click', () => {
  currentFontSize += 10;
  document.body.style.fontSize = currentFontSize + '%';
});

decreaseFontBtn.addEventListener('click', () => {
  if (currentFontSize > 60) {
    currentFontSize -= 10;
    document.body.style.fontSize = currentFontSize + '%';
  }
});

resetFontBtn.addEventListener('click', () => {
  currentFontSize = 100;
  document.body.style.fontSize = '100%';
});

