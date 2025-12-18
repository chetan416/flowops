from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.reliability.models import SLO
from app.domain.reliability.schemas import SLOCreate, SLOResponse
from app.domain.monitoring.models import MonitoredService, HealthCheckResult, Endpoint

router = APIRouter(prefix="/reliability", tags=["reliability"])

@router.post("/slos", response_model=SLOResponse)
def create_slo(
    slo_in: SLOCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    service = db.query(MonitoredService).filter(MonitoredService.id == slo_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db_slo = SLO(
        service_id=slo_in.service_id,
        name=slo_in.name,
        target_percentage=slo_in.target_percentage,
        time_window_days=slo_in.time_window_days
    )
    db.add(db_slo)
    db.commit()
    db.refresh(db_slo)
    return db_slo

@router.get("/slos/service/{service_id}", response_model=List[SLOResponse])
def get_service_slos(
    service_id: int,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    slos = db.query(SLO).filter(SLO.service_id == service_id).all()
    
    # Calculate metrics on the fly for each SLO
    for slo in slos:
        calculate_slo_status(db, slo)
        
    return slos

def calculate_slo_status(db: Session, slo: SLO):
    # 1. Define window
    now = datetime.utcnow()
    window_start = now - timedelta(days=slo.time_window_days)
    
    # 2. Get all endpoints for this service
    endpoints = db.query(Endpoint).filter(Endpoint.service_id == slo.service_id).all()
    endpoint_ids = [ep.id for ep in endpoints]
    
    if not endpoint_ids:
        slo.current_availability = 100.0
        slo.error_budget_remaining_minutes = 999999
        return

    # 3. Count total checks vs failed checks in window
    # Optimized aggregate query
    stats = db.query(
        func.count(HealthCheckResult.id).label("total"),
        func.sum(case((HealthCheckResult.success == False, 1), else_=0)).label("failures")
    ).filter(
        HealthCheckResult.endpoint_id.in_(endpoint_ids),
        HealthCheckResult.timestamp >= window_start
    ).first()
    
    total_checks = stats.total or 0
    failures = stats.failures or 0
    
    if total_checks == 0:
        slo.current_availability = 100.0
        # Budget calc requires assumption about check frequency. 
        # For MVP, assuming 1 min checks per endpoint for simplified budget minutes.
        # Total minutes in window = days * 24 * 60
        # Error budget minutes = Total Minutes * (1 - target/100)
    else:
        slo.current_availability = ((total_checks - failures) / total_checks) * 100.0

    # 4. Error Budget Calculation (Time-based approximation)
    # Total Window Minutes
    total_window_minutes = slo.time_window_days * 24 * 60
    
    # Allowed downtime minutes
    allowed_downtime_minutes = total_window_minutes * (1 - (slo.target_percentage / 100.0))
    
    # Actual downtime minutes estimate
    # Assuming each failure is ~1 minute of downtime (based on 1 min cron)
    # This is an approximation. Precise calculation requires "state change" tracking.
    actual_downtime_minutes = failures 
    
    slo.error_budget_remaining_minutes = allowed_downtime_minutes - actual_downtime_minutes

from sqlalchemy import case
