# MAMBAQ — Backend

API REST construida con **FastAPI** + **MongoDB** (Motor async).

---

## 📁 Estructura

```
backend/
├── main.py            ← Toda la lógica de la API
├── requirements.txt   ← Dependencias Python
├── .env.example       ← Variables de entorno de ejemplo
└── uploads/           ← Imágenes subidas (se crea automáticamente)
```

---

## ⚙️ Instalación

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux / Mac
venv\Scripts\activate           # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu URL de MongoDB
```

---

## ▶️ Correr el servidor

```bash
uvicorn main:app --reload --port 8000
```

La API queda disponible en: `http://localhost:8000`  
Documentación interactiva: `http://localhost:8000/docs`

---

## 📡 Endpoints

### Galería

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/artworks` | Listar todas las obras |
| `POST` | `/artworks` | Guardar obra nueva (multipart/form-data) |
| `DELETE` | `/artworks/{id}` | Eliminar una obra |

**POST /artworks — campos del formulario:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `author` | string | Nombre artístico |
| `artwork_name` | string | Nombre de la obra |
| `style` | string | Estilo aplicado (anime, comic, retro, neon) |
| `image` | file | Imagen de la obra |

---

### Likes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/artworks/{id}/like` | Dar / quitar like |

**POST /artworks/{id}/like — campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | string | Identificador del usuario (puede ser email o IP) |

---

### Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/notifications/{author}` | Ver notificaciones de un autor |
| `PATCH` | `/notifications/{id}/read` | Marcar como leída |
| `DELETE` | `/notifications/{author}` | Borrar todas las notificaciones |

---

## 🔗 Conectar el frontend

En `script.js`, reemplaza la URL base de las llamadas:

```js
const API = "http://localhost:8000";

// Ejemplo: cargar galería
const res = await fetch(`${API}/artworks`);
const obras = await res.json();
```

---

## 🗄️ MongoDB — Colecciones

### `artworks`
```json
{
  "_id": "ObjectId",
  "author": "Sofía",
  "artwork_name": "Mi primera obra",
  "style": "anime",
  "image_url": "/uploads/abc123.png",
  "likes": 5,
  "liked_by": ["user1@mail.com"],
  "created_at": "2025-06-01T00:00:00Z"
}
```

### `notifications`
```json
{
  "_id": "ObjectId",
  "author": "Sofía",
  "artwork_id": "ObjectId",
  "artwork_name": "Mi primera obra",
  "style": "anime",
  "message": "💖 A alguien le encantó tu obra...",
  "read": false,
  "created_at": "2025-06-01T00:00:00Z"
}
```
