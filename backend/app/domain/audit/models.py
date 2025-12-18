from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False, index=True)
    metadata_ = Column("metadata", JSON, nullable=True) # "metadata" is reserved in MetaData class
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
