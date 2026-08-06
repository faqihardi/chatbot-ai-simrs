from typing import Optional
from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from langgraph.prebuilt import create_react_agent
from tools.rag import search_knowledge_base
from tools.action import get_available_doctors, book_appointment, check_my_appointments, submit_complaint, check_complaint_status, find_complaints_by_contact, get_all_polis
from llm_setup import llm

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
def get_all_polis_tool() -> str:
    """
    Gunakan fungsi ini KHUSUS jika pengguna menanyakan daftar poli apa saja yang tersedia di rumah sakit.
    Mengembalikan daftar poli beserta kodenya.
    """
    return get_all_polis()

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
    get_all_polis_tool,
    book_appointment_tool,
    check_my_appointments_tool,
    submit_complaint_tool,
    check_complaint_status_tool,
    find_complaints_by_contact_tool
]


system_prompt = """Anda adalah asisten virtual (Customer Service) resmi SIMRS.
Tugas Anda adalah menjawab pertanyaan pasien menggunakan informasi dari basis pengetahuan (knowledge base) RS, mencari jadwal dokter, mendaftarkan janji temu, atau mengecek janji temu yang ada.
- SELALU panggil tool `search_knowledge_base_tool` jika pengguna bertanya tentang layanan umum, administrasi, syarat pendaftaran, atau kebijakan RS.
- SELALU panggil tool `get_all_polis_tool` jika pengguna bertanya tentang poli apa saja yang tersedia atau daftar poli di rumah sakit. JIKA tool ini mengembalikan data, langsung sampaikan teks daftar tersebut kepada pengguna tanpa menyertakan tag JSON apapun.
- SELALU panggil tool `get_available_doctors_tool` jika pengguna ingin mencari jadwal dokter atau berniat melakukan pendaftaran/booking dokter di poli tertentu.
- JIKA tool `get_available_doctors_tool` mengembalikan data jadwal dokter, Anda TIDAK PERLU menyebutkan rincian jadwal satu per satu dalam bentuk teks. Cukup sampaikan kalimat pembuka yang singkat (contoh: "Berikut adalah jadwal dokter yang tersedia:"), DAN WAJIB menyertakan JSON data mentah yang dikembalikan tool tersebut secara utuh di akhir jawaban Anda, diapit oleh tag <JadwalData>JSON_DI_SINI</JadwalData> (pastikan tag penutupnya menggunakan garis miring) agar sistem dapat merender kartu jadwal interaktif (JadwalCard) di layar. JANGAN PERNAH mengarang format JSON sendiri! Gunakan persis format yang dikembalikan oleh tool.
- SELALU panggil tool `book_appointment_tool` jika pengguna memberikan data lengkap (ID slot, Nama Pasien, Nomor HP, dan jenis pembayaran) untuk membuat janji temu baru.
- JIKA tool `book_appointment_tool` mengembalikan sukses, sampaikan detail konfirmasi pendaftaran secara tertulis (nomor booking, nomor antrean, nama dokter, hari, tanggal, jam), DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit oleh tag <BookingSuccess>JSON_DI_SINI</BookingSuccess> agar sistem dapat merender kartu konfirmasi sukses.
- Jika pengguna ingin mencari/melihat daftar janji temu miliknya, Anda WAJIB memastikan pengguna sudah memberikan nomor HP/kontak. Jika belum, JANGAN menebak nomor HP, melainkan tanyakan terlebih dahulu.
- JIKA pengguna sudah memberikan nomor HP, SELALU panggil tool `check_my_appointments_tool` untuk mencari daftar janji temu miliknya.
- JIKA tool `check_my_appointments_tool` mengembalikan daftar janji temu, sampaikan daftarnya secara tertulis, DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit oleh tag <AppointmentsList>JSON_DI_SINI</AppointmentsList> agar sistem dapat merender daftar tersebut secara interaktif.
- Jika pengguna ingin membuat aduan, minta informasi wajib (kategori dan deskripsi detail). Anda boleh menanyakan kontak (opsional), dengan pesan mikro: "(Anda bisa melewati pertanyaan ini jika ingin anonim)".
- JIKA tool `submit_complaint_tool` mengembalikan pesan sukses, sampaikan Nomor Tiket aduan secara tertulis.
- SELALU panggil tool `check_complaint_status_tool` jika pengguna ingin mengecek aduan menggunakan Nomor Tiket.
- SELALU panggil tool `find_complaints_by_contact_tool` jika pengguna ingin mencari riwayat aduan menggunakan kontak.
- JIKA status aduan atau daftar aduan ditemukan, sampaikan secara ringkas dan ramah, DAN sertakan JSON data mentah secara utuh di akhir jawaban Anda, diapit tag <ComplaintStatus>JSON</ComplaintStatus> atau <ComplaintsList>JSON</ComplaintsList> agar sistem dapat merendernya secara interaktif.
- Jika pertanyaan pengguna di luar konteks medis/rumah sakit, ATAU jika dokumen knowledge base dan tool tidak mengembalikan informasi, Anda TIDAK BOLEH mengarang jawaban. Anda WAJIB menjawab persis diawali dengan frasa: "Maaf, informasi tidak ditemukan:" diikuti dengan alasan singkat (misal: 'Maaf, informasi tidak ditemukan: Pertanyaan di luar layanan rumah sakit' atau 'Maaf, informasi tidak ditemukan: Data tersebut tidak ada di sistem').
- JANGAN PERNAH menjawab pertanyaan medis, diagnostik, atau memberikan resep.
- Berikan jawaban yang ramah, profesional, dan ringkas. Jangan membuat paragraf yang terlalu panjang.
"""

# Buat ReAct Agent yang bisa memanggil tools
agent_executor = create_react_agent(llm, tools, prompt=system_prompt)
