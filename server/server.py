from flask import Flask, request, jsonify
import base64
import numpy as np
from PIL import Image
from io import BytesIO
import cv2
from flask_cors import CORS  # Import CORS
import util  # Ensure this imports your utility functions

app = Flask(__name__)
CORS(app)  # This will allow all domains by default

@app.route('/classify_image', methods=['POST'])
def classify_image_route():
    try:
        # Debugging: Print request headers
        print("Headers:", request.headers)

        # Debugging: Print raw request data
        print("Raw Data:", request.data.decode("utf-8"))  # Decode bytes to string for readability

        # Check if the request contains valid JSON
        if not request.is_json:
            return jsonify({"error": "Invalid content type. Expected application/json"}), 415

        # Get JSON data from the request
        data = request.get_json()

        # Ensure 'image_data' is in the JSON payload
        if 'image_data' not in data:
            return jsonify({"error": "Missing 'image_data' field in JSON"}), 400

        # Extract the base64 image data
        image_data = data['image_data']

        # Classify the image using the utility function
        results = util.classify_image(image_data)

        # Return the classification results
        return jsonify(results)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask Server...")
    util.load_saved_artifacts()  # Load model and artifacts
    app.run(port=5000, debug=True)  # Enable debug mode for better error logging
