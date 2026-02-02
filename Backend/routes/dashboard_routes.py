from flask import Blueprint, jsonify
from models.user import User
from models.task import Task
from models.progress import Progress
from services.predictor import predict_risk
from services.ai_explainer import explain_risk

dashboard_routes = Blueprint("dashboard_routes", __name__)

# -------------------------------------------------
# 1️⃣ DASHBOARD SUMMARY (AI-AWARE)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/summary", methods=["GET"])
def dashboard_summary():
    users = User.query.all()

    summary = {
        "total_users": 0,
        "on_track": 0,
        "at_risk": 0,
        "delayed": 0
    }

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)

        risk = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list),
            "time_spent": 20  # mocked for now
        })

        summary["total_users"] += 1

        if risk == "On Track":
            summary["on_track"] += 1
        elif risk == "At Risk":
            summary["at_risk"] += 1
        elif risk == "Delayed":
            summary["delayed"] += 1

    return jsonify(summary)

# -------------------------------------------------
# 2️⃣ USER PROGRESS (BASIC)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/user-progress", methods=["GET"])
def user_progress():
    users = User.query.all()
    results = []

    for user in users:
        user_progress = Progress.query.filter_by(user_id=user.id).all()

        if user_progress:
            avg_completion = sum(p.completion for p in user_progress) / len(user_progress)
        else:
            avg_completion = 0

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2)
        })

    return jsonify(results)

# -------------------------------------------------
# 3️⃣ AI RISK PER USER
# -------------------------------------------------
@dashboard_routes.route("/dashboard/ai-risk", methods=["GET"])
def dashboard_ai_risk():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)

        prediction = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list),
            "time_spent": 20
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2),
            "avg_delay_days": round(avg_delay, 2),
            "ai_risk": prediction
        })

    return jsonify(results)

# -------------------------------------------------
# 4️⃣ EXPLAINABLE AI (WHY AT RISK?)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/ai-explanations", methods=["GET"])
def dashboard_ai_explanations():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)

        risk = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list),
            "time_spent": 20
        })

        reasons = explain_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list)
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2),
            "delay_days": round(avg_delay, 2),
            "risk": risk,
            "reasons": reasons
        })

    return jsonify(results)
