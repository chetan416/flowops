from sqlalchemy.orm import Session
from app.repositories.workflow_repo import WorkflowRepository
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate
from app.domain.workflow.models import Workflow
from typing import List, Optional

class WorkflowService:
    def __init__(self):
        self.repo = WorkflowRepository()

    def create_workflow(self, db: Session, workflow_in: WorkflowCreate, user_id: int) -> Workflow:
        return self.repo.create(db, workflow_in, user_id)

    def get_workflow(self, db: Session, workflow_id: int) -> Optional[Workflow]:
        return self.repo.get(db, workflow_id)

    def get_user_workflows(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Workflow]:
        return self.repo.get_multi_by_owner(db, user_id, skip, limit)

    def update_workflow(self, db: Session, workflow_id: int, workflow_in: WorkflowUpdate, user_id: int) -> Optional[Workflow]:
        workflow = self.repo.get(db, workflow_id)
        if not workflow or workflow.owner_id != user_id:
            return None
        return self.repo.update(db, workflow, workflow_in)

    def delete_workflow(self, db: Session, workflow_id: int, user_id: int) -> Optional[Workflow]:
        workflow = self.repo.get(db, workflow_id)
        if not workflow or workflow.owner_id != user_id:
            return None
        return self.repo.remove(db, workflow_id)
