from flask import Flask, request, jsonify
import pickle
import numpy as np
import os
import google.generativeai as genai

app = Flask(__name__)

# Set the absolute path for the training folder
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'training')

# Load the models and scalers
def load_pickle(file_name):
    with open(os.path.join(MODEL_DIR, file_name), 'rb') as f:
        return pickle.load(f)

# Load models
models = {
    'diabetes': load_pickle('diabetes_model.pkl'),
    'heart': load_pickle('heart_model.pkl'),
    'lung': load_pickle('lung_model.pkl'),
    'parkinsons': load_pickle('parkinsons_model.pkl'),
    'liver': load_pickle('liver_model.pkl')
}

# Load scalers
scalers = {
    'diabetes': load_pickle('diabetes_scaler.pkl'),
    'heart': load_pickle('heart_scaler.pkl'),
    'lung': load_pickle('lung_scaler.pkl'),
    'parkinsons': load_pickle('parkinsons_scaler.pkl'),
    'liver': load_pickle('liver_scaler.pkl')
}

# Optional: Set expected input counts for validation
expected_input_counts = {
    'diabetes': 8,
    'heart': 13,
    'lung': 15,
    'parkinsons': 22,
    'liver': 10
}

# Initialize Gemini AI with environment variable or fallback (replace with real key)
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyAvPpDiLbuzfvKKnfXoEONneqA9pdFqWLw'))
myai = genai.GenerativeModel('gemini-pro')

# Prediction endpoint
@app.route('/predict/<disease>', methods=['POST'])
def predict_disease(disease):
    try:
        disease = disease.strip().lower()

        if disease not in models:
            return jsonify({'error': f"Unsupported disease type: {disease}"}), 400

        input_data = request.json
        values = list(input_data.values())

        if len(values) != expected_input_counts[disease]:
            return jsonify({
                'error': f"{disease.capitalize()} model expects {expected_input_counts[disease]} input values, but got {len(values)}"
            }), 400

        scaler = scalers[disease]
        model = models[disease]

        scaled_data = scaler.transform([values])
        prediction = model.predict(scaled_data)[0]
        result = 'Positive' if prediction == 1 else 'Negative'

        return jsonify({'prediction': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recommendation endpoint
@app.route('/recommend/<disease>', methods=['POST'])
def recommend_disease(disease):
    try:
        disease = disease.strip().lower()

        if disease not in models:
            return jsonify({'error': f"Unsupported disease type: {disease}"}), 400

        input_data = request.json
        prediction = input_data.get('prediction', 'Unknown')

        prompt = (
            f"The following health parameters were provided:\n"
            f"{input_data}\n\n"
            f"The diagnosis is: {prediction}.\n"
            "Based on the values given, if the person has the disease, explain the possible causes (with subheading). "
            "If not, skip this section. Then, in the next subheading, highlight any abnormal (high/low) values and provide normal ranges. "
            "Next, give proper health recommendations. Lastly, suggest appropriate foods that can help improve any abnormal values."
        )

        response = myai.generate_content(prompt)
        recommendations = response.candidates[0].content.parts[0].text

        return jsonify({'recommendations': recommendations})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the server
if __name__ == '__main__':
    app.run(debug=True)
