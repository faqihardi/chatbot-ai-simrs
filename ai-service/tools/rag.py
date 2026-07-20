import os
import psycopg2
from dotenv import load_dotenv
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from embedding import generate_embedding

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def search_knowledge_base(query: str, limit: int = 3, similarity_threshold: float = 0.5) -> str:
    """
    Mencari dokumen yang relevan dari basis pengetahuan menggunakan exact vector search.
    Cosine distance (1 - similarity) pada pgvector menggunakan operator <=>
    """
    if not DATABASE_URL:
        return "Database URL belum dikonfigurasi."
    
    # Generate embedding untuk pertanyaan/query
    query_vector = generate_embedding(query)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Query Exact Search Vector
        # Cosine similarity dihitung dengan 1 - (jarak cosine)
        sql_query = """
            SELECT c.isi_potongan, d.judul, 1 - (c.embedding <=> %s::vector) as similarity
            FROM chunk_dokumen c
            JOIN dokumen d ON c.dokumen_id = d.id
            WHERE d.aktif = true AND c.embedding IS NOT NULL
            ORDER BY c.embedding <=> %s::vector ASC
            LIMIT %s
        """
        cursor.execute(sql_query, (str(query_vector), str(query_vector), limit))
        results = cursor.fetchall()
        
        relevant_chunks = []
        for isi_potongan, judul, similarity in results:
            # threshold untuk mencegah halusinasi
            if similarity >= similarity_threshold:
                relevant_chunks.append(f"Sumber: {judul}\nInformasi: {isi_potongan}")
                
        if not relevant_chunks:
            return "informasi tidak ditemukan"
            
        return "\n\n".join(relevant_chunks)
        
    except Exception as e:
        print(f"Error pada search_knowledge_base: {e}")
        return "Terjadi kesalahan saat mengakses basis pengetahuan."
    finally:
        cursor.close()
        conn.close()
