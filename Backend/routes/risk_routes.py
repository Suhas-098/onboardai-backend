from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress

risk_routes = Blueprint("risk_routes", __name__)
from middleware.auth_middleware import token_required

@risk_routes.route("/risks", methods=["GET"])
@token_required
def get_all_risks():
    """Returns a list of all employees and their risk levels with AI insights."""
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

                # Generate AI Insights using restored ai_service
                insight = None
                try:
                    from services.ai_service import generate_employee_insight, _fallback_insight
                    ai_context = {
                        "user_id": user.id,
                        "name": user.name,
                        "department": user.department,
                        "completion_percentage": round(total_completion, 1),
                        "tasks_assigned": len(progress_list),
                        "alert_status": alert_data.get('status', 'Healthy') if alert_data else 'Healthy',
                        "alert_data_status": alert_data.get('status', 'Healthy') if alert_data else 'Healthy',
                        "missed_deadlines": "Yes" if final_risk_level == 'Critical' else "No",
                        "risk_reasons": alert_data.get('reasons', []) if alert_data else []
                    }
                    
                    # Only call Gemini for high-risk employees
                    if final_risk_level != "Critical" and final_risk_level != "Warning":
                        print(f"[AI] Skipping Gemini for low-risk user {user.id}")
                        insight = _fallback_insight(ai_context, "AI skipped for low risk employee")
                    else:
                        print(f"[AI] Generating insight for user {user.id}")
                        insight = generate_employee_insight(ai_context)
                except Exception as insight_error:
                    print(f"AI Insight generation error for user {user.id}: {insight_error}")
                    insight = None

                result_item = {
                    "user_id": user.id,
                    "name": user.name,
                    "role": user.role,
                    "department": user.department,
                    "risk": final_risk_level, 
                    "risk_message": final_risk_message,
                    "score": round(total_completion, 1),
                    "prediction": analysis["prediction"],
                    "recommended_actions": analysis["recommended_actions"]
                }
                
                # Add AI insights if available
                if insight:
                    result_item["ai_insight"] = {
                        "risk_insight": insight.get("risk_insight", ""),
                        "detected_signals": insight.get("detected_signals", []),
                        "ai_prediction": insight.get("ai_prediction", ""),
                        "risk_explanation": insight.get("risk_explanation", ""),
                        "recommended_actions": insight.get("recommended_actions", []),
                        "engagement_score": insight.get("engagement_score", 0)
                    }
                
                results.append(result_item)
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

# ============================================
# AI INSIGHTS ENDPOINTS
# ============================================

@risk_routes.route("/insights", methods=["GET"])
@token_required
def get_all_insights():
    """
    Returns cached AI insights for all employees.
    DOES NOT call Gemini - uses cache only.
    (The /api/risks endpoint is responsible for calling Gemini)
    """
    try:
        from services.ai_service import get_insight_from_cache, _fallback_insight
        
        users = User.query.filter(User.role.ilike("employee") | User.role.ilike("intern")).all()
        
        insights = []
        for user in users:
            # Fetch from cache only - no Gemini calls here
            insight_data = get_insight_from_cache(user.id)
            
            if insight_data is None:
                # No cached insight available, use fallback
                insight_data = _fallback_insight(
                    {"name": user.name, "alert_data_status": "Unknown"},
                    "No cached insight available"
                )
            
            insight_data = insight_data.copy() if isinstance(insight_data, dict) else insight_data
            insight_data["user_id"] = user.id
            insight_data["name"] = user.name
            
            insights.append(insight_data)
            
        return jsonify(insights)
    except Exception as e:
        print(f"Error retrieving insights: {e}")
        return jsonify({"error": "Failed to retrieve insights"}), 500


@risk_routes.route("/insights/<int:user_id>", methods=["GET"])
@token_required
def get_employee_insights(user_id):
    """
    Returns cached AI insight for a specific employee.
    DOES NOT call Gemini - uses cache only.
    """
    try:
        from services.ai_service import get_insight_from_cache, _fallback_insight
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Employee not found"}), 404
        
        # Fetch from cache only - no Gemini calls here
        insight_data = get_insight_from_cache(user_id)
        
        if insight_data is None:
            # No cached insight available, use fallback
            insight_data = _fallback_insight(
                {"name": user.name, "alert_data_status": "Unknown"},
                "No cached insight available"
            )
        
        insight_data = insight_data.copy() if isinstance(insight_data, dict) else insight_data
        insight_data["user_id"] = user.id
        insight_data["name"] = user.name
        
        return jsonify(insight_data)
    except Exception as e:
        print(f"Error retrieving insight for user {user_id}: {e}")
        return jsonify({"error": "Failed to retrieve insight"}), 500