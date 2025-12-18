from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SLOBase(BaseModel):
    name: str
    target_percentage: float
    time_window_days: int = 30

class SLOCreate(SLOBase):
    service_id: int

class SLOResponse(SLOBase):
    id: int
    service_id: int
    created_at: datetime
    
    # Calculated fields (optional, often better fetched separately or included if cheap)
    current_availability: Optional[float] = None
    error_budget_remaining_minutes: Optional[float] = None

    class Config:
        from_attributes = True
