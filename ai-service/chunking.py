def chunk_text(text: str, max_words: int = 300) -> list[str]:
    """
    Pecah dokumen menjadi potongan kata dengan panjang maksimal `max_words`.
    """
    if not text:
        return []
    
    words = text.split()
    chunks = []
    
    current_chunk = []
    current_length = 0
    
    for word in words:
        current_chunk.append(word)
        current_length += 1
        
        if current_length >= max_words:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_length = 0
            
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks
