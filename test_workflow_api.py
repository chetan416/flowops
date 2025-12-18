import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "api_test_user@example.com"
PASSWORD = "password123"

def run_test():
    # 1. Signup/Login
    session = requests.Session()
    try:
        # Try signup
        resp = session.post(f"{BASE_URL}/auth/signup", json={"email": EMAIL, "password": PASSWORD, "full_name": "API Tester"})
    except:
        pass # Ignore if exists

    # Login
    auth_resp = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if auth_resp.status_code != 200:
        print(f"Login failed: {auth_resp.text}")
        return

    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in.")

    # 2. Create Workflow
    wf_data = {
        "name": "Test Workflow",
        "description": "Created via verify script",
        "steps": [{"id": "1", "type": "trigger", "data": {"label": "Start"}}]
    }
    create_resp = session.post(f"{BASE_URL}/workflows/", json=wf_data, headers=headers)
    if create_resp.status_code != 200:
        print(f"Create failed: {create_resp.text}")
        return
    
    wf = create_resp.json()
    print(f"Created Workflow: {wf['id']} - {wf['name']}")

    # 3. List
    list_resp = session.get(f"{BASE_URL}/workflows/", headers=headers)
    workflows = list_resp.json()
    print(f"Listed {len(workflows)} workflows.")

    # 4. Get Detail
    get_resp = session.get(f"{BASE_URL}/workflows/{wf['id']}", headers=headers)
    if get_resp.status_code == 200:
        print("Got detail successfully.")

    # 5. Delete
    del_resp = session.delete(f"{BASE_URL}/workflows/{wf['id']}", headers=headers)
    if del_resp.status_code == 200:
        print("Deleted workflow.")
    else:
        print(f"Delete failed: {del_resp.text}")

if __name__ == "__main__":
    run_test()
