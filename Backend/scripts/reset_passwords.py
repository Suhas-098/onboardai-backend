import sys
import os
from werkzeug.security import generate_password_hash

# Add parent directory to path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from config.db import db
from models.user import User

def reset_passwords():
    with app.app_context():
        print("Starting secure password reset...")
        users = User.query.all()
        
        for user in users:
            if user.role in ['admin', 'hr']:
                new_password = "09845"
            else:
                first_name = user.name.split()[0]
                new_password = f"{first_name}@098"
                
            # Use werkzeug security match auth_routes check_password_hash
            user.password_hash = generate_password_hash(new_password)
            print(f"Reset {user.role} password for {user.name} ({user.email}) -> raw: {new_password}")
            
        db.session.commit()
        print("Password reset successful!")

if __name__ == "__main__":
    reset_passwords()
