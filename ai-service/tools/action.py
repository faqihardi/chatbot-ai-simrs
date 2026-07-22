import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def get_available_doctors(poli: str, tanggal: str = None) -> str:
    """
    Mencari jadwal dokter yang tersedia di poli tertentu.
    Param:
    - poli: Kode poli (misal: 'INT', 'OBG') atau nama poli (misal: 'Kandungan', 'Penyakit Dalam').
    - tanggal: Opsional, tanggal praktik format 'YYYY-MM-DD'.
    """
    if not DATABASE_URL:
        return "Database belum dikonfigurasi."

    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        
        # Query untuk mencari poli berdasarkan kode atau nama (ILIKE)
        # Jika ditemukan, ambil slots dokter yang terjadwal namun belum di-booking (status != 'terjadwal')
        sql = """
            SELECT 
                js.id as slot_id,
                d.nama as dokter_nama,
                d.spesialisasi,
                p.nama as poli_nama,
                js.tanggal,
                js.jam_mulai,
                js.jam_selesai
            FROM jadwal_slot js
            JOIN dokter d ON js.dokter_id = d.id
            JOIN poli p ON d.poli_id = p.id
            WHERE (p.nama ILIKE %s OR p.kode = %s)
              AND js.tanggal >= CURRENT_DATE
              AND NOT EXISTS (
                  SELECT 1 FROM booking b
                  WHERE b.slot_id = js.id
                    AND b.status = 'terjadwal'
              )
        """
        
        params = [f"%{poli}%", poli]
        
        if tanggal:
            sql += " AND js.tanggal = %s"
            params.append(tanggal)
            
        sql += " ORDER BY js.tanggal ASC, js.jam_mulai ASC"
        
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        
        if not rows:
            return f"Tidak ada jadwal dokter yang tersedia untuk Poli '{poli}'" + (f" pada tanggal {tanggal}." if tanggal else ".")
            
        # Format output menjadi list terstruktur yang mudah dipahami LLM dan UI
        # Kita akan memberikan format terstruktur JSON agar React (Laravel Proxy) bisa mendeteksi jadwal dokter
        # dan merender kartu interaktif (JadwalCard) jika diperlukan.
        import json
        return json.dumps({
            "type": "available_schedules",
            "poli": rows[0]["poli_nama"],
            "slots": [
                {
                    "slot_id": row["slot_id"],
                    "dokter_nama": row["dokter_nama"],
                    "spesialisasi": row["spesialisasi"],
                    "tanggal": str(row["tanggal"]),
                    "jam_mulai": str(row["jam_mulai"]),
                    "jam_selesai": str(row["jam_selesai"])
                }
                for row in rows
            ]
        }, ensure_ascii=False)

    except Exception as e:
        print(f"Error pada get_available_doctors: {e}")
        return "Terjadi kesalahan saat memproses data jadwal dokter."
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


def book_appointment(slot_id: int, patient_name: str, contact: str, payment_type: str = "umum") -> str:
    """
    Melakukan booking/pendaftaran pasien ke slot jadwal tertentu.
    Param:
    - slot_id: ID slot jadwal yang dipilih.
    - patient_name: Nama pasien.
    - contact: Kontak/Nomor HP pasien (akan otomatis dienkripsi di Laravel).
    - payment_type: Jenis pembayaran ('umum', 'bpjs', 'asuransi'). Default 'umum'.
    """
    laravel_url = os.getenv("LARAVEL_URL", "http://127.0.0.1:8000")
    endpoint = f"{laravel_url}/api/internal/booking"
    
    import requests
    import json
    
    try:
        payload = {
            "slot_id": slot_id,
            "patient_name": patient_name,
            "contact": contact,
            "payment_type": payment_type
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(endpoint, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            res_data = response.json()
            return json.dumps({
                "type": "booking_success",
                "nomor_booking": res_data.get("nomor_booking"),
                "nomor_antrean": res_data.get("nomor_antrean"),
                "dokter_nama": res_data.get("dokter_nama"),
                "poli_nama": res_data.get("poli_nama"),
                "tanggal": res_data.get("tanggal"),
                "jam": res_data.get("jam")
            }, ensure_ascii=False)
        else:
            try:
                err_msg = response.json().get("message", "Gagal memproses pendaftaran.")
            except:
                err_msg = response.text
            return f"Pendaftaran Gagal: {err_msg}"
            
    except Exception as e:
        print(f"Error pada book_appointment: {e}")
        return "Gagal terhubung dengan layanan pendaftaran rumah sakit saat ini."


def check_my_appointments(contact: str) -> str:
    """
    Mencari riwayat janji temu (booking) aktif milik pasien berdasarkan kontak/nomor HP.
    """
    laravel_url = os.getenv("LARAVEL_URL", "http://127.0.0.1:8000")
    endpoint = f"{laravel_url}/api/internal/appointments"
    
    import requests
    import json
    
    try:
        payload = {
            "kontak": contact
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(endpoint, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            res_data = response.json()
            bookings = res_data.get("bookings", [])
            if not bookings:
                return f"Tidak ditemukan janji temu aktif untuk nomor kontak {contact}."
            return json.dumps({
                "type": "appointments_list",
                "bookings": bookings
            }, ensure_ascii=False)
        else:
            return "Gagal memeriksa janji temu Anda saat ini."
            
    except Exception as e:
        print(f"Error pada check_my_appointments: {e}")
        return "Gagal terhubung dengan layanan informasi janji temu saat ini."
