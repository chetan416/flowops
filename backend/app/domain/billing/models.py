from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    price = Column(Integer, nullable=False) # In cents
    currency = Column(String, default="usd")
    billing_cycle = Column(String, nullable=False) # "monthly", "yearly"
    feature_limits = Column(JSON, nullable=True)
    stripe_price_id = Column(String, nullable=True)

class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    incomplete = "incomplete"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    status = Column(String, default="incomplete")
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("app.domain.user.models.User", backref="subscription")
    plan = relationship("Plan")
