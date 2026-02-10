from flask import Blueprint, jsonify, request
from datetime import datetime
from models.user import User
from models.progress import Progress
from models.task import Task
from models.activity_log import ActivityLog
from models.employee_notification import EmployeeNotification
from config.db import db
from services.predictor import analyze_employee_risk
from utils.auth_guard import check_role

employee_routes = Blueprint("employee_routes", __name__)

def get_current_user_role():
    if hasattr(request, 'current_user') and request.current_user:
        return request.current_user.role.lower()
    return None

from middleware.auth_middleware import token_required

@employee_routes.route("/employees", methods=["GET"])
@token_required
def get_all_employees():
    requester_role = get_current_user_role()
    
    # Base query for employees/interns
    query = User.query.filter(User.role.ilike("employee") | User.role.ilike("intern"))
    
    # If HR/Admin, fetch performance stats efficiently
    if requester_role in ["hr", "hr_admin", "admin"]:
        from sqlalchemy import func, case
        from config.db import db
        
        # Join with Progress to aggregate data
        # output: (User, total_completion, total_delay_days, total_tasks, missed_count)
        results = db.session.query(
            User,
            func.coalesce(func.sum(Progress.completion), 0).label('total_completion'),
            func.coalesce(func.sum(Progress.delay_days), 0).label('total_delay'),
            func.count(Progress.id).label('task_count'),
            func.sum(case((Progress.delay_days > 0, 1), else_=0)).label('missed_count')
        ).outerjoin(Progress, User.id == Progress.user_id)\
         .filter(User.role.ilike("employee") | User.role.ilike("intern"))\
         .group_by(User.id).all()

        response_data = []
        for user, total_comp, total_delay, count, missed in results:
            completion_avg = 0
            if count > 0:
                completion_avg = total_comp / count
            
            # Dynamic Risk Analysis
            analysis = analyze_employee_risk({
                "completion": completion_avg,
                "delay_days": total_delay,
                "missed_deadlines": missed or 0
            })

            response_data.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "dept": user.department,
                "avatar": user.avatar or "👤",
                "score": round(completion_avg, 1),
                "progress": round(completion_avg, 1),
                "risk": analysis["risk_level"],
                "risk_message": analysis["message"]
            })
        return jsonify(response_data)

    # For standard users, just return basic info
    users = query.all()
    results = [{
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "dept": user.department,
        "avatar": user.avatar or "👤",
        "score": None,
        "risk": None,
        "risk_message": None
    } for user in users]

    return jsonify(results)

@employee_routes.route("/employees/<int:user_id>", methods=["GET"])
@token_required
def get_employee_detail(user_id):
    requester_role = get_current_user_role()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    score_val = None
    risk_val = None
    risk_reason = None
    
    # Calculate for HR/Admin/HR_Admin
    if requester_role in ["hr", "hr_admin", "admin"]:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        
        total_items = len(progress_list)
        completion = 0
        delay_days = 0
        missed = 0
        
        if total_items > 0:
            completion = sum(p.completion or 0 for p in progress_list) / total_items
            delay_days = sum(p.delay_days or 0 for p in progress_list)
            missed = sum(1 for p in progress_list if (p.delay_days or 0) > 0)
        
        score_val = round(completion, 1)
        
        # Dynamic Risk Analysis
        analysis = analyze_employee_risk({
            "completion": completion,
            "delay_days": delay_days,
            "missed_deadlines": missed
        })
        
        risk_val = analysis["risk_level"]
        risk_reason = analysis["message"]

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "joinedDate": user.joined_date.strftime("%b %d, %Y") if user.joined_date else "N/A",
        "avatar": user.avatar or "👤",
        "score": score_val,
        "risk": risk_val,
        "risk_message": risk_reason,
        "status": risk_val if risk_val else "Active"
    })

@employee_routes.route("/employees/<int:user_id>/tasks", methods=["GET"])
@token_required
def get_employee_tasks(user_id):
    requester_role = get_current_user_role()
    
    if requester_role == "employee":
        if hasattr(request, 'current_user') and request.current_user.id != user_id:
             return jsonify({"error": "Access denied"}), 403

    tasks = Task.query.filter_by(assigned_to=user_id).all()
    results = []
    
    for t in tasks:
        prog = Progress.query.filter_by(user_id=user_id, task_id=t.id).first()
        
        completion_status = "Pending"
        completed_at = "-"
        time_spent = "-"
        
        if prog:
            if prog.completion == 100:
                completion_status = "Completed"
                if prog.completed_at:
                    completed_at = prog.completed_at.strftime("%b %d")
            elif prog.completion > 0:
                completion_status = "In Progress"
            
            if prog.time_spent:
                time_spent = f"{prog.time_spent} min"

        results.append({
            "id": t.id,
            "name": t.title,
            "status": completion_status,
            "dueDate": t.due_date.strftime("%b %d") if t.due_date else "-",
            "dueDateRaw": t.due_date.isoformat() if t.due_date else None,
            "completedAt": completed_at,
            "timeSpent": time_spent
        })
        
    return jsonify(results)

@employee_routes.route("/employees/<int:user_id>/activity", methods=["GET"])
@token_required
def get_employee_activity(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Employee not found"}), 404
        
        logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).all()
        results = []
        for log in logs:
            results.append({
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else None,
                "details": log.details
            })
        return jsonify(results)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@employee_routes.route("/employees/<int:user_id>/send-alert", methods=["POST"])
@check_role(["admin", "hr"])
def send_employee_alert(user_id):
    data = request.json
    message = data.get("message", "Missed critical deadline — please complete your pending tasks ASAP.")
    
    # Create In-App Notification
    notification = EmployeeNotification(
        user_id=user_id,
        type="in_app_alert",
        message=message,
        created_at=datetime.now()
    )
    db.session.add(notification)
    
    # Log Activity
    log = ActivityLog(
        user_id=user_id,
        action="In-App Alert Sent",
        timestamp=datetime.now(),
        details=f"Message: {message}"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"message": "Alert sent successfully"}), 200

@employee_routes.route("/employees/<int:user_id>/send-email", methods=["POST"])
@check_role(["admin", "hr"])
def send_employee_email(user_id):
    import os
    import threading
    import requests as http_requests
    
    user = User.query.get(user_id)
    if not user or not user.email:
         return jsonify({"error": "User email not found"}), 404

    data = request.json
    subject = data.get("subject", "Missed critical deadline — action required")
    body_html = data.get("html", f"<p>Dear {user.name},</p><p>This is a reminder that you have missed a critical onboarding deadline.</p>")
    
    try:
        api_key = os.environ.get("RESEND_API_KEY")
        if not api_key:
            return jsonify({"error": "Server configuration error: Missing API Key"}), 500
            
        # Log in DB immediately
        notification = EmployeeNotification(
            user_id=user_id,
            type="email",
            message=f"Subject: {subject}",
            created_at=datetime.now()
        )
        db.session.add(notification)
        
        log = ActivityLog(
            user_id=user_id,
            action="Email Sent via Resend",
            timestamp=datetime.now(),
            details=f"Sent to {user.email}"
        )
        db.session.add(log)
        db.session.commit()
        
        # Send Email in Background Thread to avoid blocking
        def send_async_email(key, to_email, subj, content):
            try:
                http_requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "onboarding@resend.dev",
                        "to": [to_email],
                        "subject": subj,
                        "html": content
                    },
                    timeout=15
                )
            except Exception as e:
                print(f"[Resend] Email to {to_email} failed: {e}")

        thread = threading.Thread(target=send_async_email, args=(api_key, user.email, subject, body_html))
        thread.start()
        
        return jsonify({"message": "Email sent successfully via Resend"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500
