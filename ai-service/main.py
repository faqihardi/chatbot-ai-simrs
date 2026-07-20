from fastapi import FastAPI
from pydantic import BaseModel
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from tools.rag import search_knowledge_base

load_dotenv()

app = FastAPI(title="Chatbot AI SIMRS - AI Service")

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0
)

@tool
def search_knowledge_base_tool(query: str) -> str:
    """
    Gunakan fungsi ini SECARA EKSKLUSIF untuk mencari informasi prosedur, administrasi, pendaftaran, jadwal, pembayaran, fasilitas, atau kebijakan layanan rumah sakit.
    Jangan menjawab pertanyaan layanan/administrasi dari pengetahuan umum model, selalu cari dari basis pengetahuan ini.
    Input `query` harus ringkas dan relevan.
    """
    return search_knowledge_base(query)

tools = [search_knowledge_base_tool]


system_prompt = """Anda adalah asisten virtual (Customer Service) resmi SIMRS.
Tugas Anda adalah menjawab pertanyaan pasien menggunakan informasi dari basis pengetahuan (knowledge base) RS.
- SELALU panggil tool `search_knowledge_base_tool` jika pengguna bertanya tentang layanan, administrasi, syarat pendaftaran, atau kebijakan RS.
- Jika tool mengembalikan "informasi tidak ditemukan", JANGAN MENGARANG JAWABAN (HALUSINASI). Sampaikan dengan sopan bahwa Anda tidak memiliki informasi tersebut atau arahkan untuk menghubungi CS manusia.
- JANGAN PERNAH menjawab pertanyaan medis, diagnostik, atau memberikan resep.
- Berikan jawaban yang ramah, profesional, dan ringkas. Jangan membuat paragraf yang terlalu panjang.
"""

# Buat ReAct Agent yang bisa memanggil tools
agent_executor = create_react_agent(llm, tools, prompt=system_prompt)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = [] # Format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    session_id: str = "default_session"

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    # Menyusun riwayat percakapan untuk agent
    formatted_messages = []
    
    # 1. Masukkan riwayat dari Laravel
    for msg in req.history:
        role = msg.get("role")
        content = msg.get("content")
        if role in ["user", "assistant"] and content:
            formatted_messages.append((role, content))
            
    # 2. Masukkan pesan terbaru
    formatted_messages.append(("user", req.message))
    
    inputs = {"messages": formatted_messages}
    config = {"configurable": {"thread_id": req.session_id}}
    
    try:
        # Eksekusi agent
        response = agent_executor.invoke(inputs, config=config)
        final_message = response["messages"][-1].content
        
        if isinstance(final_message, list):
            final_message = " ".join([m.get("text", "") for m in final_message if isinstance(m, dict) and "text" in m])
            
        return {"reply": str(final_message)}
    except Exception as e:
        print(f"Error pada chat_endpoint: {e}")
        return {"reply": "Mohon maaf, sistem sedang mengalami gangguan saat memproses pertanyaan Anda."}

@app.get("/")
def read_root():
    return {"message": "AI Service is running with RAG capabilities"}
