from flask import Blueprint, request, jsonify
from config.init_db import db
from models.employee_notification import EmployeeNotification
from models.task_message import TaskMessage
from datetime import datetime

notification_routes = Blueprint('notification_routes', __name__)

@notification_routes.route('/notifications', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
        
    notifications = EmployeeNotification.query.filter_by(user_id=user_id).order_by(EmployeeNotification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@notification_routes.route('/notifications', methods=['POST'])
def create_notification():
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    type = data.get('type', 'info')
    related_task_id = data.get('related_task_id')
    
    if not user_id or not message:
        return jsonify({"error": "Missing fields"}), 400

    # Create Notification
    notification = EmployeeNotification(
        user_id=user_id,
        message=message,
        type=type,
        related_task_id=related_task_id
    )
    db.session.add(notification)
    
    # If it's a task warning, also add to TaskMessages
    if related_task_id:
        task_msg = TaskMessage(
            user_id=user_id,
            task_id=related_task_id,
            sender="HR",
            message=message
        )
        db.session.add(task_msg)

    db.session.commit()
    return jsonify(notification.to_dict()), 201

@notification_routes.route('/notifications/<int:id>/read', methods=['PUT'])
def mark_read(id):
    notification = EmployeeNotification.query.get(id)
    if not notification:
        return jsonify({"error": "Not found"}), 404
        
    notification.is_read = True
    db.session.commit()
    return jsonify({"success": True}), 200
