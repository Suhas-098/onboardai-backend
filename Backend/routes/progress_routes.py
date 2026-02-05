from flask import Blueprint, request, jsonify
from models.progress import Progress
from config.db import db

progress_routes = Blueprint("progress_routes", __name__)

@progress_routes.route("/progress", methods=["POST"])
def update_progress():
    data = request.json
    
    progress = Progress(
        user_id=data["user_id"],
        task_id=data["task_id"],
        completion=data["completion"],
        delay_days=data.get("delay_days", 0)
    )
    
    db.session.add(progress)
    db.session.commit()
    
    return jsonify({"message": "Progress recorded"}), 201


@progress_routes.route("/progress", methods=["GET"])
def get_progress():
    progress_list = Progress.query.all()
    
    return jsonify([
        {
            "user_id": p.user_id,
            "task_id": p.task_id,
            "completion": p.completion,
            "delay_days": p.delay_days
        }
        for p in progress_list
    ]), 200
@progress_routes.route("/progress/user/<int:user_id>", methods=["GET"])
def get_user_progress(user_id):
    from models.task import Task
    
    # Get all tasks
    tasks = Task.query.all()
    results = []
    
    for task in tasks:
        # Find progress for this task and user
        progress = Progress.query.filter_by(user_id=user_id, task_id=task.id).first()
        
        status = "pending"
        if progress and progress.completion == 100:
            status = "completed"
        elif progress and progress.completion > 0:
            status = "in-progress"
            
        results.append({
            "id": task.id,
            "title": task.title,
            "type": task.task_type,
            "due": task.due_date.strftime("%Y-%m-%d") if task.due_date else "No Date",
            "status": status,
            "completion": progress.completion if progress else 0
        })
        
    return jsonify(results)
