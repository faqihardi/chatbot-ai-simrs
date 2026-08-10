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
        role_instruction += " Saat pengguna ingin membuat aduan, Anda TETAP HARUS menanyakan: Kategori, Deskripsi/keluhan, Lokasi, dan Urgensi terlebih dahulu sebelum memanggil submit_complaint_tool. Yang TIDAK perlu ditanyakan hanya kontak — set submitter_type='staf' secara otomatis."
    else:
        role_instruction += " Saat menggunakan submit_complaint_tool, set submitter_type='publik'. Anda bisa menanyakan kontak opsional."

    formatted_messages.append(("system", role_instruction))

    # 1. Masukkan riwayat dari Laravel
    import re
    for msg in req.history[-10:]:  # Batasi maksimal 10 pesan terakhir agar tidak over-token
        role = msg.get("role")
        content = msg.get("content")
        if role in ["user", "assistant"] and content:
            # Hapus tag XML UI (seperti <JadwalData>... JSON ...</JadwalData>) dari history untuk menghemat ribuan token
            clean_content = re.sub(r'<[A-Za-z]+>.*?</[A-Za-z]+>', '[UI Card]', content, flags=re.DOTALL)
            formatted_messages.append((role, clean_content))
            
    # 2. Masukkan pesan terbaru
    formatted_messages.append(("user", req.message))
    
    inputs = {"messages": formatted_messages}
    config = {"configurable": {"thread_id": req.session_id}}
    
    # Keywords yang mengindikasikan query ke database - JANGAN cache
    DB_QUERY_KEYWORDS = ["tiket", "nomor", "kontak", "hp", "aduan", "cek", "status", "riwayat", "booking", "janji", "jadwal", "dokter", "poli"]
    is_db_query = any(kw in req.message.lower() for kw in DB_QUERY_KEYWORDS)
    
    # Hash for cache
    cache_payload = {
        "message": req.message,
        "history": req.history,
        "role": req.user_role
    }
    prompt_hash = hashlib.sha256(json.dumps(cache_payload, sort_keys=True).encode('utf-8')).hexdigest()
    
    if not is_db_query:
        cached_resp = get_cache(prompt_hash)
        if cached_resp:
            return cached_resp
    
    import time
    from telemetry import log_interaksi_gagal, log_pemakaian_api
    
    start_time = time.time()
    try:
        from agent_setup import current_session_id
        current_session_id.set(req.session_id)
        
        # Eksekusi agent
        response = agent_executor.invoke(inputs, config=config)
        durasi_ms = int((time.time() - start_time) * 1000)
        
        final_message = response["messages"][-1].content
        if isinstance(final_message, list):
            final_message = " ".join([m.get("text", "") for m in final_message if isinstance(m, dict) and "text" in m])
        
        # Guard: jika konten kosong (bisa terjadi saat fallback ke 8B)
        final_message = str(final_message).strip()
        if not final_message:
            return {"reply": "Maaf, sistem sedang dalam kapasitas terbatas. Silakan coba lagi dalam beberapa saat."}
            
        # AUTO-INJECT UI CARDS DARI TOOL MESSAGE
        # Cari pesan alat (ToolMessage) dari eksekusi terbaru untuk menyisipkan data terstruktur ke UI
        is_doc_not_found = False
        for msg in reversed(response["messages"]):
            if hasattr(msg, 'type') and msg.type == 'tool':
                tool_name = getattr(msg, 'name', '')
                content = getattr(msg, 'content', '')
                if tool_name == "search_knowledge_base_tool" and "informasi tidak ditemukan" in content:
                    is_doc_not_found = True
                    break
                elif tool_name == "get_available_doctors_tool" and "available_schedules" in content:
                    final_message += f"\n<JadwalData>{content}</JadwalData>"
                    break
                elif tool_name == "book_appointment_tool" and "booking_success" in content:
                    final_message += f"\n<BookingSuccess>{content}</BookingSuccess>"
                    break
                elif tool_name == "check_my_appointments_tool" and "appointments" in content:
                    final_message += f"\n<AppointmentsList>{content}</AppointmentsList>"
                    break
                elif tool_name == "check_complaint_status_tool" and "complaint_status" in content:
                    final_message += f"\n<ComplaintStatus>{content}</ComplaintStatus>"
                    break
                elif tool_name == "find_complaints_by_contact_tool" and "complaints_list" in content:
                    final_message += f"\n<ComplaintsList>{content}</ComplaintsList>"
                    break
                    
        # Log Token Usage (Gemini default)
        ai_msg = response["messages"][-1]
        token_in, token_out = 0, 0
        if hasattr(ai_msg, 'usage_metadata') and ai_msg.usage_metadata:
            token_in = ai_msg.usage_metadata.get('input_tokens', 0)
            token_out = ai_msg.usage_metadata.get('output_tokens', 0)
            
        log_pemakaian_api("groq", "llama-hybrid", "chat", token_in, token_out, 0.0, durasi_ms)
        
        # Deteksi Log Gagal jika jawaban bot buntu
        resp_lower = final_message.lower()
        if is_doc_not_found:
            log_interaksi_gagal(req.session_id, req.message, "dokumen_tidak_ditemukan", None)
        elif "kurang mengerti" in resp_lower or "bisa diperjelas" in resp_lower:
            log_interaksi_gagal(req.session_id, req.message, "intent_tidak_jelas", None)
            
        result = {"reply": final_message}
        
        # JANGAN cache jawaban yang mengandung data dinamis dari database
        # JANGAN cache jawaban gagal/tidak ditemukan agar tidak menghalangi dokumen baru
        if not is_db_query and not is_doc_not_found and not any(tag in final_message for tag in ["<JadwalData>", "<BookingSuccess>", "<AppointmentsList>", "<ComplaintStatus>", "<ComplaintsList>"]):
            set_cache(prompt_hash, result)
            
        return result
    except Exception as e:
        durasi_ms = int((time.time() - start_time) * 1000)
        log_pemakaian_api("groq", "llama-hybrid", "chat", 0, 0, 0.0, durasi_ms)
        log_interaksi_gagal(req.session_id, req.message, "tool_error", None)
        
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "413" in error_msg or "rate_limit_exceeded" in error_msg:
            print(f"Rate limit / Token exceeded: {error_msg}")
            return {"reply": "Mohon maaf, kapasitas memori percakapan saat ini penuh atau sistem sedang sibuk. Silakan segarkan (refresh) halaman untuk memulai sesi percakapan baru."}
        else:
            print(f"Error pada chat_endpoint: {e}")
            return {"reply": "Mohon maaf, sistem sedang mengalami gangguan teknis internal saat memproses pertanyaan Anda. Silakan coba beberapa saat lagi."}

@app.get("/")
def read_root():
    return {"message": "AI Service is running with RAG capabilities"}

@app.post("/api/internal/documents/{dokumen_id}/reprocess", status_code=202)
def reprocess_document_endpoint(dokumen_id: int, background_tasks: BackgroundTasks, _ = Depends(verify_internal_secret)):
    background_tasks.add_task(process_document, dokumen_id)
    return {"status": "processing", "message": f"Proses embedding dokumen ID {dokumen_id} dimulai di latar belakang"}
