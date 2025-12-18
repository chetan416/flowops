from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.domain.monitoring.service import MonitoringService
from app.domain.monitoring.models import Endpoint, MonitoredService
from app.domain.team.models import Team
from app.domain.user.models import User
from app.domain.deployment.models import Deployment
from app.domain.reliability.models import SLO
import httpx
import time
from app.services.workflow_engine import WorkflowEngine

service = MonitoringService()
workflow_engine = WorkflowEngine()

@celery_app.task
def check_service_health(endpoint_id: int, url: str, method: str = "GET"):
    print(f"Executing Health Check: {method} {url}")
    
    start_time = time.time()
    success = False
    status_code = 0
    error_msg = None
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.request(method, url)
            status_code = response.status_code
            # Simple success criteria: 2xx or 3xx
            success = 200 <= status_code < 400
    except Exception as e:
        success = False
        error_msg = str(e)
    
    latency = (time.time() - start_time) * 1000 # ms
    
    # Save result to DB
    db = SessionLocal()
    try:
        service.record_check_result(
            db=db,
            endpoint_id=endpoint_id,
            success=success,
            latency_ms=latency,
            status_code=status_code,
            error_message=error_msg
        )
    except Exception as e:
        print(f"Failed to record result: {e}")
    finally:
        db.close()

    return {"url": url, "success": success, "latency": latency}

@celery_app.task
def run_all_health_checks():
    db = SessionLocal()
    try:
        endpoints = db.query(Endpoint).filter(Endpoint.is_active == True).all()
        print(f"Dispatching checks for {len(endpoints)} endpoints")
        for ep in endpoints:
            check_service_health.delay(ep.id, ep.url, ep.method)
    finally:
        db.close()
    return f"Dispatched {len(endpoints)} checks"

@celery_app.task
def execute_workflow_task(workflow_id: int):
    db = SessionLocal()
    try:
        workflow_engine.execute_workflow(db, workflow_id)
    except Exception as e:
        print(f"Error executing workflow {workflow_id}: {e}")
    finally:
        db.close()
    return f"Executed workflow {workflow_id}"
