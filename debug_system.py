import sys
import os
import time

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import SessionLocal
from app.domain.monitoring.models import MonitoredService
from app.domain.user.models import User
from app.worker.tasks import run_all_health_checks, check_service_health
import redis

def test_db():
    print("--- Testing DB Connection ---")
    try:
        db = SessionLocal()
        # Try to get a user
        user = db.query(User).first()
        print(f"✅ DB Connected. Found User ID: {user.id if user else 'None (Create one via script or UI)'}")
        db.close()
        return True
    except Exception as e:
        print(f"❌ DB Failure: {e}")
        return False

def test_service_creation():
    print("\n--- Testing Service Creation ---")
    db = SessionLocal()
    try:
        # Get first user to assign owner
        user = db.query(User).first()
        if not user:
            print("⚠️ No user found, creating dummy user 'debug@flowops.com'")
            user = User(email="debug@flowops.com", hashed_password="pw", full_name="Debug User")
            db.add(user)
            db.commit()
            db.refresh(user)

        new_service = MonitoredService(
            name="Debug Service",
            description="Created by debug script",
            owner_id=user.id,
            status="healthy"
        )
        db.add(new_service)
        db.commit()
        print(f"✅ Service Created. ID: {new_service.id}")
        return True
    except Exception as e:
        print(f"❌ Service Creation Failed: {e}")
        return False
    finally:
        db.close()

def test_redis():
    print("\n--- Testing Redis Connection ---")
    try:
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis Connected")
        return True
    except Exception as e:
        print(f"❌ Redis Failure: {e}")
        return False

def test_celery():
    print("\n--- Testing Celery Task Dispatch ---")
    try:
        task = run_all_health_checks.delay()
        print(f"✅ Task Dispatched. Task ID: {task.id}")
        return True
    except Exception as e:
        print(f"❌ Celery Dispatch Failed: {e}")
        print("Tip: Make sure redis is running and requirements are installed.")
        return False

if __name__ == "__main__":
    test_db()
    test_service_creation()
    test_redis()
    test_celery()
