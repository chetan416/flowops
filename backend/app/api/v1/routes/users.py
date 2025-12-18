from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.services.user_service import UserService
from typing import Optional

router = APIRouter(prefix="/users", tags=["users"])
service = UserService()

@router.post("/", operation_id="users_create_v1")
def create_user(email: str, password: str, full_name: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return service.create_user(db, email, password, full_name)
    except ValueError as e:
        raise HTTPException(status_code = 400,detail = str(e))

@router.get("/", operation_id="users_list_v1")
def list_users(db: Session = Depends(get_db)):
    return service.list_users(db)

@router.get("/me", operation_id="read_current_user_v1")
def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "plan": current_user.plan,
    }

from app.domain.user.schemas import UserResponse, UserCreate
from app.schemas.user_update import UserUpdate

@router.put("/me", operation_id="update_current_user_v1")
def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_user = service.update_user(
        db=db, 
        user=current_user, 
        full_name=user_in.full_name, 
        password=user_in.password,
        plan=user_in.plan
    )
    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "full_name": updated_user.full_name,
    }