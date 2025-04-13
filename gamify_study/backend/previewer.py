import cv2
import numpy as np

# Load Haar cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Load hat image
hat = cv2.imread('/Users/lureta/Desktop/personalApps/bitcamp2025/gamify_study/public/filters/santahat.png', cv2.IMREAD_UNCHANGED)
if hat is None:
    raise FileNotFoundError("Hat image not found!")

def overlay_image_alpha(img, overlay, pos):
    x, y = pos
    h, w = overlay.shape[:2]
    if x < 0 or y < 0 or x + w > img.shape[1] or y + h > img.shape[0]:
        return
    alpha = overlay[:, :, 3] / 255.0
    for c in range(3):
        img[y:y+h, x:x+w, c] = alpha * overlay[:, :, c] + (1 - alpha) * img[y:y+h, x:x+w, c]

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# Tracking setup
tracker = None
tracker_initialized = False
frame_count = 0
detection_interval = 10  # detect every 10 frames

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    frame_display = frame.copy()

    if frame_count % detection_interval == 0 or not tracker_initialized:
        # Run face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            tracker = cv2.TrackerKCF_create()
            tracker.init(frame, (x, y, w, h))
            tracker_initialized = True
    elif tracker_initialized:
        # Update tracker
        success, box = tracker.update(frame)
        if success:
            x, y, w, h = [int(v) for v in box]
        else:
            tracker_initialized = False
            frame_count = 0  # force redetect
            continue

        # Resize hat and overlay
        hat_width = w
        hat_height = int(hat_width * hat.shape[0] / hat.shape[1])
        hat_resized = cv2.resize(hat, (hat_width, hat_height))

        y_offset = y - hat_height + 10
        overlay_image_alpha(frame_display, hat_resized, (x, y_offset))

    cv2.imshow('Santa Hat Filter', frame_display)
    frame_count += 1

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()
