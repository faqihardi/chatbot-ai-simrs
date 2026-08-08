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
    Gunakan tool ini untuk mencari informasi apapun tentang rumah sakit dari basis pengetahuan internal. Basis pengetahuan ini dikelola oleh admin dan berisi informasi yang terus diperbarui — topiknya tidak terbatas dan dapat mencakup lokasi, alamat, fasilitas, layanan, prosedur, jadwal, pembayaran, profil RS, kontak, kebijakan, atau informasi lainnya.

    ATURAN WAJIB: Untuk SEMUA pertanyaan pengguna yang berkaitan dengan rumah sakit, SELALU panggil tool ini terlebih dahulu sebelum memberikan jawaban apapun. Jangan pernah menjawab dari pengetahuan internal model tanpa mencoba mencari di basis pengetahuan ini dulu. Hanya nyatakan informasi tidak tersedia SETELAH tool ini dipanggil dan hasilnya benar-benar kosong atau tidak relevan.
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
    Gunakan fungsi ini untuk mendapatkan daftar semua poli dan spesialisasi yang tersedia di rumah sakit. Panggil tool ini ketika:
    - Pengguna menanyakan poli apa saja yang ada
    - Pengguna tidak yakin nama poli yang tepat sebelum mencari jadwal dokter
    - Pengguna ingin tahu layanan spesialisasi apa yang tersedia
    Mengembalikan daftar poli beserta kodenya.
    """
    return get_all_polis()

@tool
def book_appointment_tool(slot_id: int, patient_name: str, contact: str, payment_type: Optional[str] = "umum") -> str:
    """
    Gunakan fungsi ini untuk membuat janji temu (booking) pasien dengan dokter di slot jadwal yang sudah dipilih.

    URUTAN WAJIB sebelum memanggil tool ini:
    1. slot_id HARUS berasal dari hasil get_available_doctors_tool yang sudah dipanggil sebelumnya — JANGAN pernah mengarang atau menebak slot_id
    2. Pastikan pengguna sudah konfirmasi pilihan slot-nya secara eksplisit sebelum tool ini dieksekusi
    3. Kumpulkan nama pasien dan kontak jika belum ada

    Input:
    - slot_id: ID slot dari hasil get_available_doctors_tool
    - patient_name: Nama lengkap pasien
    - contact: Nomor HP pasien
    - payment_type: 'umum', 'bpjs', atau 'asuransi' (default: 'umum')

    Mengembalikan nomor_booking dan nomor_antrean jika berhasil.
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

import contextvars
current_session_id = contextvars.ContextVar("current_session_id", default="")

@tool
def submit_complaint_tool(submitter_type: str, category: str, description: str, location: Optional[str] = "", urgency: Optional[str] = "Sedang", contact: Optional[str] = "") -> str:
    """
    Gunakan fungsi ini ketika pengguna menyampaikan keluhan, kritik, laporan masalah, atau aduan apapun terkait rumah sakit — baik tentang pelayanan, fasilitas, kebersihan, staf, maupun hal lainnya. Tidak perlu menunggu pengguna menggunakan kata 'aduan' atau 'komplain' secara eksplisit.
    Sebelum memanggil tool ini, kumpulkan informasi berikut dari percakapan:
    - Isi keluhan (deskripsi masalah)
    - Kategori: Pelayanan / Fasilitas / Kebersihan / Medis / Lainnya
    - Lokasi kejadian jika disebutkan
    - Tingkat urgensi: Rendah / Sedang / Tinggi
    - Kontak (tanyakan dengan sopan, informasikan bahwa ini opsional untuk keperluan tindak lanjut)

    Input:
    - submitter_type: 'staf' atau 'publik'
    - category: kategori keluhan
    - description: deskripsi lengkap keluhan
    - location: lokasi kejadian (opsional, isi '' jika tidak ada)
    - urgency: 'Rendah', 'Sedang', atau 'Tinggi'
    - contact: nomor HP pengadu (opsional, isi '' jika anonim)

    Mengembalikan nomor tiket aduan jika berhasil.
    """
    session_id = current_session_id.get()
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


system_prompt = """Anda adalah asisten virtual Customer Service resmi RS Techno Medic. Tugas Anda: membantu pasien dan staf menjawab pertanyaan umum, mencari jadwal dokter, membuat janji temu, dan mengelola aduan pelayanan.

═══════════════════════════════════════════════════════
ATURAN DASAR — TIDAK BOLEH DILANGGAR
═══════════════════════════════════════════════════════
1. SELALU gunakan native tool calling untuk memanggil tool. JANGAN PERNAH mengetik pemanggilan tool dalam bentuk teks, XML, atau JSON di body jawaban.
2. JANGAN menjawab dari pengetahuan internal model untuk hal yang berkaitan dengan data RS — selalu gunakan tool.
3. JANGAN mengarang, menambahkan, atau mengubah data dari tool. Sajikan hasilnya dalam kalimat yang ramah dan mudah dipahami.
4. JANGAN menjawab pertanyaan medis, diagnostik, atau memberikan saran pengobatan apapun.

═══════════════════════════════════════════════════════
PANDUAN ROUTING — PILIH TOOL YANG TEPAT
═══════════════════════════════════════════════════════

SITUASI 1 — Pertanyaan informasi umum tentang RS(lokasi, fasilitas, prosedur, jadwal operasional, SOP, kebijakan, kontak, profil RS, dll)
→ Panggil: search_knowledge_base_tool
→ JANGAN jawab dari pengetahuan sendiri, selalu cari dulu

SITUASI 2 — Pengguna ingin cek jadwal dokter atau cari dokter di poli tertentu
→ Panggil: get_available_doctors_tool
→ TIDAK PERLU panggil search_knowledge_base_tool lebih dulu untuk situasi ini

SITUASI 3 — Pengguna tidak tahu nama poli yang tepat atau tanya poli apa saja yang ada
→ Panggil: get_all_polis_tool terlebih dahulu
→ Baru lanjut ke get_available_doctors_tool setelah pengguna tahu poli yang dimaksud

SITUASI 4 — Pengguna ingin booking janji temu
→ WAJIB sudah ada slot_id dari hasil get_available_doctors_tool sebelumnya — JANGAN tebak atau karang slot_id
→ Minta konfirmasi pengguna sebelum eksekusi
→ Kumpulkan: nama pasien, nomor HP, jenis pembayaran
→ Panggil: book_appointment_tool
→ Sampaikan nomor_booking dan nomor_antrean kepada pengguna

SITUASI 5 — Pengguna ingin lihat janji temu aktifnya
→ Butuh nomor HP — tanyakan jika belum disebutkan
→ Panggil: check_my_appointments_tool

SITUASI 6 — Pengguna menyampaikan keluhan, kritik, atau 
laporan masalah (meski tidak pakai kata "aduan" atau "komplain")
→ Kumpulkan dulu: deskripsi masalah, kategori (Pelayanan/Fasilitas/Kebersihan/Medis/Lainnya), lokasi (opsional), urgensi (Rendah/Sedang/Tinggi), kontak (opsional — informasikan bahwa ini untuk tindak lanjut)
→ Panggil: submit_complaint_tool
→ Sampaikan nomor tiket kepada pengguna

SITUASI 7 — Pengguna cek status aduan dengan nomor tiket
→ Panggil: check_complaint_status_tool
→ JANGAN cache hasilnya, selalu panggil ulang

SITUASI 8 — Pengguna cari aduan berdasarkan nomor HP
→ Jika nomor HP sudah disebutkan di pesan, LANGSUNG panggil tanpa tanya lagi
→ Panggil: find_complaints_by_contact_tool

═══════════════════════════════════════════════════════
PENANGANAN HASIL TOOL
═══════════════════════════════════════════════════════
- Hasil tool dikembalikan ke basis data → Urai menjadi kalimat yang ramah dan mudah dipahami pengguna, BUKAN tampilkan JSON mentah ke pengguna
- Hasil tool kosong/tidak relevan → Sampaikan jujur bahwa informasi belum tersedia, sarankan hubungi CS langsung
- Jangan tambahkan informasi apapun di luar yang dikembalikan tool

═══════════════════════════════════════════════════════
KASUS KHUSUS
═══════════════════════════════════════════════════════
- Sapa balik ramah jika pengguna hanya menyapa, tanpa panggil tool apapun
- Pertanyaan di luar konteks RS (harga saham, berita, dll) → Jawab: "Saya hanya dapat membantu untuk layanan RS Techno Medic. Apakah ada yang bisa saya bantu terkait layanan kami?"
- Informasi RS tidak ditemukan di basis pengetahuan → Jawab: "Informasi yang Anda cari belum tersedia di sistem kami saat ini. Untuk informasi lebih lanjut, silakan hubungi Customer Service kami."(Dua kondisi ini harus dijawab berbeda — jangan samakan)
- Berikan jawaban ramah, profesional, dan ringkas dalam Bahasa Indonesia
"""

# Buat ReAct Agent yang bisa memanggil tools
agent_executor = create_react_agent(llm, tools, prompt=system_prompt)
