import cv2
import numpy as np

cap = cv2.VideoCapture("source-videos/character.mp4")
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

# Let's inspect frames 114 to 128
for i in range(114, 128):
    cv2.imwrite(f"scripts/poses/trans_up_{i}.png", frames[i])

# Let's also inspect frames 14 to 22
for i in range(14, 23):
    cv2.imwrite(f"scripts/poses/trans_up_start_{i}.png", frames[i])

print("Saved trans_up frames")
