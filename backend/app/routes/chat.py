from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database.connection import get_db
from app.models.models import User
from app.services.auth_service import get_current_user
from app.services.ai_service import get_user_context, build_system_prompt, client

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []


@router.post("/")
def chat(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    context = get_user_context(current_user, db)
    system_prompt = build_system_prompt(current_user, context)

    # Build messages with history
    messages = [{"role": "system", "content": system_prompt}]

    for msg in payload.history:
        messages.append(msg)

    messages.append({"role": "user", "content": payload.message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=400,
        temperature=0.7,
    )

    return {
        "response": response.choices[0].message.content
    }