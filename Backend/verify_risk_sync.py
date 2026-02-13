import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"

def login():
    try:
        # Login as admin/hr
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@company.com",
            "password": "admin@09845"
        })
        if response.status_code == 200:
            return response.json()["token"]
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def get_employees(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/employees", headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def create_overdue_task(token, user_id):
    headers = {"Authorization": f"Bearer {token}"}
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # We use the assign task endpoint or create task endpoint?
    # task_routes.py has @task_routes.route("/tasks/assign", methods=["POST"])
    
    payload = {
        "title": "Critical Compliance Review",
        "description": "Must be done immediately.",
        "target_user_id": user_id,
        "due_date": yesterday,
        "priority": "High",
        "type": "General"
    }
    
    print(f"Creating overdue task for user {user_id} with due date {yesterday}...")
    response = requests.post(f"{BASE_URL}/tasks/assign", json=payload, headers=headers)
    if response.status_code == 201:
        print("Overdue task created successfully.")
        return response.json().get("task", {}).get("id")
    else:
        print(f"Failed to create task: {response.text}")
        return None

def check_sync(token, user_id):
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n--- Verifying Synchronization ---")
    
    # 1. Check Alerts
    print("Checking /api/alerts...")
    alerts_res = requests.get(f"{BASE_URL}/alerts", headers=headers)
    alerts = alerts_res.json()
    
    found_alert = False
    for a in alerts:
        if a.get('target_user_id') == user_id and "Missed Deadline" in a.get('title', ''):
            print(f"✅ Alert found: {a['title']} - {a['message']}")
            found_alert = True
            break
    if not found_alert:
        print("❌ Alert NOT found!")

    # 2. Check Dashboard Summary
    print("Checking /api/dashboard/summary...")
    dash_res = requests.get(f"{BASE_URL}/dashboard/summary", headers=headers)
    dash = dash_res.json()
    print(f"Dashboard Stats: {json.dumps(dash, indent=2)}")
    
    # We expect at least 1 Delayed
    if dash.get('delayed', 0) > 0:
        print("✅ Dashboard shows Delayed employees.")
    else:
        print("❌ Dashboard shows 0 Delayed employees!")

    # 3. Check Critical Focus
    print("Checking /api/dashboard/critical-focus...")
    focus_res = requests.get(f"{BASE_URL}/dashboard/critical-focus", headers=headers)
    focus = focus_res.json()
    
    found_focus = False
    for u in focus:
        if u['id'] == user_id:
            print(f"✅ User found in Critical Focus: {u['name']} - {u['risk']}")
            found_focus = True
            break
    if not found_focus:
        print("❌ User NOT found in Critical Focus!")

    # 4. Check Reports Summary
    print("Checking /api/reports/summary...")
    report_res = requests.get(f"{BASE_URL}/reports/summary", headers=headers)
    report = report_res.json()
    
    report_delayed = report.get('risk_summary', {}).get('delayed', 0)
    print(f"Report Delayed Count: {report_delayed}")
    
    if report_delayed == dash.get('delayed'):
         print("✅ Report Delayed count MATCHES Dashboard Delayed count.")
    else:
         print(f"❌ MISMATCH! Report: {report_delayed} vs Dashboard: {dash.get('delayed')}")

    # 5. Check CSV Download (Content Check)
    print("Checking CSV Download content...")
    csv_res = requests.get(f"{BASE_URL}/reports/download/csv", headers=headers)
    csv_content = csv_res.text
    
    # Check if user row has "Delayed"
    # Simple check: search for user ID and "Delayed" in same line?
    # Or just check if "Delayed" count in CSV aligns.
    delayed_rows = csv_content.count("Delayed")
    print(f"CSV 'Delayed' occurrences: {delayed_rows}")
    if delayed_rows >= 1:
        print("✅ CSV contains Delayed status.")
    else:
        print("❌ CSV does NOT contain Delayed status.")

if __name__ == "__main__":
    token = login()
    if token:
        employees = get_employees(token)
        if employees:
            target_user = employees[0]
            print(f"Targeting employee: {target_user['name']} (ID: {target_user['id']})")
            
            task_id = create_overdue_task(token, target_user['id'])
            if task_id:
                check_sync(token, target_user['id'])
            else:
                print("Skipping sync check due to task creation failure.")
        else:
            print("No employees found.")
