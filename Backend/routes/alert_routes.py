from flask import Blueprint, jsonify, request
from models.user import User
from models.alert import Alert
from config.db import db
from datetime import datetime

alert_routes = Blueprint("alert_routes", __name__)

@alert_routes.route("/alerts", methods=["GET"])
def get_alerts():
    # 1. Fetch Persisted Alerts from DB
    db_alerts = Alert.query.order_by(Alert.created_at.desc()).all()
    results = [alert.to_dict() for alert in db_alerts]

    # 3. Missed Deadline Alerts
    from models.task import Task
    overdue_tasks = Task.query.filter(
        Task.status.ilike("Pending"),
        Task.due_date < datetime.now()
    ).all()
    
    for task in overdue_tasks:
        user = User.query.get(task.assigned_to)
        results.append({
            "id": f"overdue_{task.id}",
            "level": "Warning",
            "title": "Missed Deadline",
            "time": "Overdue",
            "desc": f"Employee {user.name if user else 'Unknown'} missed deadline for: {task.title}.",
            "target_user_id": task.assigned_to
        })
    
    return jsonify(results)

@alert_routes.route("/alerts", methods=["POST"])
def create_alert():
    data = request.json
    target_user_id = data.get("target_user_id")
    alert_type = data.get("type", "Info")
    message = data.get("message")
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    new_alert = Alert(
        type=alert_type,
        message=message,
        target_user_id=target_user_id,
        sender="HR Admin" # Hardcoded for now, could use auth user
    )
    
    db.session.add(new_alert)
    
    # Enhanced: Also log to EmployeeNotification for the user dashboard
    from models.employee_notification import EmployeeNotification
    
    # Map alert type to notification type
    notif_type = "info"
    if alert_type.lower() in ["critical", "warning"]:
        notif_type = "warning"
        
    new_notif = EmployeeNotification(
        user_id=target_user_id,
        message=message,
        type=notif_type,
        is_read=False
    )
    db.session.add(new_notif)
    
    db.session.commit()
    
    print(f"Reminder sent to user {target_user_id}: {message}") # Console log requirement
    
    return jsonify({"message": "Alert sent successfully", "alert": new_alert.to_dict()}), 201
