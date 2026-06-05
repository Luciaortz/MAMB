from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
import os
import shutil
import uuid

# ──────────────────────────────────────────────
# APP
# ──────────────────────────────────────────────

app = FastAPI(title="MAMBAQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carpeta para imágenes subidas
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ──────────────────────────────────────────────
# MONGODB
# ──────────────────────────────────────────────

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["mambaq"]

artworks_col  = db["artworks"]
notifs_col    = db["notifications"]

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def serialize(doc: dict) -> dict:
    """Convierte ObjectId a string para poder devolverlo como JSON."""
    doc["id"] = str(doc.pop("_id"))
    return doc

# ──────────────────────────────────────────────
# GALERÍA – ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/artworks", summary="Listar todas las obras")
async def list_artworks():
    """
    Devuelve todas las obras guardadas, ordenadas de más reciente a más antigua.
    """
    cursor = artworks_col.find().sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return results


@app.post("/artworks", summary="Guardar una obra nueva")
async def create_artwork(
    author: str       = Form(...),
    artwork_name: str = Form(...),
    style: str        = Form(...),
    image: UploadFile = File(...)
):
    """
    Recibe los datos del formulario y la imagen en base64/multipart,
    guarda la imagen en disco y registra la obra en MongoDB.
    """
    # Guardar imagen
    ext      = image.filename.split(".")[-1] if "." in image.filename else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(image.file, f)

    doc = {
        "author":       author,
        "artwork_name": artwork_name,
        "style":        style,
        "image_url":    f"/uploads/{filename}",
        "likes":        0,
        "liked_by":     [],          # lista de IPs / user_ids que ya dieron like
        "created_at":   datetime.utcnow(),
    }

    result = await artworks_col.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@app.delete("/artworks/{artwork_id}", summary="Eliminar una obra")
async def delete_artwork(artwork_id: str):
    """
    Elimina una obra por su ID.
    """
    try:
        oid = ObjectId(artwork_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    artwork = await artworks_col.find_one({"_id": oid})
    if not artwork:
        raise HTTPException(status_code=404, detail="Obra no encontrada")

    # Borrar imagen del disco
    img_path = artwork.get("image_url", "").lstrip("/")
    if img_path and os.path.exists(img_path):
        os.remove(img_path)

    await artworks_col.delete_one({"_id": oid})
    return {"message": "Obra eliminada"}

# ──────────────────────────────────────────────
# LIKES – ENDPOINTS
# ──────────────────────────────────────────────

@app.post("/artworks/{artwork_id}/like", summary="Dar o quitar like a una obra")
async def toggle_like(artwork_id: str, user_id: str = Form(...)):
    """
    Alterna el like de un usuario sobre una obra.
    Si ya dio like → lo quita. Si no → lo suma.
    También genera una notificación para el autor.
    """
    try:
        oid = ObjectId(artwork_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    artwork = await artworks_col.find_one({"_id": oid})
    if not artwork:
        raise HTTPException(status_code=404, detail="Obra no encontrada")

    liked_by = artwork.get("liked_by", [])
    already_liked = user_id in liked_by

    if already_liked:
        # Quitar like
        await artworks_col.update_one(
            {"_id": oid},
            {
                "$inc": {"likes": -1},
                "$pull": {"liked_by": user_id},
            }
        )
        action = "removed"
    else:
        # Dar like
        await artworks_col.update_one(
            {"_id": oid},
            {
                "$inc": {"likes": 1},
                "$push": {"liked_by": user_id},
            }
        )
        action = "added"

        # Crear notificación para el autor
        notif = {
            "author":      artwork["author"],
            "artwork_id":  artwork_id,
            "artwork_name": artwork.get("artwork_name", ""),
            "style":       artwork.get("style", ""),
            "message":     f"💖 A alguien le encantó tu obra '{artwork.get('artwork_name', '')}' ({artwork.get('style', '').upper()}) ✨🎨",
            "read":        False,
            "created_at":  datetime.utcnow(),
        }
        await notifs_col.insert_one(notif)

    updated = await artworks_col.find_one({"_id": oid})
    return {
        "action": action,
        "likes":  updated["likes"],
    }

# ──────────────────────────────────────────────
# NOTIFICACIONES – ENDPOINTS
# ──────────────────────────────────────────────

@app.get("/notifications/{author}", summary="Notificaciones de un autor")
async def get_notifications(author: str):
    """
    Devuelve las notificaciones de un autor, ordenadas por fecha descendente.
    """
    cursor = notifs_col.find({"author": author}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return results


@app.patch("/notifications/{notif_id}/read", summary="Marcar notificación como leída")
async def mark_read(notif_id: str):
    """
    Marca una notificación como leída.
    """
    try:
        oid = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

    result = await notifs_col.update_one({"_id": oid}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return {"message": "Marcada como leída"}


@app.delete("/notifications/{author}", summary="Borrar todas las notificaciones de un autor")
async def clear_notifications(author: str):
    """
    Elimina todas las notificaciones de un autor.
    """
    await notifs_col.delete_many({"author": author})
    return {"message": "Notificaciones eliminadas"}

# ──────────────────────────────────────────────
# HEALTH CHECK
# ──────────────────────────────────────────────

@app.get("/", summary="Health check")
async def root():
    return {"status": "ok", "app": "MAMBAQ API v1.0"}
