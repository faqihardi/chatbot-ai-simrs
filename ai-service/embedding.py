import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Gunakan model terbaru untuk embedding
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-2",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

def generate_embedding(text: str) -> list[float]:
    """
    Generate embedding via Gemini API.
    Fungsi murni, tidak mengakses database.
    """
    return embeddings.embed_query(text)

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts via Gemini API.
    """
    return embeddings.embed_documents(texts)
