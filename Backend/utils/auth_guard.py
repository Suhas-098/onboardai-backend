from flask import request, jsonify
from functools import wraps

def check_role(allowed_roles):
    """
    Decorator to check if the user has one of the allowed roles.
    Verifies role by fetching user from database using X-User-Id header.
    
    Args:
        allowed_roles: List of role strings that are allowed to access this route
    
    Example:
        @check_role(["admin", "hr"])
        def create_user():
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_id = request.headers.get("X-User-Id")
            
            if not user_id:
                return jsonify({"message": "Authentication required"}), 401
            
            # Import here to avoid circular dependency
            from models.user import User
            
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({"message": "User not found"}), 401
            
            if user.role not in allowed_roles:
                return jsonify({
                    "message": f"Access denied. Required roles: {', '.join(allowed_roles)}"
                }), 403
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Keep backward compatibility
def admin_only():
    """Backward compatible wrapper for check_role(["admin"])"""
    return check_role(["admin"])
