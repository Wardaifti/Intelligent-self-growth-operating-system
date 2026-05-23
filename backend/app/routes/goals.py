from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.models import Goal, User
from app.schemas.schemas import GoalCreate, GoalOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = Goal(
        user_id=current_user.id,
        goal=payload.goal,
        status="active"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.get("/", response_model=List[GoalOut])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
        .all()
    )
    return goals


@router.patch("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
        .first()
    )
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")

    if "status" in payload:
        goal.status = payload["status"]

    db.commit()
    db.refresh(goal)
    return goal