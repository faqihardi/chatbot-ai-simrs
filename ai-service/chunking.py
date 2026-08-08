import os
from dotenv import load_dotenv
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

load_dotenv()

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

def chunk_text(text: str) -> list[str]:
    """
    Pecah dokumen menjadi potongan menggunakan dua fase:
    1. MarkdownHeaderTextSplitter: memecah berdasarkan heading ## sehingga setiap
       sub-topik (Profil, Lokasi, Visi Misi, dll) menjadi chunk terpisah.
    2. RecursiveCharacterTextSplitter: memecah seksi yang masih terlalu panjang (> CHUNK_SIZE).
    """
    if not text:
        return []

    # Fase 1: Pecah per heading markdown (H1, H2, H3)
    headers_to_split_on = [
        ("#", "H1"),
        ("##", "H2"),
        ("###", "H3"),
    ]
    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False  # Pertahankan heading di dalam chunk agar konteks tidak hilang
    )
    md_chunks = md_splitter.split_text(text)

    # Fase 2: Jika ada seksi yang masih terlalu panjang, pecah lagi
    char_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " "]
    )

    final_chunks = []
    for doc in md_chunks:
        content = doc.page_content.strip()
        if not content:
            continue
        if len(content) > CHUNK_SIZE:
            sub_chunks = char_splitter.split_text(content)
            final_chunks.extend(sub_chunks)
        else:
            final_chunks.append(content)

    return final_chunks
