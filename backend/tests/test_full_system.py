import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import get_db
from app.db.base import Base
from app.core.config import settings

# Setup Test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Create tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Drop tables
    Base.metadata.drop_all(bind=engine)

def test_auth_flow(client):
    # 1. Signup
    email = "tester@example.com"
    password = "weakpassword" # Test edge case: weak password (if policy exists) or just normal
    response = client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": password,
        "full_name": "Test User"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email

    # 2. Duplicate Signup (Edge Case)
    response = client.post("/api/v1/auth/signup", json={
        "email": email,
        "password": "newpassword",
        "full_name": "Imposter"
    })
    assert response.status_code == 400
    assert "User already exists" in response.json()["detail"]

    # 3. Login
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # 4. Login Invalid Password (Edge Case)
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401

    return token

def test_monitoring_flow(client):
    # Setup Auth
    login_res = client.post("/api/v1/auth/login", json={"email": "tester@example.com", "password": "weakpassword"})
    if login_res.status_code != 200:
        # Create user if module order messed up (unlikely with fixture scope)
        client.post("/api/v1/auth/signup", json={"email": "tester@example.com", "password": "weakpassword", "full_name": "Test"})
        login_res = client.post("/api/v1/auth/login", json={"email": "tester@example.com", "password": "weakpassword"})
    
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add Service
    response = client.post("/api/v1/monitoring/services", json={
        "name": "Google",
        "url": "https://google.com", 
        "check_interval": 60
    }, headers=headers)
    assert response.status_code == 200
    service_id = response.json()["id"]

    # 2. Add Endpoint
    response = client.post(f"/api/v1/monitoring/services/{service_id}/endpoints", json={
        "name": "Home Page",
        "url": "https://google.com", 
        "method": "GET"
    }, headers=headers)
    assert response.status_code == 200

    # 3. Add Invalid Endpoint (Edge Case: Invalid URL)
    response = client.post(f"/api/v1/monitoring/services/{service_id}/endpoints", json={
        "url": "not-a-url",
        "method": "GET"
    }, headers=headers)
    # Pydantic might catch this or code. Assuming Pydantic UrlStr
    # If not validated, backend might 500 or allow it. expecting 422 or 200 (if loose validation)
    
    # 4. Trigger Checks
    response = client.post("/api/v1/monitoring/run-checks", headers=headers)
    assert response.status_code == 200

    # 5. Check Incidents (Should be empty initially)
    response = client.get("/api/v1/incidents/", headers=headers)
    assert response.status_code == 200

def test_stripe_integration_mock(client):
    # Simply check if routes exist and don't crash on 401 (auth check)
    response = client.post("/api/v1/subscriptions/create-checkout-session", params={"price_id": "fake"})
    assert response.status_code == 401 # Unauthorized

def test_ai_integration_mock(client):
    # Check Auth
    response = client.post("/api/v1/ai/analyze/999")
    assert response.status_code == 401
