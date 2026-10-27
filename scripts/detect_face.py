import cv2
import numpy as np

cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
face_cascade = cv2.CascadeClassifier(cascade_path)

cap = cv2.VideoCapture("source-videos/character.mp4")
frame_idx = 0
face_data = []

while True:
    ret, frame = cap.read()
    if not ret:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(100, 100))
    if len(faces) > 0:
        x, y, w, h = faces[0]
        face_data.append((frame_idx, x, y, w, h))
    else:
        face_data.append((frame_idx, None))
    frame_idx += 1
cap.release()

detected = [f[0] for f in face_data if f[1] is not None]
print(f"Frontal face detected in frames: {detected}")
