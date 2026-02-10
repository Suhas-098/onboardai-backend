from flask import Blueprint, jsonify, request
from models.user import User
from models.activity_log import ActivityLog
from models.employee_notification import EmployeeNotification
from utils.auth_guard import check_role
from datetime import datetime
from sqlalchemy import desc

admin_routes = Blueprint("admin_routes", __name__)

# -------------------------------------------------
# 1️⃣ GET ADMIN ACTIVITY LOG
# -------------------------------------------------
@admin_routes.route("/admin/activity", methods=["GET"])
@check_role(["admin", "hr"])
def get_admin_activity():
    """Get all activity logs visible to admin (all employees' activities)"""
    try:
        # Get current authenticated user
        current_user = request.current_user
        
        # Get all activity logs ordered by timestamp (most recent first)
        logs = ActivityLog.query.order_by(desc(ActivityLog.timestamp)).all()
        
        results = []
        for log in logs:
            # Get user info to include in response
            user = User.query.get(log.user_id)
            user_name = user.name if user else "Unknown"
            
            results.append({
                "id": log.id,
                "user_id": log.user_id,
                "user_name": user_name,
                "action": log.action or "Unknown Action",
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else None,
                "details": log.details or None
            })
        
        return jsonify({
            "admin_id": current_user.id,
            "admin_name": current_user.name,
            "total_activities": len(results),
            "activities": results
        }), 200
    except Exception as e:
        import traceback
        print(f"Error fetching admin activity: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# -------------------------------------------------
# 2️⃣ GET AUDIT LOGS
# -------------------------------------------------
@admin_routes.route("/admin/audit-logs", methods=["GET"])
@check_role(["admin", "hr"])
def get_audit_logs():
    """Get audit logs (activity logs with more context)"""
    try:
        current_user = request.current_user
        
        # Audit logs are essentially activity logs with additional metadata
        logs = ActivityLog.query.order_by(desc(ActivityLog.timestamp)).all()
        
        results = []
        for log in logs:
            try:
                user = User.query.get(log.user_id)
                user_name = user.name if user else "Unknown"
                user_email = user.email if user else "Unknown"
                
                results.append({
                    "id": log.id,
                    "user_id": log.user_id,
                    "user_name": user_name,
                    "user_email": user_email,
                    "action": log.action or "Unknown Action",
                    "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                    "details": log.details or None,
                    "action_type": "User Activity"
                })
            except Exception as item_error:
                # Log but continue processing other items
                print(f"Error processing audit log {log.id}: {str(item_error)}")
                continue
        
        return jsonify({
            "admin_id": current_user.id,
            "admin_name": current_user.name,
            "total_logs": len(results),
            "audit_logs": results
        }), 200
    except Exception as e:
        import traceback
        print(f"Error fetching audit logs: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# -------------------------------------------------
# 3️⃣ GET ADMIN NOTIFICATIONS
# -------------------------------------------------
@admin_routes.route("/admin/notifications", methods=["GET"])
@check_role(["admin", "hr"])
def get_admin_notifications():
    """Get all employee notifications (admin dashboard view)"""
    try:
        current_user = request.current_user
        
        # Get all notifications for all employees, ordered by most recent
        notifications = EmployeeNotification.query.order_by(
            desc(EmployeeNotification.created_at)
        ).all()
        
        results = []
        for notif in notifications:
            try:
                user = User.query.get(notif.user_id)
                user_name = user.name if user else "Unknown"
                
                results.append({
                    "id": notif.id,
                    "user_id": notif.user_id,
                    "user_name": user_name,
                    "message": notif.message or "No message",
                    "type": getattr(notif, 'type', 'notification'),
                    "created_at": notif.created_at.strftime("%Y-%m-%d %H:%M") if notif.created_at else None,
                    "is_read": getattr(notif, 'is_read', False)
                })
            except Exception as item_error:
                print(f"Error processing notification {notif.id}: {str(item_error)}")
                continue
        
        return jsonify({
            "admin_id": current_user.id,
            "admin_name": current_user.name,
            "total_notifications": len(results),
            "notifications": results
        }), 200
    except Exception as e:
        import traceback
        print(f"Error fetching admin notifications: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# -------------------------------------------------
# 4️⃣ GET SPECIFIC EMPLOYEE ACTIVITY (ADMIN VIEW)
# -------------------------------------------------
@admin_routes.route("/admin/employees/<int:employee_id>/activity", methods=["GET"])
@check_role(["admin", "hr"])
def get_employee_activity_admin(employee_id):
    """Get activity logs for a specific employee (admin view)"""
    try:
        current_user = request.current_user
        
        # Check if employee exists
        employee = User.query.get(employee_id)
        if not employee:
            return jsonify({"error": "Employee not found"}), 404
        
        # Get all activities for this employee
        logs = ActivityLog.query.filter_by(user_id=employee_id).order_by(
            desc(ActivityLog.timestamp)
        ).all()
        
        results = []
        for log in logs:
            results.append({
                "id": log.id,
                "action": log.action or "Unknown Action",
                "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else None,
                "details": log.details or None
            })
        
        return jsonify({
            "admin_id": current_user.id,
            "admin_name": current_user.name,
            "employee_id": employee_id,
            "employee_name": employee.name,
            "employee_email": employee.email,
            "total_activities": len(results),
            "activities": results
        }), 200
    except Exception as e:
        import traceback
        print(f"Error fetching employee activity (admin): {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# -------------------------------------------------
# 5️⃣ GET ADMIN LOGS (same as audit-logs)
# -------------------------------------------------
@admin_routes.route("/admin/logs", methods=["GET"])
@check_role(["admin", "hr"])
def get_admin_logs():
    """Get admin activity logs"""
    try:
        current_user = request.current_user
        
        logs = ActivityLog.query.order_by(desc(ActivityLog.timestamp)).all()
        
        results = []
        for log in logs:
            try:
                user = User.query.get(log.user_id)
                user_name = user.name if user else "Unknown"
                
                results.append({
                    "id": log.id,
                    "user_id": log.user_id,
                    "user_name": user_name,
                    "action": log.action or "Unknown Action",
                    "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else None,
                    "details": log.details or None
                })
            except Exception as item_error:
                print(f"Error processing log {log.id}: {str(item_error)}")
                continue
        
        return jsonify({
            "admin_id": current_user.id,
            "admin_name": current_user.name,
            "total_logs": len(results),
            "logs": results
        }), 200
    except Exception as e:
        import traceback
        print(f"Error fetching admin logs: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


