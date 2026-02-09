from config.db import db
from datetime import datetime

class OnboardingTemplate(db.Model):
    __tablename__ = 'onboarding_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tasks = db.relationship('TemplateTask', backref='template', cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_by": self.created_by,
            "created_at": self.created_at.strftime("%Y-%m-%d"),
            "task_count": len(self.tasks)
        }

class TemplateTask(db.Model):
    __tablename__ = 'template_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('onboarding_templates.id'), nullable=False)
    task_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    due_days = db.Column(db.Integer, default=3) # Days after assignment
    task_type = db.Column(db.String(50), default="Form") # Form, Video, Document

    def to_dict(self):
        return {
            "id": self.id,
            "template_id": self.template_id,
            "task_name": self.task_name,
            "description": self.description,
            "due_days": self.due_days,
            "task_type": self.task_type
        }
