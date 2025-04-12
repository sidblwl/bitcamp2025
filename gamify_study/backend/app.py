from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from detector import is_user_studying

app = Flask(__name__)

# CORS setup to allow React frontend
CORS(app, resources={r"/cv-detect": {"origins": "http://localhost:3000"}})

@app.route("/cv-detect", methods=["POST", "OPTIONS"])
def cv_detect():
    if request.method == "OPTIONS":
        # Preflight request response
        return '', 200

    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({"error": "Missing image"}), 400

        # Decode the base64 image
        image_data = data["image"].split(",")[1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        is_studying = is_user_studying(frame)
        return jsonify({"isStudying": is_studying})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
