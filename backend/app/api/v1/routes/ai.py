from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.incidents.models import Incident
from app.domain.ai.service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])
ai_service = AIService()

@router.post("/analyze/{incident_id}")
def analyze_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
         raise HTTPException(status_code=404, detail="Incident not found")
    
    analysis = ai_service.analyze_incident(incident)
    return {"analysis": analysis}

from app.domain.deployment.models import Deployment

@router.post("/review/{incident_id}")
def generate_review(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
         raise HTTPException(status_code=404, detail="Incident not found")
    
    # Fetch recent deployments for context (last 3)
    deployments = db.query(Deployment).filter(
        Deployment.service_id == incident.service_id
    ).order_by(Deployment.created_at.desc()).limit(3).all()

    report = ai_service.generate_post_mortem(incident, deployments)
    return {"report": report}
