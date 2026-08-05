import os
import json
import time
from langchain_core.messages import ToolMessage
from langchain_core.runnables import Runnable
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# ----------------- LAYER 3: CACHING -----------------
CACHE_DIR = os.path.join(os.path.dirname(__file__), "tmp", "llm_cache")

def get_cache(prompt_hash: str):
    if os.getenv("LLM_CACHE_ENABLED", "false").lower() != "true":
        return None
    cache_file = os.path.join(CACHE_DIR, f"{prompt_hash}.json")
    if os.path.exists(cache_file):
        # Cek TTL 1 jam (3600 detik)
        if time.time() - os.path.getmtime(cache_file) < 3600:
            try:
                with open(cache_file, "r") as f:
                    print(f"CACHE HIT! Return from {cache_file}")
                    return json.load(f)
            except:
                return None
    return None

def set_cache(prompt_hash: str, response_data: dict):
    if os.getenv("LLM_CACHE_ENABLED", "false").lower() != "true":
        return
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(CACHE_DIR, f"{prompt_hash}.json")
    try:
        with open(cache_file, "w") as f:
            json.dump(response_data, f)
            print(f"CACHE SAVED! to {cache_file}")
    except Exception as e:
        print(f"Error saving cache: {e}")

# ----------------- LAYER 2: MODEL ROUTING & LAYER 1: BACKOFF -----------------
intent_model_name = os.getenv("LLM_INTENT_MODEL", "gemini-2.0-flash")
generation_model_name = os.getenv("LLM_GENERATION_MODEL", "gemini-2.5-flash")

class HybridLLM(Runnable):
    def __init__(self, intent_llm=None, generation_llm=None):
        # Lapis 1: Exponential Backoff via max_retries=3
        self.intent_llm = intent_llm or ChatGroq(
            model_name=intent_model_name,
            groq_api_key=os.getenv("GROQ_API_KEY"),
            temperature=0,
            max_retries=3
        )
        self.generation_llm = generation_llm or ChatGroq(
            model_name=generation_model_name,
            groq_api_key=os.getenv("GROQ_API_KEY"),
            temperature=0,
            max_retries=3
        )
        
    def _get_messages(self, input_data):
        if isinstance(input_data, dict) and "messages" in input_data:
            return input_data["messages"]
        elif hasattr(input_data, "messages"):
            return input_data.messages
        elif isinstance(input_data, list):
            return input_data
        return []

    def invoke(self, input_data, config=None, **kwargs):
        messages = self._get_messages(input_data)
        has_tool_message = any(hasattr(m, "type") and m.type == "tool" or isinstance(m, ToolMessage) for m in messages)
        
        if has_tool_message:
            print(f"Routing to Generation Model ({self.generation_llm.model})")
            return self.generation_llm.invoke(input_data, config=config, **kwargs)
        else:
            print(f"Routing to Intent Model ({self.intent_llm.model})")
            return self.intent_llm.invoke(input_data, config=config, **kwargs)
            
    def bind_tools(self, tools, **kwargs):
        return HybridLLM(
            intent_llm=self.intent_llm.bind_tools(tools, **kwargs),
            generation_llm=self.generation_llm.bind_tools(tools, **kwargs)
        )
        
    def with_config(self, *args, **kwargs):
        return HybridLLM(
            intent_llm=self.intent_llm.with_config(*args, **kwargs),
            generation_llm=self.generation_llm.with_config(*args, **kwargs)
        )
        
    async def ainvoke(self, input_data, config=None, **kwargs):
        messages = self._get_messages(input_data)
        has_tool_message = any(hasattr(m, "type") and m.type == "tool" or isinstance(m, ToolMessage) for m in messages)
        
        if has_tool_message:
            return await self.generation_llm.ainvoke(input_data, config=config, **kwargs)
        else:
            return await self.intent_llm.ainvoke(input_data, config=config, **kwargs)

# Initialize LLM
llm = HybridLLM()
