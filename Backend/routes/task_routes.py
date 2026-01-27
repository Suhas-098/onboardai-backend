from flask import Blueprint, request, jsonify
from models.task import Task
from config.db import db

task_routes = Blueprint("task_routes", __name__)

@task_routes.route("/tasks", methods=["POST"])
def create_task():
    data = request.json
    
    task = Task(
        title=data["title"],
        status="Pending"
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({"message": "Task Created Successfully"}), 201


@task_routes.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.all()
    
    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "status": t.status
        } for t in tasks
    ]), 200
