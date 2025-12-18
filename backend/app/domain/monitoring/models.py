from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class MonitoredService(Base):
    __tablename__ = "monitored_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional link to user owner
    owner_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True) # New: Link to Team
    status = Column(String, default="healthy") # healthy, degraded, down
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    endpoints = relationship("Endpoint", back_populates="service", cascade="all, delete-orphan")
    owner_team = relationship("Team", back_populates="services")
    deployments = relationship("Deployment", back_populates="service", cascade="all, delete-orphan")
    slos = relationship("SLO", back_populates="service", cascade="all, delete-orphan")

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("monitored_services.id"), nullable=False)
    name = Column(String, nullable=True) # e.g. "Get User API"
    url = Column(String, nullable=False)
    method = Column(String, default="GET")
    expected_status = Column(Integer, default=200)
    check_interval = Column(Integer, default=60) # seconds
    is_active = Column(Boolean, default=True)
    
    service = relationship("MonitoredService", back_populates="endpoints")
    results = relationship("HealthCheckResult", back_populates="endpoint", cascade="all, delete-orphan")

class HealthCheckResult(Base):
    __tablename__ = "health_check_results"

    id = Column(Integer, primary_key=True, index=True)
    endpoint_id = Column(Integer, ForeignKey("endpoints.id"), nullable=False)
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    endpoint = relationship("Endpoint", back_populates="results")
