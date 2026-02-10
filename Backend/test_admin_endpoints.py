#!/usr/bin/env python
"""Test admin endpoints that might return 500"""
import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:5000/api"

# Step 1: Login to get token
print("=" * 60)
print("LOGGING IN AS HR")
print("=" * 60)
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "hr@company.com", "password": "hr@09845"}
)
print(f"Status: {login_response.status_code}\n")

if login_response.status_code == 200:
    token = login_response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Token obtained. Role: {login_response.json()['user']['role']}\n")
    
    # Test all potential admin endpoints
    admin_endpoints = [
        "/admin/activity",
        "/admin/audit-logs",
        "/admin/notifications",
        "/admin/employees/3/activity",
        "/admin/logs",
        "/admin/activity-logs",
        "/api/admin/activity",  # Note: might be double /api
    ]
    
    print("=" * 60)
    print("TESTING ADMIN ENDPOINTS")
    print("=" * 60)
    
    for endpoint in admin_endpoints:
        # Remove /api/ if present since BASE_URL already has it
        if endpoint.startswith("/api"):
            endpoint = endpoint[4:]
            
        full_url = f"{BASE_URL}{endpoint}"
        try:
            response = requests.get(full_url, headers=headers, timeout=2)
            print(f"GET {endpoint}")
            print(f"  Status: {response.status_code}")
            if response.status_code == 500:
                print(f"  ERROR: {response.text[:200]}")
            elif response.status_code == 404:
                print(f"  (Endpoint not found)")
            else:
                try:
                    data = response.json()
                    print(f"  Response: {str(data)[:100]}")
                except:
                    print(f"  Response: {response.text[:100]}")
        except Exception as e:
            print(f"GET {endpoint}")
            print(f"  ERROR: {str(e)}")
        print()

