from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.incidents.schemas import IncidentResponse
from app.domain.incidents.service import IncidentService

router = APIRouter(prefix="/incidents", tags=["incidents"])
service = IncidentService()

@router.get("/", response_model=List[IncidentResponse])
def list_incidents(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_incidents(db, skip, limit, status)

@router.get("/{id}", response_model=IncidentResponse)
def get_incident(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = service.get_incident(db, id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/{id}/remediation")
def get_incident_remediation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.domain.ai.service import AIService
    ai_service = AIService()
    incident = service.get_incident(db, id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    suggestion = ai_service.suggest_remediation(db, incident)
    if not suggestion:
        return {"suggestion": None}
    
    return {"suggestion": suggestion}
