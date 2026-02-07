from app import app
from config.db import db
from models.user import User
from models.task import Task
from models.progress import Progress
from models.alert import Alert
from models.activity_log import ActivityLog
from datetime import datetime, timedelta
import random

def seed_database():
    with app.app_context():
        print("🔧 Dropping existing tables...")
        db.drop_all()
        print("🔨 Creating new tables...")
        db.create_all()

        print("🌱 Seeding Users...")
        users = [
            User(name="Admin User", email="admin@company.com", role="admin", department="IT", avatar="👨‍💻", joined_date=datetime.now()),
            User(name="HR Manager", email="hr@company.com", role="hr", department="Human Resources", avatar="👩‍💼", joined_date=datetime.now()),
            User(name="John Employee", email="john@company.com", role="employee", department="Engineering", avatar="👨‍🚀", joined_date=datetime.now() - timedelta(days=5), risk="On Track", risk_reason="Consistent progress"),
            User(name="Rahul Sharma", email="rahul@company.com", role="employee", department="Marketing", avatar="🦸‍♂️", joined_date=datetime.now() - timedelta(days=10), risk="At Risk", risk_reason="Low completion rate"),
            User(name="Neha Gupta", email="neha@company.com", role="employee", department="Sales", avatar="👩‍🔬", joined_date=datetime.now() - timedelta(days=2), risk="Delayed", risk_reason="Missed critical deadline"),
            User(name="Amit Verma", email="amit@company.com", role="employee", department="Engineering", avatar="🧑‍🔧", joined_date=datetime.now() - timedelta(days=1), risk="On Track", risk_reason="Just started"),
        ]
        
        db.session.add_all(users)
        db.session.commit() # Commit to get IDs

        # Re-fetch users to get IDs
        john = User.query.filter_by(email="john@company.com").first()
        rahul = User.query.filter_by(email="rahul@company.com").first()
        neha = User.query.filter_by(email="neha@company.com").first()
        amit = User.query.filter_by(email="amit@company.com").first()
        employees = [john, rahul, neha, amit]

        print("🌱 Seeding Tasks & Assigning to Employees...")
        default_tasks = [
            {"title": "Fill Personal Details Form", "type": "form", "desc": "Provide your personal info"},
            {"title": "Upload Government ID", "type": "upload", "desc": "Aadhaar or Passport"},
            {"title": "Upload Bank Details", "type": "form", "desc": "For salary processing"},
            {"title": "Sign Offer Letter", "type": "signature", "desc": "Digital signature required"},
            {"title": "Read & Accept HR Policies", "type": "form", "desc": "Code of conduct"},
            {"title": "Complete Cybersecurity Training", "type": "video", "desc": "Watch the security briefing"},
            {"title": "Complete Workplace Safety Training", "type": "video", "desc": "Safety first!"},
            {"title": "Set Up Company Email", "type": "setup", "desc": "Configure Outlook"},
            {"title": "Attend Manager Intro Meeting", "type": "meeting", "desc": "Meet your reporting manager"}
        ]

        for emp in employees:
            for i, t_data in enumerate(default_tasks):
                # Create Task
                task = Task(
                    title=t_data["title"],
                    description=t_data["desc"],
                    status="Pending",
                    due_date=datetime.now() + timedelta(days=7),
                    task_type=t_data["type"],
                    assigned_to=emp.id
                )
                db.session.add(task)
                db.session.commit() # Commit to get Task ID

                # Simulate Progress
                status = "Pending"
                completion = 0
                time_spent = 0
                
                # Randomize progress
                if emp == john: # John is doing well
                    if i < 4:
                        status = "Completed"
                        completion = 100
                        time_spent = random.randint(10, 30)
                    elif i == 4:
                        status = "In Progress"
                        completion = 50
                        time_spent = 15
                elif emp == rahul: # Rahul is struggling
                    if i < 2:
                        status = "Completed"
                        completion = 100
                        time_spent = random.randint(20, 40)
                elif emp == neha: # Neha is delayed
                     pass # Mostly pending
                
                # Update Task Status
                task.status = status
                db.session.commit()

                # Create Progress Record
                progress = Progress(
                    user_id=emp.id,
                    task_id=task.id,
                    completion=completion,
                    delay_days=0 if status != "Pending" else random.choice([0, 1, 2]),
                    time_spent=time_spent,
                    completed_at=datetime.now() - timedelta(days=random.randint(1, 4)) if status == "Completed" else None
                )
                db.session.add(progress)

                # Create Activity Log if completed
                if status == "Completed":
                    log = ActivityLog(
                        user_id=emp.id,
                        action=f"Completed task: {task.title}",
                        timestamp=datetime.now() - timedelta(hours=random.randint(1, 48)),
                        details=f"Time spent: {time_spent} mins"
                    )
                    db.session.add(log)
        
        print("🌱 Seeding Alerts...")
        alerts = [
            Alert(type="Warning", message="Rahul is behind on Cybersecurity Training", target_user_id=rahul.id),
            Alert(type="Critical", message="Neha has not submitted ID proof", target_user_id=neha.id),
            Alert(type="Info", message="Welcome to OnboardAI!", target_user_id=None),
        ]
        db.session.add_all(alerts)

        db.session.commit()
        print("✅ Database Seeded Successfully!")

if __name__ == "__main__":
    seed_database()
