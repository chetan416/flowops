from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class IncidentSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class IncidentStatus(str, enum.Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="medium") # e.g. low, medium, high, critical
    status = Column(String, default="open") # open, investigating, resolved
    
    # Optional link to a specific service or endpoint if the incident was auto-generated
    service_id = Column(Integer, ForeignKey("monitored_services.id"), nullable=True)
    owner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True) # New: Assign to team
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
