import sys
import os
import random
from datetime import datetime
from faker import Faker

# Add parent directory to path to allow imports from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from config.db import db
from models.user import User
from models.task import Task
from models.progress import Progress

fake = Faker()

def seed():
    with app.app_context():
        print("🗑️  Dropping all tables...")
        db.drop_all()
        print("✅ Tables dropped.")

        print("🛠️  Creating new tables...")
        db.create_all()
        print("✅ Tables created.")

        # 1. Create Users
        users = []
        
        # Define specific users with RBAC roles
        user_data = [
            {
                "name": "Admin User",
                "email": "admin@company.com",
                "role": "admin",
                "department": "IT",
                "designation": "System Administrator",
                "avatar": "👨‍💻"
            },
            {
                "name": "HR Manager",
                "email": "hr@company.com",
                "role": "hr",
                "department": "Human Resources",
                "designation": "HR Manager",
                "avatar": "👩‍💼"
            },
            {
                "name": "John Doe",
                "email": "john@company.com",
                "role": "employee",
                "department": "Engineering",
                "designation": "Software Engineer",
                "avatar": "👨‍🚀"
            },
            {
                "name": "Jane Smith",
                "email": "jane@company.com",
                "role": "employee",
                "department": "Product",
                "designation": "Product Manager",
                "avatar": "👩‍🔬"
            },
            {
                "name": "Alex Johnson",
                "email": "alex@company.com",
                "role": "intern",
                "department": "Design",
                "designation": "Design Intern",
                "avatar": "🧑‍🎨"
            }
        ]
        
        print("👤 Creating users...")
        for data in user_data:
            u = User(
                name=data["name"],
                email=data["email"],
                role=data["role"],
                department=data["department"],
                designation=data["designation"],
                avatar=data["avatar"],
                joined_date=datetime.now()
            )
            users.append(u)
            db.session.add(u)
        
        db.session.commit()
        print(f"✅ Created {len(users)} users (1 admin, 1 hr, 2 employees, 1 intern).")

        # 2. Create Tasks
        tasks = []
        task_titles = [
            ("Complete HR Form", "form"),
            ("Watch Security Training", "video"),
            ("Upload ID Proof", "upload"),
            ("Setup Work Email", "form"),
            ("Join Slack Channels", "form")
        ]

        print("📋 Creating tasks...")
        for title, t_type in task_titles:
            t = Task(
                title=title,
                description=f"Standard onboarding task: {title}",
                status="Not Started", # Template status
                task_type=t_type,
                due_date=datetime.now() # Just a placeholder
            )
            tasks.append(t)
            db.session.add(t)
        
        db.session.commit()
        print(f"✅ Created {len(tasks)} tasks.")

        # 3. Create Progress (Simulate Scenarios)
        print("📊 Creating progress records...")
        
        # User 0: On Track (High completion, low delay)
        # User 1: At Risk (Medium completion, some delay)
        # User 2: Delayed (Low completion, high delay. Real bad.)
        
        scenarios = [
            {"completion": 100, "delay": 0, "time": 45}, # On Track
            {"completion": 90, "delay": 1, "time": 40},  # On Track
            {"completion": 50, "delay": 3, "time": 20},  # At Risk
            {"completion": 20, "delay": 7, "time": 10},  # Delayed
            {"completion": 10, "delay": 10, "time": 5},  # Delayed
        ]

        for i, user in enumerate(users):
            scenario = scenarios[i]
            # Assign all tasks to user with specific progress
            for task in tasks:
                p = Progress(
                    user_id=user.id,
                    task_id=task.id,
                    completion=scenario["completion"], # Simplified: all tasks have same completion for this user
                    delay_days=scenario["delay"] if random.random() > 0.5 else 0,
                    time_spent=scenario["time"]
                )
                db.session.add(p)
            
            # Predict and store risk
            from services.predictor import predict_risk
            risk = predict_risk({
                "completion": scenario["completion"],
                "delay_days": scenario["delay"],
                "tasks_completed": 5, # Since we assign all 5 tasks
                "time_spent": scenario["time"] * 5 # Total time
            })
            
            user.risk = risk
            if risk == "Delayed":
                user.risk_reason = "Significant delays detected in task completion."
            elif risk == "At Risk":
                user.risk_reason = "Low engagement and slow progress."
            else:
                user.risk_reason = None
            
            db.session.add(user) # Update user with risk
        
        db.session.commit()
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed()
