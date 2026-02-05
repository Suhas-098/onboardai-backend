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