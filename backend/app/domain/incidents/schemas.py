from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "medium"
    status: str = "open"

class IncidentCreate(IncidentBase):
    service_id: Optional[int] = None

class IncidentResponse(IncidentBase):
    id: int
    service_id: Optional[int]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
