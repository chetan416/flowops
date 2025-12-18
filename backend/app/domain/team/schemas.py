from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.domain.user.schemas import UserResponse

class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamMemberAdd(BaseModel):
    user_email: str
    role: str = "member"

class TeamMemberResponse(BaseModel):
    user: UserResponse
    role: str
    joined_at: datetime
    
    class Config:
        from_attributes = True

class TeamResponse(TeamBase):
    id: int
    slug: str
    created_at: datetime
    # members: List[TeamMemberResponse] = [] # Optional, might be heavy to load always

    class Config:
        from_attributes = True
