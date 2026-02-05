import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from config.db import db
from models.user import User
from datetime import datetime

def quick_seed():
    with app.app_context():
        print("🛠️  Creating admin and test users...")
        
        # Check if users already exist
        existing = User.query.filter_by(email="admin@company.com").first()
        if existing:
            print("⚠️  Users already exist. Skipping...")
            return
        
        # Create test users
        users = [
            User(
                name="Admin User",
                email="admin@company.com",
                role="admin",
                department="IT",
                avatar="👨‍💻",
                joined_date=datetime.now()
            ),
            User(
                name="HR Manager",
                email="hr@company.com",
                role="hr",
                department="Human Resources",
                avatar="👩‍💼",
                joined_date=datetime.now()
            ),
            User(
                name="John Employee",
                email="john@company.com",
                role="employee",
                department="Engineering",
                avatar="👨‍🚀",
                joined_date=datetime.now()
            )
        ]
        
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        print(f"✅ Created {len(users)} users successfully!")
        print("\n📝 Test Credentials:")
        print("  Admin: admin@company.com (any password)")
        print("  HR: hr@company.com (any password)")
        print("  Employee: john@company.com (any password)")

if __name__ == "__main__":
    quick_seed()
