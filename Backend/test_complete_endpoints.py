#!/usr/bin/env python
"""Comprehensive test of admin endpoints including edge cases"""
import requests
import json

def test_admin_endpoints():
    BASE_URL = "http://localhost:5000/api"
    
    # Step 1: Login
    print("=" * 70)
    print("STEP 1: LOGIN")
    print("=" * 70)
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "hr@company.com", "password": "hr@09845"}
    )
    assert login_response.status_code == 200, "Login failed"
    token = login_response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    user = login_response.json()['user']
    print(f"✓ Logged in as {user['name']} ({user['role']})\n")
    
    # Step 2: Test all admin endpoints
    print("=" * 70)
    print("STEP 2: TEST ADMIN ENDPOINTS")
    print("=" * 70)
    
    test_cases = [
        {
            "name": "GET /admin/activity",
            "method": "GET",
            "url": "/admin/activity",
            "expected_fields": ["admin_id", "admin_name", "total_activities", "activities"]
        },
        {
            "name": "GET /admin/audit-logs",
            "method": "GET",
            "url": "/admin/audit-logs",
            "expected_fields": ["admin_id", "admin_name", "total_logs", "audit_logs"]
        },
        {
            "name": "GET /admin/notifications",
            "method": "GET",
            "url": "/admin/notifications",
            "expected_fields": ["admin_id", "admin_name", "total_notifications", "notifications"]
        },
        {
            "name": "GET /admin/logs",
            "method": "GET",
            "url": "/admin/logs",
            "expected_fields": ["admin_id", "admin_name", "total_logs", "logs"]
        },
    ]
    
    for test in test_cases:
        print(f"\n{test['name']}")
        print("-" * 70)
        response = requests.get(f"{BASE_URL}{test['url']}", headers=headers)
        
        # Check status code
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Status: 200")
        
        # Check response format
        data = response.json()
        for field in test["expected_fields"]:
            assert field in data, f"Missing field: {field}"
        print(f"✓ All required fields present")
        
        # Verify admin_id matches logged in user
        assert data["admin_id"] == user["id"], f"Admin ID mismatch"
        print(f"✓ Admin ID matches: {data['admin_id']}")
    
    # Step 3: Test employee-specific endpoint
    print(f"\n\nGET /admin/employees/{{id}}/activity")
    print("-" * 70)
    response = requests.get(f"{BASE_URL}/admin/employees/3/activity", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print(f"✓ Status: 200")
    
    data = response.json()
    required_fields = ["admin_id", "admin_name", "employee_id", "employee_name", "total_activities", "activities"]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    print(f"✓ All required fields present")
    print(f"✓ Employee: {data['employee_name']} (ID: {data['employee_id']})")
    print(f"✓ Activities: {data['total_activities']}")
    
    # Step 4: Test 404 for non-existent employee
    print(f"\n\nGET /admin/employees/99999/activity (non-existent)")
    print("-" * 70)
    response = requests.get(f"{BASE_URL}/admin/employees/99999/activity", headers=headers)
    assert response.status_code == 404, f"Expected 404 for non-existent employee, got {response.status_code}"
    print(f"✓ Correctly returns 404 for non-existent employee")
    
    # Step 5: Test auth enforcement
    print(f"\n\nTEST AUTH ENFORCEMENT")
    print("-" * 70)
    response = requests.get(f"{BASE_URL}/admin/activity")  # No headers
    assert response.status_code == 401, f"Expected 401 for missing auth, got {response.status_code}"
    print(f"✓ Endpoints require authentication")
    
    # Step 6: Verify existing employee endpoint still works
    print(f"\n\nVERIFY EXISTING ENDPOINTS STILL WORK")
    print("-" * 70)
    response = requests.get(f"{BASE_URL}/employees/3/activity", headers=headers)
    assert response.status_code == 200, f"Expected 200 for employee activity, got {response.status_code}"
    print(f"✓ GET /employees/{{id}}/activity still works")
    
    print("\n" + "=" * 70)
    print("✓ ALL TESTS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    try:
        test_admin_endpoints()
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        exit(1)

