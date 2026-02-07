from flask import Blueprint, jsonify, request
from models.user import User
from models.progress import Progress
from models.task import Task
from models.activity_log import ActivityLog
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
    users = User.query.filter(User.role.ilike("employee") | User.role.ilike("intern")).all()
    results = []
    
    for user in users:
        # Defaults
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

        results.append({
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "dept": user.department,
            "avatar": user.avatar or "👤",
            "score": score_val,
            "risk": risk_val,
            "risk_message": risk_reason
        })

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
    logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).all()
    results = [log.to_dict() for log in logs]
    return jsonify(results)
