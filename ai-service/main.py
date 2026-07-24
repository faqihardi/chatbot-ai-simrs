from fastapi import FastAPI
from pydantic import BaseModel
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from langgraph.prebuilt import create_react_agent
from tools.rag import search_knowledge_base
from tools.action import get_available_doctors, book_appointment, check_my_appointments, submit_complaint, check_complaint_status, find_complaints_by_contact

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

@tool
def get_available_doctors_tool(poli: str, tanggal: Optional[str] = None) -> str:
    """
    Gunakan fungsi ini untuk mencari jadwal dokter yang tersedia di poli tertentu.
    Input `poli` bisa nama poli (misal: 'Penyakit Dalam', 'Kandungan') atau kode poli (misal: 'INT', 'OBG').
    Input `tanggal` opsional dalam format 'YYYY-MM-DD'.
    Mengembalikan data slot jadwal dokter yang aktif dan bisa di-booking.
    """
    return get_available_doctors(poli, tanggal)

@tool
def book_appointment_tool(slot_id: int, patient_name: str, contact: str, payment_type: Optional[str] = "umum") -> str:
    """
    Gunakan fungsi ini jika pengguna secara eksplisit meminta Anda mendaftarkan mereka atau membuatkan janji temu dokter baru di slot jadwal tertentu.
    Input:
    - slot_id: ID slot jadwal yang dipilih.
    - patient_name: Nama lengkap pasien.
    - contact: Nomor HP/kontak pasien.
    - payment_type: Jenis pembayaran ('umum', 'bpjs', 'asuransi').
    Mengembalikan detail booking jika pendaftaran berhasil.
    """
    return book_appointment(slot_id, patient_name, contact, payment_type)

@tool
def check_my_appointments_tool(contact: str) -> str:
    """
    Gunakan fungsi ini jika pengguna ingin memeriksa status janji temu (booking) aktif mereka.
    Input:
    - contact: Nomor HP/kontak pasien yang digunakan saat pendaftaran.
    Mengembalikan daftar janji temu pasien yang terdaftar.
    """
    return check_my_appointments(contact)

@tool
def submit_complaint_tool(submitter_type: str, category: str, description: str, location: Optional[str] = "", urgency: Optional[str] = "Sedang", contact: Optional[str] = "", config: RunnableConfig = None) -> str:
    """
    Gunakan fungsi ini jika pengguna ingin mensubmit aduan atau keluhan terkait pelayanan rumah sakit.
    Input:
    - submitter_type: 'staf' jika pengadu adalah staf rumah sakit, atau 'publik' jika masyarakat/pasien.
    - category: Kategori keluhan (contoh: Pelayanan, Fasilitas, Kebersihan, Medis).
    - description: Deskripsi lengkap mengenai aduan.
    - location: (Opsional) Lokasi kejadian aduan.
    - urgency: (Opsional) 'Rendah', 'Sedang', atau 'Tinggi'.
    - contact: (Opsional) Nomor HP/kontak pengadu. Pastikan meminta izin (consent) sebelum meminta kontak.
    Mengembalikan Nomor Tiket aduan jika berhasil.
    """
    session_id = config.get("configurable", {}).get("thread_id", "") if config else ""
    return submit_complaint(submitter_type, category, description, location, urgency, contact, session_id)

@tool
def check_complaint_status_tool(nomor_tiket: str) -> str:
    """
    Gunakan fungsi ini untuk mengecek status aduan berdasarkan nomor tiket.
    Input:
    - nomor_tiket: Nomor tiket aduan.
    Mengembalikan data status aduan.
    """
    return check_complaint_status(nomor_tiket)

@tool
def find_complaints_by_contact_tool(contact: str) -> str:
    """
    Gunakan fungsi ini untuk mencari daftar aduan milik pengguna berdasarkan kontak.
    Input:
    - contact: Nomor HP/kontak pengadu.
    Mengembalikan daftar aduan.
    """
    return find_complaints_by_contact(contact)

tools = [
    search_knowledge_base_tool, 
    get_available_doctors_tool,
    book_appointment_tool,
    check_my_appointments_tool,
    submit_complaint_tool,
    check_complaint_status_tool,
    find_complaints_by_contact_tool
]


system_prompt = """Anda adalah asisten virtual (Customer Service) resmi SIMRS.
Tugas Anda adalah menjawab pertanyaan pasien menggunakan informasi dari basis pengetahuan (knowledge base) RS, mencari jadwal dokter, mendaftarkan janji temu, atau mengecek janji temu yang ada.
- SELALU panggil tool `search_knowledge_base_tool` jika pengguna bertanya tentang layanan umum, administrasi, syarat pendaftaran, atau kebijakan RS.
- SELALU panggil tool `get_available_doctors_tool` jika pengguna ingin mencari jadwal dokter atau berniat melakukan pendaftaran/booking dokter di poli tertentu.
- JIKA tool `get_available_doctors_tool` mengembalikan data jadwal dokter, Anda wajib menyampaikannya secara tertulis dengan ramah, DAN menyertakan JSON data mentah yang dikembalikan tool tersebut secara utuh di akhir jawaban Anda, diapit oleh tag <JadwalData>JSON_DI_SINI</JadwalData> agar sistem dapat merender kartu jadwal interaktif (JadwalCard) di layar.
- SELALU panggil tool `book_appointment_tool` jika pengguna memberikan data lengkap (ID slot, Nama Pasien, Nomor HP, dan jenis pembayaran) untuk membuat janji temu baru.
- JIKA tool `book_appointment_tool` mengembalikan sukses, sampaikan detail konfirmasi pendaftaran secara tertulis (nomor booking, nomor antrean, nama dokter, hari, tanggal, jam), DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit oleh tag <BookingSuccess>JSON_DI_SINI</BookingSuccess> agar sistem dapat merender kartu konfirmasi sukses.
- SELALU panggil tool `check_my_appointments_tool` jika pengguna ingin mencari/melihat daftar janji temu miliknya menggunakan nomor HP/kontak.
- JIKA tool `check_my_appointments_tool` mengembalikan daftar janji temu, sampaikan daftarnya secara tertulis, DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit oleh tag <AppointmentsList>JSON_DI_SINI</AppointmentsList> agar sistem dapat merender daftar tersebut secara interaktif.
- Jika pengguna ingin membuat aduan, minta informasi wajib (kategori dan deskripsi detail). Anda boleh menanyakan kontak (opsional), dengan pesan mikro: "(Anda bisa melewati pertanyaan ini jika ingin anonim)".
- JIKA tool `submit_complaint_tool` mengembalikan pesan sukses, sampaikan Nomor Tiket aduan secara tertulis.
- SELALU panggil tool `check_complaint_status_tool` jika pengguna ingin mengecek aduan menggunakan Nomor Tiket.
- SELALU panggil tool `find_complaints_by_contact_tool` jika pengguna ingin mencari riwayat aduan menggunakan kontak.
- JIKA status aduan atau daftar aduan ditemukan, sampaikan secara ringkas dan ramah, DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit tag <ComplaintStatus>JSON</ComplaintStatus> atau <ComplaintsList>JSON</ComplaintsList> agar sistem dapat merendernya secara interaktif.
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
    user_role: str = "publik"

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    # Menyusun riwayat percakapan untuk agent
    formatted_messages = []
    
    # Konteks Role
    role_instruction = f"PENTING: Anda sedang berinteraksi dengan pengguna berstatus '{req.user_role}'."
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
