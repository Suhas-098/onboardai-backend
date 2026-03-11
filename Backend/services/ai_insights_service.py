import os
import json
from datetime import datetime, timedelta
from models.user import User
from models.progress import Progress
from models.activity_log import ActivityLog
from models.task import Task
from config.db import db
import google.generativeai as genai

# Configure Gemini API
API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=API_KEY)

class AIInsightsService:
    """
    Generates real, AI-driven insights using Gemini API based on employee behavioral data.
    """
    
    @staticmethod
    def collect_employee_signals(user_id):
        """
        Collects behavioral signals for an employee.
        Returns: dict with aggregated metrics
        """
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Get progress data
        progress_list = Progress.query.filter_by(user_id=user_id).all()
        
        # Calculate metrics
        completion_rate = 0
        task_completion_count = 0
        delayed_days_total = 0
        time_spent_total = 0
        missed_deadlines = 0
        
        if progress_list:
            task_completion_count = len(progress_list)
            completion_rate = sum(p.completion or 0 for p in progress_list) / len(progress_list)
            delayed_days_total = sum(p.delay_days or 0 for p in progress_list)
            time_spent_total = sum(p.time_spent or 0 for p in progress_list)
            missed_deadlines = sum(1 for p in progress_list if (p.delay_days or 0) > 0)
        
        # Get last activity
        last_activity = ActivityLog.query.filter_by(user_id=user_id).order_by(
            ActivityLog.timestamp.desc()
        ).first()
        
        last_login = last_activity.timestamp if last_activity else user.joined_date
        hours_since_activity = (datetime.utcnow() - last_login).total_seconds() / 3600 if last_login else 0
        
        # Calculate engagement score (0-100)
        engagement_score = AIInsightsService._calculate_engagement_score(
            completion_rate,
            hours_since_activity,
            task_completion_count,
            time_spent_total
        )
        
        # Get activity trend
        activity_trend = AIInsightsService._calculate_activity_trend(user_id)
        
        # Get pending/overdue tasks
        pending_tasks = Task.query.filter(
            Task.assigned_to == user_id,
            Task.status != 'Completed'
        ).count()
        
        overdue_tasks = Task.query.filter(
            Task.assigned_to == user_id,
            Task.status != 'Completed',
            Task.due_date < datetime.utcnow()
        ).count()
        
        return {
            "user_id": user_id,
            "name": user.name,
            "email": user.email,
            "department": user.department,
            "joined_date": user.joined_date,
            "completion_rate": round(completion_rate, 1),
            "task_completion_count": task_completion_count,
            "missed_deadlines": missed_deadlines,
            "delayed_days_total": delayed_days_total,
            "time_spent_minutes": time_spent_total,
            "last_activity": last_login,
            "hours_since_activity": round(hours_since_activity, 1),
            "engagement_score": round(engagement_score, 1),
            "activity_trend": activity_trend,
            "pending_tasks": pending_tasks,
            "overdue_tasks": overdue_tasks
        }
    
    @staticmethod
    def _calculate_engagement_score(completion_rate, hours_since_activity, task_count, time_spent):
        """
        Calculates engagement score (0-100) based on multiple factors.
        """
        score = 0
        
        # Completion (0-30 points)
        score += min(completion_rate, 100) * 0.3
        
        # Recency (0-30 points) - Recently active = high score
        if hours_since_activity <= 24:
            score += 30
        elif hours_since_activity <= 72:
            score += 20
        elif hours_since_activity <= 168:  # 1 week
            score += 10
        else:
            score += 0
        
        # Task volume (0-20 points)
        if task_count >= 10:
            score += 20
        elif task_count >= 5:
            score += 15
        elif task_count >= 1:
            score += 10
        
        # Time investment (0-20 points)
        if time_spent >= 1000:  # 16+ hours
            score += 20
        elif time_spent >= 500:  # 8+ hours
            score += 15
        elif time_spent >= 100:  # Some effort
            score += 10
        
        return min(score, 100)
    
    @staticmethod
    def _calculate_activity_trend(user_id):
        """
        Calculates activity trend over the last 7 days.
        Returns: "improving", "stable", "declining"
        """
        try:
            now = datetime.utcnow()
            week_ago = now - timedelta(days=7)
            
            # Get activity from last 7 days
            activities = ActivityLog.query.filter(
                ActivityLog.user_id == user_id,
                ActivityLog.timestamp >= week_ago
            ).all()
            
            if len(activities) < 2:
                return "insufficient_data"
            
            # Split into first half and second half of the week
            first_half = len([a for a in activities if a.timestamp < (week_ago + timedelta(days=3.5))])
            second_half = len([a for a in activities if a.timestamp >= (week_ago + timedelta(days=3.5))])
            
            if second_half > first_half * 1.2:
                return "improving"
            elif first_half > second_half * 1.2:
                return "declining"
            else:
                return "stable"
        except:
            return "unknown"
    
    @staticmethod
    def generate_insight(employee_signals):
        """
        Uses Gemini AI to generate structured, detailed insights based on employee signals.
        Returns: dict with risk_insight, detected_signals, ai_prediction, recommended_actions
        """
        if not employee_signals:
            return None
        
        # Prepare context for Gemini
        context = f"""
        Employee: {employee_signals['name']}
        Department: {employee_signals['department']}
        Task Completion Rate: {employee_signals['completion_rate']}%
        Tasks Completed: {employee_signals['task_completion_count']}
        Missed Deadlines: {employee_signals['missed_deadlines']}
        Total Delay Days: {employee_signals['delayed_days_total']}
        Engagement Score: {employee_signals['engagement_score']}/100
        Hours Since Last Activity: {employee_signals['hours_since_activity']}
        Activity Trend: {employee_signals['activity_trend']}
        Pending Tasks: {employee_signals['pending_tasks']}
        Overdue Tasks: {employee_signals['overdue_tasks']}
        Time Invested: {employee_signals['time_spent_minutes']} minutes
        """
        
        prompt = f"""
        You are an HR analytics AI specialized in employee onboarding assessment. Based on the following employee data:
        
        {context}
        
        Provide a structured JSON response with EXACTLY these fields (no extra fields):
        {{
            "risk_insight": "A 2-3 sentence explanation of what's happening with this employee's onboarding journey. Be specific about behavioral patterns.",
            "detected_signals": ["List", "of", "behavioral", "signals", "such", "as", "low engagement", "missed deadlines", "inactivity", "slow progress", "good engagement", "on track", etc"],
            "ai_prediction": "A single, short prediction (max 8 words) of the likely outcome if current trend continues. Examples: 'Will miss next deadline', 'Engagement improving', 'At risk of project delay', 'On track for completion'",
            "recommended_actions": ["Action 1: Specific and actionable", "Action 2: Include who should do it", "Action 3: Include timeline if relevant"]
        }}
        
        IMPORTANT RULES:
        - If engagement_score < 30: Flag as low engagement
        - If overdue_tasks > 0: Flag as missed deadlines  
        - If hours_since_activity > 72: Flag as inactivity
        - If completion_rate < 40: Flag as slow progress
        - If completion_rate >= 80 AND missed_deadlines == 0: Flag as good progress
        - Make predictions NEGATIVE if there are critical issues (overdue_tasks, low engagement, missed deadlines)
        - Make predictions POSITIVE if completion > 70% and activity is recent
        - Recommended actions should be concrete and specific to the employee's situation
        - Actions should include who should do them (Manager, Team Lead, Mentor, HR)
        
        Return ONLY valid JSON, no markdown code blocks.
        """
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            # Parse response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            insight_data = json.loads(response_text)
            
            return {
                "user_id": employee_signals['user_id'],
                "name": employee_signals['name'],
                "risk_insight": insight_data.get("risk_insight", ""),
                "detected_signals": insight_data.get("detected_signals", []),
                "ai_prediction": insight_data.get("ai_prediction", ""),
                "recommended_actions": insight_data.get("recommended_actions", []),
                "engagement_score": employee_signals['engagement_score'],
                "completion_rate": employee_signals['completion_rate']
            }
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            return None
        except Exception as e:
            print(f"Gemini API Error: {e}")
            # Fallback to rule-based insight
            return AIInsightsService._generate_fallback_insight(employee_signals)
    
    @staticmethod
    def _generate_fallback_insight(signals):
        """
        Generates a fallback insight if Gemini API fails.
        """
        completion = signals['completion_rate']
        engagement = signals['engagement_score']
        missed = signals['missed_deadlines']
        overdue = signals['overdue_tasks']
        hours_inactive = signals['hours_since_activity']
        
        # Determine risk insight
        if overdue > 0 or missed > 0:
            risk_insight = f"{signals['name']} has missed {missed} deadlines with {overdue} overdue tasks. This indicates potential time management issues or capacity constraints."
            prediction = "Will miss additional deadlines"
            actions = [
                "Manager: Schedule 1:1 meeting to understand blockers",
                "HR: Review task workload distribution",
                "Mentor: Provide time management guidance",
                "Manager: Consider timeline adjustments"
            ]
        elif engagement < 30:
            risk_insight = f"{signals['name']} shows low engagement (Score: {engagement}/100) with no activity for {int(hours_inactive)} hours. May need support or onboarding adjustments."
            prediction = "Risk of disengagement"
            actions = [
                "Manager: Check in on progress and challenges",
                "HR: Offer onboarding support",
                "Team Lead: Assign buddy/mentor",
                "Manager: Ensure clear expectations"
            ]
        elif completion < 40:
            risk_insight = f"{signals['name']} has completed only {completion}% of assigned tasks. May need additional training or clarification on expectations."
            prediction = "Slow onboarding progress"
            actions = [
                "Manager: Review task clarity",
                "HR: Provide training resources",
                "Mentor: Offer hands-on support",
                "Team: Schedule knowledge transfer session"
            ]
        else:
            risk_insight = f"{signals['name']} is making steady progress with {completion}% completion and good engagement ({engagement}/100). On track for successful onboarding."
            prediction = "On track for successful onboarding"
            actions = [
                "Manager: Acknowledge good progress",
                "Team: Continue current support level",
                "HR: Prepare next phase onboarding",
                "Manager: Plan skill development"
            ]
        
        return {
            "user_id": signals['user_id'],
            "name": signals['name'],
            "risk_insight": risk_insight,
            "detected_signals": [
                "Low engagement" if engagement < 30 else "Good engagement",
                "Missed deadlines" if missed > 0 else "Deadline compliance",
                "Inactive" if hours_inactive > 72 else "Active",
                "Slow progress" if completion < 40 else "Good progress"
            ],
            "ai_prediction": prediction,
            "recommended_actions": actions,
            "engagement_score": engagement,
            "completion_rate": completion
        }
    
    @staticmethod
    def get_all_insights():
        """
        Generates insights for all employees.
        """
        employees = User.query.filter(
            (User.role.ilike("employee")) | (User.role.ilike("intern"))
        ).all()
        
        insights = []
        for emp in employees:
            signals = AIInsightsService.collect_employee_signals(emp.id)
            if signals:
                insight = AIInsightsService.generate_insight(signals)
                if insight:
                    insights.append(insight)
        
        return insights

