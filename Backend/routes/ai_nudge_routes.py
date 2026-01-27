from flask import Blueprint, jsonify
from services.ai_nudges import generate_ai_nudges

ai_nudge_routes = Blueprint("ai_nudge_routes", __name__)

@ai_nudge_routes.route("/ai/alerts", methods=["GET"])
def get_ai_alerts():
    alerts = generate_ai_nudges()
    return jsonify(alerts)
