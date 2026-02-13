import requests
import json

BASE_URL = 'http://localhost:5000/api'
login_r = requests.post(f'{BASE_URL}/auth/login', json={'email': 'hr@company.com', 'password': 'hr@09845'})
token = login_r.json()['token']
headers = {'Authorization': f'Bearer {token}'}

print("ENDPOINT STATUS AND SAMPLE DATA")
print("=" * 60)

endpoints = [
    ('admin/activity', '/admin/activity'),
    ('admin/audit-logs', '/admin/audit-logs'),
    ('admin/notifications', '/admin/notifications'),
    ('admin/employees/3/activity', '/admin/employees/3/activity'),
]

for name, path in endpoints:
    r = requests.get(f'{BASE_URL}{path}', headers=headers)
    print(f'\n{name}: {r.status_code}')
    d = r.json()
    if 'total_activities' in d:
        print(f'  Total activities: {d["total_activities"]}')
        if d.get('activities'):
            act = d['activities'][0]
            print(f'  Sample: {act["action"]}')
    elif 'total_logs' in d:
        print(f'  Total logs: {d["total_logs"]}')
        if d.get('audit_logs'):
            log = d['audit_logs'][0]
            print(f'  Sample: {log["action"]}')
    elif 'total_notifications' in d:
        print(f'  Total notifications: {d["total_notifications"]}')
