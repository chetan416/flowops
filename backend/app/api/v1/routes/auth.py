from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.user_service import UserService
from app.core.security import create_access_token
from typing import Optional

router = APIRouter(prefix="/auth", tags = ["auth"])
service = UserService()

from app.domain.user.schemas import UserCreate

@router.post("/signup", operation_id = "auth_signup")
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        user = service.create_user(
            db=db,
            email=user_in.email,
            hashed_password=user_in.password, 
            full_name=user_in.full_name
            )
        db.add(user)
        db.commit()
        db.refresh(user)

        return {"id": user.id, "email": user.email}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
from app.schemas.auth import UserLogin

@router.post("/login", operation_id = "auth_login")
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = service.authenticate(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}