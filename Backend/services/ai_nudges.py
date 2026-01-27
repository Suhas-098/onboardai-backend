from models.user import User
from models.progress import Progress
from services.predictor import predict_risk


def generate_ai_nudges():
    users = User.query.all()
    alerts = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()

        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)
        tasks_completed = len(progress_list)
        time_spent = 20  # mock value

        risk = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": tasks_completed,
            "time_spent": time_spent
        })

        if risk in ["At Risk", "Delayed"]:
            alerts.append({
                "user_id": user.id,
                "name": user.name,
                "risk": risk,
                "message": f"⚠️ Alert: {user.name} is {risk}. HR intervention recommended."
            })

    return alerts
