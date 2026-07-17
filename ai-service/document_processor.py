import os
import psycopg2
import json
from dotenv import load_dotenv
from chunking import chunk_text
from embedding import generate_embeddings

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def process_document(dokumen_id: int):
    """
    Ambil dokumen, hapus chunk lama, pecah isi, generate embedding, dan simpan chunk baru.
    """
    if not DATABASE_URL:
        print("DATABASE_URL belum diset di .env")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        # 1. Fetch document
        cursor.execute("SELECT id, judul, kategori, isi, versi FROM dokumen WHERE id = %s", (dokumen_id,))
        doc_row = cursor.fetchone()
        
        if not doc_row:
            print(f"Dokumen dengan ID {dokumen_id} tidak ditemukan.")
            return

        doc_id, judul, kategori, isi, versi = doc_row

        if not isi:
            print(f"Dokumen ID {dokumen_id} tidak memiliki isi.")
            return

        print(f"Memproses dokumen ID {dokumen_id} - {judul}")

        # 2. Delete old chunks
        cursor.execute("DELETE FROM chunk_dokumen WHERE dokumen_id = %s", (dokumen_id,))

        # 3. Chunk text
        chunks_text = chunk_text(isi, max_words=300)
        if not chunks_text:
            print("Tidak ada chunk yang dihasilkan.")
            return

        print(f"Dihasilkan {len(chunks_text)} chunks.")

        # 4. Generate embeddings for all chunks
        print("Menghasilkan embeddings via Gemini API...")
        embeddings = generate_embeddings(chunks_text)

        # 5. Save new chunks using raw SQL
        insert_query = """
            INSERT INTO chunk_dokumen (dokumen_id, isi_potongan, urutan_chunk, panjang_karakter, metadata, embedding, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        """
        
        for i, (text, emb) in enumerate(zip(chunks_text, embeddings)):
            metadata = {
                "judul": judul,
                "kategori": kategori,
                "dokumen_versi": versi
            }
            # psycopg2 automatically converts lists to PostgreSQL arrays, 
            # and dicts to JSONB if wrapped with psycopg2.extras.Json or json.dumps
            cursor.execute(insert_query, (
                dokumen_id,
                text,
                i + 1,
                len(text),
                json.dumps(metadata),
                emb # pgvector accepts list of floats directly via psycopg2 adapter in most cases, or as string format '[1,2,3]'
            ))

        conn.commit()
        print(f"Berhasil menyimpan {len(chunks_text)} chunks untuk dokumen ID {dokumen_id}.")

    except Exception as e:
        conn.rollback()
        print(f"Gagal memproses dokumen: {str(e)}")
    finally:
        cursor.close()
        conn.close()
