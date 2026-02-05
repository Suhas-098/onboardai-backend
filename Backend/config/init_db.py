from config.db import db

def init_database(app):
    db.init_app(app)

    with app.app_context():
        from models.user import User
        from models.task import Task
        from models.progress import Progress
        from models.alert import Alert
        from models.activity_log import ActivityLog
        from models.employee_notification import EmployeeNotification
        from models.task_message import TaskMessage
        
        db.create_all()
