/* ============================================================
   MAMBAQ IA — app.js
   ============================================================ */

lucide.createIcons();

// --- Fecha ---
const today = new Date().toLocaleDateString('es-CO', {
  year: 'numeric', month: 'long', day: 'numeric'
});
document.getElementById("creationDate").innerHTML = "📅 Fecha de creación: " + today;

// ============================================================
// NAVEGACIÓN
// ============================================================
const screens = document.querySelectorAll(".screen");

function goTo(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}

// ============================================================
// MODO OSCURO — usando variables CSS en <html>
// ============================================================
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.classList.toggle("dark-mode", darkMode);

  const icon  = document.getElementById("darkModeIcon");
  const label = document.getElementById("darkModeLabel");

  if (darkMode) {
    icon.setAttribute("data-lucide", "sun");
    label.textContent = "Modo claro";
  } else {
    icon.setAttribute("data-lucide", "moon");
    label.textContent = "Modo oscuro";
  }
  lucide.createIcons();
}

// ============================================================
// SECCIÓN "CREAR OBRA" — carga de imagen
// ============================================================
const galleryInput  = document.getElementById("galleryInput");
const cameraInput   = document.getElementById("cameraInput");
const previewImage  = document.getElementById("previewImage");
const placeholder   = document.getElementById("placeholder");

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

// ──────────────────────────────────────────────────────────
// FIX 1: Botón "Cámara" — abre la cámara real del dispositivo
// El input#cameraInput ya tiene capture="environment", pero
// en algunos navegadores de escritorio se ignora.
// Añadimos un botón que primero intenta getUserMedia (stream
// en vivo), y si el navegador no lo soporta cae al input.
// ──────────────────────────────────────────────────────────
function openCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Crear modal de cámara en vivo
    showLiveCameraModal();
  } else {
    // Fallback: input file con capture
    cameraInput.click();
  }
}

/* Modal de cámara en vivo para capturar foto */
function showLiveCameraModal() {
  // Contenedor del modal
  const modal = document.createElement("div");
  modal.id = "cameraModal";
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.85);
    z-index:9999;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:16px;
  `;

  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.style.cssText = `
    width:320px;max-width:90vw;border-radius:24px;
    border:3px solid white;
  `;

  const snapBtn = document.createElement("button");
  snapBtn.textContent = "📸 Capturar foto";
  snapBtn.style.cssText = `
    padding:14px 32px;border:none;border-radius:20px;
    background:#ff8f1f;color:white;font-size:17px;
    font-family:'Fredoka',sans-serif;cursor:pointer;
  `;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "✖ Cancelar";
  cancelBtn.style.cssText = `
    padding:10px 24px;border:none;border-radius:16px;
    background:#555;color:white;font-size:14px;
    font-family:'Fredoka',sans-serif;cursor:pointer;
  `;

  modal.append(video, snapBtn, cancelBtn);
  document.body.appendChild(modal);

  let stream;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      video.srcObject = s;
    })
    .catch(() => {
      // Si falla getUserMedia, cerrar modal y usar input file
      closeModal();
      cameraInput.click();
    });

  function closeModal() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    document.body.removeChild(modal);
  }

  snapBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      const file = new File([blob], "camara.png", { type: "image/png" });
      loadImage(file);
      closeModal();
    }, "image/png");
  });

  cancelBtn.addEventListener("click", closeModal);
}

// ============================================================
// SELECCIÓN DE ESTILO
// ============================================================
const styleCards = document.querySelectorAll(".style-card");

styleCards.forEach(card => {
  card.addEventListener("click", () => {
    styleCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedStyle = card.dataset.style;
  });
});

// ============================================================
// GENERACIÓN DE ARTE — aplica filtro CSS en Canvas
// ============================================================
let editedImageDataURL = null;

const FILTERS = {
  anime: "contrast(1.5) saturate(2)",
  comic: "contrast(2.5) saturate(3)",
  retro: "sepia(0.9) contrast(1.6)",
  neon:  "contrast(2) saturate(3) hue-rotate(40deg)"
};

function applyFilterToCanvas(imgSrc, filterCSS) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById("resultCanvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = filterCSS;
      ctx.drawImage(img, 0, 0);
      editedImageDataURL = canvas.toDataURL("image/png");
      resolve();
    };
    img.src = imgSrc;
  });
}

async function generateArt() {
  const artist  = document.getElementById("artistName").value;
  const artwork = document.getElementById("artName").value;

  if (!selectedImage)      { alert("Selecciona una imagen.");  return; }
  if (!artist || !artwork) { alert("Completa los datos.");     return; }

  document.getElementById("finalArtist").innerText  = artist;
  document.getElementById("finalArtwork").innerText = artwork;
  document.getElementById("finalDate").innerText    = today;
  document.getElementById("finalStyle").innerText   = selectedStyle.toUpperCase();

  goTo("result");

  const url = URL.createObjectURL(selectedImage);
  await applyFilterToCanvas(url, FILTERS[selectedStyle] || "none");
}

// ============================================================
// DESCARGA Y COMPARTIR (imagen editada)
// ============================================================
function downloadArtwork() {
  if (!editedImageDataURL) { alert("Genera una obra primero."); return; }
  const link = document.createElement("a");
  link.download = "mambaq-art.png";
  link.href = editedImageDataURL;
  link.click();
}

async function shareArtwork() {
  if (!editedImageDataURL) { alert("Genera una obra primero."); return; }
  const blob = await (await fetch(editedImageDataURL)).blob();
  const file = new File([blob], "mambaq-art.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: "MAMBAQ", text: "Mira mi obra con IA", files: [file] });
  } else {
    alert("Tu navegador no soporta compartir archivos.");
  }
}

// ============================================================
// NOTIFICACIONES
// ============================================================
let notifications = [];

function openNotifications() {
  document.getElementById("notificationPanel").classList.remove("hidden");
  renderNotifications();
}
function closeNotifications() {
  document.getElementById("notificationPanel").classList.add("hidden");
}
function renderNotifications() {
  const list = document.getElementById("notificationList");
  if (notifications.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:30px 10px;opacity:.6;">✨ No tienes notificaciones todavía 🎨</div>`;
    return;
  }
  list.innerHTML = "";
  notifications.forEach(n => {
    list.innerHTML += `
      <div class="notification-item">
        <div class="notification-icon">💖</div>
        <div class="notification-content">
          <h4>¡Nueva reacción! ✨</h4><p>${n}</p>
        </div>
      </div>`;
  });
}

// ============================================================
// MUSEO INTERACTIVO
// ============================================================
let museum = [
  { img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop', style:'Anime',  author:'Sofía',  likes:12 },
  { img:'https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=600&auto=format&fit=crop', style:'Retro',  author:'Mateo',  likes:8  },
  { img:'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=600&auto=format&fit=crop', style:'Comic',  author:'Camila', likes:17 }
];

function saveToMuseum() {
  if (!editedImageDataURL) { alert("Genera una obra primero."); return; }
  museum.unshift({ img: editedImageDataURL, style: selectedStyle.toUpperCase(), author:'Tú', likes:0 });
  renderMuseum();
  alert("¡Obra guardada en el Museo Interactivo! 🎨");
  goTo('gallery');
}

function likePost(index) {
  museum[index].likes++;
  if (museum[index].author === "Tú") {
    notifications.unshift("💖 A alguien le encantó tu obra " + museum[index].style + " ✨");
  }
  renderMuseum();
}

function renderMuseum() {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = "";
  museum.forEach((item, index) => {
    grid.innerHTML += `
      <div class="gallery-card">
        <img src="${item.img}" loading="lazy">
        <div class="gallery-body">
          <h3>${item.style}</h3>
          <p style="font-size:12px;opacity:.7;margin-top:4px;">👤 ${item.author}</p>
          <button onclick="likePost(${index})" class="like-btn"
            style="width:100%;height:46px;border:none;border-radius:14px;margin-top:10px;
                   background:#ffe4ef;cursor:pointer;font-family:'Fredoka',sans-serif;
                   font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;">
            💖 ✨ ${item.likes} Likes
          </button>
        </div>
      </div>`;
  });
}
renderMuseum();

// ============================================================
// PERFIL
// ============================================================
let currentUser = null;

function showRegister() {
  document.getElementById("registerBox").classList.remove("hidden");
}
function encryptPassword(pwd) { return "*".repeat(pwd.length); }

function createAccount() {
  const email    = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  if (!email || !password) { alert("Completa todos los campos."); return; }
  currentUser = { email, password };
  document.getElementById("guestProfile").classList.add("hidden");
  document.getElementById("userProfile").classList.remove("hidden");
  document.getElementById("profileEmail").innerText    = email;
  document.getElementById("profilePassword").innerText = encryptPassword(password);
  alert("Cuenta creada.");
}

function logout() {
  currentUser = null;
  document.getElementById("registerEmail").value    = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("userProfile").classList.add("hidden");
  document.getElementById("guestProfile").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  alert("Sesión cerrada 🎨✨");
}

document.getElementById("profilePhoto").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("profilePreview").src = URL.createObjectURL(file);
});

// ============================================================
// IA DE GESTOS — Teachable Machine IMAGE
// ============================================================

let gestureModel     = null;
let webcamTM         = null;
let isGestureRunning = false;

const MODEL_URL    = "./model/model.json";
const METADATA_URL = "./model/metadata.json";

const gestureEmojis = {
  "Mano abierta": "🖐️",
  "Gesto paz":    "✌️",
  "Puño":         "✊"
};

function showGestureResult(className, prob) {
  const emoji = gestureEmojis[className] || "🤔";
  document.getElementById("gestureResult").innerHTML = `
    ${emoji} ${className}<br>
    <span style="font-size:14px;opacity:.7;">${(prob * 100).toFixed(1)}% de confianza</span>
  `;
}

function setGestureStatus(msg) {
  document.getElementById("gestureResult").innerHTML =
    `<span style="font-size:14px;opacity:.6;">${msg}</span>`;
}

/* ---------- Cámara en vivo ---------- */
async function initGestureAI() {
  if (isGestureRunning) return;

  setGestureStatus("⏳ Cargando modelo...");

  try {
    document.getElementById("gesturePlaceholder").style.display = "none";

    if (!gestureModel) {
      gestureModel = await tmImage.load(MODEL_URL, METADATA_URL);
    }

    const flip = true;
    webcamTM = new tmImage.Webcam(300, 300, flip);
    await webcamTM.setup();
    await webcamTM.play();

    const canvas = document.getElementById("gestureCanvas");
    canvas.style.display = "block";
    document.getElementById("webcam").style.display = "none";

    isGestureRunning = true;
    setGestureStatus("🎥 Cámara activa...");
    predictFromWebcam(canvas);

  } catch (err) {
    console.error("Error al iniciar cámara IA:", err);
    setGestureStatus("❌ No se pudo acceder a la cámara.");
    document.getElementById("gesturePlaceholder").style.display = "flex";
  }
}

async function predictFromWebcam(canvas) {
  if (!isGestureRunning || !webcamTM) return;
  webcamTM.update();
  const ctx = canvas.getContext("2d");
  canvas.width  = webcamTM.canvas.width;
  canvas.height = webcamTM.canvas.height;
  ctx.drawImage(webcamTM.canvas, 0, 0);

  const predictions = await gestureModel.predict(webcamTM.canvas);
  const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
  showGestureResult(best.className, best.probability);

  requestAnimationFrame(() => predictFromWebcam(canvas));
}

/* ---------- FIX 2: Detección por imagen desde galería ----------
   Problema original: tmImage.predict() requiere un elemento de imagen
   que ya esté completamente cargado Y con CORS resuelto.
   Solución: dibujar el archivo en un canvas auxiliar (evita CORS
   porque es un blob local) y predecir sobre ese canvas.
------------------------------------------------------------------*/
document.getElementById("gestureImageInput").addEventListener("change", async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Detener cámara si estaba activa
  if (webcamTM) {
    webcamTM.stop();
    isGestureRunning = false;
    webcamTM = null;
  }
  document.getElementById("gestureCanvas").style.display = "none";
  document.getElementById("gesturePlaceholder").style.display = "none";

  // Mostrar preview de la imagen elegida
  const previewEl = document.getElementById("gesturePreview");
  const blobURL   = URL.createObjectURL(file);
  previewEl.src   = blobURL;
  previewEl.classList.remove("hidden");

  setGestureStatus("⏳ Cargando modelo...");

  try {
    // Cargar modelo si hace falta
    if (!gestureModel) {
      gestureModel = await tmImage.load(MODEL_URL, METADATA_URL);
    }

    // Esperar a que la imagen renderice
    await new Promise((resolve, reject) => {
      if (previewEl.complete && previewEl.naturalWidth > 0) {
        resolve();
      } else {
        previewEl.onload  = resolve;
        previewEl.onerror = reject;
      }
    });

    setGestureStatus("🔍 Analizando imagen...");

    // Dibujar en canvas auxiliar para evitar problemas de CORS/taint
    const auxCanvas = document.createElement("canvas");
    auxCanvas.width  = 224;   // tamaño esperado por el modelo
    auxCanvas.height = 224;
    const ctx = auxCanvas.getContext("2d");
    ctx.drawImage(previewEl, 0, 0, 224, 224);

    // Predecir sobre el canvas (no sobre el img directamente)
    const predictions = await gestureModel.predict(auxCanvas);
    const best = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
    showGestureResult(best.className, best.probability);

  } catch (err) {
    console.error("Error al predecir gesto:", err);
    setGestureStatus("❌ No se pudo analizar la imagen. Intenta con otra.");
  }
});

