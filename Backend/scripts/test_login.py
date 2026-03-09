import sys
import os
import requests

# Add parent directory to path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from models.user import User

def test_login():
    with app.app_context():
        # Get one of each
        admin = User.query.filter_by(role='admin').first()
        hr = User.query.filter_by(role='hr').first()
        emp = User.query.filter_by(role='employee').first()
        
        url = "http://127.0.0.1:5000/api/auth/login"
        
        tests = [
            (admin.email, "09845", "Admin"),
            (hr.email, "09845", "HR"),
            (emp.email, f"{emp.name.split()[0]}@098", "Employee")
        ]
        
        for email, pwd, role in tests:
            print(f"Testing {role} login ({email} / {pwd})...")
            resp = requests.post(url, json={"email": email, "password": pwd})
            if resp.status_code == 200:
                print(f"SUCCESS: Token -> {resp.json().get('token')[:15]}...")
            else:
                print(f"FAILED: Status {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_login()
