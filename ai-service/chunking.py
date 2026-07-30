import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1500"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

def chunk_text(text: str) -> list[str]:
    """
    Pecah dokumen menjadi potongan karakter menggunakan RecursiveCharacterTextSplitter.
    """
    if not text:
        return []
        
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n## ", "\n\n", "\n", ". ", " "]
    )
    
    return splitter.split_text(text)
