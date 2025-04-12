import cv2
import mediapipe as mp

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Create the face detection model once (so it's not reinitialized every frame)
face_detector = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)

def is_user_studying(frame):
    # Convert to RGB (MediaPipe expects RGB input)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_detector.process(rgb)
    
    if results.detections:
        return True
    else:
        return False

    # if results.detections:
    #     for detection in results.detections:
    #         # Draw face bounding box for debug purposes
    #         mp_drawing.draw_detection(frame, detection)

    #     # ✅ Show debug popup
    #     cv2.imwrite("debug_output.jpg", frame)
    #     cv2.waitKey(1000)  # Show for 1 second (1000 ms)
    #     cv2.destroyAllWindows()

    #     return True
    # else:
    #     # Also show image when nothing is detected (optional)
    #     cv2.imwrite("debug_output.jpg", frame)

    #     cv2.waitKey(1000)
    #     cv2.destroyAllWindows()

    #     return False
