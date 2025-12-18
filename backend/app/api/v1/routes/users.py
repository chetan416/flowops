from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])
service = UserService()

@router.post("/", operation_id="users_create_v1")
def create_user(email: str, password: str, full_name: str | None = None, db: Session = Depends(get_db)):
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
        "full_name": current_user.fullname,
    }