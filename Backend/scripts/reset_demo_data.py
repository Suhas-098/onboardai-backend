import sys
import os
from datetime import datetime
from copy import deepcopy

# Add parent directory to path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.db import db
from models.user import User
from models.task import Task
from models.progress import Progress

def reset_demo_data():
    with app.app_context():
        print("Starting demo data reset...")

        # 1. Employee Cleanup
        # Find 1 Admin, 1 HR
        admin = User.query.filter_by(role='admin').first()
        hr = User.query.filter_by(role='hr').first()

        # Find 6 Employees
        all_employees = User.query.filter_by(role='employee').all()
        employees_to_keep = all_employees[:6]
        employees_to_delete = all_employees[6:]

        print(f"Keeping {len(employees_to_keep)} employees, deleting {len(employees_to_delete)} employees.")

        for emp in employees_to_delete:
            Progress.query.filter_by(user_id=emp.id).delete()
            Task.query.filter_by(assigned_to=emp.id).delete()
            # Also clear activity logs to avoid foreign key violations
            from models.activity_log import ActivityLog
            ActivityLog.query.filter_by(user_id=emp.id).delete()
            # Also clear alerts
            from models.alert import Alert
            Alert.query.filter_by(target_user_id=emp.id).delete()
            # Also clear notifications
            from models.employee_notification import EmployeeNotification
            EmployeeNotification.query.filter_by(user_id=emp.id).delete()
            db.session.delete(emp)
        
        db.session.commit()

        # 2. Reset Tasks and Progress for kept employees
        for emp in employees_to_keep:
            print(f"Resetting tasks for employee: {emp.name}")
            
            # Delete existing tasks and progress
            Progress.query.filter_by(user_id=emp.id).delete()
            Task.query.filter_by(assigned_to=emp.id).delete()
            db.session.commit()

            # Create new tasks
            tasks_data = [
                {"title": "Upload Government ID", "due_date": datetime(2026, 3, 12).date(), "type": "Document"},
                {"title": "Upload Bank Details", "due_date": datetime(2026, 3, 12).date(), "type": "Document"},
                {"title": "Sign Offer Letter", "due_date": datetime(2026, 3, 12).date(), "type": "Document"},
                {"title": "Read HR Policies", "due_date": datetime(2026, 3, 12).date(), "type": "Document"},
                {"title": "Complete Cybersecurity Training", "due_date": datetime(2026, 3, 10).date(), "type": "Training"},
                {"title": "Set Up Company Email", "due_date": datetime(2026, 3, 10).date(), "type": "Form"},
            ]

            for td in tasks_data:
                new_task = Task(
                    title=td["title"],
                    description=f"Please complete: {td['title']}",
                    task_type=td["type"],
                    status="Not Started",
                    due_date=td["due_date"],
                    assigned_to=emp.id
                )
                db.session.add(new_task)
                db.session.flush()

                new_progress = Progress(
                    user_id=emp.id,
                    task_id=new_task.id,
                    completion=0,
                    delay_days=0,
                    time_spent=0
                )
                db.session.add(new_progress)
            
            # Update user's progress/score
            emp.score = 0
            emp.progress = 0
            emp.risk = "Good" # Reset risk
        
        db.session.commit()
        print("Demo data reset completed successfully.")

if __name__ == "__main__":
    reset_demo_data()
