from config.db import db

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))
    completion = db.Column(db.Integer)  # 0-100
    delay_days = db.Column(db.Integer, default=0)
    time_spent = db.Column(db.Integer, default=0)  # minutes
    completed_at = db.Column(db.DateTime, nullable=True)