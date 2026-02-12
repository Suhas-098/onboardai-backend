from models.user import User
from models.progress import Progress
from models.task import Task
from flask import jsonify
from datetime import datetime
import random
from sqlalchemy import func

class AlertService:
    
    @staticmethod
    def get_dashboard_stats():
        """
        Returns aggregated stats for the dashboard:
        - Total Users
        - On Track
        - At Risk
        - Delayed
        """
        users = User.query.all()
        summary = {
            "total_users": 0,
            "on_track": 0,
            "at_risk": 0,
            "delayed": 0
        }

        for user in users:
            # Filter for employees only? The original dashboard route didn't look like it filtered, 
            # but usually we only care about employees. reports_routes filtered for 'employee'.
            # Let's align with reports_routes and filter for employees to be safe/correct for reports.
            if user.role and user.role.lower() not in ['admin', 'hr']:
                summary["total_users"] += 1
                if user.risk == "On Track":
                    summary["on_track"] += 1
                elif user.risk == "At Risk":
                    summary["at_risk"] += 1
                elif user.risk in ["Delayed", "Critical"]:
                    summary["delayed"] += 1
        
        return summary

    @staticmethod
    def get_user_risks():
        """
        Returns list of employee objects with their calculated risk metrics.
        Used for reports and risk dashboard.
        """
        users = User.query.filter(User.role.ilike("employee")).all()
        results = []

        for user in users:
            try:
                # Basic User Info
                user_data = {
                    "id": user.id,
                    "name": user.name,
                    "department": user.department,
                    "risk": user.risk or "Unknown",
                    "completion": 0
                }
                
                # Fetch Progress
                progs = Progress.query.filter_by(user_id=user.id).all()
                if progs:
                    user_data["completion"] = sum(p.completion or 0 for p in progs) / len(progs)
                
                results.append(user_data)
            except Exception as e:
                print(f"Error processing user {user.id} in AlertService: {e}")
                
        return results

    @staticmethod
    def get_risk_trend():
        """
        Returns 7-day risk trend data.
        Currently simulated based on current state as per dashboard logic.
        """
        users = User.query.filter(User.role.ilike("employee")).all()
        current_risk_score = 0
        
        if users:
            total_risk = 0
            count = 0
            for u in users:
                count += 1
                if u.risk == "On Track": total_risk += 10
                elif u.risk == "At Risk": total_risk += 50
                elif u.risk in ["Delayed", "Critical"]: total_risk += 90
                else: total_risk += 10
            
            if count > 0:
                current_risk_score = int(total_risk / count)

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        trend_data = []
        base_score = current_risk_score
        
        for i in range(6, -1, -1):
            variation = random.randint(-15, 15)
            if i == 0: variation = 0 # Today matches exactly
            
            day_score = max(0, min(100, base_score + variation))
            
            # Simple day label logic from dashboard_routes
            day_label = days[(datetime.now().weekday() - i) % 7]
            trend_data.append({"name": day_label, "risk": day_score})
            
        return trend_data
