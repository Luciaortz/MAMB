
lucide.createIcons();

const today = new Date().toLocaleDateString();

document.getElementById("creationDate").innerHTML =
"📅 Fecha de creación: " + today;

const screens = document.querySelectorAll(".screen");

function goTo(id){

  screens.forEach(screen=>{
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

function toggleMenu(){
  document.getElementById("sideMenu").classList.toggle("open");
}

const galleryInput = document.getElementById("galleryInput");
const cameraInput = document.getElementById("cameraInput");

const previewImage = document.getElementById("previewImage");
const placeholder = document.getElementById("placeholder");

let selectedImage = null;
let selectedStyle = "anime";

function loadImage(file){

  if(!file) return;

  selectedImage = file;

  const url = URL.createObjectURL(file);

  previewImage.src = url;

  previewImage.classList.remove("hidden");

  placeholder.classList.add("hidden");
}

galleryInput.addEventListener("change",e=>{
  loadImage(e.target.files[0]);
});

cameraInput.addEventListener("change",e=>{
  loadImage(e.target.files[0]);
});

const styleCards = document.querySelectorAll(".style-card");

styleCards.forEach(card=>{

  card.addEventListener("click",()=>{

    styleCards.forEach(c=>{
      c.classList.remove("active");
    });

    card.classList.add("active");

    selectedStyle = card.dataset.style;
  });
});

function generateArt(){

  const artist =
  document.getElementById("artistName").value;

  const artwork =
  document.getElementById("artName").value;

  if(!selectedImage){
    alert("Selecciona una imagen.");
    return;
  }

  if(!artist || !artwork){
    alert("Completa los datos.");
    return;
  }

  document.getElementById("finalArtist").innerText = artist;
  document.getElementById("finalArtwork").innerText = artwork;
  document.getElementById("finalDate").innerText = today;
  document.getElementById("finalStyle").innerText =
  selectedStyle.toUpperCase();

  goTo("result");

  const resultImage =
  document.getElementById("resultImage");

  const url = URL.createObjectURL(selectedImage);

  resultImage.src = url;

  switch(selectedStyle){

    case "anime":
      resultImage.style.filter =
      "contrast(1.5) saturate(2)";
    break;

    case "comic":
      resultImage.style.filter =
      "contrast(2.5) saturate(3)";
    break;

    case "retro":
      resultImage.style.filter =
      "sepia(.9) contrast(1.6)";
    break;

    case "neon":
      resultImage.style.filter =
      "contrast(2) saturate(3) hue-rotate(40deg)";
    break;
  }
}

async function downloadArtwork(){

  const artwork =
  document.getElementById("artworkCard");

  const canvas =
  await html2canvas(artwork);

  const link =
  document.createElement("a");

  link.download = "mambaq-art.png";

  link.href = canvas.toDataURL();

  link.click();
}

async function shareArtwork(){

  const artwork =
  document.getElementById("artworkCard");

  const canvas =
  await html2canvas(artwork);

  canvas.toBlob(async(blob)=>{

    const file = new File(
      [blob],
      "mambaq-art.png",
      {type:"image/png"}
    );

    if(navigator.canShare &&
      navigator.canShare({files:[file]})){

      await navigator.share({
        title:"MAMBAQ",
        text:"Mira mi obra creada con IA",
        files:[file]
      });

    }else{
      alert("Tu navegador no soporta compartir.");
    }

  });
}

let notifications = [];

function openNotifications(){

  const panel =
  document.getElementById("notificationPanel");

  panel.classList.remove("hidden");

  renderNotifications();
}

function closeNotifications(){

  document
    .getElementById("notificationPanel")
    .classList
    .add("hidden");
}

function renderNotifications(){

  const list =
  document.getElementById("notificationList");

  if(notifications.length === 0){

    list.innerHTML = `

    <div style="
    text-align:center;
    padding:30px 10px;
    opacity:.6;">

    ✨ No tienes notificaciones todavía 🎨

    </div>

    `;

    return;
  }

  list.innerHTML = "";

  notifications.forEach(notification=>{

    list.innerHTML += `

    <div class="notification-item">

      <div class="notification-icon">
      💖
      </div>

      <div class="notification-content">

        <h4>
        ¡Nueva reacción! ✨
        </h4>

        <p>
        ${notification}
        </p>

      </div>

    </div>

    `;
  });
}

let gallery = [

{
img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
style:'Anime',
author:'Sofía',
likes:12
},

{
img:'https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1200&auto=format&fit=crop',
style:'Retro',
author:'Mateo',
likes:8
},

{
img:'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop',
style:'Comic',
author:'Camila',
likes:17
}

];

function saveToGallery(){

  const img =
  document.getElementById("resultImage").src;

  gallery.unshift({
    img,
    style:selectedStyle,
    author:'Tú',
    likes:0
  });

  renderGallery();

  alert("Obra guardada.");
}

function likePost(index){

  gallery[index].likes++;

  if(gallery[index].author === "Tú"){

    notifications.unshift(
      "💖 A alguien le encantó tu obra "
      + gallery[index].style +
      " ✨🎨🌈"
    );
  }

  renderGallery();
}

function renderGallery(){

  const grid =
  document.getElementById("galleryGrid");

  grid.innerHTML = "";

  gallery.forEach((item,index)=>{

    grid.innerHTML += `

    <div class="gallery-card">

      <img src="${item.img}">

      <div class="gallery-body">

        <h3>${item.style}</h3>

        <p style="font-size:12px;opacity:.7;margin-top:4px;">
        👤 ${item.author}
        </p>

        <button
        onclick="likePost(${index})"
        class="like-btn"
        style="
        width:100%;
        height:46px;
        border:none;
        border-radius:14px;
        margin-top:10px;
        background:#ffe4ef;
        cursor:pointer;
        font-family:'Fredoka',sans-serif;
        font-size:14px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        ">
        💖 ✨ ${item.likes} Likes
        </button>

      </div>

    </div>

    `;
  });
}

renderGallery();

/* PERFIL */

let currentUser = null;

function showRegister(){

  document
    .getElementById("registerBox")
    .classList
    .remove("hidden");
}

function encryptPassword(password){

  return "*".repeat(password.length);
}

function createAccount(){

  const email =
  document.getElementById("registerEmail").value;

  const password =
  document.getElementById("registerPassword").value;

  if(!email || !password){

    alert("Completa todos los campos.");
    return;
  }

  currentUser = {
    email,
    password
  };

  document
    .getElementById("guestProfile")
    .classList
    .add("hidden");

  document
    .getElementById("userProfile")
    .classList
    .remove("hidden");

  document
    .getElementById("profileEmail")
    .innerText = email;

  document
    .getElementById("profilePassword")
    .innerText =
    encryptPassword(password);

  alert("Cuenta creada.");
}

function logout(){
  
  currentUser = null;
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";
  
  document
    .getElementById("userProfile")
    .classList
    .add("hidden");
    
  document
    .getElementById("guestProfile")
    .classList
    .remove("hidden");
    
  document
    .getElementById("registerBox")
    .classList
    .add("hidden");
    
  alert("Sesión cerrada 🎨✨");
}

document
.getElementById("profilePhoto")
.addEventListener("change",function(e){

  const file = e.target.files[0];

  if(!file) return;

  const url =
  URL.createObjectURL(file);

  document
    .getElementById("profilePreview")
    .src = url;
});


