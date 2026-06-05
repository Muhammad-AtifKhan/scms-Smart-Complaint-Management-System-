import os
import uuid
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from app.db import get_db_cursor
from app.auth.dependencies import get_current_user
from app.routers.complaints import to_db_id

router = APIRouter()

# Get the path to upload directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Helper to determine file_type
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"}

def get_file_type(filename: str) -> str:
    _, ext = os.path.splitext(filename.lower())
    if ext in IMAGE_EXTENSIONS:
        return "image"
    elif ext in VIDEO_EXTENSIONS:
        return "video"
    elif ext in DOCUMENT_EXTENSIONS:
        return "document"
    return "other"

# ✅ UPLOAD EVIDENCE FILES FOR A COMPLAINT
@router.post("/upload")
def upload_files(
    complaint_id: str = Form(...),
    file_purpose: Optional[str] = Form("evidence"),  # evidence, before, after, other
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    db_complaint_id = to_db_id(complaint_id)
    user_id = current_user["id"]
    role = current_user["role"]

    # Verify if user has access to this complaint
    with get_db_cursor(commit=False) as cursor:
        cursor.execute("SELECT id, citizen_id, department_id FROM complaints WHERE id = %s", (db_complaint_id,))
        c = cursor.fetchone()
        if not c:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Permission check
        if role == "citizen" and c["citizen_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized upload: you do not own this complaint")
        elif role == "admin" and c["department_id"] != current_user["department_id"]:
            raise HTTPException(status_code=403, detail="Unauthorized upload: complaint does not belong to your department")
        # Officers must be assigned. We can verify if they are assigned.
        elif role == "officer":
            cursor.execute("SELECT id FROM complaint_assignments WHERE complaint_id = %s AND officer_id = %s AND is_active = TRUE", (db_complaint_id, user_id))
            if not cursor.fetchone():
                raise HTTPException(status_code=403, detail="Unauthorized upload: you are not assigned to this complaint")

    # Save files and insert to DB
    uploaded_urls = []
    file_records = []

    for file in files:
        # Generate unique filename
        filename = file.filename
        _, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save to filesystem
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        # Construct URL relative to server root
        file_url = f"/uploads/{unique_filename}"
        uploaded_urls.append(file_url)
        
        file_type = get_file_type(filename)
        
        file_records.append((db_complaint_id, file_url, file_type, user_id, file_purpose))

    # Batch insert into DB
    with get_db_cursor() as cursor:
        for rec in file_records:
            cursor.execute("""
                INSERT INTO complaint_files (complaint_id, file_url, file_type, uploaded_by, file_purpose)
                VALUES (%s, %s, %s, %s, %s)
            """, rec)

        # Log timeline event
        timeline_action = "Evidence uploaded"
        if file_purpose == "before":
            timeline_action = "Before photos uploaded"
        elif file_purpose == "after":
            timeline_action = "After photos uploaded"
            
        cursor.execute("""
            INSERT INTO complaint_history (complaint_id, action, performed_by)
            VALUES (%s, %s, %s)
        """, (db_complaint_id, timeline_action, user_id))

        # Update complaint updated_at timestamp
        cursor.execute("UPDATE complaints SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (db_complaint_id,))

    return {
        "success": True,
        "images": uploaded_urls,
        "count": len(uploaded_urls)
    }
