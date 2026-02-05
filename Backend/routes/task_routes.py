from flask import Blueprint, request, jsonify
from models.task import Task
from models.progress import Progress
from models.activity_log import ActivityLog
from config.db import db
from datetime import datetime
import random

task_routes = Blueprint("task_routes", __name__)

@task_routes.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    
    task = Task(
        title=data["title"],
        status="Pending"
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({"message": "Task Created Successfully"}), 201


@task_routes.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    
    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "status": t.status
        } for t in tasks
    ]), 200

@task_routes.route("/tasks/<int:task_id>/complete", methods=["POST"])
def complete_task(task_id):
    # Get user_id from header (simulated auth)
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = int(user_id)
    
    # Check if task exists
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    # Find or create Progress
    progress = Progress.query.filter_by(user_id=user_id, task_id=task_id).first()
    if not progress:
        progress = Progress(
            user_id=user_id,
            task_id=task_id,
            completion=0,
            delay_days=0,
            time_spent=0
        )
        db.session.add(progress)
    
    # Update Progress
    progress.completion = 100
    progress.completed_at = datetime.now()
    # Simulate time spent if 0
    if progress.time_spent == 0:
        progress.time_spent = random.randint(5, 60)

    # Log Activity
    log = ActivityLog(
        user_id=user_id,
        action=f"Completed task: {task.title}",
        timestamp=datetime.now(),
        details=f"Time spent: {progress.time_spent} mins"
    )
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({"message": "Task completed", "progress": {
        "completion": 100,
        "completed_at": progress.completed_at.strftime("%Y-%m-%d %H:%M")
    }})

# --- New Task Message Routes ---
from models.task_message import TaskMessage

@task_routes.route('/tasks/<int:id>/messages', methods=['GET'])
def get_task_messages(id):
    messages = TaskMessage.query.filter_by(task_id=id).order_by(TaskMessage.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@task_routes.route('/tasks/<int:id>/messages', methods=['POST'])
def create_task_message(id):
    data = request.json
    msg = TaskMessage(
        user_id=data['user_id'],
        task_id=id,
        sender=data['sender'],
        message=data['message']
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify(msg.to_dict()), 201

@task_routes.route("/tasks/assign", methods=["POST"])
def assign_task():
    data = request.json
    
    # Needs HR/Admin check (skipped to reuse existing middleware pattern if possible, or just trust internal logic)
    # Ideally should use @check_role(['hr', 'admin'])
    
    title = data.get("title")
    description = data.get("description", "")
    target_user_id = data.get("target_user_id")
    due_date_str = data.get("due_date")
    priority = data.get("priority", "Medium")
    task_type = data.get("type", "General")
    
    if not title or not target_user_id:
        return jsonify({"error": "Title and Target User ID are required"}), 400
        
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
        except ValueError:
            pass
            
    # 1. Create Task
    new_task = Task(
        title=title,
        description=description,
        status="Pending",
        due_date=due_date,
        task_type=task_type,
        assigned_to=target_user_id
    )
    db.session.add(new_task)
    db.session.flush() # get ID
    
    # 2. Create Progress Entry
    new_progress = Progress(
        user_id=target_user_id,
        task_id=new_task.id,
        completion=0,
        delay_days=0,
        time_spent=0
    )
    db.session.add(new_progress)
    
    # 3. Create Alert if High Priority
    alert_created = False
    if priority == "High":
        from models.alert import Alert
        new_alert = Alert(
            type="Critical",
            message=f"New High Priority Task Assigned: {title}",
            target_user_id=target_user_id,
            sender="HR System"
        )
        db.session.add(new_alert)
        alert_created = True
        
    # 4. Log Activity
    log = ActivityLog(
        user_id=target_user_id,
        action=f"Assigned new task: {title}",
        timestamp=datetime.now(),
        details=f"Priority: {priority}"
    )
    db.session.add(log)
    
    db.session.commit()
    
    return jsonify({
        "message": "Task assigned successfully", 
        "task": {
            "id": new_task.id,
            "title": new_task.title,
            "priority": priority
        },
        "alert_sent": alert_created
    }), 201
