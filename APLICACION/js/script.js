

const API = "https://mamb-backend.onrender.com";


let USER_ID = localStorage.getItem("mambaq_user_id");
if (!USER_ID) {
  USER_ID = "user_" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("mambaq_user_id", USER_ID);
}


lucide.createIcons();

const today = new Date().toLocaleDateString();

document.getElementById("creationDate").innerHTML =
  "📅 Fecha de creación: " + today;

const screens = document.querySelectorAll(".screen");


function goTo(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  
  if (id === "gallery") fetchGallery();
}

function toggleMenu() {
  document.getElementById("sideMenu").classList.toggle("open");
}



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


const styleCards = document.querySelectorAll(".style-card");

styleCards.forEach(card => {
  card.addEventListener("click", () => {
    styleCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedStyle = card.dataset.style;
  });
});


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

  const resultImage = document.getElementById("resultImage");
  resultImage.src = URL.createObjectURL(selectedImage);

  const filters = {
    anime:  "contrast(1.5) saturate(2)",
    comic:  "contrast(2.5) saturate(3)",
    retro:  "sepia(.9) contrast(1.6)",
    neon:   "contrast(2) saturate(3) hue-rotate(40deg)",
  };

  resultImage.style.filter = filters[selectedStyle] || "";
}


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


async function saveToGallery() {
  console.log("BOTON PRESIONADO");
  const artist = document.getElementById("finalArtist").innerText;
  const artwork = document.getElementById("finalArtwork").innerText;

  const canvas = await html2canvas(
    document.getElementById("artworkCard")
  );

  const data = {

    nombreObra: artwork,

    nombreArtistico: artist,

    imagen: canvas.toDataURL("image/png")

  };

  const res = await fetch(`${API}/api/artworks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  console.log(await res.json());

}

async function fetchGallery() {

  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;opacity:.6;">Cargando... ✨</div>`;

  try {
    const res = await fetch(`${API}/api/artworks`);
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

    const imgSrc = item.imagen;

    grid.innerHTML += `
    <div class="gallery-card">

      <img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/300x200?text=MAMBAQ'">

      <div class="gallery-body">

        <h3>${item.nombreObra}</h3>

        <p style="font-size:12px;opacity:.7;margin-top:4px;">
          👤 ${item.nombreArtistico}
        </p>

        <p style="font-size:11px;opacity:.5;margin-top:2px;">
          📅 ${new Date(item.fechaCreacion).toLocaleDateString()}
        </p>

       
      </div>

    </div>
    `;
  });
}


async function likePost(artworkId, author) {

  const btn = document.getElementById(`like-btn-${artworkId}`);
  if (btn) btn.disabled = true;

  const form = new FormData();
  form.append("user_id", USER_ID);

  try {
    const res  = await fetch(`${API}/artworks/${artworkId}/like`, { method: "POST", body: form });
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (btn) {
      btn.innerHTML = `💖 ✨ ${data.likes} Likes`;
      btn.disabled = false;
    }

    if (data.action === "added") {
      fetchNotifications();
    }

  } catch {
    showToast("❌ Error al registrar el like");
    if (btn) btn.disabled = false;
  }
}



let currentAuthor = null;   // se actualiza cuando el usuario crea su cuenta

async function fetchNotifications() {

  if (!currentAuthor) return;

  try {
    const res  = await fetch(`${API}/notifications/${encodeURIComponent(currentAuthor)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderNotifications(data);

    // Mostrar badge si hay no leídas
    const unread = data.filter(n => !n.read).length;
    updateNotifBadge(unread);

  } catch {
    console.warn("No se pudieron cargar las notificaciones");
  }
}

function renderNotifications(items) {

  const list = document.getElementById("notificationList");

  if (!items || items.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:30px 10px;opacity:.6;">
        ✨ No tienes notificaciones todavía 🎨
      </div>`;
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
        <p style="font-size:10px;opacity:.5;margin-top:4px;">
          ${new Date(notif.created_at).toLocaleString()}
        </p>
      </div>

      ${!notif.read ? `
        <button onclick="markRead('${notif.id}')" style="
          border:none;background:#ffe4ef;border-radius:10px;
          padding:6px 10px;cursor:pointer;font-size:11px;
          font-family:'Fredoka',sans-serif;">
          ✓
        </button>` : ""}

    </div>`;
  });
}

async function markRead(notifId) {
  try {
    await fetch(`${API}/notifications/${notifId}/read`, { method: "PATCH" });
    fetchNotifications();
  } catch {
    console.warn("Error al marcar como leída");
  }
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

  currentUser   = { email, password };
  currentAuthor = email;   

  document.getElementById("guestProfile").classList.add("hidden");
  document.getElementById("userProfile").classList.remove("hidden");
  document.getElementById("profileEmail").innerText    = email;
  document.getElementById("profilePassword").innerText = encryptPassword(password);

  fetchNotifications();   
  showToast("¡Cuenta creada! 🎨✨");
}

function logout() {
  currentUser   = null;
  currentAuthor = null;
  document.getElementById("registerEmail").value    = "";
  document.getElementById("registerPassword").value = "";
  document.getElementById("userProfile").classList.add("hidden");
  document.getElementById("guestProfile").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  showToast("Sesión cerrada 🚪");
}

document.getElementById("profilePhoto").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("profilePreview").src = URL.createObjectURL(file);
});


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

  toast.innerText  = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2800);
}



fetchGallery();
