from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List

from app.database.connection import get_db
from app.models.models import JournalEntry, Goal, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # All entries
    all_entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )

    total_entries = len(all_entries)

    # Last 7 days entries
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_entries = [e for e in all_entries if e.created_at >= seven_days_ago]

    # Average mood and energy last 7 days
    avg_mood_7d = round(
        sum(e.mood for e in recent_entries) / len(recent_entries), 1
    ) if recent_entries else 0

    avg_energy_7d = round(
        sum(e.energy_level for e in recent_entries) / len(recent_entries), 1
    ) if recent_entries else 0

    # Streak calculation
    streak = 0
    today = datetime.utcnow().date()
    for i in range(30):
        day = today - timedelta(days=i)
        entry_on_day = any(e.created_at.date() == day for e in all_entries)
        if entry_on_day:
            streak += 1
        else:
            break

    # Active goals count
    active_goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id, Goal.status == "active")
        .count()
    )

    # Mood trend last 7 days
    mood_trend = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_entries = [e for e in all_entries if e.created_at.date() == day]
        if day_entries:
            mood_trend.append({
                "date": day.strftime("%b %d"),
                "avg_mood": round(sum(e.mood for e in day_entries) / len(day_entries), 1),
                "avg_energy": round(sum(e.energy_level for e in day_entries) / len(day_entries), 1),
            })
        else:
            mood_trend.append({
                "date": day.strftime("%b %d"),
                "avg_mood": 0,
                "avg_energy": 0,
            })

    # Burnout warning
    burnout_warning = avg_mood_7d < 4 or avg_energy_7d < 4

    return {
        "total_entries": total_entries,
        "current_streak": streak,
        "avg_mood_7d": avg_mood_7d,
        "avg_energy_7d": avg_energy_7d,
        "active_goals": active_goals,
        "mood_trend": mood_trend,
        "burnout_warning": burnout_warning,
    }


@router.get("/patterns")
def get_patterns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    all_entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .all()
    )

    if not all_entries:
        return {"message": "No entries yet to analyze patterns."}

    # Best day of week
    day_moods = {}
    for entry in all_entries:
        day_name = entry.created_at.strftime("%A")
        if day_name not in day_moods:
            day_moods[day_name] = []
        day_moods[day_name].append(entry.mood)

    best_day = max(day_moods, key=lambda d: sum(day_moods[d]) / len(day_moods[d]))
    worst_day = min(day_moods, key=lambda d: sum(day_moods[d]) / len(day_moods[d]))

    # Highest and lowest mood entries
    best_entry = max(all_entries, key=lambda e: e.mood)
    worst_entry = min(all_entries, key=lambda e: e.mood)

    return {
        "best_day_of_week": best_day,
        "worst_day_of_week": worst_day,
        "highest_mood_entry": {
            "date": best_entry.created_at.strftime("%b %d"),
            "mood": best_entry.mood,
            "progress": best_entry.progress_text,
        },
        "lowest_mood_entry": {
            "date": worst_entry.created_at.strftime("%b %d"),
            "mood": worst_entry.mood,
            "struggle": worst_entry.struggle_text,
        },
    }