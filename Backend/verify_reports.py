import sys
import os
sys.path.append(os.getcwd())

from app import app
from config.db import db
from models.user import User
import jwt
import datetime

# Check matplotlib
try:
    import matplotlib
    print(f"Matplotlib found: {matplotlib.__version__}")
except ImportError:
    print("Matplotlib NOT found in verification script environment")

def verify_reports():
    with app.test_client() as client:
        with app.app_context():
            # Get admin user
            admin = User.query.filter_by(role='admin').first()
            if not admin:
                print("Error: No admin user found")
                return
            
            # Generate Token
            token = jwt.encode({
                "sub": str(admin.id),
                "role": admin.role,
                "name": admin.name,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test PDF
            print("Testing PDF Download...")
            res_pdf = client.get('/api/reports/download/pdf', headers=headers)
            if res_pdf.status_code == 200 and res_pdf.content_type == 'application/pdf':
                print("✅ PDF Download: Success")
            else:
                print(f"❌ PDF Download: Failed ({res_pdf.status_code})")
                print(res_pdf.data[:100])

            # Test CSV
            print("Testing CSV Download...")
            res_csv = client.get('/api/reports/download/csv', headers=headers)
            if res_csv.status_code == 200 and res_csv.content_type == 'text/csv':
                print("✅ CSV Download: Success")
            else:
                print(f"❌ CSV Download: Failed ({res_csv.status_code})")
                print(res_csv.data[:100])

            # Test Excel
            print("Testing Excel Download...")
            res_excel = client.get('/api/reports/download/excel', headers=headers)
            if res_excel.status_code == 200 and 'spreadsheetml' in res_excel.content_type:
                print("✅ Excel Download: Success")
            else:
                print(f"❌ Excel Download: Failed ({res_excel.status_code})")
                print(res_excel.data[:100])

            # Test Summary Structure (Frontend Requirement)
            print("Testing Summary Endpoint...")
            res_summary = client.get('/api/reports/summary', headers=headers)
            if res_summary.status_code == 200:
                data = res_summary.json
                required = ["total_employees", "averages", "risk_summary", "top_risks", "department_breakdown"]
                missing = [k for k in required if k not in data]
                if not missing:
                    print("✅ Summary Endpoint: Success (Schema Valid)")
                else:
                    print(f"❌ Summary Endpoint: Missing keys {missing}")
            else:
                print(f"❌ Summary Endpoint: Failed ({res_summary.status_code})")

if __name__ == "__main__":
    verify_reports()
