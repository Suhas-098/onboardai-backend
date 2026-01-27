import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib


def train_model():
    print("📊 Loading dataset...")

    df = pd.read_csv("services/onboarding_real_data.csv")

    print("✅ Rows loaded:", len(df))
    print("✅ Columns:", df.columns.tolist())

    # Inputs (features)
    X = df[["completion", "delay_days", "tasks_completed", "time_spent"]]

    # Output (label)
    y = df["label"]

    print("🤖 Training ML model...")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )

    model = RandomForestClassifier(n_estimators=200)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print("\n✅ Model Accuracy:", accuracy)
    print("\n📈 Classification Report:\n")
    print(classification_report(y_test, predictions))

    joblib.dump(model, "services/model.pkl")
    print("\n💾 Model saved to services/model.pkl")


# FORCE run training
train_model()
