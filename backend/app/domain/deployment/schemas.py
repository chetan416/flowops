from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeploymentBase(BaseModel):
    version: str
    git_commit: Optional[str] = None
    git_branch: Optional[str] = None
    status: str = "success"
    environment: str = "production"

class DeploymentCreate(DeploymentBase):
    service_id: int
    service_token: Optional[str] = None # For potential auth later

class DeploymentResponse(DeploymentBase):
    id: int
    service_id: int
    created_at: datetime
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True
