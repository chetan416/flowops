from sqlalchemy.orm import Session
from app.domain.workflow.models import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate
from typing import List, Optional

class WorkflowRepository:
    def create(self, db: Session, obj_in: WorkflowCreate, owner_id: int) -> Workflow:
        db_obj = Workflow(
            name=obj_in.name,
            description=obj_in.description,
            steps=obj_in.steps,
            owner_id=owner_id,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get(self, db: Session, id: int) -> Optional[Workflow]:
        return db.query(Workflow).filter(Workflow.id == id).first()

    def get_multi_by_owner(self, db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[Workflow]:
        return db.query(Workflow).filter(Workflow.owner_id == owner_id).offset(skip).limit(limit).all()

    def update(self, db: Session, db_obj: Workflow, obj_in: WorkflowUpdate) -> Workflow:
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: int) -> Workflow:
        obj = db.query(Workflow).get(id)
        db.delete(obj)
        db.commit()
        return obj
