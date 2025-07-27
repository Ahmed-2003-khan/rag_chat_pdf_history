from pydantic import BaseModel

class ChatRequest(BaseModel):
    session_id: str
    question: str
    groq_api_key: str
