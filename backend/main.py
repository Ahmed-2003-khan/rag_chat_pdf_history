from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import upload, chat

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to localhost/your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routers
app.include_router(upload.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "RAG API is running"}
