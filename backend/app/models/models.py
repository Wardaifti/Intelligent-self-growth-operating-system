from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.connection import Base


class GoalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete")
    goals = relationship("Goal", back_populates="user", cascade="all, delete")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(Integer, nullable=False)
    energy_level = Column(Integer, nullable=False)
    progress_text = Column(Text, nullable=True)
    struggle_text = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="journal_entries")
    ai_response = relationship("AIResponse", back_populates="entry", uselist=False, cascade="all, delete")


class AIResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    entry = relationship("JournalEntry", back_populates="ai_response")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal = Column(Text, nullable=False)
    status = Column(Enum(GoalStatus), default=GoalStatus.active)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="goals")