from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import cv2
import numpy as np
from detector import is_user_studying  # ✅ keep your existing detector.py

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Shared pause state
PAUSE_STATE = {"paused": False}

# Base64 image input model
class ImagePayload(BaseModel):
    image: str

# POST /cv-detect
@app.post("/cv-detect")
async def cv_detect(payload: ImagePayload):
    try:
        # Decode base64 image
        image_data = payload.image.split(",")[1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        is_studying = is_user_studying(frame)
        return {
            "isStudying": is_studying,
            "isPaused": PAUSE_STATE["paused"]
        }
    except Exception as e:
        return {"error": str(e)}

# POST /pause-timer
@app.post("/pause-timer")
async def pause_timer(request: Request):
    PAUSE_STATE["paused"] = True
    print("🔴 Study timer paused by extension!")
    return {"message": "Timer paused"}

# GET /get-pause-state
@app.get("/get-pause-state")
async def get_pause_state(request: Request):
    print("🔍 Headers received:", dict(request.headers))
    return PAUSE_STATE

# POST /reset-pause-state
@app.post("/reset-pause-state")
async def reset_pause_state():
    PAUSE_STATE["paused"] = False
    print("✅ Pause state reset")
    return {"message": "Pause reset"}
