from fastapi import APIRouter, Depends, HTTPException, status
from app.worker.tasks import execute_workflow_task
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowResponse
from app.services.workflow_service import WorkflowService
from app.domain.user.models import User

router = APIRouter(prefix="/workflows", tags=["workflows"])
service = WorkflowService()

@router.post("/", response_model=WorkflowResponse)
def create_workflow(
    workflow_in: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_workflow(db, workflow_in, current_user.id)

@router.get("/", response_model=List[WorkflowResponse])
def read_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_user_workflows(db, current_user.id, skip, limit)

@router.get("/{workflow_id}", response_model=WorkflowResponse)
def read_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = service.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this workflow")
    return workflow

@router.put("/{workflow_id}", response_model=WorkflowResponse)
def update_workflow(
    workflow_id: int,
    workflow_in: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = service.update_workflow(db, workflow_id, workflow_in, current_user.id)
    if not workflow:
         # Check if it exists but belongs to someone else, or doesn't exist at all
         # For simplicity, returning 404/403 based on service return being None is ambiguous without more logic, 
         # but service checks owner. if None, likely either not found or not owner.
         # Let's do a quick check to be precise if needed, or just 404.
         # Re-fetching to distinguish error for better UX
         existing = service.get_workflow(db, workflow_id)
         if existing and existing.owner_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized")
         raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.delete("/{workflow_id}", response_model=WorkflowResponse)
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = service.delete_workflow(db, workflow_id, current_user.id)
    if not workflow:
         existing = service.get_workflow(db, workflow_id)
         if existing and existing.owner_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized")
         raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/{workflow_id}/run")
def run_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = service.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to run this workflow")
    
    # Trigger Celery Task
    execute_workflow_task.delay(workflow_id)
    return {"message": "Workflow execution started"}
