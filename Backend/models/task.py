from config.db import db 

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250))
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default="Not Started")
    due_date = db.Column(db.DateTime)
    task_type = db.Column(db.String(50))  # video, form, upload
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))