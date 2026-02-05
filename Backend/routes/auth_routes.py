from flask import Blueprint, request, jsonify
from models.user import User

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "user_id": user.id,
        "name": user.name,
        "role": user.role
    })
