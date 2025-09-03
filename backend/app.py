print(">>> Running this app.py file")

from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

# Load the trained model
model_path = r'C:\Users\Pragati\OneDrive\Desktop\Desktop\flask-react-app\backend\stroke_prediction_model.joblib'
model = load(model_path)
logging.info(f"Model loaded from {model_path}")

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Health check route
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Validate and map frontend keys to backend/model keys
        # Provide defaults or raise error if missing required fields
        age = data.get("age")
        hypertension = data.get("hypertension")
        heart_disease = data.get("heart_disease")
        ever_married = data.get("ever_married")
        work_type = data.get("work_type")
        residence_type = data.get("residence_type")  # fixed key name
        avg_glucose_level = data.get("glucose_level")  # fixed key name
        bmi = data.get("bmi")
        smoking_status = data.get("smoking_status")

        # Basic validation
        if age is None or avg_glucose_level is None or bmi is None:
            return jsonify({"error": "Missing required numeric fields: age, glucose_level, or bmi"}), 400

        # Construct input dict for model
        mapped_data = {
            "age": float(age),
            "hypertension": int(hypertension) if hypertension is not None else 0,
            "heart_disease": int(heart_disease) if heart_disease is not None else 0,
            "ever_married": ever_married if ever_married else "No",
            "work_type": work_type if work_type else "Private",
            "residence_type": residence_type if residence_type else "Urban",
            "avg_glucose_level": float(avg_glucose_level),
            "bmi": float(bmi),
            "smoking_status": smoking_status if smoking_status else "never"
        }

        df = pd.DataFrame([mapped_data])

        # Make prediction
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]  # probability of stroke
        probability_percent = round(probability * 100, 2)

        return jsonify({
            "prediction": int(prediction),
            "probability": probability_percent
        })

    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 400

# Home route
@app.route('/')
def home():
    return "Welcome to the Stroke Prediction API"

if __name__ == "__main__":
    print(">>> Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
