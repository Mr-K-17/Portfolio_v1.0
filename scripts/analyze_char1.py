import cv2
import numpy as np
import os

cap1 = cv2.VideoCapture("source-videos/character1.mp4")
frames1 = []
while True:
    ret, frame = cap1.read()
    if not ret:
        break
    frames1.append(frame)
cap1.release()

print(f"character1 total frames: {len(frames1)}")

# In character1.mp4:
# 0..15: Center neutral gaze
# 20..45: Looking UP (max UP around 35)
# 50..85: Looking UP-RIGHT / RIGHT (around 75 is UP-RIGHT, 85 is RIGHT)
# 90..115: Looking DOWN-RIGHT / DOWN (around 105 is DOWN-RIGHT, 110 is DOWN)
# 120..140: Looking DOWN / DOWN-LEFT
# 150..170: Returning from DOWN
# 175..191: Center neutral gaze

# Let's save a contact sheet of character1 with 16 samples
os.makedirs("scripts/poses1", exist_ok=True)
for i in range(0, 192, 12):
    cv2.imwrite(f"scripts/poses1/c1_sample_{i:03d}.png", frames1[i])

print("Saved character1 sample frames")
