from flask import Flask, request, jsonify
from flask_cors import CORS  # 👈 import this
import subprocess

app = Flask(__name__)
CORS(app)

@app.route("/preview-filter", methods=["POST"])
def preview_filter():
    data = request.json
    filter_path = data.get("filterPath")
    
    if not filter_path:
        return jsonify({"error": "No filter path provided"}), 400

    try:
        # Call the webcam script with the filter path as an argument
        subprocess.Popen(["python3", "webcam_overlay.py", filter_path])
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5005)
