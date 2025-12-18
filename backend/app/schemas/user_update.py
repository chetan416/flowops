from pydantic import BaseModel
from typing import Optional

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    plan: Optional[str] = None
