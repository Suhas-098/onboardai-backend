from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress

risk_routes = Blueprint("risk_routes", __name__)
from middleware.auth_middleware import token_required

@risk_routes.route("/risks", methods=["GET"])
@token_required
def get_all_risks():
    """Returns a list of all employees and their risk levels."""
    try:
        # Single Source of Truth for Risk Status
        from services.alert_service import AlertService
        user_risks_map = AlertService.get_user_risks()
        
        users = User.query.filter(User.role.ilike("employee") | User.role.ilike("intern")).all()
        results = []

        for user in users:
            try:
                progress_list = Progress.query.filter_by(user_id=user.id).all()
                
                # Calculate aggregate metrics
                total_completion = 0
                total_delay = 0
                tasks_completed = 0
                missed_deadlines = 0
                total_time_spent = 0

                if progress_list:
                    total_items = len(progress_list)
                    # Handle potential division by zero if total_items is 0 (unlikely if valid list, but safe)
                    if total_items > 0:
                        total_completion = sum(p.completion or 0 for p in progress_list) / total_items
                    else:
                        total_completion = 0
                        
                    total_delay = sum(p.delay_days or 0 for p in progress_list)
                    # Assuming completion 100 means task done
                    tasks_completed = sum(1 for p in progress_list if (p.completion or 0) == 100) 
                    total_time_spent = sum(p.time_spent or 0 for p in progress_list)
                    
                    # Calculate missed deadlines (both confirmed delays AND currently overdue pending tasks)
                    missed_deadlines = 0
                    from datetime import datetime
                    now = datetime.now()
                    
                    # 1. Count already completed but delayed tasks
                    missed_deadlines += sum(1 for p in progress_list if (p.delay_days or 0) > 0)
                    
                    # 2. Count pending tasks that are overdue
                    # We need to look at the tasks associated with the user
                    from models.task import Task
                    pending_overdue = Task.query.filter(
                        Task.assigned_to == user.id,
                        Task.status != 'Completed',
                        Task.due_date < now
                    ).count()
                    missed_deadlines += pending_overdue

                # Prepare data for predictor
                employee_data = {
                    "completion": total_completion,
                    "delay_days": total_delay,
                    "tasks_completed": tasks_completed,
                    "time_spent": total_time_spent,
                    "missed_deadlines": missed_deadlines
                }

                # Get AI analysis
                from services.predictor import analyze_employee_risk
                analysis = analyze_employee_risk(employee_data)
                
                # OVERRIDE with AlertService logic
                alert_data = user_risks_map.get(user.id)
                final_risk_level = analysis["risk_level"]
                final_risk_message = analysis["message"]

                if alert_data:
                    alert_status = alert_data['status']
                    if alert_status == 'Delayed':
                        final_risk_level = 'Critical'
                        final_risk_message = alert_data['reasons'][0] if alert_data['reasons'] else "Critical Alerts Detected"
                    elif alert_status == 'At Risk':
                        final_risk_level = 'Warning'
                        final_risk_message = alert_data['reasons'][0] if alert_data['reasons'] else "Warning Alerts Detected"

                results.append({
                    "user_id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "department": user.department,
                    "risk": final_risk_level, 
                    "risk_message": final_risk_message,
                    "score": round(total_completion, 1),
                    "prediction": analysis["prediction"],
                    "recommended_actions": analysis["recommended_actions"]
                })
            except Exception as e:
                print(f"Error processing user {user.id}: {e}")
                # Add a fallback/error entry so the loop continues
                results.append({
                    "user_id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "department": user.department,
                    "risk": "Neutral",
                    "risk_message": "Data unavailable",
                    "score": 0,
                    "prediction": "Unavailable",
                    "recommended_actions": []
                })

        return jsonify(results)
    except Exception as e:
        print(f"Global error in get_all_risks: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@risk_routes.route("/risks/stats", methods=["GET"])
def get_risk_stats():
    """Returns aggregated risk statistics."""
    from services.alert_service import AlertService
    stats = AlertService.get_dashboard_stats()
    return jsonify({
        "total_users": stats["total_employees"],
        "on_track": stats["on_track"],
        "at_risk": stats["at_risk"],
        "delayed": stats["delayed"]
    })

@risk_routes.route("/ml/prediction-summary", methods=["GET"])
@token_required
def get_prediction_summary():
    """
    aggregated summary for the ML Predictor - Enhanced Requirement
    """
    from services.alert_service import AlertService
    stats = AlertService.get_dashboard_stats()
    return jsonify({
        "on_track": stats["on_track"],
        "at_risk": stats["at_risk"],
        "delayed": stats["delayed"]
    })
