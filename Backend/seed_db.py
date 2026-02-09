from app import app
from config.db import db
from models.user import User
from models.task import Task
from models.progress import Progress
from models.alert import Alert
from models.activity_log import ActivityLog
from models.onboarding_template import OnboardingTemplate, TemplateTask
from models.employee_notification import EmployeeNotification
from datetime import datetime, timedelta
import random
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        print("🔧 Dropping existing tables...")
        db.drop_all()
        print("🔨 Creating new tables...")
        db.create_all()

        print("🌱 Seeding Users...")
        # 1. Admin & HR
        # Password for Admin/HR: 09845
        admin_pw = generate_password_hash("09845")
        hr_pw = generate_password_hash("09845")
        employee_pw = generate_password_hash("098765432")

        admin = User(name="Admin User", email="admin@company.com", role="admin", department="IT", avatar="👨‍💻", joined_date=datetime.now(), password_hash=admin_pw)
        hr = User(name="HR Manager", email="hr@company.com", role="hr", department="Human Resources", avatar="👩‍💼", joined_date=datetime.now(), password_hash=hr_pw)
        
        db.session.add(admin)
        db.session.add(hr)
        
        # 2. Employees (10 records)
        departments = ["Engineering", "Marketing", "Sales", "Product", "Support"]
        avatars = ["👨‍🚀", "🦸‍♂️", "👩‍🔬", "🧑‍🔧", "👩‍🎨", "👨‍✈️", "👩‍🚒", "🧙‍♂️", "🧛‍♀️", "🧟"]
        names = [
            ("John Doe", "john"), ("Jane Smith", "jane"), ("Rahul Sharma", "rahul"), ("Neha Gupta", "neha"),
            ("Amit Verma", "amit"), ("Sarah Connor", "sarah"), ("Tony Stark", "tony"), ("Bruce Wayne", "bruce"),
            ("Clark Kent", "clark"), ("Diana Prince", "diana")
        ]
        
        employees = []
        for i, (name, email_prefix) in enumerate(names):
            dept = departments[i % len(departments)]
            join_date = datetime.now() - timedelta(days=random.randint(1, 30))
            
            # Risk Logic
            risk = "On Track"
            risk_reason = "Consistent progress"
            if i % 3 == 0:
                risk = "At Risk"
                risk_reason = "Low engagement detected"
            elif i % 5 == 0:
                risk = "Delayed"
                risk_reason = "Missed critical deadline"
                
            emp = User(
                name=name, 
                email=f"{email_prefix}@company.com", 
                role="employee", 
                department=dept, 
                avatar=avatars[i], 
                joined_date=join_date,
                risk=risk,
                risk_reason=risk_reason,
                password_hash=employee_pw
            )
            employees.append(emp)
            db.session.add(emp)
            
        db.session.commit()
        
        print("🌱 Seeding Templates...")
        # Template 1: Engineering Onboarding
        eng_template = OnboardingTemplate(name="Engineering Onboarding", created_by=admin.id)
        db.session.add(eng_template)
        db.session.flush()
        
        eng_tasks = [
            {"name": "Setup Dev Environment", "days": 1, "type": "Setup"},
            {"name": "Review Codebase Access", "days": 2, "type": "Access"},
            {"name": "Complete Cloud Security Training", "days": 3, "type": "Video"},
            {"name": "First PR Submission", "days": 7, "type": "Project"}
        ]
        for t in eng_tasks:
            db.session.add(TemplateTask(template_id=eng_template.id, task_name=t["name"], due_days=t["days"], task_type=t["type"]))

        # Template 2: Sales Onboarding
        sales_template = OnboardingTemplate(name="Sales Onboarding", created_by=hr.id)
        db.session.add(sales_template)
        db.session.flush()
        
        sales_tasks = [
            {"name": "CRM Tool Training", "days": 1, "type": "Video"},
            {"name": "Shadow Senior Sales Rep", "days": 3, "type": "Meeting"},
            {"name": "Review Product Pricing", "days": 2, "type": "Document"},
            {"name": "First Client Call", "days": 10, "type": "Project"}
        ]
        for t in sales_tasks:
            db.session.add(TemplateTask(template_id=sales_template.id, task_name=t["name"], due_days=t["days"], task_type=t["type"]))
            
        # Template 3: General
        gen_template = OnboardingTemplate(name="General Onboarding", created_by=hr.id)
        db.session.add(gen_template)
        db.session.flush()
        gen_tasks = [
            {"name": "Submit ID Proof", "days": 1, "type": "Upload"},
            {"name": "Sign NDA", "days": 1, "type": "Signature"},
            {"name": "Fill Bank Details", "days": 2, "type": "Form"}
        ]
        for t in gen_tasks:
            db.session.add(TemplateTask(template_id=gen_template.id, task_name=t["name"], due_days=t["days"], task_type=t["type"]))

        db.session.commit()

        print("🌱 Seeding Tasks & Progress...")
        
        for emp in employees:
            # Assign tasks based on dept or random
            taskList = gen_tasks
            if emp.department == "Engineering":
                taskList = eng_tasks + gen_tasks
            elif emp.department == "Sales":
                taskList = sales_tasks + gen_tasks
            
            for t_data in taskList:
                status = "Pending"
                completion = 0
                time_spent = 0
                completed_at = None
                
                # Simulate progress based on risk
                if emp.risk == "On Track":
                    if random.random() > 0.2:
                        status = "Completed"
                        completion = 100
                        time_spent = random.randint(15, 60)
                        completed_at = datetime.now() - timedelta(days=random.randint(1, 5))
                elif emp.risk == "At Risk":
                     if random.random() > 0.7:
                        status = "Completed"
                        completion = 100
                # Delayed users stay pending mostly
                
                task = Task(
                    title=t_data["name"],
                    description="Standard task",
                    status=status,
                    due_date=datetime.now() + timedelta(days=t_data["days"]),
                    task_type=t_data["type"],
                    assigned_to=emp.id
                )
                db.session.add(task)
                db.session.flush()
                
                progress = Progress(
                    user_id=emp.id,
                    task_id=task.id,
                    completion=completion,
                    delay_days=random.randint(0, 5) if emp.risk == "Delayed" else 0,
                    time_spent=time_spent,
                    completed_at=completed_at
                )
                db.session.add(progress)

        print("🌱 Seeding Notifications...")
        for emp in employees:
             if emp.risk == "At Risk":
                 db.session.add(EmployeeNotification(
                     user_id=emp.id,
                     message="Reminder: You have pending tasks overdue.",
                     type="warning"
                 ))
        
        db.session.commit()
        print("✅ Database Seeded Successfully!")

if __name__ == "__main__":
    seed_database()
