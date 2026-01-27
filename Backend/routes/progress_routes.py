from flask import Blueprint, request, jsonify
from models.progress import Progress
from config.db import db

progress_routes = Blueprint("progress_routes", __name__)

@progress_routes.route("/progress", methods=["POST"])
def update_progress():
    data = request.json
    
    progress = Progress(
        user_id=data["user_id"],
        task_id=data["task_id"],
        completion=data["completion"],
        delay_days=data.get("delay_days", 0)
    )
    
    db.session.add(progress)
    db.session.commit()
    
    return jsonify({"message": "Progress recorded"}), 201


@progress_routes.route("/progress", methods=["GET"])
def get_progress():
    progress_list = Progress.query.all()
    
    return jsonify([
        {
            "user_id": p.user_id,
            "task_id": p.task_id,
            "completion": p.completion,
            "delay_days": p.delay_days
        }
        for p in progress_list
    ]), 200
