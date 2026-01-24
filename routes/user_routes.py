from flask import Blueprint, request, jsonify
from models.user import User
from config.db import db

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/users", methods=["POST"])
def create_user():
    data = request.json
    
    user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"]
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201


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
