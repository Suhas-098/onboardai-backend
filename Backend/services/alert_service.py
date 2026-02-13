from models.alert import Alert
from models.task import Task
from models.user import User
from models.progress import Progress
from config.db import db
from datetime import datetime

class AlertService:
    @staticmethod
    def get_all_alerts():
        """
        Fetches all active alerts:
        1. Persisted Alerts from DB (Alert table)
        2. Dynamic "Missed Deadline" alerts from Tasks table
        """
        results = []

        # 1. Fetch Persisted Alerts
        try:
            db_alerts = Alert.query.order_by(Alert.created_at.desc()).all()
            for alert in db_alerts:
                results.append(alert.to_dict())
        except Exception as e:
            print(f"Error fetching DB alerts: {e}")

        # 2. Check for Overdue Tasks (Missed Deadlines)
        try:
            overdue_tasks = Task.query.filter(
                Task.status.ilike("Pending"),
                Task.due_date < datetime.now()
            ).all()

            for task in overdue_tasks:
                user = User.query.get(task.assigned_to)
                
                # Create a dynamic alert object
                # Ensure structure matches what frontend expects
                results.append({
                    "id": f"overdue_{task.id}",
                    "level": "Critical", # Overdue = Critical
                    "type": "Critical",
                    "title": "Missed Deadline",
                    "message": f"Employee {user.name if user else 'Unknown'} missed deadline for: {task.title}.",
                    "time": "Overdue",
                    "target_user_id": task.assigned_to,
                    "created_at": datetime.now().isoformat()
                })
        except Exception as e:
            print(f"Error fetching overdue tasks: {e}")

        return results

    @staticmethod
    def get_user_risks():
        """
        Determines the risk status for ALL employees based on active alerts.
        Returns: dict { user_id: { "status": "...", "reasons": [...] } }
        """
        users = User.query.filter(User.role.ilike("employee")).all()
        user_risks = {}
        
        # Get all alerts first to avoid N+1 queries ideally, 
        # but user count is small so filtering in python is fine for now.
        all_alerts = AlertService.get_all_alerts()

        for user in users:
            status = "On Track"
            reasons = []

            # Filter alerts for this user
            user_alerts = [a for a in all_alerts if a.get('target_user_id') == user.id]

            has_critical = False
            has_warning = False

            for alert in user_alerts:
                # Dynamic alerts have 'level', DB alerts have 'type'
                lvl = alert.get('level') or alert.get('type') or ''
                lvl = lvl.lower()
                msg = alert.get('message', '')
                
                if lvl in ['critical', 'delayed']:
                    has_critical = True
                    reasons.append(msg)
                elif lvl == 'warning':
                    has_warning = True
                    reasons.append(msg)

            # Enforce Precedence: Critical > Warning > On Track
            if has_critical:
                status = "Delayed"
            elif has_warning:
                status = "At Risk"
            
            user_risks[user.id] = {
                "user": user,
                "status": status,
                "reasons": reasons
            }
            
        return user_risks

    @staticmethod
    def get_dashboard_stats():
        """
        Aggregates stats for Dashboard and Reports.
        Single Source of Truth.
        """
        user_risks = AlertService.get_user_risks()
        
        stats = {
            "total_employees": len(user_risks),
            "on_track": 0,
            "at_risk": 0,
            "delayed": 0,
            "critical_employees": [], # For Critical Focus & Top Risks
            "dept_counts": {} # For distribution
        }
        
        # Also calculate global completion average
        total_completion = 0
        total_users_for_avg = 0 # Only count users who have progress? or all? 
        # Usually all employees.
        
        for uid, data in user_risks.items():
            user = data['user']
            status = data['status']
            
            # Risk Counts
            if status == "On Track":
                stats["on_track"] += 1
            elif status == "At Risk":
                stats["at_risk"] += 1
            elif status == "Delayed":
                stats["delayed"] += 1
                
            # Critical / Delayed List
            if status in ["Delayed", "Critical"]: # Catch both just in case
                stats["critical_employees"].append({
                    "id": user.id,
                    "name": user.name,
                    "department": user.department,
                    "risk": "Critical", # UI expects "Critical" usually for the red badge
                    "reason": data['reasons'][0] if data['reasons'] else "Missed Critical Deadline"
                })
                
            # Department Counts
            dept = user.department or "Unassigned"
            stats["dept_counts"][dept] = stats["dept_counts"].get(dept, 0) + 1
            
            # Completion
            # We need to query progress for this user
            # To avoid N+1, ideally we'd join, but keeping it simple for now as requested
            user_progress = Progress.query.filter_by(user_id=user.id).all()
            if user_progress:
                user_avg = sum(p.completion or 0 for p in user_progress) / len(user_progress)
                total_completion += user_avg
            total_users_for_avg += 1

        stats["avg_completion"] = round(total_completion / total_users_for_avg, 1) if total_users_for_avg > 0 else 0
        
        return stats