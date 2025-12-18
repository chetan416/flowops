from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[Dict[str, Any]] = [] # Flexible JSON structure for now
    is_active: Optional[int] = 1

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
