from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress

risk_routes = Blueprint("risk_routes", __name__)

@risk_routes.route("/risks", methods=["GET"])
def get_all_risks():
    """Returns a list of all employees and their risk levels."""
    users = User.query.filter(User.role.ilike("employee")).all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        
        avg_completion = 0
        if progress_list:
            avg_completion = sum(p.completion for p in progress_list) / len(progress_list)

        results.append({
            "user_id": user.id,
            "name": user.name,
            "risk": user.risk or "On Track", 
            "score": round(avg_completion, 1)
        })

    return jsonify(results)

@risk_routes.route("/risks/stats", methods=["GET"])
def get_risk_stats():
    """Returns aggregated risk statistics."""
    users = User.query.filter(User.role.ilike("employee")).all()
    
    stats = {
        "total_users": len(users),
        "on_track": 0,
        "at_risk": 0,
        "delayed": 0
    }
    
    for user in users:
        risk = (user.risk or "On Track").lower()
        if risk == "on track":
            stats["on_track"] += 1
        elif risk == "at risk":
            stats["at_risk"] += 1
        elif risk == "delayed":
            stats["delayed"] += 1
            
    return jsonify(stats)
