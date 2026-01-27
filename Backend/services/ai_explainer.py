def explain_risk(data):
    reasons = []
    risk_score = 0  # Higher = worse risk

    # Safe reads with defaults
    completion = data.get("completion", 100)
    delay_days = data.get("delay_days", 0)
    tasks_completed = data.get("tasks_completed", 0)
    time_spent = data.get("time_spent", 0)

    # Rule 1 — Task completion
    if completion < 40:
        reasons.append("Very low task completion")
        risk_score += 3
    elif completion < 60:
        reasons.append("Low task completion")
        risk_score += 2
    elif completion < 80:
        reasons.append("Moderate task completion")
        risk_score += 1

    # Rule 2 — Delay history
    if delay_days > 10:
        reasons.append("Severe task delays")
        risk_score += 3
    elif delay_days > 5:
        reasons.append("High delay history")
        risk_score += 2
    elif delay_days > 2:
        reasons.append("Minor delays")
        risk_score += 1

    # Rule 3 — Tasks completed
    if tasks_completed < 2:
        reasons.append("Very few tasks completed")
        risk_score += 3
    elif tasks_completed < 4:
        reasons.append("Few tasks completed")
        risk_score += 2

    # Rule 4 — Time spent (optional signal)
    if time_spent < 2:
        reasons.append("Low engagement time")
        risk_score += 1

    # Risk Level Classification
    if risk_score >= 6:
        risk_level = "High Risk"
    elif risk_score >= 3:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    # Healthy case
    if not reasons:
        reasons.append("Performance is healthy")

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reasons": reasons
    }
