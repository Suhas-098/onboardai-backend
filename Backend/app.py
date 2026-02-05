from flask import Flask
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

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:ThunderGod098@localhost/onboardai"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

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

@app.route("/")
def home():
    return "🚀 OnboardAI Backend Running..."

if __name__ == "__main__":
    app.run(debug=True)
