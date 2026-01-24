from flask import Flask
from config.init_db import init_database
from routes.user_routes import user_routes
from routes.task_routes import task_routes
from routes.progress_routes import progress_routes

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:ThunderGod098@localhost/onboardai"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

init_database(app)

app.register_blueprint(user_routes, url_prefix="/api")
app.register_blueprint(task_routes, url_prefix="/api")
app.register_blueprint(progress_routes, url_prefix="/api")

@app.route("/")
def home():
    return "🚀 OnboardAI Backend Running..."

if __name__ == "__main__":
    app.run(debug=True)
