import requests
import json

BASE_URL = "http://localhost:5000/api"

def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@company.com",
            "password": "admin@09845"
        })
        if response.status_code == 200:
            return response.json().get("token")
        else:
            print("Login failed:", response.text)
            return None
    except Exception as e:
        print("Login exception:", e)
        return None

def verify_download(token, endpoint, expected_content_type, expected_filename):
    print(f"Verifying {endpoint}...")
    try:
        response = requests.get(
            f"{BASE_URL}/reports/download/{endpoint}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code != 200:
            print(f"❌ Failed: Status code {response.status_code}")
            print("Response:", response.text)
            return False
            
        content_type = response.headers.get("Content-Type", "")
        content_disposition = response.headers.get("Content-Disposition", "")
        
        if expected_content_type not in content_type:
            print(f"❌ Failed: Expected Content-Type '{expected_content_type}', got '{content_type}'")
            return False
            
        if expected_filename not in content_disposition:
            print(f"❌ Failed: Expected filename '{expected_filename}' in Content-Disposition '{content_disposition}'")
            return False
            
        if len(response.content) == 0:
            print("❌ Failed: Response body is empty")
            return False
            
        print(f"✅ Success: {endpoint} downloaded correctly ({len(response.content)} bytes)")
        return True
        
    except Exception as e:
        print(f"❌ Exception verifying {endpoint}: {e}")
        return False


def check_cors(token):
    print("Verifying CORS headers...")
    try:
        response = requests.options(
            f"{BASE_URL}/reports/download/pdf",
            headers={
                "Authorization": f"Bearer {token}",
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        # Flask-CORS should return 200 OK for OPTIONS request
        if response.status_code != 200:
            print(f"❌ Failed: CORS Preflight check failed with status {response.status_code}")
            return False
            
        allow_origin = response.headers.get("Access-Control-Allow-Origin")
        if allow_origin != "*" and allow_origin != "http://localhost:3000":
             print(f"❌ Failed: Access-Control-Allow-Origin header missing or incorrect. Got: {allow_origin}")
             return False
             
        print("✅ Success: CORS headers present and correct.")
        return True

    except Exception as e:
        print(f"❌ Exception verifying CORS: {e}")
        return False

if __name__ == "__main__":
    print("Starting Verification...")
    token = login()
    if not token:
        print("Aborting: Could not login.")
    else:
        # Check CORS first
        cors_ok = check_cors(token)

        # Then check downloads
        checks = [
            ("pdf", "application/pdf", "onboardai-report.pdf"),
            ("csv", "text/csv", "onboardai-report.csv"),
            ("excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "onboardai-report.xlsx")
        ]
        
        all_passed = cors_ok
        for endpoint, c_type, fname in checks:
            if not verify_download(token, endpoint, c_type, fname):
                all_passed = False
                
        if all_passed:
            print("\n🎉 All checks passed (Download + CORS)!")
        else:
            print("\n⚠️ Some checks failed.")
