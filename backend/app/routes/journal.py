from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.models import JournalEntry, AIResponse, User
from app.schemas.schemas import JournalEntryCreate, JournalEntryOut
from app.services.auth_service import get_current_user
from app.services.ai_service import generate_ai_response

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("/", response_model=JournalEntryOut, status_code=201)
def create_entry(
    payload: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save journal entry
    entry = JournalEntry(
        user_id=current_user.id,
        mood=payload.mood,
        energy_level=payload.energy_level,
        progress_text=payload.progress_text,
        struggle_text=payload.struggle_text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Generate real AI response
    ai_text = generate_ai_response(
        user=current_user,
        mood=payload.mood,
        energy_level=payload.energy_level,
        progress_text=payload.progress_text,
        struggle_text=payload.struggle_text,
        db=db
    )

    # Save AI response
    ai = AIResponse(
        entry_id=entry.id,
        response=ai_text
    )
    db.add(ai)
    db.commit()
    db.refresh(ai)

    return entry


@router.get("/", response_model=List[JournalEntryOut])
def get_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )
    return entries


@router.get("/{entry_id}", response_model=JournalEntryOut)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return entry