import os
import psycopg2
from dotenv import load_dotenv
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from embedding import generate_embedding

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

import numpy as np

def cosine_similarity_np(v1, v2):
    vec1 = np.array(v1)
    vec2 = np.array(v2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def mmr_select(candidates, k=5, lambda_mult=0.7):
    # candidates: list of dict {'dokumen_id', 'urutan_chunk', 'judul', 'score', 'embedding'}
    selected = []
    remaining = candidates.copy()
    
    while len(selected) < k and remaining:
        if not selected:
            best = max(remaining, key=lambda x: x['score'])
        else:
            def mmr_score(candidate):
                sim_score = candidate['score']
                max_redundancy = max(
                    cosine_similarity_np(candidate['embedding'], s['embedding'])
                    for s in selected
                )
                return lambda_mult * sim_score - (1 - lambda_mult) * max_redundancy
            
            best = max(remaining, key=mmr_score)
        
        selected.append(best)
        remaining.remove(best)
    
    return selected

def search_knowledge_base(query: str, limit: int = 5, similarity_threshold: float = 0.4) -> str:
    """
    Mencari dokumen yang relevan dari basis pengetahuan menggunakan MMR (Maximal Marginal Relevance).
    """
    if not DATABASE_URL:
        return "Database URL belum dikonfigurasi."
    
    query_vector = generate_embedding(query)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Fetch top 20 candidates untuk diproses MMR
        fetch_k = 20
        sql_query = """
            SELECT c.dokumen_id, c.urutan_chunk, d.judul, 
                   1 - (c.embedding <=> %s::vector) as similarity,
                   c.embedding::text
            FROM chunk_dokumen c
            JOIN dokumen d ON c.dokumen_id = d.id
            WHERE d.aktif = true AND c.embedding IS NOT NULL
            ORDER BY c.embedding <=> %s::vector ASC
            LIMIT %s
        """
        cursor.execute(sql_query, (str(query_vector), str(query_vector), fetch_k))
        results = cursor.fetchall()
        
        # Parse kandidat
        candidates = []
        import json
        for row in results:
            if row[3] >= similarity_threshold: # threshold filtering
                try:
                    emb = json.loads(row[4])
                    candidates.append({
                        'dokumen_id': row[0],
                        'urutan_chunk': row[1],
                        'judul': row[2],
                        'score': row[3],
                        'embedding': emb
                    })
                except:
                    pass

        # Pilih dengan MMR
        selected_candidates = mmr_select(candidates, k=limit, lambda_mult=0.7)
        
        relevant_chunks = []
        for cand in selected_candidates:
            dokumen_id = cand['dokumen_id']
            urutan_chunk = cand['urutan_chunk']
            judul = cand['judul']
            
            # Context Expansion
            expand_query = """
                SELECT urutan_chunk, isi_potongan
                FROM chunk_dokumen
                WHERE dokumen_id = %s AND urutan_chunk IN (%s, %s, %s)
                ORDER BY urutan_chunk ASC
            """
            cursor.execute(expand_query, (dokumen_id, urutan_chunk - 1, urutan_chunk, urutan_chunk + 1))
            expanded_results = cursor.fetchall()
            
            gabungan_teks = "\n".join([row[1] for row in expanded_results])
            relevant_chunks.append(f"Sumber: {judul}\nInformasi: {gabungan_teks}")
            
        if not relevant_chunks:
            return "informasi tidak ditemukan"
            
        return "\n\n".join(relevant_chunks)
        
    except Exception as e:
        print(f"Error pada search_knowledge_base: {e}")
        return "Terjadi kesalahan saat mengakses basis pengetahuan."
    finally:
        cursor.close()
        conn.close()
