import cv2
import numpy as np
import sys
import mediapipe as mp

# --- Load Filter Image from Command-Line Argument ---
if len(sys.argv) < 2:
    print("No filter path provided")
    sys.exit(1)

filter_path = sys.argv[1]
hat = cv2.imread(filter_path, cv2.IMREAD_UNCHANGED)

if hat is None:
    print("Failed to load hat image:", filter_path)
    sys.exit(1)

# Resize hat once to reduce per-frame work (adjust size if needed)
hat_width, hat_height = 550, 550
hat_resized = cv2.resize(hat, (hat_width, hat_height))

# --- Setup MediaPipe Face Mesh ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Forehead landmark index
FOREHEAD_IDX = 6

# --- Overlay Function ---
def overlay_image(bg, fg, x, y):
    h_fg, w_fg, _ = fg.shape
    h_bg, w_bg, _ = bg.shape

    # Handle bounds
    if x < 0:
        fg = fg[:, -x:]
        w_fg = fg.shape[1]
        x = 0
    if y < 0:
        fg = fg[-y:, :]
        h_fg = fg.shape[0]
        y = 0
    if x + w_fg > w_bg:
        fg = fg[:, :w_bg - x]
        w_fg = fg.shape[1]
    if y + h_fg > h_bg:
        fg = fg[:h_bg - y, :]
        h_fg = fg.shape[0]

    if h_fg <= 0 or w_fg <= 0:
        return

    # Blend images using alpha channel
    alpha = fg[:, :, 3] / 255.0
    alpha = alpha[:, :, np.newaxis]

    bg_slice = bg[y:y+h_fg, x:x+w_fg]
    blended = (1. - alpha) * bg_slice + alpha * fg[:, :, :3]
    bg[y:y+h_fg, x:x+w_fg] = blended.astype(np.uint8)

# --- Webcam Capture Loop ---
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            h, w, _ = frame.shape
            forehead = face_landmarks.landmark[FOREHEAD_IDX]
            x = int(forehead.x * w)
            y = int(forehead.y * h)

            # Center hat on forehead
            x_offset = x - hat_width // 2
            y_offset = y - hat_height

            overlay_image(frame, hat_resized, x_offset, y_offset)

    cv2.imshow('Accessory Overlay', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
