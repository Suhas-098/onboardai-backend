import requests
import time

BASE_URL = "http://localhost:5000/api"

def test_api():
    print("🚀 Starting API Verification...")
    
    # 1. Login as Admin
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@company.com", "password": "09845"})
    if resp.status_code != 200:
        print("❌ Admin login failed.")
        return
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Check Risks Endpoint (Should show multiple risks now)
    print("👉 Checking /risks endpoint...")
    resp = requests.get(f"{BASE_URL}/risks", headers=headers)
    risks = resp.json()
    
    at_risk_count = sum(1 for r in risks if r['risk'] == 'Warning')
    critical_count = sum(1 for r in risks if r['risk'] == 'Critical')
    
    print(f"   Found {len(risks)} users.")
    print(f"   Warning (At Risk): {at_risk_count}")
    print(f"   Critical (Delayed): {critical_count}")
    
    if at_risk_count > 0 and critical_count > 0:
        print("✅ Multiple users with risks found.")
    else:
        print("❌ Still missing risk data for other users.")

    # 3. Check Prediction Summary (Trigger Sklearn)
    print("👉 Checking /ml/prediction-summary...")
    resp = requests.get(f"{BASE_URL}/ml/prediction-summary", headers=headers)
    if resp.status_code == 200:
        print(f"✅ Prediction Summary: {resp.json()}")
    else:
        print(f"❌ Failed to get prediction summary: {resp.text}")

if __name__ == "__main__":
    test_api()
