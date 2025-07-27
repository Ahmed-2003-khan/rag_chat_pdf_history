from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# In-memory store for session vectorstores
SESSION_VS = {}

# Load HuggingFace embedding model
embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')

def create_vectorstore(documents, session_id):
    vectorstore = Chroma.from_documents(documents=documents, embedding=embeddings)
    SESSION_VS[session_id] = vectorstore

def get_vectorstore(session_id):
    return SESSION_VS.get(session_id)
