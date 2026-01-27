from flask import Blueprint, jsonify
from models.user import User
from models.task import Task
from models.progress import Progress

dashboard_routes = Blueprint("dashboard_routes",__name__)

@dashboard_routes.route("/dashboard/summary")
def dashboard_summary():
    total_users = User.query.count()
    total_tasks = Task.query.count()
    total_progress = Progress.query.count()

    return jsonify({
        "total_users": total_users,
        "total_tasks": total_tasks,
        "progress_entries": total_progress
    })


@dashboard_routes.route("/dashboard/user-progress")
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
            "completion_percent": avg_completion
        })

    return jsonify(results)

