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

# Shared pause state including a reason
PAUSE_STATE = {"paused": False, "pause_reason": None}
MISS_COUNT = {"count": 0}
HIT_COUNT = {"count": 0}
MAX_BUFFER = 1

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

        if not is_studying:
            MISS_COUNT["count"] += 1
            HIT_COUNT["count"] = 0  # Reset streak of good frames
            print(f"😴 Not studying. Miss #{MISS_COUNT['count']}")
        else:
            HIT_COUNT["count"] += 1
            MISS_COUNT["count"] = 0
            print(f"✅ Studying detected! Hit #{HIT_COUNT['count']}")

        # Auto-pause: if distracted for MAX_BUFFER consecutive checks and not already paused
        if MISS_COUNT["count"] >= MAX_BUFFER and not PAUSE_STATE["paused"]:
            PAUSE_STATE["paused"] = True
            PAUSE_STATE["pause_reason"] = "face"
            HIT_COUNT["count"] = 0  # clear resume count
            print("🔴 Auto-paused due to consecutive distractions.")

        # Auto-resume: if focused for MAX_BUFFER consecutive checks and we're paused auto
        if HIT_COUNT["count"] >= MAX_BUFFER and PAUSE_STATE["paused"] and PAUSE_STATE["pause_reason"] == "face":
            PAUSE_STATE["paused"] = False
            PAUSE_STATE["pause_reason"] = None
            MISS_COUNT["count"] = 0
            print("✅ Auto-resumed after consecutive focused frames.")

        return {
            "isStudying": is_studying,
            "isPaused": PAUSE_STATE["paused"],
            "pauseReason": PAUSE_STATE.get("pause_reason")
        }

    except Exception as e:
        return {"error": str(e)}

# POST /pause-timer
@app.post("/pause-timer")
async def pause_timer(request: Request):
    PAUSE_STATE["paused"] = True
    PAUSE_STATE["pause_reason"] = "user"  # Mark as a user pause
    print("🔴 Study timer paused by user")
    return {"message": "Timer paused"}

@app.post("/site-detect")
async def pause_timer(request: Request):
    data = await request.json()
    site = data.get("site", "unknown")
    full_url = data.get("fullUrl", "unknown")

    PAUSE_STATE["paused"] = True
    PAUSE_STATE["pause_reason"] = "site"
    PAUSE_STATE["site"] = site
    PAUSE_STATE["url"] = full_url

    print(f"🔴 Auto-paused due to user visiting: {site} ({full_url})")
    return {"message": f"Timer paused due to {site}"}

@app.post("/site-closed")
async def reset_pause_state():
    PAUSE_STATE["paused"] = False
    print("✅ Auto-resumed due to user closing disallowed site")
    return {"message": "Pause reset"}

# GET /get-pause-state
@app.get("/get-pause-state")
async def get_pause_state(request: Request):
    return PAUSE_STATE

# POST /reset-pause-state
@app.post("/reset-pause-state")
async def reset_pause_state():
    PAUSE_STATE["paused"] = False
    PAUSE_STATE["pause_reason"] = None
    print("✅ Backend Reset")
    print(f"PAUSE STATE: {PAUSE_STATE["paused"]}, PAUSE REASON: {PAUSE_STATE["pause_reason"]}")
    return {"message": "Pause reset"}

