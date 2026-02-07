from config.db import db
from datetime import datetime

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))  # Warning, Urgent, Info
    message = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    # Optional: Link to a specific user if the alert is targeted
    target_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    sender = db.Column(db.String(50), default="System") # System or HR Name

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "message": self.message,
            "time": self.created_at.strftime("%Y-%m-%d %H:%M"),
            "is_read": self.is_read,
            "target_user_id": self.target_user_id,
            "sender": self.sender
        }
