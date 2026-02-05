from flask import Blueprint, jsonify
from models.user import User
from models.progress import Progress
from services.predictor import predict_risk
from datetime import datetime

alert_routes = Blueprint("alert_routes", __name__)

@alert_routes.route("/alerts", methods=["GET"])
def get_alerts():
    alerts = []
    users = User.query.all()
    
    # 1. Check for Risk Alerts
    for user in users:
        # Check stored risk directly
        if user.risk == "Delayed":
            alerts.append({
                "id": len(alerts) + 1,
                "level": "Critical",
                "title": "Onboarding Delayed",
                "time": "Just now",
                "desc": f"Employee {user.name} is significantly behind schedule (Risk: {user.risk})."
            })
        elif user.risk == "At Risk":
            alerts.append({
                "id": len(alerts) + 1,
                "level": "Warning",
                "title": "At-Risk Employee",
                "time": "1h ago",
                "desc": f"Engagement drop detected for {user.name}."
            })

    # 2. Generic System Alerts (to ensure list isn't empty)
    alerts.append({
        "id": len(alerts) + 1,
        "level": "Info",
        "title": "System Active",
        "time": "Now",
        "desc": f"Monitoring {len(users)} employees for onboarding progress."
    })

    # Sort alerts? (Newest first - effectively reverse order of append)
    alerts.reverse()
    
    return jsonify(alerts)
