from flask import Blueprint, jsonify, request
from models.user import User
from models.alert import Alert
from config.db import db
from datetime import datetime

alert_routes = Blueprint("alert_routes", __name__)

@alert_routes.route("/alerts", methods=["GET"])
def get_alerts():
    # 1. Fetch Persisted Alerts from DB
    db_alerts = Alert.query.order_by(Alert.created_at.desc()).all()
    results = [alert.to_dict() for alert in db_alerts]

    # 2. Dynamic Risk Alerts (Real-time check)
    # We can choose to persist these OR just show them dynamically. 
    # For a robust system, we might want to check if they exist in DB before adding, 
    # but for now, let's just append them if they are CRITICAL.
    
    users = User.query.all()
    for user in users:
        if user.risk == "Delayed":
            # Check if we already have a recent alert for this? (Skipped for simplicity)
            results.append({
                "id": f"temp_{user.id}",
                "level": "Critical",
                "title": "Onboarding Delayed",
                "time": "Real-time",
                "desc": f"Employee {user.name} is significantly behind schedule (Risk: {user.risk}).",
                "target_user_id": user.id
            })
    
    return jsonify(results)

@alert_routes.route("/alerts", methods=["POST"])
def create_alert():
    data = request.json
    target_user_id = data.get("target_user_id")
    alert_type = data.get("type", "Info")
    message = data.get("message")
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    new_alert = Alert(
        type=alert_type,
        message=message,
        target_user_id=target_user_id,
        sender="HR Admin" # Hardcoded for now, could use auth user
    )
    
    db.session.add(new_alert)
    db.session.commit()
    
    return jsonify({"message": "Alert sent successfully", "alert": new_alert.to_dict()}), 201
