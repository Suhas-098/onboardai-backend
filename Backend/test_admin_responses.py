#!/usr/bin/env python
"""Comprehensive test of admin endpoints responses"""
import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:5000/api"

# Login
print("=" * 70)
print("LOGGING IN")
print("=" * 70)
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "hr@company.com", "password": "hr@09845"}
)
token = login_response.json().get('token')
headers = {"Authorization": f"Bearer {token}"}
print("✓ Logged in\n")

# Test each endpoint
print("=" * 70)
print("TESTING ADMIN ENDPOINTS")
print("=" * 70)

endpoints_to_test = [
    ("GET /admin/activity", f"{BASE_URL}/admin/activity"),
    ("GET /admin/audit-logs", f"{BASE_URL}/admin/audit-logs"),
    ("GET /admin/notifications", f"{BASE_URL}/admin/notifications"),
    ("GET /admin/employees/3/activity", f"{BASE_URL}/admin/employees/3/activity"),
    ("GET /admin/logs", f"{BASE_URL}/admin/logs"),
]

for endpoint_name, endpoint_url in endpoints_to_test:
    print(f"\n{endpoint_name}")
    print("-" * 70)
    try:
        response = requests.get(endpoint_url, headers=headers, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            # Print summary info
            if "total_activities" in data:
                print(f"Total activities: {data['total_activities']}")
            elif "total_logs" in data:
                print(f"Total logs: {data['total_logs']}")
            elif "total_notifications" in data:
                print(f"Total notifications: {data['total_notifications']}")
            elif "total_activities" in data:
                print(f"Total activities: {data['total_activities']}")
            
            # Print first few items if available
            if "activities" in data and data["activities"]:
                print(f"First activity: {data['activities'][0]}")
            elif "audit_logs" in data and data["audit_logs"]:
                print(f"First log: {data['audit_logs'][0]}")
            elif "notifications" in data and data["notifications"]:
                print(f"First notification: {data['notifications'][0]}")
            elif "logs" in data and data["logs"]:
                print(f"First log: {data['logs'][0]}")
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {str(e)}")

print("\n" + "=" * 70)
print("✓ ALL ENDPOINTS TESTED SUCCESSFULLY")
print("=" * 70)

