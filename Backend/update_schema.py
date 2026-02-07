from app import app
from config.db import db
from sqlalchemy import text

def update_schema():
    with app.app_context():
        print("Checking/Updating Schema...")
        try:
            # Try to query the column to see if it exists
            db.session.execute(text("SELECT password_hash FROM \"user\" LIMIT 1"))
            print("Column 'password_hash' already exists.")
        except Exception:
            print("Column 'password_hash' missing. Adding it...")
            db.session.rollback() # Clear the error
            try:
                db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN password_hash VARCHAR(255)"))
                db.session.commit()
                print("Column added successfully.")
            except Exception as e:
                print(f"Failed to add column: {e}")

if __name__ == "__main__":
    update_schema()
