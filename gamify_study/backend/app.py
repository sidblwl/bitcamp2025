from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from detector import is_user_studying

app = Flask(__name__)

# CORS setup to allow React frontend
CORS(app, resources={r"/*": {"origins": "*"}})


# Global flag to track paused state
PAUSE_STATE = {"paused": False}

@app.route("/cv-detect", methods=["POST", "OPTIONS"])
def cv_detect():
    if request.method == "OPTIONS":
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
        return jsonify({
            "isStudying": is_studying,
            "isPaused": PAUSE_STATE["paused"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/pause-timer", methods=["POST"])
def pause_timer():
    try:
        PAUSE_STATE["paused"] = True
        print("🔴 Study timer paused by extension!")
        return jsonify({"message": "Timer paused"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-pause-state", methods=["GET"])
def get_pause_state():
    return jsonify(PAUSE_STATE)

@app.route("/reset-pause-state", methods=["POST"])
def reset_pause_state():
    PAUSE_STATE["paused"] = False
    print("✅ Pause state reset")
    return jsonify({"message": "Pause reset"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
