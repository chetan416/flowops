from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.db.base import Base
import enum
# Prevent circular import by using string references in relationship, verified below.

class TeamRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class UserTeam(Base):
    __tablename__ = "user_teams"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), primary_key=True)
    role = Column(String, default="member") # owner, admin, member
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="teams")
    team = relationship("Team", back_populates="members")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    members = relationship("UserTeam", back_populates="team", cascade="all, delete-orphan")
    services = relationship("MonitoredService", back_populates="owner_team")
