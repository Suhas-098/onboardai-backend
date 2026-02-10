from flask import Blueprint, request, jsonify, current_app
from models.user import User
import jwt
import datetime
import bcrypt
from werkzeug.security import check_password_hash
from config.db import db

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"message": "Missing email or password"}), 400

        user = User.query.filter_by(email=data["email"]).first()

        # Debug logs
        print(f"Login attempt for: {data['email']}")
        
        if not user:
             print("User not found.")
             return jsonify({"message": "Invalid credentials"}), 401
             
        if not user.password_hash:
            print("ERROR: User has no password set.")
            return jsonify({"message": "Account setup incomplete. Contact Admin."}), 403

        # Verify password using bcrypt (matching seed_auth.py)
        # Handle cases where password_hash might be string or bytes
        stored_hash = user.password_hash
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')
            
        if bcrypt.checkpw(data["password"].encode('utf-8'), stored_hash):
            print("Password verified.")
            # Generate JWT
            token = jwt.encode({
                "sub": str(user.id),
                "role": user.role,
                "name": user.name,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm="HS256")
            
            print("JWT issued.")

            return jsonify({
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "department": user.department,
                    "email": user.email,
                    "avatar": user.avatar
                }
            })
        
        print("Password mismatch.")
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"message": "Login failed"}), 500
