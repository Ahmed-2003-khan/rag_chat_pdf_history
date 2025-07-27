from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.rag_chain import build_chain
from backend.services.rag_chain import get_session_history

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    session_id: str
    question: str
    groq_api_key: str

@router.post("/")
def chat_with_rag(request: ChatRequest):
    chain = build_chain(request.groq_api_key, request.session_id)
    
    result = chain.invoke(
        {"input": request.question},
        config={"configurable": {"session_id": request.session_id}}
    )

    history = get_session_history(request.session_id).messages

    return {
        "answer": result["answer"],
        "history": [msg.__dict__ for msg in history]
    }
