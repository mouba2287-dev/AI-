import os
import uuid
import threading
import time
from typing import Dict, Any, Optional, List
from backend.app.services.file_handler import extract_cbz, extract_pdf, create_cbz
from backend.app.services.ballons import translate_batch

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
TEMP_JOBS_DIR = os.path.join(BASE_DIR, "temp_jobs")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(TEMP_JOBS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def create_job(self, filename: str, file_bytes: bytes) -> str:
        job_id = str(uuid.uuid4())
        ext = os.path.splitext(filename)[1].lower()

        with self._lock:
            self._jobs[job_id] = {
                "job_id": job_id,
                "filename": filename,
                "file_type": ext,
                "status": "queued",
                "progress": 0,
                "message": "En attente de traitement...",
                "created_at": time.time(),
                "pages_count": 0,
                "translated_cbz": None,
                "error": None
            }

        thread = threading.Thread(target=self._process_job, args=(job_id, file_bytes), daemon=True)
        thread.start()

        return job_id

    def update_job(self, job_id: str, updates: Dict[str, Any]) -> None:
        with self._lock:
            if job_id in self._jobs:
                self._jobs[job_id].update(updates)

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            job = self._jobs.get(job_id)
            return dict(job) if job else None

    def get_job_pages(self, job_id: str) -> List[str]:
        job_dir = os.path.join(TEMP_JOBS_DIR, job_id, "translated")
        if not os.path.exists(job_dir):
            return []

        files = sorted([
            f for f in os.listdir(job_dir)
            if f.endswith(('.png', '.jpg', '.jpeg', '.webp'))
        ])
        return files

    def get_page_path(self, job_id: str, page_filename: str) -> Optional[str]:
        job_dir = os.path.join(TEMP_JOBS_DIR, job_id, "translated")
        file_path = os.path.join(job_dir, page_filename)
        if os.path.exists(file_path):
            return file_path
        return None

    def _process_job(self, job_id: str, file_bytes: bytes) -> None:
        try:
            self.update_job(job_id, {
                "status": "processing",
                "progress": 5,
                "message": "Extraction des images du fichier..."
            })

            job = self.get_job(job_id)
            ext = job["file_type"]
            job_work_dir = os.path.join(TEMP_JOBS_DIR, job_id)
            extracted_dir = os.path.join(job_work_dir, "extracted")
            translated_dir = os.path.join(job_work_dir, "translated")

            if ext in ['.cbz', '.zip']:
                extracted_paths = extract_cbz(file_bytes, extracted_dir)
            elif ext == '.pdf':
                extracted_paths = extract_pdf(file_bytes, extracted_dir)
            else:
                raise ValueError(f"Format de fichier non supporté : {ext}")

            if not extracted_paths:
                raise ValueError("Aucune image n'a pu être extraite du fichier.")

            total_pages = len(extracted_paths)
            self.update_job(job_id, {
                "pages_count": total_pages,
                "progress": 15,
                "message": f"Extraction réussie. {total_pages} page(s) détectée(s). Début de la traduction..."
            })

            def on_progress(pct: float, msg: str):
                job_pct = 15 + int((pct / 100) * 75)
                self.update_job(job_id, {
                    "progress": job_pct,
                    "message": msg
                })

            translated_paths = translate_batch(
                extracted_paths,
                translated_dir,
                progress_callback=on_progress
            )

            self.update_job(job_id, {
                "progress": 92,
                "message": "Génération de l'archive CBZ traduite..."
            })

            clean_name = os.path.splitext(job["filename"])[0]
            cbz_filename = f"{clean_name}_FR.cbz"
            output_cbz_path = os.path.join(OUTPUT_DIR, f"{job_id}_{cbz_filename}")
            create_cbz(translated_dir, output_cbz_path)

            self.update_job(job_id, {
                "status": "completed",
                "progress": 100,
                "message": "Traduction terminée avec succès !",
                "translated_cbz": output_cbz_path
            })

        except Exception as e:
            self.update_job(job_id, {
                "status": "failed",
                "message": f"Erreur lors de la traduction : {str(e)}",
                "error": str(e)
            })

job_manager = JobManager()
