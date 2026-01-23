from config.db import db

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    task_id = db.Column(db.Integer)
    completion = db.Column(db.Integer)
    delay_days = db.Column(db.Integer)