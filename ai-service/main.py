from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI(title="Chatbot AI SIMRS - AI Service")

# Initialize LLM (Gemini API)
# Fallback logic to OpenAI can be added later if needed
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    # Basic endpoint to validate API Key and connection
    response = llm.invoke(req.message)
    return {"reply": response.content}

@app.get("/")
def read_root():
    return {"message": "AI Service is running"}
