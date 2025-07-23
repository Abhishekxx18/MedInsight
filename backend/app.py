from dotenv import load_dotenv
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from google import genai
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime
import pickle       
import numpy as np
import uuid
import os
from functools import wraps

load_dotenv()

app = Flask(__name__, static_folder='./dist', static_url_path='')
CORS(app, origins=["http://localhost:5173", "*"])

# Set the absolute path for the training folder
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'training')

# MongoDB Configuration
mongodb_uri = os.getenv('MONGODB_URI')

client = MongoClient(mongodb_uri)
db = client["insights_db"]

# User Schema
users_collection = db["users"]
# Chat History Schema
chat_history_collection = db["chat_history"]
# Form History Schema
prediction_history_collection = db["prediction_history"]

JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'super_secret_jwt_auth_key_which_is_not_so_secret') 

def generate_token(user_id):
    random_uid = uuid.uuid4().hex[:8]
    payload = {
        'user_id': str(user_id),
        'random_uid': str(random_uid)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
        

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

# Initialize Gemini AI with environment variable
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

def get_optional_user_id():
    auth_header = request.headers.get('Authorization', None)
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user_id = decode_token(token)
        return user_id
    return None

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
        token = auth_header.split(' ')[1]
        user_id = decode_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        g.user_id = user_id
        return f(*args, **kwargs)
    return decorated

# serve index.html on / route
@app.route('/', methods=['GET'])
def serve_index():
    return app.send_static_file('index.html')


# ping route
@app.route('/health', methods=['GET'])
def ping():
    return jsonify({'status': 'ok'}), 200

# User Sign-In Endpoint
@app.route('/api/sign-in', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user_data = users_collection.find_one({
            'email': email,
        })

        if not user_data:
            return jsonify({'error': 'User not found'}), 401
        
        is_valid_password = check_password_hash(user_data.get("password") ,password)
        if not is_valid_password:
            return jsonify({'error': 'Invalid password'}), 401
        
        user_data['id'] = str(user_data['_id'])
        user_data.pop('password', None)  # Remove password from response
        user_data.pop('_id', None)  # Remove _id from response

        token = generate_token(user_data['id'])

        # update auth token in the user schema
        users_collection.update_one(
            {'email': email},
            {'$set': {'auth_token': token}}
        )

        return jsonify({ 'message': 'User Login successfully', 'token': token, 'user_data': user_data }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Sign-Up Endpoint
@app.route('/api/sign-up', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        avatar = data.get("avatar", None)
        provider = data.get('provider', 'email')

        if not name or not email or not password:
            return jsonify({'error': 'Missing required fields'}), 400

        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 409

        hashed_password = generate_password_hash(password)

        user_data = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'provider': provider,
            'avatar': avatar,
            'auth_token': "",
            'id': "",
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        result = users_collection.insert_one(user_data)
        
        users_collection.update_one(
            {'_id': result.inserted_id},
            {'$set': {'id': str(result.inserted_id)}}
        )

        created_user = users_collection.find_one({'_id': result.inserted_id})

        if not created_user:
            return jsonify({'error': 'Failed to create user'}), 500

        created_user['id'] = str(created_user.get('_id', ''))
        created_user.pop('password', None)
        created_user.pop('_id', None)

        token = generate_token(created_user['id'])

        # update auth token in the user schema
        users_collection.update_one(
            {'email': email},
            {'$set': {'auth_token': token}}
        )

        return jsonify({ 'message': 'User registered successfully', 'token': token,  'user_data': created_user }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Sign-Out Endpoint
@app.route('/api/sign-out', methods=['POST'])
def signout():
    try:
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
        token = auth_header.split(' ')[1]
        user_id = decode_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        users_collection.find_one_and_update({'id': user_id, 'auth_token': token}, {'$set': {'auth_token': ''}})
        return jsonify({'message': 'User signed out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Prediction endpoint
@app.route('/api/predict/<disease>', methods=['POST'])
def predict_disease(disease):
    try:
        disease = disease.strip().lower()
        if disease not in models:
            return jsonify({'error': f"Unsupported disease type: {disease}"}), 400
        input_data = request.get_json()
        if input_data is None:
            return jsonify({'error': 'No input data provided'}), 400
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

        session_id = request.headers.get('SessionId', None)
        if session_id:
            # create or update based on session_id
            auth_header = request.headers.get('Authorization', "Bearer ")
            token = str(auth_header.split(' ')[1])
            user_id = decode_token(token.strip())
            if user_id:
                user = users_collection.find_one({'auth_token': token})
                if not user or user.get('auth_token') != token:
                    return jsonify({'error': 'Invalid token'}), 401

                prediction_history_collection.update_one(
                    {'session_id': session_id, 'user_id': user_id, 'disease': disease},
                    {'$set': {'prediction': result, 'input_data': input_data, 'updated_at': datetime.now()}, "$setOnInsert": {"created_at": datetime.now()}},
                    upsert=True
                )

        return jsonify({'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recommendation endpoint
@app.route('/api/recommend/<disease>', methods=['POST'])
def recommend_disease(disease):
    try:
        disease = disease.strip().lower()
        if disease not in models:
            return jsonify({'error': f"Unsupported disease type: {disease}"}), 400
        input_data = request.get_json()
        if input_data is None:
            return jsonify({'error': 'No input data provided'}), 400
        prediction = input_data.get('prediction', 'Unknown')
        prompt = (f"""The following health parameters were provided:\n{input_data}\n\nThe diagnosis is: {prediction}.\nBased on the values given, if the person has the disease, explain the possible causes (with subheading). \nIf not, skip this section. Then, in the next subheading, highlight any abnormal (high/low) values and provide normal ranges. \nNext, give proper health recommendations. Lastly, suggest appropriate foods that can help improve any abnormal values."""
        )
        response = client.models.generate_content(
            model='gemini-2.0-flash-001', contents=prompt
        )
        recommendations = response.text
        
        session_id = request.headers.get('SessionId', None)
        if session_id:
            # create or update based on session_id
            auth_header = request.headers.get('Authorization', "Bearer ")
            token = str(auth_header.split(' ')[1])
            user_id = decode_token(token.strip())
            if user_id:
                user = users_collection.find_one({'auth_token': token})
                if not user or user.get('auth_token') != token:
                    return jsonify({'error': 'Invalid token'}), 401
                prediction_history_collection.update_one(
                    {'session_id': session_id, 'user_id': user_id, 'disease': disease},
                    {'$set': {'recommendation': recommendations, 'input_data': input_data, 'updated_at': datetime.now()}, "$setOnInsert": {"created_at": datetime.now()}},
                    upsert=True
                )

        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat endpoint
@app.route('/api/chat/<disease>', methods=['POST'])
def chat(disease):
    try:
        disease = disease.strip().lower()
        if disease not in models:
            return jsonify({'error': f"Unsupported disease type: {disease}"}), 400

        default_messages = [
            { "user": False, "message": "Hello! I'm your health assistant. How can I help you today?" }
        ]

        input_data = request.get_json()
        if input_data is None:
            return jsonify({'error': 'No input data provided'}), 400
        
        user_messages = input_data.get('messages', default_messages)
        form_data = input_data.get('form_data')
        prediction = input_data.get('prediction', "Form Data needed to get prediction" if len(form_data.items()) >= 0 else None)
        recommendation = input_data.get('recommendation', "Form Data needed to get recommendation" if len(form_data.items()) >= 0 else None)

        session_id = request.headers.get('SessionId', None)
        if session_id:
            # create or update based on session_id
            auth_header = request.headers.get('Authorization', "Bearer ")
            token = str(auth_header.split(' ')[1])
            user_id = decode_token(token.strip())
            if user_id:
                user = users_collection.find_one({'auth_token': token})
                if not user or user.get('auth_token') != token:
                    return jsonify({'error': 'Invalid token'}), 401
                
                prediction_history = prediction_history_collection.find_one({'session_id': session_id, 'user_id': user_id, 'disease': disease})
                if prediction_history:
                    default_messages = prediction_history.get('messages', default_messages)
                    user_messages = prediction_history.get('messages', default_messages)
                    message = input_data.get('message', "Hi")
                    user_messages.append({ "user": True, "message": message })
        else:
            user_messages.append({ "user": True, "message": "Hi" })

        # Properly format user messages
        formatted_messages = [
            f"User: {msg['message']}" if msg["user"] else f"Assistant: {msg['message']}"
            for msg in user_messages
        ]

        prompt = f"""You are a professional, AI-powered **medical assistant chatbot** specializing in diseases related to the **heart, lungs, liver, parkinsons, and diabetes**. You are not a doctor, but you provide **medically accurate, empathetic, and easy-to-understand explanations**. You act as a supportive first step in a patient's health journey and always encourage consulting a licensed healthcare provider for diagnosis, treatment, or emergencies.

Your communication style should be:

* **Professional and caring**
* **Short, clear sentences**, like a helpful human would speak
* **Simple language**, avoiding complex jargon unless it's explained
* **Reassuring and non-alarming**, especially when discussing serious topics

When responding:

* Use a **natural, conversational tone**—you should sound like a real person who cares.
* Keep sentences **concise and human-like**, especially in follow-up answers.
* Provide helpful guidance on symptoms, risk factors, diagnosis, and general treatment options.
* Encourage users to seek professional care for medical decisions or emergencies.
* Never offer a direct diagnosis or prescribe treatments.
* If the user describes urgent symptoms (like chest pain or shortness of breath), **strongly recommend immediate medical attention.**

Include statements like:

* "I'm here to help explain things, but a doctor should confirm anything medical."
* "If you feel worse or unsure, it's safest to talk to a healthcare provider."
* "That sounds serious—please get medical help right away."

Current context:

- User has access to our disease prediction system
- Available predictions: diabetes, parkinsons, heart disease, lung disease and liver disease.
- User is currently consulting for {disease} related disease
- Our system provides recommendations based on AI analysis

Form Data:
{('\n'.join([f"- {k}: {v}" for k, v in form_data.items()]) if form_data else "User has not provided any form data")}

Prediction:
{f"User has been tested for {disease} and the result is {prediction}" if prediction else f"user has not predicted anything for {disease}. Ask user to fill form data and hit get prediction button"}

Recommendation:
{recommendation if recommendation else f"user has not recommended anything for {disease}. Ask user to fill form data and hit get recommendation button"}

Conversation History:

{"\n".join(formatted_messages)}

Use this context to generate a short, supportive, and medically-informed response.
"""

        response = client.models.generate_content(
            model='gemini-2.0-flash-001', contents=prompt,
        )
        message = response.text

        if user_id:
            user_messages.append({ "user": False, "message": message })
            prediction_history_collection.update_one(
                {'session_id': session_id, 'user_id': user_id, 'disease': disease},
                {'$set': {'messages': user_messages, 'updated_at': datetime.now()}, "$setOnInsert": {"created_at": datetime.now()}},
                upsert=True
            )

        return jsonify({'message': message})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Prediction History Endpoint
@app.route('/api/prediction_history', methods=['GET'])
def get_chat_history():
    try:
        auth_header = request.headers.get('Authorization', "Bearer ")
        token = str(auth_header.split(' ')[1])
        user_id = decode_token(token.strip())
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        user = users_collection.find_one({'id': user_id})
        if not user or user.get('auth_token') != token:
            return jsonify({'error': 'Invalid token'}), 401
        history = list(prediction_history_collection.find({'user_id': user_id}, {'_id': 0, 'user_id': 0, 'created_at': 0}))
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Session History Endpoint
@app.route('/api/session_history', methods=['GET'])
def get_session_history():
    try:
        # Get session_id and disease from query parameters (?session_id=...)
        session_id = request.args.get('session_id')
        disease = request.args.get('disease')
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        auth_header = request.headers.get('Authorization', "Bearer ")
        token = str(auth_header.split(' ')[1])
        user_id = decode_token(token.strip())
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        user = users_collection.find_one({'id': user_id})
        if not user or user.get('auth_token') != token:
            return jsonify({'error': 'Invalid token'}), 401
        session_history = prediction_history_collection.find_one(
            {'session_id': session_id, 'user_id': user_id, 'disease': disease},
            {'_id': 0, 'user_id': 0, 'created_at': 0, 'updated_at': 0}
        )
        return jsonify({'history': session_history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
