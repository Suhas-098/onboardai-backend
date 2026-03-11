import os
import json
import time
import traceback
import google.genai as genai
from cachetools import TTLCache

# Cache insights for 15 minutes
insight_cache = TTLCache(maxsize=500, ttl=900)

# Track Gemini usage
MAX_AI_REQUESTS = 6
_state = {
    "api_calls": 0,
    "gemini_initialized": False
}

# Initialize Gemini client
api_key = os.environ.get("GEMINI_API_KEY")

client = None

if api_key:
    try:
        client = genai.Client(api_key=api_key)
        _state["gemini_initialized"] = True
        print("[AI] Gemini client initialized at startup")
    except Exception as e:
        print(f"[AI] Failed to initialize Gemini: {e}")
else:
    print("[AI] GEMINI_API_KEY not found")


def get_insight_from_cache(user_id):
    if user_id and user_id in insight_cache:
        return insight_cache[user_id]
    return None


def generate_employee_insight(employee_context):

    user_id = employee_context.get("user_id")
    print(f"[AI] generate_employee_insight called for user {user_id}")
    print(f"[AI DEBUG] Employee context keys: {list(employee_context.keys())}")

    # 1️⃣ Cache check
    if user_id and user_id in insight_cache:
        print(f"[AI] Using cached insight for user {user_id}")
        return insight_cache[user_id]

    # 2️⃣ Hard request limit
    if _state["api_calls"] >= MAX_AI_REQUESTS:
        print(f"[AI] Request limit reached ({MAX_AI_REQUESTS})")
        fallback = _fallback_insight(employee_context, "AI request limit reached")
        if user_id:
            insight_cache[user_id] = fallback
        return fallback

    # 3️⃣ Gemini initialized check
    if not _state["gemini_initialized"]:
        print(f"[AI] Gemini not initialized - client is {client}")
        fallback = _fallback_insight(employee_context, "Gemini not initialized")
        if user_id:
            insight_cache[user_id] = fallback
        return fallback

    # 4️⃣ Skip AI for healthy employees - TEMPORARILY DISABLED FOR DEBUGGING
    # Uncomment below to re-enable this logic
    # if employee_context.get("alert_status") == "Healthy":
    #     print(f"[AI] Skipping Gemini for healthy user {user_id}")
    #     fallback = _fallback_insight(employee_context, "AI skipped for healthy employee")
    #     if user_id:
    #         insight_cache[user_id] = fallback
    #     return fallback

    try:
        print(f"[AI DEBUG] About to call Gemini API for user {user_id}")
        print(f"[AI DEBUG] Client object: {client}")
        print(f"[AI DEBUG] Full employee context:")
        print(json.dumps(employee_context, indent=2, default=str))

        time.sleep(0.3)

        prompt = f"""
You are an AI HR assistant analyzing employee onboarding performance.

Analyze the employee data below and return ONLY JSON with all required fields.

Employee Data:
{json.dumps(employee_context, indent=2)}

Return ONLY this JSON structure (no markdown, no explanation):
{{
  "risk_insight": "Detailed explanation of the risk",
  "detected_signals": ["signal1","signal2"],
  "ai_prediction": "Short prediction label",
  "risk_explanation": "Extended explanation",
  "engagement_score": 0-100,
  "recommended_actions": ["action1","action2"]
}}
"""
        
        print(f"[AI DEBUG] Calling client.models.generate_content() with model='gemini-2.0-flash'")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        print(f"[AI DEBUG] Gemini API responded successfully")
        print(f"[AI DEBUG] Raw Gemini response type: {type(response)}")
        print(f"[AI DEBUG] Raw Gemini response text (first 200 chars): {response.text[:200] if response.text else 'EMPTY'}")

        _state["api_calls"] += 1
        print(f"[AI] Generating insight for user {user_id} (call {_state['api_calls']}/{MAX_AI_REQUESTS})")

        result_text = response.text
        print(f"[AI DEBUG] Attempting to parse JSON from response")
        insight_data = json.loads(result_text)
        print(f"[AI DEBUG] Successfully parsed JSON. Keys: {list(insight_data.keys())}")

        required_fields = [
            "risk_insight",
            "detected_signals",
            "ai_prediction",
            "risk_explanation",
            "engagement_score",
            "recommended_actions"
        ]

        fallback = _fallback_insight(employee_context, "Missing fields")
        missing_fields = []

        for field in required_fields:
            if field not in insight_data:
                print(f"[AI] Missing field '{field}' for user {user_id}, using fallback")
                insight_data[field] = fallback.get(field)
                missing_fields.append(field)
        
        if missing_fields:
            print(f"[AI] Filled {len(missing_fields)} missing fields from fallback: {missing_fields}")

        if user_id:
            insight_cache[user_id] = insight_data
            print(f"[AI] Cached insight for user {user_id}")

        print(f"[AI] Successfully generated insight for user {user_id}")
        return insight_data

    except Exception as e:
        print(f"[AI ERROR] Gemini call failed for user {user_id}")
        print(f"[AI ERROR] Exception type: {type(e).__name__}")
        print(f"[AI ERROR] Exception message: {str(e)}")
        print("[AI ERROR] Full traceback:")
        print(traceback.format_exc())

        fallback = _fallback_insight(employee_context, "AI generation failed")

        if user_id:
            insight_cache[user_id] = fallback
            print(f"[AI] Cached fallback insight for user {user_id}")

        return fallback


def clear_insight_cache(user_id=None):

    if user_id and user_id in insight_cache:
        del insight_cache[user_id]

    elif not user_id:
        insight_cache.clear()


def _fallback_insight(context, reason):

    status = context.get("alert_status", "Unknown")
    completion = context.get("completion_percentage", 0)

    if status in ["Critical", "Delayed"]:
        prediction = "Likely to miss deadlines"
        insight = "Employee shows critical risk signals and missed deadlines."
        signals = ["Missed deadlines"]
        actions = ["Schedule urgent meeting", "Investigate blockers"]
        engagement_score = 25

    elif status in ["Warning", "At Risk"]:
        prediction = "Engagement dropping"
        insight = "Employee progress is slower than expected."
        signals = ["Slow progress"]
        actions = ["Check workload", "Offer assistance"]
        engagement_score = 50

    elif completion > 50:
        prediction = "Progress stable"
        insight = "Employee progressing normally."
        signals = ["Consistent completion"]
        actions = ["Encourage progress"]
        engagement_score = 75

    else:
        prediction = "Getting started"
        insight = "Employee beginning onboarding tasks."
        signals = ["Initial activity"]
        actions = ["Ensure access to resources"]
        engagement_score = 40

    return {
        "risk_insight": f"(Fallback - {reason}) {insight}",
        "detected_signals": signals,
        "prediction_label": prediction,
        "ai_prediction": prediction,
        "risk_explanation": insight,
        "engagement_score": engagement_score,
        "recommended_actions": actions
    }