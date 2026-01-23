from flask import Flask, jsonify
from config.db import db
from config.init_db import init_database

app=Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:ThunderGod098@localhost/onboardai"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

init_database(app)

@app.route("/")
def home():
    return "🚀OnboardAI Backend Running..."

if __name__=="__main__":
    app.run(debug=True)