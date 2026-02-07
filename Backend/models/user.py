from config.db import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(50))
    department = db.Column(db.String(100))
    joined_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    avatar = db.Column(db.String(255))
    risk = db.Column(db.String(50))  # On Track, At Risk, Delayed
    risk_reason = db.Column(db.String(255))
    password_hash = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "department": self.department,
            "joined_date": self.joined_date.strftime("%Y-%m-%d") if self.joined_date else None,
            "avatar": self.avatar,
            "risk": self.risk,
            "risk_reason": self.risk_reason
        }