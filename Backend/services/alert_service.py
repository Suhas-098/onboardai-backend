from models.alert import Alert
from models.task import Task
from models.user import User
from models.progress import Progress
from config.db import db
from datetime import datetime

class AlertService:
    @staticmethod
    def calculate_employee_alerts(user):
        from models.progress import Progress
        from models.activity_log import ActivityLog
        from models.task import Task
        from datetime import datetime
        
        result = {
            "lowEngagement": False,
            "missedDeadline": False,
            "reasons": [],
            "status": "On Track"
        }
        
        # 1. 100% Complete Check
        tasks = Task.query.filter_by(assigned_to=user.id).all()
        user_progress = Progress.query.filter_by(user_id=user.id).all()
        
        all_completed = True
        total_completion = 0
        if tasks:
            if not user_progress or len(user_progress) < len(tasks):
                all_completed = False
            
            for p in user_progress:
                total_completion += (p.completion or 0)
                if (p.completion or 0) < 100:
                    all_completed = False
            
            # RULE 1: If progress is 100% OR all items are 100%, they are NOT at risk
            avg_completion = total_completion / len(tasks) if tasks else 0
            if avg_completion >= 100:
                all_completed = True
        else:
            # No tasks means they're effectively done/not on track yet
            all_completed = True

        # MANDATORY EARLY RETURN FOR COMPLETED EMPLOYEES (Rule 1)
        if all_completed:
            return {
                "lowEngagement": False,
                "missedDeadline": False,
                "reasons": [],
                "status": "On Track"
            }
            
        # 2. Missed Deadline Check (Only for incomplete)
        overdue_tasks = []
        for t in tasks:
            if t.due_date and t.due_date < datetime.now():
                task_prog = next((p for p in user_progress if p.task_id == t.id), None)
                prog_val = task_prog.completion if task_prog else 0
                if t.status.lower() != 'completed' and prog_val < 100:
                    overdue_tasks.append(t)
        if len(overdue_tasks) > 0:
            result["missedDeadline"] = True
            result["reasons"].append(f"Missed Critical Deadline for: {overdue_tasks[0].title}")

        # 3. Low Engagement Check — ONLY for incomplete employees (Rule 2)
        last_login = ActivityLog.query.filter(
            ActivityLog.user_id == user.id,
            ActivityLog.action.ilike("Logged in")
        ).order_by(ActivityLog.timestamp.desc()).first()
        
        reference_time = last_login.timestamp if last_login else user.joined_date
        if not reference_time:
            reference_time = datetime.now()
            
        hours_inactive = (datetime.now() - reference_time).total_seconds() / 3600
        if hours_inactive > 24:
            result["lowEngagement"] = True
            result["reasons"].append("Low Engagement Detected")
        
        # 4. Enforce Precedence Status
        if result["missedDeadline"]:
            result["status"] = "Delayed"
        elif result["lowEngagement"]:
            result["status"] = "At Risk"
            
        return result

    @staticmethod
    def get_all_alerts():
        results = []
        users = User.query.filter(User.role.ilike("employee")).all()
        for user in users:
            alerts = AlertService.calculate_employee_alerts(user)
            if alerts["missedDeadline"]:
                results.append({
                    "id": f"dl_{user.id}",
                    "level": "Critical",
                    "type": "Critical",
                    "title": "Missed Critical Deadline",
                    "message": alerts["reasons"][0] if alerts["reasons"] else "Missed Critical Deadline",
                    "time": "Overdue",
                    "target_user_id": user.id,
                    "created_at": datetime.now().isoformat()
                })
            if alerts["lowEngagement"]:
                results.append({
                    "id": f"le_{user.id}",
                    "level": "Warning",
                    "type": "Warning",
                    "title": "Low Engagement Detected",
                    "message": "Low Engagement Detected",
                    "time": "Needs Attention",
                    "target_user_id": user.id,
                    "created_at": datetime.now().isoformat()
                })
        return results

    @staticmethod
    def get_user_risks():
        """
        Determines the risk status for ALL employees based on active alerts.
        Returns: dict { user_id: { "status": "...", "reasons": [...] } }
        """
        users = User.query.filter(User.role.ilike("employee")).all()
        user_risks = {}

        for user in users:
            alerts = AlertService.calculate_employee_alerts(user)

            user_risks[user.id] = {
                "user": user,
                "status": alerts["status"],
                "reasons": alerts["reasons"],
                "alert_count": len(alerts["reasons"]),
                "lowEngagement": alerts["lowEngagement"],
                "missedDeadline": alerts["missedDeadline"]
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
            "critical_employees": [], # For Critical Focus
            "high_risk_employees": [], # For High Risk Employees
            "dept_counts": {} # For distribution
        }
        
        # Also calculate global completion average
        total_completion = 0
        total_users_for_avg = 0
        
        for uid, data in user_risks.items():
            user = data['user']
            status = data['status']
            lowEng = data['lowEngagement']
            missed = data['missedDeadline']
            
            # Risk Counts
            if status == "On Track":
                stats["on_track"] += 1
            elif status == "At Risk":
                stats["at_risk"] += 1
            elif status == "Delayed":
                stats["delayed"] += 1
                
            # Dashboard: Critical Focus
            # Should count employees with: Missed Critical Deadlines
            if missed:
                stats["critical_employees"].append({
                    "id": user.id,
                    "name": user.name,
                    "department": user.department,
                    "risk": "Critical",
                    "reason": data['reasons'][0] if data['reasons'] else "Missed Critical Deadline"
                })
                
            # Dashboard: High Risk Employees logic handles Low Engagement OR Missed Deadline
            if lowEng or missed:
                reasons_text = ", ".join(data['reasons'])
                stats["high_risk_employees"].append({
                    "id": user.id,
                    "name": user.name,
                    "department": user.department,
                    "risk": status,
                    "reason": reasons_text
                })
                
            # Department Counts
            dept = user.department or "Unassigned"
            stats["dept_counts"][dept] = stats["dept_counts"].get(dept, 0) + 1
            
            # Completion
            user_progress = Progress.query.filter_by(user_id=user.id).all()
            if user_progress:
                user_avg = sum(p.completion or 0 for p in user_progress) / len(user_progress)
                total_completion += user_avg
            total_users_for_avg += 1

        stats["avg_completion"] = round(total_completion / total_users_for_avg, 1) if total_users_for_avg > 0 else 0
        
        return stats