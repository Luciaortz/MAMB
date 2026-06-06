const API = "https://mamb-backend.onrender.com";

let USER_ID = localStorage.getItem("mambaq_user_id");
if (!USER_ID) {
  USER_ID = "user_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("mambaq_user_id", USER_ID);
}

lucide.createIcons();

const today = new Date().toLocaleDateString();
document.getElementById("creationDate").innerHTML = "📅 Fecha de creación: " + today;

const screens = document.querySelectorAll(".screen");

function goTo(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "gallery") fetchGallery();
}

function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}

// ══════════════════════════════════
// MODO OSCURO
// ══════════════════════════════════
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.querySelector(".phone").classList.toggle("dark-mode", darkMode);
  document.getElementById("darkModeIcon").setAttribute("data-lucide", darkMode ? "sun" : "moon");
  document.getElementById("darkModeLabel").innerText = darkMode ? "Modo claro" : "Modo oscuro";
  lucide.createIcons();
}

// ══════════════════════════════════
// IMAGEN Y ESTILOS
// ══════════════════════════════════
const galleryInput = document.getElementById("galleryInput");
const cameraInput  = document.getElementById("cameraInput");
const placeholder  = document.getElementById("placeholder");
const previewImage = document.getElementById("previewImage");

let selectedImage = null;
let selectedStyle = "anime";

function loadImage(file) {
  if (!file) return;
  selectedImage = file;
  previewImage.src = URL.createObjectURL(file);
  previewImage.classList.remove("hidden");
  placeholder.classList.add("hidden");
}

galleryInput.addEventListener("change", e => loadImage(e.target.files[0]));
cameraInput.addEventListener("change",  e => loadImage(e.target.files[0]));

// --- Nuevas funciones de Cámara para el Escáner ---
let scannerStream = null;

async function openScannerCamera() {
  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById("scannerVideo");
    video.srcObject = scannerStream;
    video.classList.remove("hidden");
    document.getElementById("placeholder").classList.add("hidden");
    document.getElementById("previewImage").classList.add("hidden");
    document.getElementById("snapBtn").classList.remove("hidden");
  } catch {
    showToast("No se pudo acceder a la cámara 📷");
  }
}

function snapPhoto() {
  const video = document.getElementById("scannerVideo");
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    selectedImage = new File([blob], "captura.png", { type: "image/png" });
    const preview = document.getElementById("previewImage");
    preview.src = URL.createObjectURL(blob);
    preview.classList.remove("hidden");
    document.getElementById("scannerVideo").classList.add("hidden");
    document.getElementById("snapBtn").classList.add("hidden");
    document.getElementById("placeholder").classList.add("hidden");

    // Detener cámara
    if (scannerStream) { scannerStream.getTracks().forEach(t => t.stop()); scannerStream = null; }
  });
}

const styleCards = document.querySelectorAll(".style-card");
styleCards.forEach(card => {
  card.addEventListener("click", () => {
    styleCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedStyle = card.dataset.style;
  });
});

// ══════════════════════════════════
// GENERAR ARTE — dibuja en canvas
// ══════════════════════════════════
function generateArt() {
  const artist  = document.getElementById("artistName").value;
  const artwork = document.getElementById("artName").value;

  if (!selectedImage) { alert("Selecciona una imagen."); return; }
  if (!artist || !artwork) { alert("Completa los datos."); return; }

  document.getElementById("finalArtist").innerText  = artist;
  document.getElementById("finalArtwork").innerText = artwork;
  document.getElementById("finalDate").innerText    = today;
  document.getElementById("finalStyle").innerText   = selectedStyle.toUpperCase();

  goTo("result");

  const filters = {
    anime: "contrast(1.5) saturate(2)",
    comic: "contrast(2.5) saturate(3)",
    retro: "sepia(.9) contrast(1.6)",
    neon:  "contrast(2) saturate(3) hue-rotate(40deg)",
  };

  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById("resultCanvas");
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.filter = filters[selectedStyle] || "none";
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";
  };
  img.src = URL.createObjectURL(selectedImage);
}

// ══════════════════════════════════
// DESCARGAR Y COMPARTIR
// ══════════════════════════════════
async function downloadArtwork() {
  const canvas = await html2canvas(document.getElementById("artworkCard"));
  const link   = document.createElement("a");
  link.download = "mambaq-art.png";
  link.href     = canvas.toDataURL();
  link.click();
}

async function shareArtwork() {
  const canvas = await html2canvas(document.getElementById("artworkCard"));
  canvas.toBlob(async blob => {
    const file = new File([blob], "mambaq-art.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "MAMBAQ", text: "Mira mi obra creada con IA", files: [file] });
    } else {
      alert("Tu navegador no soporta compartir.");
    }
  });
}

// ══════════════════════════════════
// GUARDAR EN GALERÍA
// ══════════════════════════════════
async function saveToGallery() {
  const artist  = document.getElementById("finalArtist").innerText;
  const artwork = document.getElementById("finalArtwork").innerText;

  if (!artist || !artwork) { showToast("⚠️ Genera una obra primero"); return; }

  showToast("Guardando... ✨");

  const canvas = await html2canvas(document.getElementById("artworkCard"));

  const data = {
    nombreObra:     artwork,
    nombreArtistico: artist,
    imagen:         canvas.toDataURL("image/png")
  };

  try {
    const res = await fetch(`${API}/api/artworks/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    showToast("¡Guardado en el museo! 🎨");
  } catch {
    showToast("❌ Error al guardar");
  }
}

// ══════════════════════════════════
// GALERÍA
// ══════════════════════════════════
async function fetchGallery() {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;opacity:.6;">Cargando... ✨</div>`;
  try {
    const res  = await fetch(`${API}/api/artworks`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderGallery(data);
  } catch {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;opacity:.6;">⚠️ No se pudo cargar la galería</div>`;
  }
}

function renderGallery(items) {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = "";
  if (!items || items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;opacity:.6;">🎨 La galería está vacía. ¡Sé el primero!</div>`;
    return;
  }
  items.forEach(item => {
    grid.innerHTML += `
    <div class="gallery-card">
      <img src="${item.imagen}" onerror="this.src='https://via.placeholder.com/300x200?text=MAMBAQ'">
      <div class="gallery-body">
        <h3>${item.nombreObra}</h3>
        <p style="font-size:12px;opacity:.7;margin-top:4px;">👤 ${item.nombreArtistico}</p>
        <p style="font-size:11px;opacity:.5;margin-top:2px;">📅 ${new Date(item.fechaCreacion).toLocaleDateString()}</p>
      </div>
    </div>`;
  });
}

// ══════════════════════════════════
// NOTIFICACIONES
// ══════════════════════════════════
let currentAuthor = null;

async function fetchNotifications() {
  if (!currentAuthor) return;
  try {
    const res  = await fetch(`${API}/notifications/${encodeURIComponent(currentAuthor)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderNotifications(data);
    const unread = data.filter(n => !n.read).length;
    updateNotifBadge(unread);
  } catch {
    console.warn("No se pudieron cargar las notificaciones");
  }
}

function renderNotifications(items) {
  const list = document.getElementById("notificationList");
  if (!items || items.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:30px 10px;opacity:.6;">✨ No tienes notificaciones todavía 🎨</div>`;
    return;
  }
  list.innerHTML = "";
  items.forEach(notif => {
    list.innerHTML += `
    <div class="notification-item" style="${notif.read ? 'opacity:.6' : ''}">
      <div class="notification-icon">💖</div>
      <div class="notification-content">
        <h4>¡Nueva reacción! ✨</h4>
        <p>${notif.message}</p>
        <p style="font-size:10px;opacity:.5;margin-top:4px;">${new Date(notif.created_at).toLocaleString()}</p>
      </div>
      ${!notif.read ? `<button onclick="markRead('${notif.id}')" style="border:none;background:#ffe4ef;border-radius:10px;padding:6px 10px;cursor:pointer;font-size:11px;font-family:'Fredoka',sans-serif;">✓</button>` : ""}
    </div>`;
  });
}

async function markRead(notifId) {
  try {
    await fetch(`${API}/notifications/${notifId}/read`, { method: "PATCH" });
    fetchNotifications();
  } catch { console.warn("Error al marcar como leída"); }
}

function updateNotifBadge(count) {
  console.log(`Notificaciones sin leer: ${count}`);
}

function openNotifications() {
  document.getElementById("notificationPanel").classList.remove("hidden");
  fetchNotifications();
}

function closeNotifications() {
  document.getElementById("notificationPanel").classList.add("hidden");
}

// ══════════════════════════════════
// PERFIL
// ══════════════════════════════════
let currentUser = null;

function showRegister() {
  document.getElementById("registerBox").classList.remove("hidden");
}

function encryptPassword(password) {
  return "*".repeat(password.length);
}

function createAccount() {
  const email    = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  if (!email || !password) { alert("Completa todos los campos."); return; }
  currentUser    = { email, password };
  currentAuthor = email;
  document.getElementById("guestProfile").classList.add("hidden");
  document.getElementById("userProfile").classList.remove("hidden");
  document.getElementById("profileEmail").innerText    = email;
  document.getElementById("profilePassword").innerText = encryptPassword(password);
  fetchNotifications();
  showToast("¡Cuenta creada! 🎨✨");
}

function logout() {
  currentUser    = null;
  currentAuthor = null;
  document.getElementById("registerEmail").value      = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("userProfile").classList.add("hidden");
  document.getElementById("guestProfile").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  showToast("Sesión cerrada 🚪");
}

const profilePhotoEl = document.getElementById("profilePhoto");
if (profilePhotoEl) {
  profilePhotoEl.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById("profilePreview").src = URL.createObjectURL(file);
  });
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function showToast(msg) {
  let toast = document.getElementById("mambaq-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "mambaq-toast";
    toast.style.cssText = `
      position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
      background:#2a1b14;color:white;padding:12px 22px;border-radius:18px;
      font-family:'Fredoka',sans-serif;font-size:15px;z-index:9999;
      box-shadow:0 8px 24px rgba(0,0,0,.3);transition:opacity .3s;
      white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2800);
}

// ══════════════════════════════════
// GESTOS IA
// ══════════════════════════════════
let gestureModel     = null;
let gestureStream    = null;
let gestureAnimFrame = null;
let gestureMode      = 'idle';

const GESTURE_EMOJIS = {
  'Mano abierta': '🖐️',
  'Gesto paz':    '✌️',
  'Puño':         '✊',
};

async function loadGestureModel() {
  if (gestureModel) return true;
  document.getElementById("gestureResult").innerText = "Cargando modelo... ⏳";
  try {
    const modelURL    = "model.json";
    const metadataURL = "metadata.json";
    gestureModel = await tmImage.load(modelURL, metadataURL);
    return true;
  } catch (e) {
    console.error(e);
    document.getElementById("gestureResult").innerText = "❌ Error al cargar el modelo";
    return false;
  }
}

async function initGestureAI() {
  const ok = await loadGestureModel();
  if (!ok) return;
  stopGestureCamera();
  gestureMode = 'camera';
  try {
    gestureStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    const video = document.getElementById("webcam");
    video.srcObject = gestureStream;
    video.style.display = "block";
    document.getElementById("gesturePlaceholder").style.display = "none";
    document.getElementById("gesturePreview").classList.add("hidden");
    document.getElementById("gestureResult").innerText = "Detectando... 👀";
    video.onloadedmetadata = () => loopGesture();
  } catch {
    showToast("No se pudo acceder a la cámara 📷");
    gestureMode = 'idle';
  }
}

async function loopGesture() {
  if (gestureMode !== 'camera') return;
  const video = document.getElementById("webcam");
  if (video.readyState >= 2) await predictGesture(video);
  gestureAnimFrame = requestAnimationFrame(loopGesture);
}

const gestureImageInputEl = document.getElementById("gestureImageInput");
if (gestureImageInputEl) {
  gestureImageInputEl.addEventListener("change", async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    stopGestureCamera();
    gestureMode = 'image';
    const ok = await loadGestureModel();
    if (!ok) return;
    const preview = document.getElementById("gesturePreview");
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
    document.getElementById("gesturePlaceholder").style.display = "none";
    document.getElementById("gestureResult").innerText = "Analizando... ✨";
    preview.onload = async () => await predictGesture(preview);
  });
}

async function predictGesture(input) {
  if (!gestureModel) return;
  try {
    const predictions = await gestureModel.predict(input);
    const top = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
    const pct = Math.round(top.probability * 100);
    const emoji = GESTURE_EMOJIS[top.className] || '🖐️';
    document.getElementById("gestureResult").innerText = `${emoji} ${top.className} (${pct}%)`;
  } catch (e) {
    console.warn("Predict error:", e);
  }
}

function stopGestureCamera() {
  if (gestureAnimFrame) { cancelAnimationFrame(gestureAnimFrame); gestureAnimFrame = null; }
  if (gestureStream) { gestureStream.getTracks().forEach(t => t.stop()); gestureStream = null; }
  const video = document.getElementById("webcam");
  if (video) { video.srcObject = null; video.style.display = "none"; }
  gestureMode = 'idle';
}

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
fetchGallery();
