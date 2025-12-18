from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("Testing 'password123'...")
    hashed = pwd_context.hash("password123")
    print(f"Success: {hashed}")
except Exception as e:
    print(f"Error: {e}")

try:
    long_pass = "x" * 73
    print("Testing 73 chars...")
    hashed = pwd_context.hash(long_pass)
    print(f"Success (long): {hashed}")
except Exception as e:
    print(f"Error (long): {e}")
