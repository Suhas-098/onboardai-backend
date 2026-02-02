from flask import request, jsonify

def admin_only():
    def decorator(func):
        def wrapper(*args, **kwargs):
            role = request.headers.get("X-Role")
            if role != "admin":
                return jsonify({"message": "Admin access required"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator
