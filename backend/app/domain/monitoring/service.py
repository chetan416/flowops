from sqlalchemy.orm import Session
from app.domain.monitoring.models import MonitoredService, Endpoint
from app.domain.monitoring.schemas import MonitoredServiceCreate, EndpointCreate

class MonitoringService:
    def create_service(self, db: Session, service_in: MonitoredServiceCreate, user_id: int):
        # 1. Create Service
        db_service = MonitoredService(
            name=service_in.name,
            description=service_in.description,
            owner_id=user_id,
            status="healthy"
        )
        db.add(db_service)
        db.commit()
        db.refresh(db_service)

        # 2. Create Endpoints if provided
        if service_in.endpoints:
            for ep_in in service_in.endpoints:
                self.create_endpoint(db, ep_in, db_service.id)
        
        db.refresh(db_service)
        return db_service

    def create_endpoint(self, db: Session, endpoint_in: EndpointCreate, service_id: int):
        db_endpoint = Endpoint(
            service_id=service_id,
            **endpoint_in.dict()
        )
        db.add(db_endpoint)
        db.commit()
        db.refresh(db_endpoint)
        return db_endpoint

    def get_services(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        # In a real app, maybe filter by owner or team. For now, show all.
        return db.query(MonitoredService).offset(skip).limit(limit).all()

    def get_service(self, db: Session, service_id: int):
        from app.domain.monitoring.models import HealthCheckResult
        from sqlalchemy import desc

        service = db.query(MonitoredService).filter(MonitoredService.id == service_id).first()
        if not service:
            return None
        
        # Hydrate endpoints with latest status
        # Note: This causes N+1 queries. Optimization: Use window functions or separate batch query.
        # For this prototype/MVP, iteration is acceptable.
        for endpoint in service.endpoints:
            latest = db.query(HealthCheckResult)\
                .filter(HealthCheckResult.endpoint_id == endpoint.id)\
                .order_by(desc(HealthCheckResult.timestamp))\
                .first()
            
            # Attach ephemeral attribute for Pydantic to pick up
            endpoint.latest_check_success = latest.success if latest else None
            
        return service

    def record_check_result(
        self, 
        db: Session, 
        endpoint_id: int, 
        success: bool, 
        latency_ms: float, 
        status_code: int = None, 
        error_message: str = None
    ):
        from app.domain.monitoring.models import HealthCheckResult, Endpoint
        from app.domain.incidents.models import Incident
        
        # 1. Save Result
        result = HealthCheckResult(
            endpoint_id=endpoint_id,
            success=success,
            latency_ms=latency_ms,
            status_code=status_code,
            error_message=error_message
        )
        db.add(result)
        
        # 2. Update Endpoint/Service Status (Simplified)
        endpoint = db.query(Endpoint).filter(Endpoint.id == endpoint_id).first()
        if endpoint:
            service = endpoint.service
            
            if not success:
                service.status = "down"
                # 3. Auto-Create Incident if no open incident exists
                existing_incident = db.query(Incident).filter(
                    Incident.service_id == service.id,
                    Incident.status != "resolved"
                ).first()
                
                if not existing_incident:
                    new_incident = Incident(
                        title=f"Service Down: {service.name}",
                        description=f"Endpoint {endpoint.name} ({endpoint.url}) failed check. Error: {error_message}",
                        severity="high",
                        status="open",
                        service_id=service.id,
                        owner_team_id=service.owner_team_id # Auto-assign to owning team
                    )
                    db.add(new_incident)
            else:
                # If was down, mark healthy if no other incidents? 
                # For now just simple flip to healthy if success. 
                # Real logic would check if ALL endpoints are healthy.
                service.status = "healthy"
                
                # Auto-resolve incident? (Optional, maybe keep open for human review)
        
        db.commit()
        db.commit()

        # Broadcast Event
        if not success:
             try:
                 import redis
                 import json
                 from app.core.config import settings
                 r = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
                 # Wait.. we need the ID. Refresh incident if created.
                 # Optimization: Only if created.
                 if not existing_incident: # It was created inside loop, but variable scope?
                      # Re-query specifically? 
                      # The logic above: if not existing_incident: new_incident = ... db.add(new_incident)
                      # We can't access new_incident easily here unless we scope it out or refresh query.
                      # Let's just publish a general "service_down" event for now or minimal payload.
                      pass
                      
                 # Better approach: Publish the Result itself
                 event = {
                     "type": "check_result",
                     "service_id": endpoint.service_id,
                     "endpoint_id": endpoint.id,
                     "success": success,
                     "latency_ms": latency_ms,
                     "status": "down" if not success else "up"
                 }
                 r.publish("events", json.dumps(event))
             except Exception as e:
                 print(f"Failed to publish redis event: {e}")

        return result

    def delete_service(self, db: Session, service_id: int):
        from app.domain.incidents.models import Incident
        
        service_obj = self.get_service(db, service_id)
        if service_obj:
            # Manually delete incidents due to missing cascade relationship
            db.query(Incident).filter(Incident.service_id == service_id).delete()
            
            db.delete(service_obj) # Cascades handle endpoints
            db.commit()
            return True
        return False

    def delete_endpoint(self, db: Session, endpoint_id: int):
        from app.domain.monitoring.models import Endpoint
        endpoint = db.query(Endpoint).filter(Endpoint.id == endpoint_id).first()
        if endpoint:
            db.delete(endpoint)
            db.commit()
            return True
        return False
