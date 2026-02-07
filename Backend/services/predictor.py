import joblib

model = joblib.load("services/model.pkl")

def predict_risk(data):
    features = [[
        data["completion"],
        data["delay_days"],
        data["tasks_completed"],
        data["time_spent"]
    ]]

    prediction = model.predict(features)[0]
    return prediction

def analyze_employee_risk(data):
    """
    Analyzes employee data to determine risk level, message, and recommendations.
    Handles missing keys and ensures robustness.
    """
    # Safe data extraction with defaults
    try:
        completion = float(data.get("completion") or 0)
        delay_days = int(data.get("delay_days") or 0)
        missed_deadlines = int(data.get("missed_deadlines") or 0)
    except (ValueError, TypeError):
        completion = 0.0
        delay_days = 0
        missed_deadlines = 0
    
    risk_level = "Low"
    message = "Consistent progress"
    risk_type = "Good" # For internal logic
    recommendations = []

    # Logic for Risk Level & Message
    # New Strict Rules from User:
    # 1. Missed critical deadline -> HIGH RISK (RED)
    if missed_deadlines > 0:
        risk_level = "High"
        message = "Missed critical deadline — immediate action required."
        risk_type = "Critical"
        recommendations = [
            "Schedule 1:1 meeting to discuss blockers",
            "Assign a mentor or buddy",
            "Reduce workload temporarily",
            "Provide additional training resources"
        ]
    # 2. Just started (0-10%) -> NEUTRAL
    elif completion <= 10:
        risk_level = "Neutral"
        message = "Just started — no risk assessment yet."
        risk_type = "Neutral"
        recommendations = [
            "Ensure access to all tools",
            "Schedule an introductory walkthrough",
            "Verify account setup completion"
        ]
    # 3. Low completion rate (< 40%) but no missed deadline -> MEDIUM RISK
    elif completion < 40:
        risk_level = "Medium"
        message = "Low completion rate — monitor performance."
        risk_type = "Warning"
        recommendations = [
            "Check task difficulty level",
            "Provide clearer requirements",
            "Increase supervision frequency",
            "Send a gentle reminder"
        ]
    # 4. Steady progress (>= 50%) AND no missed deadline -> ON TRACK
    elif completion >= 50:
        # Default/Good state
        risk_level = "Low"
        message = "Consistent progress — on track."
        risk_type = "Good"
        recommendations = [
            "Acknowledge good progress",
            "Assign next set of advanced tasks",
            "Encourage peer networking"
        ]
    else:
        # Fallback for 10-40% or 40-50% gaps if strictly following rules, 
        # but let's assume "Consistent progress" for safe zone or "Monitor" for gap
        risk_level = "Low"
        message = "Consistent progress."
        risk_type = "Good"
        recommendations = []

    # Use the ML model for a "prediction" insight
    try:
        # Ensure data passed to model has correct shape/types if needed
        # For now, just passing the original data wrapper safe
        ml_prediction = predict_risk(data)
    except Exception as e:
        # Log error in a real app
        ml_prediction = "Prediction unavailable"

    return {
        "risk_level": risk_type, # Critical, Warning, Neutral, Good
        "message": message,
        "prediction": f"AI Prediction: {ml_prediction}",
        "recommended_actions": recommendations
    }
