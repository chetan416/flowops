from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class DeploymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    cancelled = "cancelled"

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("monitored_services.id"), nullable=False, index=True)
    version = Column(String, nullable=False, index=True) # e.g. v1.2.0, sha-12345
    git_commit = Column(String, nullable=True) # git sha
    git_branch = Column(String, nullable=True)
    status = Column(String, default="success") 
    environment = Column(String, default="production") # production, staging
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    service = relationship("MonitoredService", back_populates="deployments")
