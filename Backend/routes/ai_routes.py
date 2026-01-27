from flask import Blueprint, request, jsonify
from services.predictor import predict_risk

ai_routes = Blueprint("ai_routes", __name__)

@ai_routes.route("/predict-risk", methods=["POST"])
def predict_user_risk():
    data = request.json
    prediction = predict_risk(data)

    return jsonify({
        "prediction": prediction,
        "message": f"User risk level: {prediction}"
    })
