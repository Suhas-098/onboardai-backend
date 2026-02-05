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
    # Basic analytics for reports
    total_users = User.query.count()
    depts = db.session.query(User.department, func.count(User.id)).group_by(User.department).all()
    
    # Department breakdown
    dept_stats = [{"department": d[0] or "Unassigned", "count": d[1]} for d in depts]
    
    # Risk breakdown
    at_risk_count = User.query.filter_by(risk="At Risk").count()
    delayed_count = User.query.filter_by(risk="Delayed").count()
    on_track_count = User.query.filter_by(risk="On Track").count()

    return jsonify({
        "total_employees": total_users,
        "department_breakdown": dept_stats,
        "risk_summary": {
            "on_track": on_track_count,
            "at_risk": at_risk_count,
            "delayed": delayed_count
        },
        "averages": {
            "completion": 65.4, # Mock for now or calculate
            "time_to_onboard": "14 days"
        }
    })

@reports_routes.route("/reports/export", methods=["GET"])
@check_role(["admin", "hr"])
def export_report():
    return jsonify({"message": "Report generation started. You will be notified when the PDF/CSV is ready."})
