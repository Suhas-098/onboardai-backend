from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
from config.init_db import init_database
from routes.auth_routes import auth_routes
from routes.user_routes import user_routes
from routes.task_routes import task_routes
from routes.progress_routes import progress_routes
from routes.dashboard_routes import dashboard_routes
from routes.ai_routes import ai_routes
from routes.employee_routes import employee_routes
from routes.risk_routes import risk_routes
from routes.alert_routes import alert_routes
from routes.reports_routes import reports_routes
from routes.admin_routes import admin_routes

from config.config import Config

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

app.config.from_object(Config)
init_database(app)

app.register_blueprint(auth_routes, url_prefix="/api")
app.register_blueprint(user_routes, url_prefix="/api")
app.register_blueprint(task_routes, url_prefix="/api")
app.register_blueprint(progress_routes, url_prefix="/api")
app.register_blueprint(dashboard_routes, url_prefix="/api")
app.register_blueprint(ai_routes, url_prefix="/api")
app.register_blueprint(employee_routes, url_prefix="/api")
app.register_blueprint(risk_routes, url_prefix="/api")
app.register_blueprint(alert_routes, url_prefix="/api")
app.register_blueprint(reports_routes, url_prefix="/api")
app.register_blueprint(admin_routes, url_prefix="/api")
from routes.template_routes import template_routes
app.register_blueprint(template_routes, url_prefix="/api")
from routes.notification_routes import notification_routes
from routes.search_routes import search_routes
app.register_blueprint(notification_routes, url_prefix="/api")
app.register_blueprint(search_routes, url_prefix="/api")


@app.route("/")
def home():
    return "🚀 OnboardAI Backend Running.."

if __name__ == "__main__":
    app.run(debug=True)
