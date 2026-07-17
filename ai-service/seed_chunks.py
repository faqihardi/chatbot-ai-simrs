import os
import psycopg2
from dotenv import load_dotenv
from document_processor import process_document

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def run_seed():
    if not DATABASE_URL:
        print("DATABASE_URL belum diset di .env")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        # Fetch all active documents
        cursor.execute("SELECT id FROM dokumen WHERE aktif = TRUE")
        active_docs = cursor.fetchall()
        
        if not active_docs:
            print("Tidak ada dokumen aktif yang ditemukan.")
            return

        print(f"Menemukan {len(active_docs)} dokumen aktif. Memulai proses...")
        
        for doc_row in active_docs:
            doc_id = doc_row[0]
            process_document(doc_id)
            
        print("Selesai memproses semua dokumen aktif.")
    except Exception as e:
        print(f"Error saat seeding: {str(e)}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_seed()
