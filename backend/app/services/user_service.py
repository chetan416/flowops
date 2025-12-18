from app.core.security import  hash_password, verify_password
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.user_repo import UserRepository

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    def create_user(self,*,db: Session, email: str, hashed_password: str, full_name: str | None):
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