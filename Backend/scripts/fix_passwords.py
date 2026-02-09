from app import app
from config.db import db
from models.user import User
from werkzeug.security import generate_password_hash

def fix_passwords():
    with app.app_context():
        print("🔧 Checking all users for password updates...")
        users = User.query.all()
        updated_count = 0
        
        admin_hash = generate_password_hash("09845")
        emp_hash = generate_password_hash("098765432")
        
        for user in users:
            should_update = False
            if not user.password_hash:
                print(f"⚠️ User {user.email} has NO password. Updating...")
                should_update = True
            elif user.password_hash == "temp": # If there were temp passwords
                should_update = True
            
            # Force update to ensure new hash method is applied if requested, 
            # but usually only if missing. 
            # However, User requested "Assigns hashed passwords to ALL existing users", 
            # implying a reset to known defaults.
            should_update = True 
            
            if should_update:
                if user.role in ["admin", "hr", "hr_admin"]:
                    user.password_hash = admin_hash
                else:
                    user.password_hash = emp_hash
                updated_count += 1
        
        db.session.commit()
        print(f"✅ Updated passwords for {updated_count} users.")

if __name__ == "__main__":
    fix_passwords()
