import requests

# 1. Login as Admin
resp = requests.post("http://127.0.0.1:5000/api/auth/login", json={
    "email": "admin@company.com",
    "password": "09845"
})
token = resp.json().get("token")
print("Token:", token[:20])

# 2. Assign template 1 to employee 2
headers = {"Authorization": f"Bearer {token}"}
resp2 = requests.post("http://127.0.0.1:5000/api/employees/2/assign-template/1", headers=headers)
print("Status:", resp2.status_code)
print("Response:", resp2.text)
