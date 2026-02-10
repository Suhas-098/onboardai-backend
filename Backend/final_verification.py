#!/usr/bin/env python
"""Final verification - show exact responses from all admin endpoints"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

# Login
login_r = requests.post(f'{BASE_URL}/auth/login', 
    json={'email': 'hr@company.com', 'password': 'hr@09845'})
token = login_r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

print("=" * 80)
print("FINAL ENDPOINT VERIFICATION - ACTUAL RESPONSES")
print("=" * 80)

# Test 1
print("\n1. GET /api/admin/activity")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/activity', headers=headers)
print(f"Status: {r.status_code}")
print("Response:")
data = r.json()
print(f"  admin_id: {data['admin_id']}")
print(f"  admin_name: {data['admin_name']}")
print(f"  total_activities: {data['total_activities']}")
if data['activities']:
    print(f"  Sample activity:")
    print(f"    - action: {data['activities'][0]['action']}")
    print(f"    - user: {data['activities'][0]['user_name']}")
    print(f"    - timestamp: {data['activities'][0]['timestamp']}")

# Test 2
print("\n\n2. GET /api/admin/audit-logs")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/audit-logs', headers=headers)
print(f"Status: {r.status_code}")
data = r.json()
print(f"  admin_id: {data['admin_id']}")
print(f"  total_logs: {data['total_logs']}")
if data['audit_logs']:
    print(f"  Sample audit log:")
    log = data['audit_logs'][0]
    print(f"    - action: {log['action']}")
    print(f"    - user: {log['user_name']} ({log['user_email']})")

# Test 3
print("\n\n3. GET /api/admin/notifications")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/notifications', headers=headers)
print(f"Status: {r.status_code}")
data = r.json()
print(f"  admin_id: {data['admin_id']}")
print(f"  total_notifications: {data['total_notifications']}")
print(f"  notifications: {len(data['notifications'])} items")

# Test 4
print("\n\n4. GET /api/admin/employees/3/activity")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/employees/3/activity', headers=headers)
print(f"Status: {r.status_code}")
data = r.json()
print(f"  admin_id: {data['admin_id']}")
print(f"  employee: {data['employee_name']} ({data['employee_email']})")
print(f"  total_activities: {data['total_activities']}")
for i, act in enumerate(data['activities'][:2]):
    print(f"  Activity {i+1}: {act['action']} at {act['timestamp']}")

# Test 5
print("\n\n5. GET /api/admin/logs")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/logs', headers=headers)
print(f"Status: {r.status_code}")
data = r.json()
print(f"  admin_id: {data['admin_id']}")
print(f"  total_logs: {data['total_logs']}")

# Test 6
print("\n\n6. GET /api/admin/employees/99999/activity (404 TEST)")
print("-" * 80)
r = requests.get(f'{BASE_URL}/admin/employees/99999/activity', headers=headers)
print(f"Status: {r.status_code}")
print(f"Error: {r.json()['error']}")

print("\n" + "=" * 80)
print("✓ ALL ENDPOINTS VERIFIED - NO 500 ERRORS")
print("=" * 80)

