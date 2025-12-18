from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    steps = Column(JSON, default=[], nullable=False)  # Stores the workflow graph/nodes
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("app.domain.user.models.User", backref="workflows")
