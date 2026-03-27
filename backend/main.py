import os
import re
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ─── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="College Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Groq Client ───────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found. Please set it in your .env file.")

client = Groq(api_key=GROQ_API_KEY)

# ─── RAG System ────────────────────────────────────────────────────────────────
DATA_FILE = os.path.join(os.path.dirname(__file__), "college_data.txt")

def load_and_chunk_data(file_path: str, chunk_size: int = 400, overlap: int = 80) -> List[str]:
    """Load college_data.txt and split into overlapping text chunks."""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Clean up excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    words = text.split()
    chunks = []

    i = 0
    while i < len(words):
        chunk_words = words[i : i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap  # step forward with overlap

    return chunks


def retrieve_relevant_chunks(query: str, chunks: List[str], top_k: int = 4) -> List[str]:
    """
    Simple keyword-based retrieval.
    Scores each chunk by how many query words appear in it, returns top_k.
    """
    query_words = set(re.findall(r"\w+", query.lower()))
    scores = []

    for chunk in chunks:
        chunk_lower = chunk.lower()
        chunk_words = set(re.findall(r"\w+", chunk_lower))
        # Count matching keywords + bonus for phrase match
        keyword_score = len(query_words & chunk_words)
        phrase_score = sum(1 for word in query_words if word in chunk_lower) * 0.5
        scores.append(keyword_score + phrase_score)

    # Get top_k indices sorted by score (descending)
    ranked = sorted(range(len(chunks)), key=lambda i: scores[i], reverse=True)
    return [chunks[i] for i in ranked[:top_k] if scores[i] > 0]


# Load chunks once at startup
print("Loading college knowledge base...")
COLLEGE_CHUNKS = load_and_chunk_data(DATA_FILE)
print(f"Loaded {len(COLLEGE_CHUNKS)} chunks from college_data.txt")

# ─── Schemas ───────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []


class ChatResponse(BaseModel):
    reply: str
    context_used: List[str]


# ─── Chat Endpoint ─────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_message = request.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Retrieve relevant context from college data
    relevant_chunks = retrieve_relevant_chunks(user_message, COLLEGE_CHUNKS, top_k=4)
    context_text = "\n\n---\n\n".join(relevant_chunks) if relevant_chunks else ""

    # Build system prompt
    system_prompt = (
        "You are a helpful and friendly College Assistant chatbot for a prestigious university. "
        "Answer student questions clearly, accurately, and concisely using the college information provided below. "
        "If the information is not in the context, politely say you don't have that detail and suggest "
        "contacting the relevant college office.\n\n"
    )
    if context_text:
        system_prompt += f"=== COLLEGE INFORMATION (use this to answer) ===\n{context_text}\n\n"
    system_prompt += (
        "Always be warm, encouraging, and professional. "
        "Format lists clearly if needed. Keep responses concise but complete."
    )

    # Build messages array for Groq
    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history (last 10 turns to stay within token limit)
    for msg in request.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})

    # Add the current user message
    messages.append({"role": "user", "content": user_message})

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.6,
            max_tokens=1024,
        )
        reply = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

    return ChatResponse(reply=reply, context_used=relevant_chunks)


@app.get("/health")
async def health_check():
    return {"status": "ok", "chunks_loaded": len(COLLEGE_CHUNKS)}
