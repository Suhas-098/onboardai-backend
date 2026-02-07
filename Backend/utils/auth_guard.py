from flask import request, jsonify
from functools import wraps
import jwt

SECRET_KEY = "YOUR_SECRET_KEY_HERE"

def check_role(allowed_roles):
    """
    Decorator to check if the user has one of the allowed roles.
    Now supports JWT authentication via Authorization header.
    Falls back to X-User-Id header for backward compatibility.
    
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
            user = None
            
            # Try JWT first
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                    from models.user import User
                    user = User.query.get(int(data['sub']))
                except jwt.ExpiredSignatureError:
                    return jsonify({"message": "Token has expired"}), 401
                except jwt.InvalidTokenError:
                    return jsonify({"message": "Invalid token"}), 401
                except Exception as e:
                    return jsonify({"message": f"Token error: {str(e)}"}), 401
            
            # Fallback to X-User-Id header for backward compatibility
            if not user:
                user_id = request.headers.get("X-User-Id")
                if user_id:
                    from models.user import User
                    user = User.query.get(user_id)
            
            if not user:
                return jsonify({"message": "Authentication required"}), 401
            
            # Case-insensitive role check
            user_role = user.role.lower() if user.role else ""
            allowed_roles_lower = [r.lower() for r in allowed_roles]
            
            if user_role not in allowed_roles_lower:
                return jsonify({
                    "message": f"Access denied. Required roles: {', '.join(allowed_roles)}"
                }), 403
            
            # Attach user to request for use in route
            request.current_user = user
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Keep backward compatibility
def admin_only():
    """Backward compatible wrapper for check_role(["admin"])"""
    return check_role(["admin"])
