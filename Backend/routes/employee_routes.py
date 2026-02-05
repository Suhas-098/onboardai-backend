from flask import Blueprint, jsonify, request
from models.user import User
from models.progress import Progress
from models.task import Task
from models.activity_log import ActivityLog
from services.predictor import predict_risk
from utils.auth_guard import check_role

employee_routes = Blueprint("employee_routes", __name__)

def get_current_user_role():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    user = User.query.get(user_id)
    return user.role.lower() if user else None

@employee_routes.route("/employees", methods=["GET"])
@check_role(["admin", "hr"])
def get_all_employees():
    requester_role = get_current_user_role()
    users = User.query.filter(User.role.ilike("employee")).all()
    results = []

    for user in users:
        # Defaults for restricted view
        progress_val = None
        risk_val = None
        risk_reason = None
        
        # Admin gets limited view (Name, Role, Dept, Status)
        # HR gets full view
        if requester_role == "hr":
            progress_list = Progress.query.filter_by(user_id=user.id).all()
            avg_completion = 0
            if progress_list:
                avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
            
            progress_val = round(avg_completion, 1)
            risk_val = user.risk or "On Track"
            risk_reason = user.risk_reason

        results.append({
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "dept": user.department,
            "avatar": user.avatar or "👤",
            "progress": progress_val, # Null for admin
            "risk": risk_val,         # Null for admin
            "riskReason": risk_reason # Null for admin
        })

    return jsonify(results)

@employee_routes.route("/employees/<int:user_id>", methods=["GET"])
@check_role(["admin", "hr"])
def get_employee_detail(user_id):
    requester_role = get_current_user_role()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Defaults
    progress_val = None
    risk_val = None
    risk_reason = None
    
    if requester_role == "hr":
        # Calculate stats for HR
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        avg_completion = 0
        if progress_list:
            avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        progress_val = round(avg_completion, 1)
        risk_val = user.risk or "On Track"
        risk_reason = user.risk_reason

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "joinedDate": user.joined_date.strftime("%b %d, %Y") if user.joined_date else "N/A",
        "avatar": user.avatar or "👤",
        "progress": progress_val,
        "risk": risk_val,
        "riskReason": risk_reason,
        "status": risk_val if risk_val else "Active" # Admin sees generic status
    })

@employee_routes.route("/employees/<int:user_id>/tasks", methods=["GET"])
@check_role(["hr", "employee"]) # REMOVED ADMIN
def get_employee_tasks(user_id):
    # Security check: if role is employee, ensure they match user_id
    requester_id = request.headers.get("X-User-Id")
    requester_role = get_current_user_role()
    
    if requester_role == "employee" and str(requester_id) != str(user_id):
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
            "completedAt": completed_at,
            "timeSpent": time_spent
        })
        
    return jsonify(results)

@employee_routes.route("/employees/<int:user_id>/activity", methods=["GET"])
@check_role(["hr"]) # REMOVED ADMIN
def get_employee_activity(user_id):
    logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).all()
    results = [log.to_dict() for log in logs]
    return jsonify(results)
