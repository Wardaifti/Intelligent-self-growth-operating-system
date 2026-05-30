from groq import Groq
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_user_context(user, db: Session) -> dict:
    """Fetches all user history to make AI response personal."""
    from app.models.models import JournalEntry, Goal

    recent_entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(desc(JournalEntry.created_at))
        .limit(7)
        .all()
    )

    active_goals = (
        db.query(Goal)
        .filter(Goal.user_id == user.id, Goal.status == "active")
        .all()
    )

    streak = 0
    today = datetime.utcnow().date()
    for i in range(30):
        day = today - timedelta(days=i)
        entry_on_day = any(e.created_at.date() == day for e in recent_entries)
        if entry_on_day:
            streak += 1
        else:
            break

    avg_mood = round(
        sum(e.mood for e in recent_entries) / len(recent_entries), 1
    ) if recent_entries else None

    avg_energy = round(
        sum(e.energy_level for e in recent_entries) / len(recent_entries), 1
    ) if recent_entries else None

    return {
        "streak": streak,
        "avg_mood": avg_mood,
        "avg_energy": avg_energy,
        "recent_entries": recent_entries,
        "active_goals": active_goals,
    }


def build_system_prompt(user, context: dict, similar_memories: list = []) -> str:
    """Builds a rich prompt using live user data and ChromaDB memories."""

    goals_text = "\n".join(
        f"- {g.goal}" for g in context["active_goals"]
    ) or "No goals set yet."

    history_text = ""
    for entry in context["recent_entries"][:5]:
        date_str = entry.created_at.strftime("%b %d")
        history_text += f"\n[{date_str}] Mood: {entry.mood}/10, Energy: {entry.energy_level}/10"
        if entry.progress_text:
            history_text += f" | Progress: {entry.progress_text[:100]}"
        if entry.struggle_text:
            history_text += f" | Struggle: {entry.struggle_text[:100]}"

    memory_text = ""
    if similar_memories:
        memory_text = "\n\nRELEVANT PAST MEMORIES (similar situations):\n"
        for i, memory in enumerate(similar_memories):
            memory_text += f"\n{i+1}. {memory}"

    return f"""You are an emotionally intelligent AI mentor inside a personal growth operating system.

USER PROFILE:
- Name: {user.name}
- Current streak: {context['streak']} days
- Average mood (7 days): {context['avg_mood']}/10
- Average energy (7 days): {context['avg_energy']}/10

ACTIVE GOALS:
{goals_text}

RECENT HISTORY:
{history_text or "No previous entries yet."}
{memory_text}

YOUR RULES:
1. Be personal — reference their actual history and goals.
2. Be realistic — no generic motivation. Give specific small actions.
3. Be empathetic — acknowledge their mood and energy first.
4. Keep response under 150 words.
5. End with ONE concrete action they can do today.
6. If relevant memories exist, reference them specifically.
7. Never say "I understand how you feel" — show it through their data.
"""


def generate_ai_response(
    user,
    mood: int,
    energy_level: int,
    progress_text: str,
    struggle_text: str,
    db: Session
) -> str:
    """Main function — returns personalized AI response string."""
    from app.services.memory_service import search_similar_entries

    context = get_user_context(user, db)

    # Search for similar past entries using ChromaDB
    query = f"mood {mood} energy {energy_level} {struggle_text or ''}"
    similar_memories = search_similar_entries(user.id, query)

    system_prompt = build_system_prompt(user, context, similar_memories)

    user_message = f"""Today's check-in:
Mood: {mood}/10
Energy: {energy_level}/10
Progress: {progress_text or 'Not shared'}
Struggle: {struggle_text or 'Not shared'}

Give me your honest personalized assessment and one action I should take."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=300,
        temperature=0.7,
    )

    return response.choices[0].message.content