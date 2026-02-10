#!/usr/bin/env python
"""Test script to verify admin endpoints"""
import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:5000/api"

# Step 1: Login to get token
print("=" * 60)
print("STEP 1: LOGIN")
print("=" * 60)
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "hr@company.com", "password": "hr@09845"}
)
print(f"Status: {login_response.status_code}")
print("Response:")
pprint(login_response.json())

if login_response.status_code == 200:
    token = login_response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Test GET /api/employees/{id}/activity
    print("\n" + "=" * 60)
    print("STEP 2: GET /employees/{id}/activity")
    print("=" * 60)
    
    # First get list of employees to test with
    emp_response = requests.get(f"{BASE_URL}/employees", headers=headers)
    print(f"GET /employees Status: {emp_response.status_code}")
    employees = emp_response.json()
    if employees:
        emp_id = employees[0]['id'] if isinstance(employees, list) else employees.get('id')
        print(f"Testing with employee ID: {emp_id}")
        
        activity_response = requests.get(f"{BASE_URL}/employees/{emp_id}/activity", headers=headers)
        print(f"GET /employees/{emp_id}/activity Status: {activity_response.status_code}")
        print("Response:")
        pprint(activity_response.json())
    
    # Step 3: Check database
    print("\n" + "=" * 60)
    print("STEP 3: DATABASE CHECK")
    print("=" * 60)
    from models.activity_log import ActivityLog
    from models.user import User
    from config.init_db import db
    from app import app
    
    with app.app_context():
        # Check if tables exist
        users = User.query.all()
        activities = ActivityLog.query.all()
        
        print(f"Total users in DB: {len(users)}")
        print(f"Total activity logs in DB: {len(activities)}")
        
        if activities:
            print("\nSample activity logs:")
            for log in activities[:5]:
                print(f"  ID: {log.id}, User: {log.user_id}, Action: {log.action}, Time: {log.timestamp}")
else:
    print("Login failed!")

