from sqlalchemy.orm import Session
from app.domain.user.models import User

class UserRepository:
    def create(self, db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    def get_by_email(self,db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_id(self,db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()
    
    def list(self, db: Session, limit: int = 100):
        return db.query(User).limit(limit).all()
    
