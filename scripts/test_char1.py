import cv2
import numpy as np

cap = cv2.VideoCapture("source-videos/character1.mp4")
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

print(f"character1 total frames: {len(frames)}")

# In character1:
# Frames 0..12: Center
# Frames 24..45: Looking UP
# Frames 55..75: Looking UP-LEFT
# Frames 80..95: Looking LEFT / UP-LEFT
# Frames 105..120: Looking DOWN-LEFT
# Frames 125..140: Looking DOWN
# Frames 155..170: Looking DOWN / transitioning to Center
# Frames 175..191: Center neutral gaze

# Let's save samples for character1
import os
os.makedirs("scripts/poses1", exist_ok=True)
sample_indices = [0, 20, 35, 60, 75, 90, 110, 130, 160, 185, 190]
for idx in sample_indices:
    cv2.imwrite(f"scripts/poses1/c1_{idx:03d}.png", frames[idx])

print("Saved character1 poses")
