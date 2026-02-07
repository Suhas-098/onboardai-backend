from flask import Blueprint, request, jsonify
from models.task import Task
from models.user import User

search_routes = Blueprint('search_routes', __name__)

@search_routes.route('/search', methods=['GET'])
def search():
    scope = request.args.get('scope') # 'employee' or 'admin'
    query = request.args.get('query', '').lower()
    user_id = request.args.get('user_id')

    if not query:
        return jsonify([]), 200

    results = []

    if scope == 'employee' and user_id:
        # Search Tasks for this user
        tasks = Task.query.filter(Task.assigned_to == user_id).all()
        for task in tasks:
            if query in task.description.lower() or query in task.status.lower():
                results.append({
                    "id": task.id,
                    "type": "Task",
                    "title": task.description,
                    "status": task.status,
                    "dueDate": task.due_date.strftime("%Y-%m-%d") if task.due_date else "N/A"
                })
        
        # Add static training docs/videos if they match
        trainings = [
            {"title": "Company Culture 101", "type": "Training"},
            {"title": "Cybersecurity Basics", "type": "Training"},
            {"title": "IT Setup Guide", "type": "Document"}
        ]
        for t in trainings:
            if query in t['title'].lower():
                results.append(t)

    elif scope == 'admin':
        # Admin search logic (Employees, Risks, etc.)
        employees = User.query.filter_by(role='employee').all()
        for emp in employees:
            if query in emp.name.lower():
                results.append({
                    "id": emp.id,
                    "type": "Employee",
                    "title": emp.name,
                    "subtitle": emp.role
                })

    return jsonify(results), 200
