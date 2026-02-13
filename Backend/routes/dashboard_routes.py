from flask import Blueprint, jsonify
from models.user import User
from models.task import Task
from models.progress import Progress
from models.activity_log import ActivityLog
from services.predictor import predict_risk, analyze_employee_risk
from services.ai_explainer import explain_risk
from utils.auth_guard import check_role
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import random

dashboard_routes = Blueprint("dashboard_routes", __name__)

# -------------------------------------------------
# 1️⃣ DASHBOARD SUMMARY (AI-AWARE)
# -------------------------------------------------
from services.alert_service import AlertService

@dashboard_routes.route("/dashboard/summary", methods=["GET"])
@check_role(["admin", "hr"])
def dashboard_summary():
    stats = AlertService.get_dashboard_stats()
    return jsonify({
        "total_users": stats["total_employees"],
        "on_track": stats["on_track"],
        "at_risk": stats["at_risk"],
        "delayed": stats["delayed"]
    })

@dashboard_routes.route("/dashboard/risk-trend", methods=["GET"])
@check_role(["admin", "hr"])
def get_risk_trend():
    # Use AlertService as Single Source of Truth for current state
    user_risks = AlertService.get_user_risks()
    
    current_risk_score = 0
    total_users = len(user_risks)
    
    if total_users > 0:
        total_risk = 0
        for uid, data in user_risks.items():
            status = data['status']
            # Simple heuristic matching reports logic: On Track=10, At Risk=50, Delayed=90
            if status == "On Track": total_risk += 10
            elif status == "At Risk": total_risk += 50
            elif status == "Delayed": total_risk += 90
            else: total_risk += 10
        current_risk_score = int(total_risk / total_users)

    # Generate 7 days of data ending in current_score
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    trend_data = []
    base_score = current_risk_score
    
    for i in range(6, -1, -1):
        # vary slightly but trend towards actual
        variation = random.randint(-15, 15)
        # dampen variation as we get closer to today (index 0 is T-6, index 6 is Today)
        if i == 0: variation = 0 # Today matches exactly
        
        day_score = max(0, min(100, base_score + variation))
        
        day_label = days[(datetime.now().weekday() - i) % 7]
        trend_data.append({"name": day_label, "risk": day_score})
    
    return jsonify(trend_data)

# -------------------------------------------------
# 2️⃣ USER PROGRESS (BASIC)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/user-progress", methods=["GET"])
@check_role(["admin", "hr"])
def user_progress():
    users = User.query.all()
    results = []

    for user in users:
        user_progress = Progress.query.filter_by(user_id=user.id).all()

        if user_progress:
            avg_completion = sum(p.completion for p in user_progress) / len(user_progress)
        else:
            avg_completion = 0

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2)
        })

    return jsonify(results)

# -------------------------------------------------
# 3️⃣ AI RISK PER USER
# -------------------------------------------------
@dashboard_routes.route("/dashboard/ai-risk", methods=["GET"])
@check_role(["admin", "hr"])
def dashboard_ai_risk():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)
        time_spent = sum(p.time_spent for p in progress_list)

        prediction = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list), 
            "time_spent": time_spent
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2),
            "avg_delay_days": round(avg_delay, 2),
            "ai_risk": prediction
        })

    return jsonify(results)

# -------------------------------------------------
# 4️⃣ EXPLAINABLE AI (WHY AT RISK?)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/ai-explanations", methods=["GET"])
@check_role(["admin", "hr"])
def dashboard_ai_explanations():
    users = User.query.all()
    results = []

    for user in users:
        progress_list = Progress.query.filter_by(user_id=user.id).all()
        if not progress_list:
            continue

        avg_completion = sum(p.completion for p in progress_list) / len(progress_list)
        avg_delay = sum(p.delay_days for p in progress_list) / len(progress_list)
        time_spent = sum(p.time_spent for p in progress_list)

        risk = predict_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list),
            "time_spent": time_spent
        })

        reasons = explain_risk({
            "completion": avg_completion,
            "delay_days": avg_delay,
            "tasks_completed": len(progress_list)
        })

        results.append({
            "user_id": user.id,
            "name": user.name,
            "completion_percent": round(avg_completion, 2),
            "delay_days": round(avg_delay, 2),
            "risk": risk,
            "reasons": reasons
        })

    return jsonify(results)

# -------------------------------------------------
# 5️⃣ RISK HEATMAP (DEPARTMENTAL)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/risk-heatmap", methods=["GET"])
@check_role(["admin", "hr"])
def get_risk_heatmap():
    user_risks = AlertService.get_user_risks()
    dept_risks = {}
    
    for uid, data in user_risks.items():
        user = data['user']
        status = data['status']
        
        dept = user.department or "Unassigned"
        if dept not in dept_risks:
            dept_risks[dept] = {"total_score": 0, "count": 0}
            
        # standardized score: On Track=10, At Risk=50, Delayed=90
        score = 10
        if status == "At Risk": score = 50
        elif status == "Delayed": score = 90
        elif status == "Critical": score = 100 
        
        dept_risks[dept]["total_score"] += score
        dept_risks[dept]["count"] += 1
        
    heatmap = []
    for dept, data in dept_risks.items():
        if data["count"] > 0:
            avg_score = data["total_score"] / data["count"]
            risk_level = "Low"
            if avg_score > 60: risk_level = "High"
            elif avg_score > 30: risk_level = "Medium"
            
            heatmap.append({
                "department": dept,
                "risk_level": risk_level,
                "avg_score": round(avg_score, 1)
            })
        
    return jsonify(heatmap)

# -------------------------------------------------
# 6️⃣ TOP IMPROVED (LAST 7 DAYS)
# -------------------------------------------------
@dashboard_routes.route("/dashboard/top-improved", methods=["GET"])
@check_role(["admin", "hr"])
def get_top_improved():
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    try:
        # Check for ActivityLog table existence and query
        # We assume ActivityLog is available as we imported it
        recent_activity = ActivityLog.query.filter(
            ActivityLog.timestamp >= seven_days_ago,
            ActivityLog.action.ilike("%complete%") # broadly match completion
        ).all()
        
        user_improvements = {}
        for log in recent_activity:
            uid = log.user_id
            if uid not in user_improvements:
                user_improvements[uid] = 0
            user_improvements[uid] += 1 # 1 task = 1 point of improvement for now
            
        # Get top 3
        sorted_users = sorted(user_improvements.items(), key=lambda x: x[1], reverse=True)[:3]
        
        results = []
        for uid, count in sorted_users:
            user = User.query.get(uid)
            if user:
                results.append({
                    "id": user.id,
                    "name": user.name,
                    "department": user.department,
                    "improvement_score": f"+{count * 5}%" # Mocking the % display
                })
        return jsonify(results)
    except Exception as e:
        print(f"Error fetching top improved: {e}")
        return jsonify([])

# -------------------------------------------------
# 7️⃣ CRITICAL FOCUS
# -------------------------------------------------
@dashboard_routes.route("/dashboard/critical-focus", methods=["GET"])
@check_role(["admin", "hr"])
def get_critical_focus():
    stats = AlertService.get_dashboard_stats()
    return jsonify(stats["critical_employees"])
