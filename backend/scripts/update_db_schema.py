import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../'))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from sqlalchemy import text
from app.domain.team.models import Team, UserTeam # Import to register
from app.domain.user.models import User # Import to ensure 'users' table is known for FK
from app.domain.deployment.models import Deployment # Import to register
from app.domain.monitoring.models import MonitoredService # Import for FK resolution
from app.domain.reliability.models import SLO # Import to register

def update_schema():
    print("Creating new tables (if not exist)...")
    # This creates 'teams' and 'user_teams'
    Base.metadata.create_all(bind=engine)
    
    print("Checking for schema updates...")
    
    # 1. MonitoredService.owner_team_id
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT owner_team_id FROM monitored_services LIMIT 1"))
            print("Column 'monitored_services.owner_team_id' already exists.")
        except Exception:
            print("Adding 'owner_team_id' to monitored_services...")
            conn.rollback() # Ensure clean state
            with conn.begin(): # Start transaction for DDL
                 conn.execute(text("ALTER TABLE monitored_services ADD COLUMN owner_team_id INTEGER REFERENCES teams(id)"))
            print("Column monitored_services.owner_team_id added.")

    # 2. Incident.owner_team_id
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT owner_team_id FROM incidents LIMIT 1"))
            print("Column 'incidents.owner_team_id' already exists.")
        except Exception:
            print("Adding 'owner_team_id' to incidents...")
            conn.rollback() # Ensure clean state
            with conn.begin(): # Start transaction for DDL
                conn.execute(text("ALTER TABLE incidents ADD COLUMN owner_team_id INTEGER REFERENCES teams(id)"))
            print("Column incidents.owner_team_id added.")
    
    # 3. Create 'deployments' table (covered by create_all at start if imported)
    
    # 4. Create 'slos' table (covered by create_all at start if imported)
    pass

if __name__ == "__main__":
    update_schema()
