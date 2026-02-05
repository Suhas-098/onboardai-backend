from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress
from services.predictor import predict_risk
from utils.auth_guard import check_role

employee_routes = Blueprint("employee_routes", __name__)

@employee_routes.route("/employees", methods=["GET"])
@check_role(["admin", "hr"])
def get_all_employees():
    # Only fetch users with role 'employee'
    users = User.query.filter(User.role.ilike("employee")).all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        
        avg_completion = 0
        if progress_list:
            avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        
        results.append({
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "dept": user.department,
            "avatar": user.avatar or "👤",
            "progress": round(avg_completion, 1),
            "risk": user.risk or "On Track",  
            "riskReason": user.risk_reason
        })

    return jsonify(results)

@employee_routes.route("/employees/<int:user_id>", methods=["GET"])
@check_role(["admin", "hr"])
def get_employee_detail(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Logic similar to list, but detailed... 
    # For now, simplistic implementation to satisfy contract
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "department": user.department,
        "role": user.role
    })
