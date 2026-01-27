from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress
from services.predictor import predict_risk

ai_dashboard_routes = Blueprint("ai_dashboard_routes", __name__)

@ai_dashboard_routes.route("/dashboard/ai-risk")
def ai_risk_dashboard():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()

        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)

        tasks_completed = len(progress_list)
        time_spent = 20  # mock value (we can improve later)

        prediction = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": tasks_completed,
            "time_spent": time_spent
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": avg_completion,
            "avg_delay_days": avg_delay,
            "ai_risk": prediction
        })

    return jsonify(results)
