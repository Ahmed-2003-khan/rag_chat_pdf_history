from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from backend.utils.pdf_loader import load_and_split_pdf
from backend.services.vector_store import create_vectorstore

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/")
async def upload_pdfs(files: List[UploadFile] = File(...), session_id: str = Form(...)):
    all_docs = []

    for file in files:
        content = await file.read()
        docs = load_and_split_pdf(content)
        all_docs.extend(docs)

    create_vectorstore(all_docs, session_id)
    return {"status": "success", "session_id": session_id, "num_files": len(files)}
