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
