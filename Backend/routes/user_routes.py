from flask import Blueprint, request, jsonify
from models.user import User
from config.db import db
from utils.auth_guard import check_role

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/users", methods=["POST"])
@check_role(["admin", "hr"])
def create_user():
    """Create a new user (employee). Only accessible by admin/hr."""
    data = request.json
    
    user = User(
        name=data.get("name"),
        email=data.get("email"),
        role=data.get("role", "employee"),
        department=data.get("department")
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }), 201


@user_routes.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    
    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role
        } for u in users
    ])
