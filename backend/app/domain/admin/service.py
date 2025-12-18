from sqlalchemy.orm import Session
from sqlalchemy import func
from app.domain.user.models import User
from app.domain.workflow.models import Workflow
from app.domain.audit.models import AuditLog

class AdminService:
    def get_stats(self, db: Session):
        total_users = db.query(User).count()
        total_workflows = db.query(Workflow).count()
        active_users = db.query(User).filter(User.is_active == 1).count()
        
        return {
            "total_users": total_users,
            "total_workflows": total_workflows,
            "active_users": active_users
        }

    def list_users(self, db: Session, limit: int = 100, skip: int = 0):
        return db.query(User).offset(skip).limit(limit).all()

    def toggle_user_active(self, db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = 0 if user.is_active else 1
            db.commit()
            db.refresh(user)
        return user
