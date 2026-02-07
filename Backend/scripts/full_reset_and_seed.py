from datetime import datetime
import sys
import os

# Add parent directory to path to import app and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.db import db
from models.user import User
from models.task import Task
from models.progress import Progress
from models.activity_log import ActivityLog
from models.alert import Alert

def full_reset_and_seed():
    with app.app_context():
        print("🔄 Starting Full Database Reset...")

        # 1. Clear Progress, Logs, Alerts FIRST (referencing Tasks/Users)
        print("   - Deleting dependent records (Progress, Logs, Alerts)...")
        db.session.query(Progress).delete()
        db.session.query(ActivityLog).delete()
        db.session.query(Alert).delete()
        db.session.commit()

        # 2. Clear Tasks
        print("   - Deleting tasks...")
        db.session.query(Task).delete()
        db.session.commit()

        # 2. Remove "Intern" users except Rohan Buckley
        print("   - Removing invalid 'Intern' users...")
        invalid_interns = User.query.filter(
            User.name.ilike("Intern%"),
            User.name != "Rohan"
        ).all()
        
        for user in invalid_interns:
            print(f"     ❌ Deleting user: {user.name}")
            db.session.delete(user)
        
        db.session.commit()

        # 3. Reset Stats for ALL users
        print("   - Resetting user stats...")
        all_users = User.query.all()
        for user in all_users:
            user.risk = "On Track"
            user.risk_reason = "Onboarding started"
            # Note: tasks_assigned, tasks_completed, onboarding_progress are not columns in User model based on view_file output.
            # They seem to be calculated dynamically or stored in Progress if they existed. 
            # Looking at User model (step 22), these fields DO NOT exist. 
            # So we only need to reset risk.
        db.session.commit()

        # 4. Define Default Tasks
        current_year = datetime.now().year
        deadline = datetime(current_year, 2, 16, 23, 59, 0)
        
        default_tasks = [
            "Sign Offer Letter",
            "Read & Accept HR Policies",
            "Complete Cybersecurity Training",
            "Complete Workplace Safety Training",
            "Set Up Company Email",
            "Attend Manager Intro Meeting",
            "Complete IT Setup",
            "Company Culture Orientation"
        ]

        # 5. Assign Tasks to ALL Employees (Role=Employee or Intern)
        # (Loop definition moved down to avoid duplication)
        
        # Determine strict flush/commit strategy
        # To avoid multiple commits inside loop, let's do:
        # For each employee, generate tasks, flush, generate progress.
        
        # Actually, let's re-loop to be safe or do it properly.
        db.session.commit() # Commit deletion and user updates first

        # Re-fetch employees to be safe
        employees = User.query.filter(
            (User.role.ilike("employee")) | (User.role.ilike("intern"))
        ).all()

        total_tasks_created = 0
        for emp in employees:
            for title in default_tasks:
                task = Task(
                    title=title,
                    description="Standard onboarding task.",
                    status="Pending",
                    due_date=deadline,
                    task_type="Standard",
                    assigned_to=emp.id
                )
                db.session.add(task)
                db.session.flush() # Get ID

                prog = Progress(
                    user_id=emp.id,
                    task_id=task.id,
                    completion=0
                )
                db.session.add(prog)
                total_tasks_created += 1
        
        db.session.commit()
        print(f"✅ Reset Complete. Created {total_tasks_created} tasks for {len(employees)} employees.")

if __name__ == "__main__":
    full_reset_and_seed()
