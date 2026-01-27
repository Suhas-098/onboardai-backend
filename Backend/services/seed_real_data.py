import sys
import os
import pandas as pd
from flask import Flask

# Add Backend root to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.db import db
from config.init_db import init_database
from models.user import User
from models.progress import Progress


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:ThunderGod098@localhost/onboardai"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

init_database(app)


def seed_real_data():
    df = pd.read_csv("services/onboarding_with_users.csv")

    with app.app_context():
        for _, row in df.iterrows():
            # Create user
            user = User.query.filter_by(email=row["email"]).first()

            if not user:
                user = User(
                    name=row["name"],
                    email=row["email"],
                    role="employee"
                )
                db.session.add(user)
                db.session.commit()

            # Create progress entry
            progress = Progress(
                user_id=user.id,
                task_id=1,
                completion=row["completion"],
                delay_days=row["delay_days"]
            )

            db.session.add(progress)

        db.session.commit()

    print("✅ Real employee data seeded successfully!")


if __name__ == "__main__":
    seed_real_data()
