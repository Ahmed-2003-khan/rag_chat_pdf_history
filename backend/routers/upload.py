from fastapi import APIRouter, UploadFile, File, Form
from backend.utils.pdf_loader import load_and_split_pdf
from backend.services.vector_store import create_vectorstore

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/")
async def upload_pdf(file: UploadFile = File(...), session_id: str = Form(...)):
    content = await file.read()
    documents = load_and_split_pdf(content)
    create_vectorstore(documents, session_id)
    return {"status": "success", "session_id": session_id}
