import os
import sys
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.services.job_manager import job_manager

app = FastAPI(
    title="ORKA - Manga/Manhwa Translator API",
    description="Backend API for automatic English to French Manga/Manhwa translation and reading",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API ORKA Manga Translator", "status": "online"}

@app.post("/translate")
async def translate_file(file: UploadFile = File(...)):
    filename = file.filename or "manga.cbz"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ['.pdf', '.cbz', '.zip']:
        raise HTTPException(status_code=400, detail="Format de fichier non pris en charge. Veuillez uploader un fichier PDF ou CBZ.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Fichier vide.")

    job_id = job_manager.create_job(filename, file_bytes)
    return {"job_id": job_id, "message": "Job de traduction créé avec succès.", "status": "queued"}

@app.get("/status/{job_id}")
def get_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable.")

    return {
        "job_id": job["job_id"],
        "filename": job["filename"],
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "pages_count": job["pages_count"],
        "error": job["error"]
    }

@app.get("/download/{job_id}")
def download_cbz(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable.")

    if job["status"] != "completed" or not job.get("translated_cbz"):
        raise HTTPException(status_code=400, detail="Le job n'est pas encore terminé ou a échoué.")

    file_path = job["translated_cbz"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier CBZ traduit introuvable sur le serveur.")

    filename = os.path.basename(file_path).split('_', 1)[-1]
    return FileResponse(path=file_path, filename=filename, media_type="application/x-cbz")

@app.get("/jobs/{job_id}/pages")
def list_job_pages(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable.")

    pages = job_manager.get_job_pages(job_id)
    return {
        "job_id": job_id,
        "filename": job["filename"],
        "pages": pages,
        "total_pages": len(pages)
    }

@app.get("/jobs/{job_id}/page/{page_filename}")
def get_job_page(job_id: str, page_filename: str):
    page_path = job_manager.get_page_path(job_id, page_filename)
    if not page_path:
        raise HTTPException(status_code=404, detail="Page introuvable.")

    return FileResponse(path=page_path, media_type="image/png")
