"""
Script to drop and recreate database tables.
Run this to reset the database and apply the latest schema changes.
"""
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from config.db import db

def reset_database():
    with app.app_context():
        print("🗑️  Dropping all tables...")
        db.drop_all()
        print("✅ Tables dropped")
        
        print("🛠️  Creating new tables with updated schema...")
        db.create_all()
        print("✅ Tables created")
        
        print("\n✨ Database reset complete! Restart the server to create test users.")

if __name__ == "__main__":
    reset_database()
