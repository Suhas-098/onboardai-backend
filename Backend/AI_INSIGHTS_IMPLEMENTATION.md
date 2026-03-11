# AI Insights System - Implementation Guide

## Overview
The AI Insights System has been upgraded to generate real, AI-driven insights using Google Gemini API instead of static placeholder predictions. The system now analyzes employee behavioral data and provides detailed, actionable recommendations.

## What's New

### 1. **AI Insights Service** (`services/ai_insights_service.py`)
A new comprehensive service that:
- Collects behavioral signals from employee data
- Calculates engagement scores
- Generates structured insights using Gemini AI
- Provides fallback rule-based insights if API fails

### 2. **New Backend Endpoints**

#### `/risks` (Updated)
- **Method**: GET
- **Auth**: Required
- **Response**: Each employee now includes an `ai_insight` object with:
  - `risk_insight`: Detailed explanation of employee status
  - `detected_signals`: Array of behavioral flags
  - `ai_prediction`: Short prediction of likely outcome
  - `recommended_actions`: Array of specific recommendations
  - `engagement_score`: Calculated engagement metric
  - `completion_rate`: Task completion percentage

#### `/insights` (New)
- **Method**: GET
- **Auth**: Required
- **Purpose**: Get AI insights for all employees
- **Response**: Array of insight objects

#### `/insights/<user_id>` (New)
- **Method**: GET
- **Auth**: Required  
- **Purpose**: Get detailed insight for a specific employee
- **Response**: Single insight object with all details

## Data Analysis

### Employee Signals Collected
The system analyzes:
1. **Task Completion Rate** - Percentage of tasks completed
2. **Missed Deadlines** - Count of overdue tasks
3. **Delay Days** - Total days tasks were delayed
4. **Engagement Score** (0-100):
   - 30 points: Completion rate
   - 30 points: Recent activity (within 24h = full points)
   - 20 points: Task volume (10+ tasks = full points)
   - 20 points: Time investment (16+ hours = full points)
5. **Activity Trend** - improving/stable/declining
6. **Hours Since Activity** - Last login/action time
7. **Pending/Overdue Tasks** - Current open items

### Risk Classification Rules
The Gemini AI applies these rules when generating insights:
- **Low Engagement** (Score < 30): Flags for inactivity support
- **Missed Deadlines** (overdue_tasks > 0): Flags for intervention
- **Inactivity** (> 72 hours): Requires immediate check-in
- **Slow Progress** (< 40% completion): Needs training/clarification
- **Good Progress** (80%+ completion, no missed deadlines): Positive trajectory

## Frontend Changes

### AlertsInsights.js Updated
- **Insights Filter**: Now filters by `ai_insight` presence instead of "AI Prediction" text
- **Enhanced UI**: Displays structured insight data
- **New Sections**:
  - Risk Insight (main explanation)
  - Detected Signals (behavioral tags)
  - AI Prediction (outcome forecast)
  - Recommended Actions (specific next steps)
- **Engagement Badge**: Shows engagement score (0-100)

### ActionModal Updated
- Displays AI-generated recommendations
- Falls back to old analysis recommendations if AI insights unavailable

## AI Insight Structure Example

```json
{
  "user_id": 5,
  "name": "John Doe",
  "risk_insight": "John has missed 2 deadlines with 1 overdue task currently pending. This indicates potential time management issues or capacity constraints that need immediate attention.",
  "detected_signals": [
    "Missed deadlines",
    "Overdue tasks",
    "Slow progress",
    "Low engagement"
  ],
  "ai_prediction": "Will miss additional deadlines",
  "recommended_actions": [
    "Manager: Schedule 1:1 meeting to understand blockers",
    "HR: Review task workload distribution", 
    "Mentor: Provide time management guidance",
    "Manager: Consider timeline adjustments"
  ],
  "engagement_score": 35,
  "completion_rate": 42
}
```

## API Integration Points

### Required Environment Variable
```
GEMINI_API_KEY=your_api_key_here
```
(Already set in your `.env` file)

### Python Dependencies
- `google-generativeai>=0.8.6` (already added to requirements.txt)

## Usage Examples

### Frontend - Displaying Insights
```javascript
// Fetched from /risks endpoint
const risks = await api.get('/risks').then(res => res.data);
const insights = risks.filter(r => r.ai_insight);

// Access insight data
insights.forEach(insight => {
  console.log(insight.ai_insight.risk_insight);
  console.log(insight.ai_insight.detected_signals);
  console.log(insight.ai_insight.ai_prediction);
});
```

### Backend - Generate Insight for Specific Employee
```python
from services.ai_insights_service import AIInsightsService

# Collect signals
signals = AIInsightsService.collect_employee_signals(user_id=5)

# Generate insight
insight = AIInsightsService.generate_insight(signals)
print(insight['risk_insight'])
print(insight['ai_prediction'])
```

## Fallback Mechanism
If Gemini API is unavailable:
1. System automatically uses rule-based insight generation
2. Still provides all required fields
3. Recommendations are based on analyzed signals
4. No service interruption

## Performance Considerations
- Insights are generated on-demand
- Can be cached for 15 minutes (configurable)
- Batch processing available via `/insights` endpoint
- Each insight generation: ~1-2 seconds (Gemini API latency)

## Consistency with Alerts System
The insights system now aligns with the Alerts system:
- **Alert: Critical Risk** → **Insight: Explains missed deadlines/inactivity**
- **Alert: Warning Risk** → **Insight: Explains engagement drop/slow progress**
- **Alert: On Track** → **Insight: Explains good progress/stability**

No contradictory predictions will appear.

## Testing the System

### 1. Start Backend Server
```bash
cd Backend
venv\Scripts\activate
python -m flask run
```

### 2. Check Insights Endpoint
```bash
curl -X GET http://localhost:5000/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. View in Frontend
- Navigate to "Alerts & Insights" page
- Click "View Recommendations" to see detailed actions
- Check "View Details" to see full employee profile

## Configuration

### Customize AI Behavior
Edit `ai_insights_service.py` to modify:
1. **Engagement Score Weights**: Adjust points distribution (lines ~100-120)
2. **Activity Trend Logic**: Change trend calculation (lines ~130-150)
3. **Gemini Prompt**: Refine AI instructions (lines ~180-220)
4. **Fallback Rules**: Customize rule-based logic (lines ~240-280)

### Change Stale Time (Cache Duration)
In frontend `AlertsInsights.js`:
```javascript
const staleTime = 15 * 60 * 1000; // Change to desired milliseconds
```

## Troubleshooting

### "Gemini API Error"
- Verify `GEMINI_API_KEY` is set in `.env`
- Check internet connection
- System will use fallback rules automatically

### "Employee not found"
- Ensure user_id is valid
- Check user has role = "employee" or "intern"

### Slow Response
- First insight generation will be slower (Gemini API latency)
- Subsequent requests use cache
- Consider implementing result caching in Redis for production

## Future Enhancements
1. Add result caching (Redis)
2. Batch process insights during off-peak hours
3. Add A/B testing for different AI prompts
4. Implement user feedback loop to improve predictions
5. Add custom alert thresholds per department
