from flask import Blueprint, jsonify, request
from models.onboarding_template import OnboardingTemplate, TemplateTask
from models.user import User
from models.task import Task
from models.progress import Progress
from config.db import db
from datetime import datetime, timedelta
from utils.auth_guard import check_role

template_routes = Blueprint("template_routes", __name__)

# --- Template CRUD ---

@template_routes.route("/templates", methods=["POST"])
@check_role(["admin", "hr"])
def create_template():
    data = request.json
    name = data.get("name")
    tasks = data.get("tasks", [])
    current_user_id = getattr(request.current_user, 'id', None)

    if not name:
        return jsonify({"error": "Template name is required"}), 400

    new_template = OnboardingTemplate(
        name=name,
        created_by=current_user_id
    )
    db.session.add(new_template)
    db.session.flush() # get ID

    for t in tasks:
        new_task = TemplateTask(
            template_id=new_template.id,
            task_name=t["task_name"],
            description=t.get("description"),
            due_days=int(t.get("due_days", 3)),
            task_type=t.get("task_type", "Form")
        )
        db.session.add(new_task)

    db.session.commit()
    return jsonify({"message": "Template created", "template": new_template.to_dict()}), 201

@template_routes.route("/templates", methods=["GET"])
@check_role(["admin", "hr"])
def get_templates():
    templates = OnboardingTemplate.query.all()
    return jsonify([t.to_dict() for t in templates])

@template_routes.route("/templates/<int:template_id>", methods=["GET"])
@check_role(["admin", "hr"])
def get_template_detail(template_id):
    template = OnboardingTemplate.query.get_or_404(template_id)
    tasks = TemplateTask.query.filter_by(template_id=template.id).all()
    
    result = template.to_dict()
    result["tasks"] = [t.to_dict() for t in tasks]
    return jsonify(result)

@template_routes.route("/templates/<int:template_id>", methods=["DELETE"])
@check_role(["admin", "hr"])
def delete_template(template_id):
    template = OnboardingTemplate.query.get_or_404(template_id)
    # Tasks cascade delete usually, but let's be safe or rely on DB
    TemplateTask.query.filter_by(template_id=template.id).delete()
    db.session.delete(template)
    db.session.commit()
    return jsonify({"message": "Template deleted"})

@template_routes.route("/templates/<int:template_id>", methods=["PUT"])
@check_role(["admin", "hr"])
def update_template(template_id):
    template = OnboardingTemplate.query.get_or_404(template_id)
    data = request.json
    
    # Update Template Name
    if "name" in data:
        template.name = data["name"]
    
    # Handle Tasks
    if "tasks" in data:
        incoming_tasks = data["tasks"]
        incoming_ids = [t.get("id") for t in incoming_tasks if t.get("id")]
        
        # Delete removed tasks
        existing_tasks = TemplateTask.query.filter_by(template_id=template.id).all()
        for et in existing_tasks:
            if et.id not in incoming_ids:
                db.session.delete(et)
        
        # Update or Create tasks
        for t_data in incoming_tasks:
            if t_data.get("id"):
                # Update
                task = TemplateTask.query.get(t_data["id"])
                if task and task.template_id == template.id:
                    task.task_name = t_data.get("task_name", task.task_name)
                    task.description = t_data.get("description", task.description)
                    task.due_days = int(t_data.get("due_days", task.due_days))
                    task.task_type = t_data.get("task_type", task.task_type)
            else:
                # Create
                new_task = TemplateTask(
                    template_id=template.id,
                    task_name=t_data["task_name"],
                    description=t_data.get("description"),
                    due_days=int(t_data.get("due_days", 3)),
                    task_type=t_data.get("task_type", "Form")
                )
                db.session.add(new_task)

    db.session.commit()
    return jsonify({"message": "Template updated", "template": template.to_dict()})

# --- Assignment Logic ---

@template_routes.route("/employees/<int:user_id>/assign-template/<int:template_id>", methods=["POST"])
@check_role(["admin", "hr"])
def assign_template(user_id, template_id):
    user = User.query.get_or_404(user_id)
    template = OnboardingTemplate.query.get_or_404(template_id)
    template_tasks = TemplateTask.query.filter_by(template_id=template.id).all()

    if not template_tasks:
        return jsonify({"message": "Template has no tasks"}), 400

    created_tasks = []
    
    # Calculate start date (today or user joined date if very recent?)
    # Let's use today as assignment date
    start_date = datetime.now()

    for tt in template_tasks:
        due_date = start_date + timedelta(days=tt.due_days)
        
        new_task = Task(
            title=tt.task_name,
            description=tt.description,
            task_type=tt.task_type,
            status="Not Started",
            due_date=due_date,
            assigned_to=user.id
        )
        db.session.add(new_task)
        db.session.flush()
        
        # Initialize Progress
        new_progress = Progress(
            user_id=user.id,
            task_id=new_task.id,
            completion=0,
            status="Not Started"
        )
        db.session.add(new_progress)
        created_tasks.append(new_task.title)

    db.session.commit()
    
    return jsonify({
        "message": f"Assigned template '{template.name}' to {user.name}",
        "tasks_created": len(created_tasks)
    })
