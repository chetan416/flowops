from app.db.session import SessionLocal
from app.domain.user.models import User
from app.core.security import hash_password
import app.main # triggers loading of all models via api_router

def create_test_admin():
    db = SessionLocal()
    email = "admin@flowops.com"
    password = "adminpassword"
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name="System Admin",
            role="admin",
            is_active=1
        )
        db.add(user)
        print(f"Creating admin user: {email}")
    else:
        user.role = "admin"
        user.hashed_password = hash_password(password)
        print(f"Updating existing user to admin: {email}")
    
    db.commit()
    db.close()
    print("Done.")

if __name__ == "__main__":
    create_test_admin()
