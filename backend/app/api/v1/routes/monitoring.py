from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.monitoring.schemas import MonitoredServiceCreate, MonitoredServiceResponse, EndpointCreate, EndpointResponse
from app.domain.monitoring.service import MonitoringService

router = APIRouter(prefix="/monitoring", tags=["monitoring"])
service = MonitoringService()

@router.post("/services", response_model=MonitoredServiceResponse)
def create_service(
    service_in: MonitoredServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_service(db, service_in, current_user.id)

@router.get("/services/{service_id}", response_model=MonitoredServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service_obj = service.get_service(db, service_id)
    if not service_obj:
        raise HTTPException(status_code=404, detail="Service not found")
    return service_obj

@router.get("/services", response_model=List[MonitoredServiceResponse])
def list_services(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_services(db, current_user.id, skip, limit)

@router.post("/services/{service_id}/endpoints", response_model=EndpointResponse)
def add_endpoint(
    service_id: int,
    endpoint_in: EndpointCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify service exists first? (Service handles it or we do check here)
    # For now direct call
    return service.create_endpoint(db, endpoint_in, service_id)

@router.post("/run-checks")
def trigger_health_checks(
    sync: bool = False,
    current_user: User = Depends(get_current_user)
):
    from app.worker.tasks import run_all_health_checks, check_service_health
    from app.db.session import SessionLocal
    from app.domain.monitoring.models import Endpoint

    if sync:
        # Run checks immediately in this thread (Blocking, for Dev/Test)
        db = SessionLocal()
        try:
            endpoints = db.query(Endpoint).filter(Endpoint.is_active == True).all()
            results = []
            for ep in endpoints:
                # Call the logic directly, bypassing Celery wrapper
                # We need to unwrap the task or just call it if it's just a function decorated
                # Celery tasks are callable. Calling them directly runs them locally.
                res = check_service_health(ep.id, ep.url, ep.method) 
                results.append(res)
            return {"message": f"Ran {len(results)} checks synchronously", "results": results}
        finally:
            db.close()
    else:
        run_all_health_checks.delay()
        return {"message": "Health checks triggered in background"}

@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Check ownership
    success = service.delete_service(db, service_id)
    if not success:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

@router.delete("/endpoints/{endpoint_id}")
def delete_endpoint(
    endpoint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Check ownership via service
    success = service.delete_endpoint(db, endpoint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return {"message": "Endpoint deleted"}
