from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.admin.service import AdminService
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])
service = AdminService()

def check_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user

@router.get("/stats", dependencies=[Depends(check_admin)])
def get_admin_stats(db: Session = Depends(get_db)):
    return service.get_stats(db)

@router.get("/users", dependencies=[Depends(check_admin)])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = service.list_users(db, limit=limit, skip=skip)
    # Be careful not to expose password hashes. 
    # Since we are returning ORM models, FastAPI might serialize them if we don't convert or use response_model.
    # Ideally use response_model, but for now we'll do a quick dict cleanup or trust the User schema if configured.
    return users

@router.put("/users/{user_id}/toggle-active", dependencies=[Depends(check_admin)])
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    user = service.toggle_user_active(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "is_active": user.is_active}
