from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.team.schemas import TeamCreate, TeamResponse, TeamMemberAdd, TeamMemberResponse
from app.domain.team.service import TeamService

router = APIRouter(prefix="/teams", tags=["teams"])
service = TeamService()

@router.post("/", response_model=TeamResponse)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_team(db, team_in, current_user.id)

@router.get("/", response_model=List[TeamResponse])
def list_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_user_teams(db, current_user.id)

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Check membership/permissions
    team = service.get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/{team_id}/members")
def add_member(
    team_id: int,
    member_in: TeamMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Verify current_user is admin/owner
    result = service.add_member_by_email(db, team_id, member_in.user_email, member_in.role)
    if not result:
        raise HTTPException(status_code=404, detail="User not found or add failed")
    return {"message": "Member added"}
