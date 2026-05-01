import os
import json
import requests
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.orm import Session

env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

from database import engine, get_db
import models, auth, schemas
from routers import auth as auth_router, admin as admin_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

# ── OpenRouter config ─────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Free models on OpenRouter — tested & verified working
FREE_MODELS = [
    "openai/gpt-oss-120b:free",          # 120B OpenAI-style, best quality
    "nvidia/nemotron-3-nano-30b-a3b:free",  # 30B fallback
    "nvidia/nemotron-nano-12b-v2-vl:free",  # 12B second fallback
]

def ai_chat(messages: list[dict], max_tokens: int = 1500) -> str:
    """Call OpenRouter with fallback across free models."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Callus Admissions Agent",
    }
    last_error = "Unknown error"
    for model in FREE_MODELS:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.8,
        }
        try:
            resp = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            # Rate-limited or unavailable — try next model
            last_error = resp.json().get("error", {}).get("message", f"HTTP {resp.status_code}")
        except requests.Timeout:
            last_error = f"Timeout on {model}"
        except Exception as e:
            last_error = str(e)
    raise HTTPException(status_code=502, detail=f"All AI models unavailable: {last_error}")

app = FastAPI(title="Callus Admissions Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(admin_router.router)


class ChatMessage(BaseModel):
    role: str
    content: str

class InterviewRequest(BaseModel):
    messages: List[ChatMessage]
    university_target: Optional[str] = "Top Tier"

class EssayRequest(BaseModel):
    transcript: str
    university_target: Optional[str] = "Top Tier"
    prompt: Optional[str] = "Common App personal statement"

class ScoreRequest(BaseModel):
    essay: str
    prompt: Optional[str] = "Common App personal statement"

class RefineRequest(BaseModel):
    essay: str
    instruction: str

class SupplementalRequest(BaseModel):
    school: str
    prompt: str
    student_context: str


@app.get("/")
async def root():
    return {"message": "Callus Admissions Agent API is running"}


# ── 1. INTERVIEW ──────────────────────────────────────────────────
@app.post("/api/interview")
async def conduct_interview(
    request: InterviewRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    system = (
        f"You are the Callus Admissions Agent — a world-class college admissions counselor "
        f"helping a student apply to {request.university_target} universities. "
        "Your mission: uncover the student's unique 'hook' for their personal statement through "
        "a deep, empathetic interview. Ask ONE powerful question at a time. "
        "Avoid generic questions. Dig into moments of failure, growth, obsession, or identity. "
        "After 4 exchanges, respond with a message that STARTS with '[[READY]]' and "
        "summarise the key themes discovered. Keep tone warm, curious, professional."
    )
    msgs = [{"role": "system", "content": system}]
    for m in request.messages:
        msgs.append({"role": "user" if m.role == "user" else "assistant", "content": m.content})
    reply = ai_chat(msgs, max_tokens=600)
    return {"response": reply}


# ── 2. GENERATE ESSAY ─────────────────────────────────────────────
@app.post("/api/essay/generate")
async def generate_essay(
    request: EssayRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    system = "You are an elite college essay writer and admissions consultant."
    user_msg = (
        f"Write a compelling, authentic personal statement for: **{request.prompt}** "
        f"targeting {request.university_target} universities.\n\n"
        "REQUIREMENTS:\n"
        "- 500-650 words\n"
        "- Vivid opening hook (in medias res, sensory detail, or bold statement)\n"
        "- Show, don't tell — use specific scenes from the transcript\n"
        "- Maintain the student's authentic voice (must NOT sound AI-written)\n"
        "- Build to a clear insight or transformation\n"
        "- End memorably\n"
        "- Avoid clichés like 'ever since I was young'\n\n"
        f"INTERVIEW TRANSCRIPT:\n{request.transcript}\n\n"
        "Output ONLY the essay text, no commentary."
    )
    reply = ai_chat([{"role": "system", "content": system}, {"role": "user", "content": user_msg}], max_tokens=900)
    return {"essay": reply}


# ── 3. SCORE ESSAY ────────────────────────────────────────────────
@app.post("/api/essay/score")
async def score_essay(
    request: ScoreRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    system = "You are an experienced Ivy League admissions officer. You ALWAYS respond with valid JSON only."
    user_msg = (
        f"Review this college essay written for: {request.prompt}\n\n"
        "Score on 5 dimensions (each out of 10) and return ONLY this JSON, no markdown, no commentary:\n"
        '{"scores":{"narrative":0,"originality":0,"emotional_impact":0,"prompt_alignment":0,"voice":0},'
        '"overall":0.0,"strengths":["","",""],"improvements":["","",""],'
        '"verdict":"2-3 sentence summary"}\n\n'
        f"ESSAY:\n{request.essay}"
    )
    raw = ai_chat([{"role": "system", "content": system}, {"role": "user", "content": user_msg}], max_tokens=500)
    import re
    text = raw.strip()
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        text = match.group(0)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed score data. Try again.")


# ── 4. REFINE ESSAY ───────────────────────────────────────────────
@app.post("/api/essay/refine")
async def refine_essay(
    request: RefineRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    system = "You are a world-class college essay editor. Output ONLY the refined essay, no commentary."
    user_msg = (
        f'Refine this essay based on: "{request.instruction}"\n'
        "Rules: preserve authentic voice, fix grammar/typos, change only what is necessary.\n\n"
        f"ORIGINAL ESSAY:\n{request.essay}"
    )
    reply = ai_chat([{"role": "system", "content": system}, {"role": "user", "content": user_msg}], max_tokens=900)
    return {"essay": reply}


# ── 5. SUPPLEMENTAL ESSAY ─────────────────────────────────────────
@app.post("/api/essay/supplemental")
async def supplemental_guidance(
    request: SupplementalRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    system = "You are a college-specific admissions expert. Format your response using markdown headers."
    user_msg = (
        f"A student is writing a supplemental essay for **{request.school}**.\n"
        f'Prompt: "{request.prompt}"\n'
        f"Student background: {request.student_context}\n\n"
        f"Provide:\n1. What {request.school} specifically looks for in this prompt\n"
        "2. Three unique angle ideas\n"
        "3. Three things to absolutely avoid\n"
        "4. A strong 150-200 word sample opening paragraph"
    )
    reply = ai_chat([{"role": "system", "content": system}, {"role": "user", "content": user_msg}], max_tokens=800)
    return {"guidance": reply}


# ── 6. DOCUMENTS (SAVE & SHARE) ───────────────────────────────────
@app.post("/api/documents", response_model=schemas.SavedDocumentResponse)
async def save_document(
    doc: schemas.SavedDocumentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_doc = models.SavedDocument(
        user_id=current_user.id,
        doc_type=doc.doc_type,
        title=doc.title,
        content=doc.content
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

@app.get("/api/documents", response_model=List[schemas.SavedDocumentResponse])
async def get_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.SavedDocument).filter(models.SavedDocument.user_id == current_user.id).order_by(models.SavedDocument.created_at.desc()).all()

@app.delete("/api/documents/{doc_id}")
async def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_doc = db.query(models.SavedDocument).filter(models.SavedDocument.id == doc_id, models.SavedDocument.user_id == current_user.id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(db_doc)
    db.commit()
    return {"message": "Document deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
