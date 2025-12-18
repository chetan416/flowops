from sqlalchemy.orm import Session
from app.domain.incidents.models import Incident

class IncidentService:
    def get_incidents(self, db: Session, skip: int = 0, limit: int = 100, status: str = None):
        query = db.query(Incident)
        if status:
            query = query.filter(Incident.status == status)
        return query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_incident(self, db: Session, incident_id: int):
        return db.query(Incident).filter(Incident.id == incident_id).first()
