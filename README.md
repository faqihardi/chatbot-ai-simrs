# SIMRS Techno Medic - Chatbot AI 🏥🤖

TechnoZ adalah Chatbot AI terintegrasi berbasis LangChain dan LLM (Groq/Llama-3). Proyek ini dibagi menjadi dua bagian utama:
1. **web-app**: Frontend (React/Vite) dan Backend Aplikasi (Laravel 11)
2. **ai-service**: Layanan AI Chatbot (Python FastAPI + LangGraph)

Berikut adalah panduan lengkap untuk mengatur dan menjalankan proyek ini.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Requirement:
- **PHP** (Minimal versi 8.2) & **Composer**
- **Node.js** (Minimal versi 18) & **NPM**
- **Python** (Minimal versi 3.10)
- **PostgreSQL** (Database)
- Akun dan API Key aktif dari:
  - **Groq Cloud** (Untuk model LLM Llama-3)
  - **Google Gemini** (Untuk model Text Embedding / RAG)

---

## 🚀 Cara Menjalankan Proyek

### 1. Persiapan Database
1. Buka PostgreSQL (pgAdmin / DBeaver / PSQL)
2. Buat database baru dengan nama `simrs-chatbot`.

### 2. Konfigurasi `web-app` (Laravel + React)
Buka terminal baru dan arahkan ke direktori `web-app`:
```bash
cd web-app
```
1. **Instalasi dependensi PHP & Node:**
   ```bash
   composer install
   npm install
   ```
2. **Pengaturan *Environment* (.env):**
   Salin *file* template `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka *file* `.env` dan sesuaikan kredensial database Anda:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=simrs-chatbot
   DB_USERNAME=postgres
   DB_PASSWORD=password_database_anda
   
   # Buat string acak (misal: 64 karakter) dan samakan dengan di ai-service
   INTERNAL_API_SECRET=your_secret_string_here 
   ```
3. **Generate App Key & Migrasi Database:**
   ```bash
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```
4. **Jalankan *Server* Laravel & Vite (Buka 2 Terminal):**
   - Terminal 1 (Backend Laravel):
     ```bash
     php artisan serve --port=8002
     ```
   - Terminal 2 Frontend and Backend:
     ```bash
     composer run dev
     ```

### 3. Konfigurasi `ai-service` (Python FastAPI)
Buka terminal baru dan arahkan ke direktori `ai-service`:
```bash
cd ai-service
```
1. **Buat dan Aktifkan *Virtual Environment*:**
   - **Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
2. **Instalasi dependensi Python:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Pengaturan *Environment* (.env):**
   Salin *file* template `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka *file* `.env` dan isi API Key Anda:
   ```env
   GEMINI_API_KEY=api_key_google_gemini_anda
   GROQ_API_KEY=api_key_groq_cloud_anda
   
   # Sesuaikan dengan kredensial database postgresql Anda
   DATABASE_URL="postgresql://postgres:password_database_anda@localhost:5432/simrs-chatbot"
   
   # Harus sama persis dengan yang ada di web-app/.env
   INTERNAL_API_SECRET=your_secret_string_here
   ```
4. **Jalankan *Server* AI:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

---

## ✅ Akses Aplikasi
Jika ketiga layanan (Laravel, Vite, dan Uvicorn) sudah berjalan, Anda dapat mengakses aplikasi melalui browser:
👉 **http://localhost:8000**

*Catatan: Pastikan Uvicorn AI Service selalu menyala di `port 8001` agar fitur chatbot di web aplikasi dapat merespons pesan dengan baik.*
