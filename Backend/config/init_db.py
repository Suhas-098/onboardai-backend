from config.db import db

def init_database(app):
    db.init_app(app)

    with app.app_context():
        from models.user import User
        from models.task import Task
        from models.progress import Progress
        
        db.create_all()
