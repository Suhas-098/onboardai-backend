from app import app
from config.db import db
from models.user import User
from models.alert import Alert
from services.alert_service import AlertService
import pandas as pd

def debug_risk_visibility():
    with app.app_context():
        print("🔍 Debugging Risk Visibility...")
        
        # 1. List all users and their basic info
        users = User.query.filter(User.role.ilike("employee")).all()
        print(f"Total Employees in DB: {len(users)}")
        
        # 2. Get Risk Data from AlertService
        user_risks = AlertService.get_user_risks()
        print(f"Employees in AlertService Risk Map: {len(user_risks)}")
        
        print("\n--- User Risk Status Breakdown ---")
        for u in users:
            risk_data = user_risks.get(u.id)
            if not risk_data:
                print(f"❌ User {u.name} (ID: {u.id}) NOT FOUND in AlertService map!")
                continue
                
            status = risk_data['status']
            alert_count = len(Alert.query.filter_by(target_user_id=u.id).all())
            
            print(f"👤 {u.name} (ID: {u.id})")
            print(f"   - Role: {u.role}")
            print(f"   - AlertService Status: {status}")
            print(f"   - Active Alerts in DB: {alert_count}")
            print(f"   - Reasons: {risk_data['reasons']}")
            
            if status == "On Track":
                print("   -> Visible in: 'On Track' counts only.")
            elif status == "At Risk":
                print("   -> Visible in: 'At Risk' counts, Risk Reports.")
            elif status == "Delayed":
                print("   -> Visible in: 'Delayed' counts, Critical Focus, Risk Reports.")

        # 3. Check Dashboard Stats directly
        stats = AlertService.get_dashboard_stats()
        print("\n--- Dashboard Stats ---")
        print(f"Total: {stats['total_employees']}")
        print(f"On Track: {stats['on_track']}")
        print(f"At Risk: {stats['at_risk']}")
        print(f"Delayed: {stats['delayed']}")
        print(f"Critical Employees List ({len(stats['critical_employees'])}):")
        for c in stats['critical_employees']:
            print(f"   - {c['name']} ({c['risk']})")

if __name__ == "__main__":
    debug_risk_visibility()
