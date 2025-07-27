from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory

from backend.services.vector_store import get_vectorstore

# In-memory chat history store
CHAT_SESSIONS = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in CHAT_SESSIONS:
        CHAT_SESSIONS[session_id] = ChatMessageHistory()
    return CHAT_SESSIONS[session_id]

def build_chain(groq_api_key: str, session_id: str):
    llm = ChatGroq(groq_api_key=groq_api_key, model_name="Gemma2-9b-It")

    vectorstore = get_vectorstore(session_id)
    retriever = vectorstore.as_retriever()

    # Contextual Question Reformulation
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", 
             "Given a chat history and the latest user question "
             "which might reference context in the chat history, "
             "formulate a standalone question which can be understood "
             "without the chat history. Do not answer the question, "
             "just reformulate it if needed and otherwise return it as is"),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}")
        ]
    )

    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    # RAG QA
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an assistant for question-answering tasks. "
         "Use the following pieces of retrieved context to answer "
         "the question. If you don't know the answer, say that you "
         "don't know. Use three sentences maximum and keep the "
         "answer concise.\n\n{context}"),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}")
    ])

    qa_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, qa_chain)

    # Wrap with message history
    conversational_chain = RunnableWithMessageHistory(
        rag_chain,
        lambda session_id: get_session_history(session_id),
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer"
    )

    return conversational_chain
