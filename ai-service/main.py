from fastapi import FastAPI, BackgroundTasks, Header, HTTPException, Depends
from pydantic import BaseModel
import os
import json
import hashlib
from typing import List, Dict, Optional
from dotenv import load_dotenv

from llm_setup import get_cache, set_cache
from agent_setup import agent_executor
from document_processor import process_document

load_dotenv()

app = FastAPI(title="Chatbot AI SIMRS - AI Service")

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = [] # Format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    session_id: str = "default_session"
    user_role: str = "publik"

def verify_internal_secret(x_internal_secret: Optional[str] = Header(None)):
    secret = os.getenv("INTERNAL_API_SECRET")
    if not secret or x_internal_secret != secret:
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/chat")
def chat_endpoint(req: ChatRequest, _ = Depends(verify_internal_secret)):
    # Menyusun riwayat percakapan untuk agent
    formatted_messages = []
    
    # Konteks Role dan Waktu
    import datetime
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    role_instruction = f"PENTING: Anda sedang berinteraksi dengan pengguna berstatus '{req.user_role}'. Waktu dan Tanggal saat ini adalah {current_time}."
    if req.user_role == "staf":
        role_instruction += " Saat menggunakan submit_complaint_tool, set submitter_type='staf'. Anda TIDAK PERLU menanyakan kontak staf."
    else:
        role_instruction += " Saat menggunakan submit_complaint_tool, set submitter_type='publik'. Anda bisa menanyakan kontak opsional."

    formatted_messages.append(("system", role_instruction))

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
    
    # Hash for cache (exclude time to ensure cache hits)
    cache_payload = {
        "message": req.message,
        "history": req.history,
        "role": req.user_role
    }
    prompt_hash = hashlib.sha256(json.dumps(cache_payload, sort_keys=True).encode('utf-8')).hexdigest()
    
    cached_resp = get_cache(prompt_hash)
    if cached_resp:
        return cached_resp
    
    import time
    from telemetry import log_interaksi_gagal, log_pemakaian_api
    
    start_time = time.time()
    try:
        # Eksekusi agent
        response = agent_executor.invoke(inputs, config=config)
        durasi_ms = int((time.time() - start_time) * 1000)
        
        final_message = response["messages"][-1].content
        if isinstance(final_message, list):
            final_message = " ".join([m.get("text", "") for m in final_message if isinstance(m, dict) and "text" in m])
            
        # Log Token Usage (Gemini default)
        ai_msg = response["messages"][-1]
        token_in, token_out = 0, 0
        if hasattr(ai_msg, 'usage_metadata') and ai_msg.usage_metadata:
            token_in = ai_msg.usage_metadata.get('input_tokens', 0)
            token_out = ai_msg.usage_metadata.get('output_tokens', 0)
            
        log_pemakaian_api("groq", "llama-hybrid", "chat", token_in, token_out, 0.0, durasi_ms)
        
        # Deteksi Log Gagal jika jawaban bot buntu
        resp_lower = str(final_message).lower()
        if resp_lower.startswith("maaf, informasi tidak ditemukan:"):
            log_interaksi_gagal(req.session_id, req.message, "dokumen_tidak_ditemukan", None)
        elif "kurang mengerti" in resp_lower or "bisa diperjelas" in resp_lower:
            log_interaksi_gagal(req.session_id, req.message, "intent_tidak_jelas", None)
            
        result = {"reply": str(final_message)}
        
        # JANGAN cache jawaban yang mengandung data dinamis dari database
        if not any(tag in str(final_message) for tag in ["<JadwalData>", "<BookingSuccess>", "<AppointmentsList>", "<ComplaintStatus>", "<ComplaintsList>"]):
            set_cache(prompt_hash, result)
            
        return result
    except Exception as e:
        durasi_ms = int((time.time() - start_time) * 1000)
        log_pemakaian_api("gemini", "gemini-hybrid", "chat", 0, 0, 0.0, durasi_ms)
        log_interaksi_gagal(req.session_id, req.message, "tool_error", None)
        
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            print("Rate limit exceeded after max_retries.")
            return {"reply": "Sistem sedang sibuk, coba lagi dalam beberapa menit."}
        else:
            print(f"Error pada chat_endpoint: {e}")
            return {"reply": f"Mohon maaf, sistem sedang mengalami gangguan saat memproses pertanyaan Anda. [Debug: {error_msg}]"}

@app.get("/")
def read_root():
    return {"message": "AI Service is running with RAG capabilities"}

@app.post("/api/internal/documents/{dokumen_id}/reprocess", status_code=202)
def reprocess_document_endpoint(dokumen_id: int, background_tasks: BackgroundTasks, _ = Depends(verify_internal_secret)):
    background_tasks.add_task(process_document, dokumen_id)
    return {"status": "processing", "message": f"Proses embedding dokumen ID {dokumen_id} dimulai di latar belakang"}
