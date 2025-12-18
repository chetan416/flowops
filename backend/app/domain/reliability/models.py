from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class SLO(Base):
    __tablename__ = "slos"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("monitored_services.id"), nullable=False, index=True)
    name = Column(String, nullable=False) # e.g. "99.9% Availability"
    target_percentage = Column(Float, nullable=False) # e.g. 99.9
    time_window_days = Column(Integer, default=30) # e.g. 30 days
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    service = relationship("MonitoredService", back_populates="slos")
