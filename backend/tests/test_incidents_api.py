from app.api.deps import get_current_user
from app.main import app
from app.domain.user.models import User

import pytest

# Mock User
mock_user = User(id=1, email="test@example.com", is_active=True, role="user")

def override_get_current_user():
    return mock_user

@pytest.fixture
def auth_client(client):
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    # No need to clear here if client fixture clears everything, 
    # but strictly speaking we should only clear what we set if client didn't.
    # But client fixture clears ALL. So we are fine relying on that or re-clearing.

def test_read_incidents(auth_client):
    response = auth_client.get("/api/v1/incidents/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_and_remediate_incident(auth_client, db):
    # 1. Create Incident (Need to mock IncidentService or just insert into DB, 
    # but let's assume we can create one via API if POST exists, or manually)
    # The API might not have a public POST for incidents (usually monitoring service does it).
    # Let's insert into DB directly using the session.
    
    from app.domain.incidents.models import Incident
    from app.domain.workflow.models import Workflow
    
    # Create a "Fix" Workflow
    fix_workflow = Workflow(
        name="Restart Database",
        description="Restarts the DB service",
        owner_id=1,
        is_active=1,
        steps=[{"nodes": [], "edges": []}]
    )
    db.add(fix_workflow)
    
    # Create an Incident that matches the keywords
    incident = Incident(
        title="Database Timeout Error",
        description="Connection timeout while reaching 5432. Needs restart.",
        severity="high",
        status="open",
        service_id=1
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # 2. Test Get Incident
    response = auth_client.get(f"/api/v1/incidents/{incident.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Database Timeout Error"
    
    # 3. Test Remediation
    # The logic in AIService matches "Restart" (in workflow) with "Timeout" (in incident)
    # My previous implementation: 
    # if "restart" in wf_name and ("timeout" in incident_desc ...): score += 30
    
    response = auth_client.get(f"/api/v1/incidents/{incident.id}/remediation")
    assert response.status_code == 200
    suggestion = response.json()["suggestion"]
    
    assert suggestion is not None
    assert suggestion["workflow_name"] == "Restart Database"
    assert suggestion["workflow_id"] == fix_workflow.id
    assert suggestion["confidence"] > 0.2
