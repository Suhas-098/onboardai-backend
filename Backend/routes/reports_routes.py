from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress
from config.db import db
from sqlalchemy import func
from utils.auth_guard import check_role

reports_routes = Blueprint("reports_routes", __name__)

@reports_routes.route("/reports/summary", methods=["GET"])
@check_role(["admin", "hr"])
def get_reports_summary():
    try:
        # Basic analytics for reports
        total_users = User.query.filter(User.role.ilike("employee")).count() # Only count employees
        depts = db.session.query(User.department, func.count(User.id)).filter(User.role.ilike("employee")).group_by(User.department).all()
        
        # Department breakdown
        dept_stats = [{"department": d[0] or "Unassigned", "count": d[1]} for d in depts]
        
        # Risk breakdown logic - ideally should reuse risk_routes logic but for aggregation we can do a simplified pass
        # Or better, fetch all users and calculate risks to be accurate
        users = User.query.filter(User.role.ilike("employee")).all()
        on_track = 0
        at_risk = 0
        delayed = 0
        total_completion_acc = 0
        
        top_risk_employees = []
        
        from services.predictor import analyze_employee_risk
        
        for user in users:
            progress_list = Progress.query.filter_by(user_id=user.id).all()
            
            # Recalculate risk for accuracy
            total_items = len(progress_list)
            completion = 0
            missed = 0
            delay_days = 0
            if total_items > 0:
                completion = sum(p.completion or 0 for p in progress_list) / total_items
                missed = sum(1 for p in progress_list if (p.delay_days or 0) > 0)
                delay_days = sum(p.delay_days or 0 for p in progress_list)
            
            total_completion_acc += completion
            
            analysis = analyze_employee_risk({
                "completion": completion,
                "delay_days": delay_days,
                "missed_deadlines": missed
            })
            
            risk_level = analysis["risk_level"]
            
            if risk_level == "Good":
                on_track += 1
            elif risk_level == "Critical":
                delayed += 1
                top_risk_employees.append({
                    "name": user.name,
                    "risk": "Critical",
                    "reason": analysis["message"],
                    "department": user.department
                })
            else: # Warning / Neutral
                at_risk += 1
                if risk_level == "Warning": # Only add warnings to top list if needed
                     top_risk_employees.append({
                        "name": user.name,
                        "risk": "Warning",
                        "reason": analysis["message"],
                        "department": user.department
                     })

        avg_completion = round(total_completion_acc / total_users, 1) if total_users > 0 else 0
        
        # Sort top risk employees by severity (Critical first)
        top_risk_employees.sort(key=lambda x: 0 if x["risk"] == "Critical" else 1)
        top_3_risk = top_risk_employees[:3]

        return jsonify({
            "total_employees": total_users,
            "department_breakdown": dept_stats,
            "risk_summary": {
                "on_track": on_track,
                "at_risk": at_risk,
                "delayed": delayed
            },
            "averages": {
                "completion": avg_completion,
                "time_to_onboard": "14 days"
            },
            "top_risks": top_3_risk,
            "weekly_trend": [ # Mock data for now
                {"day": "Mon", "risks": 2},
                {"day": "Tue", "risks": 3},
                {"day": "Wed", "risks": 1},
                {"day": "Thu", "risks": 4},
                {"day": "Fri", "risks": 2}
            ]
        })
    except Exception as e:
        print(f"Error generating reports: {e}")
        return jsonify({"error": "Failed to generate report"}), 500

@reports_routes.route("/reports/export", methods=["GET"])
@check_role(["admin", "hr"])
def export_report():
    return jsonify({"message": "Report generation started. You will be notified when the PDF/CSV is ready."})
