from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress
from services.predictor import predict_risk
from services.ai_explainer import explain_risk

ai_explain_routes = Blueprint("ai_explain_routes", __name__)

@ai_explain_routes.route("/dashboard/ai-explanations", methods=["GET"])
def ai_explanations():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()

        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)

        tasks_completed = len(progress_list)
        time_spent = 20

        prediction = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": tasks_completed,
            "time_spent": time_spent
        })

        reasons = explain_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": tasks_completed
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2),
            "delay_days": round(avg_delay, 2),
            "risk": prediction,
            "reasons": reasons
        })

    return jsonify(results)
