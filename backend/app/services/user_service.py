from app.core.security import hash_password, verify_password
from sqlalchemy.orm import Session
from app.domain.user.models import User
from app.repositories.user_repo import UserRepository
from typing import Optional

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    def create_user(self,*,db: Session, email: str, hashed_password: str, full_name: Optional[str]):
        existing = self.repo.get_by_email(db, email)
        if existing:
            raise ValueError("User already exists")
        
        user = User(
            email=email,
            hashed_password=hash_password(hashed_password),
            full_name=full_name
            )
        return self.repo.create(db, user)
    
    def authenticate(self,db,email: str, password: str):
        user = self.repo.get_by_email(db,email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def update_user(self, db: Session, user: User, full_name: Optional[str], password: Optional[str], plan: Optional[str] = None):
        update_data = {}
        if full_name is not None:
             update_data["full_name"] = full_name
        if password is not None:
             update_data["hashed_password"] = hash_password(password)
        if plan is not None:
             update_data["plan"] = plan
        
        if not update_data:
             return user
        
        return self.repo.update(db, user, update_data)