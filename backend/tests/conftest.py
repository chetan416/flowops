import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.main import app
from app.db.session import get_db

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_engine():
    # Import all models so Base has them registered
    from app.domain.user.models import User
    from app.domain.team.models import UserTeam, Team
    from app.domain.incidents.models import Incident
    from app.domain.workflow.models import Workflow
    from app.domain.monitoring.models import MonitoredService, Endpoint
    from app.domain.deployment.models import Deployment
    from app.domain.reliability.models import SLO
    
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_engine, db):
    # Override the dependency to use the function-scoped DB session
    def override_get_db():
        yield db
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    # Cleanup overrides
    app.dependency_overrides = {}
