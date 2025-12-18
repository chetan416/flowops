from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.domain.deployment.models import Deployment
from app.domain.deployment.schemas import DeploymentCreate, DeploymentResponse
from app.domain.monitoring.models import MonitoredService

router = APIRouter(prefix="/deployments", tags=["deployments"])

@router.post("/", response_model=DeploymentResponse)
def create_deployment(
    deployment_in: DeploymentCreate,
    db: Session = Depends(get_db),
    # Optional Auth: Allow API Key or User Token. For MVP, assuming User Token or open if configured.
    # user: User = Depends(get_current_user) 
):
    # Validate service exists
    service = db.query(MonitoredService).filter(MonitoredService.id == deployment_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Create Deployment
    db_deployment = Deployment(
        service_id=deployment_in.service_id,
        version=deployment_in.version,
        git_commit=deployment_in.git_commit,
        git_branch=deployment_in.git_branch,
        status=deployment_in.status,
        environment=deployment_in.environment
    )
    db.add(db_deployment)
    db.commit()
    db.refresh(db_deployment)
    return db_deployment

@router.get("/service/{service_id}", response_model=List[DeploymentResponse])
def list_service_deployments(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Check permissions
    deployments = db.query(Deployment).filter(Deployment.service_id == service_id).order_by(Deployment.created_at.desc()).limit(50).all()
    return deployments
