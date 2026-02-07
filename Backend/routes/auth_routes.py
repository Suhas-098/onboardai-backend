from flask import Blueprint, request, jsonify
from models.user import User
import jwt
import datetime
import bcrypt
from config.db import db

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"message": "Missing email or password"}), 400

        user = User.query.filter_by(email=data["email"]).first()

        if not user or not user.password_hash:
            return jsonify({"message": "Invalid credentials"}), 401

        if bcrypt.checkpw(data["password"].encode('utf-8'), user.password_hash.encode('utf-8')):
            # Generate JWT - sub must be string for PyJWT
            token = jwt.encode({
                "sub": str(user.id),
                "role": user.role,
                "name": user.name,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, "YOUR_SECRET_KEY_HERE", algorithm="HS256") # TODO: Move secret to env

            return jsonify({
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "department": user.department
                }
            })
        
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Login failed"}), 500
