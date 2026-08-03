import os
import psycopg2
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    return psycopg2.connect(db_url)

def log_interaksi_gagal(token_sesi: Optional[str], pertanyaan: str, alasan_gagal: str, skor_similarity: Optional[float] = None):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        sesi_id = None
        if token_sesi:
            cur.execute("SELECT id FROM sesi_percakapan WHERE token_sesi = %s", (token_sesi,))
            res = cur.fetchone()
            if res:
                sesi_id = res[0]

        cur.execute("""
            INSERT INTO log_interaksi_gagal 
            (sesi_id, pertanyaan, alasan_gagal, skor_similarity_tertinggi) 
            VALUES (%s, %s, %s, %s)
        """, (sesi_id, pertanyaan, alasan_gagal, skor_similarity))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error logging interaksi gagal: {e}")

def log_pemakaian_api(provider: str, model: str, jenis_panggilan: str, token_input: int, token_output: Optional[int], estimasi_biaya: float, durasi_ms: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO log_pemakaian_api 
            (provider, model, jenis_panggilan, token_input, token_output, estimasi_biaya, durasi_ms) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (provider, model, jenis_panggilan, token_input, token_output, estimasi_biaya, durasi_ms))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error logging pemakaian API: {e}")
