import bcrypt
from app import app
from config.db import db
from models.user import User

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_auth():
    with app.app_context():
        print("Seeding Authentication Data...")
        
        users_data = [
            {"name": "Admin", "email": "admin@company.com", "role": "ADMIN", "password": "admin@09845", "department": "HR"},
            {"name": "HR", "email": "hr@company.com", "role": "HR", "password": "hr@09845", "department": "HR"},
            {"name": "John Employee", "email": "john@company.com", "role": "Employee", "password": "john@098", "department": "Engineering"},
            {"name": "Rahul Sharma", "email": "rahul@company.com", "role": "Employee", "password": "rahul@098", "department": "Engineering"},
            {"name": "Neha Gupta", "email": "neha@company.com", "role": "Employee", "password": "neha@098", "department": "Marketing"},
            {"name": "Amit Verma", "email": "amit@company.com", "role": "Employee", "password": "amit@098", "department": "Sales"},
            {"name": "Rohan Bakle", "email": "rohan@company.com", "role": "Intern", "password": "rohan@098", "department": "Engineering"}
        ]

        for u_data in users_data:
            user = User.query.filter_by(email=u_data["email"]).first()
            if user:
                print(f"Updating password for {u_data['name']}")
                user.password_hash = hash_password(u_data["password"])
                user.role = u_data["role"] # Ensure role matches
            else:
                print(f"Creating user {u_data['name']}")
                new_user = User(
                    name=u_data["name"],
                    email=u_data["email"],
                    role=u_data["role"],
                    department=u_data["department"],
                    password_hash=hash_password(u_data["password"]),
                    risk="On Track",
                    risk_reason="Just started",
                    avatar=""
                )
                db.session.add(new_user)
        
        db.session.commit()
        print("Authentication Seeding Complete!")

if __name__ == "__main__":
    seed_auth()
