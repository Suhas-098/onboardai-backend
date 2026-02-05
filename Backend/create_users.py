"""
Quick script to create test users for RBAC testing.
Run this from the Backend directory: python -c "from create_users import create_test_users; create_test_users()"
"""
from models.user import User
from config.db import db
from datetime import datetime

def create_test_users():
    """Create admin, hr, and employee test users if they don't exist"""
    
    # Check if admin exists
    existing = User.query.filter_by(email="admin@company.com").first()
    if existing:
        print("⚠️  Admin user already exists")
        return
    
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
    print(f"✅ Created {len(users)} test users!")
    print("  Admin: admin@company.com")
    print("  HR: hr@company.com")
    print("  Employee: john@company.com")
