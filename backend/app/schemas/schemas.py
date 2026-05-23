from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Journal Schemas ──────────────────────────────────────────────────────────

class JournalEntryCreate(BaseModel):
    mood: int
    energy_level: int
    progress_text: Optional[str] = None
    struggle_text: Optional[str] = None


class AIResponseOut(BaseModel):
    id: int
    response: str
    created_at: datetime

    class Config:
        from_attributes = True


class JournalEntryOut(BaseModel):
    id: int
    user_id: int
    mood: int
    energy_level: int
    progress_text: Optional[str]
    struggle_text: Optional[str]
    created_at: datetime
    ai_response: Optional[AIResponseOut] = None

    class Config:
        from_attributes = True


# ─── Goal Schemas ─────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    goal: str


class GoalOut(BaseModel):
    id: int
    user_id: int
    goal: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True