from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.user_service import UserService
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags = ["auth"])
service = UserService()

@router.post("/signup", operation_id = "auth_signup")
def signup(email: str, hashed_password: str, full_name: str | None = None, db: Session = Depends(get_db)):
    try:
        user = service.create_user(
            db=db,
            email=email,
            hashed_password=hashed_password, 
            full_name=full_name
            )
        db.add(user)
        db.commit()
        db.refresh(user)

        return {"id": user.id, "email": user.email}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/login", operation_id = "auth_login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = service.authenticate(db, email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}