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

# Let's inspect optical flow or face movement between frames to see if it's continuous
# Let's check pairwise differences
print(f"Total frames: {len(frames)}")

# Let's print out what happens in segments:
# 0..20:
# 20..45:
# 45..70:
# 70..95:
# 95..125:
# 125..150:
# 150..175:
# 175..191:

# Let's write a script that saves individual frames for the 8 keyframes
key_candidates = {
    "CENTER_0": 0,
    "CENTER_END": 190,
    "UP_18": 18,
    "UP_RIGHT_35": 35,
    "RIGHT_90": 90,
    "DOWN_RIGHT_52": 52,
    "DOWN_160": 160,
    "DOWN_LEFT_140": 140,
    "LEFT_130": 130,
    "UP_LEFT_118": 118,
}

for name, fidx in key_candidates.items():
    cv2.imwrite(f"scripts/poses/candidate_{name}.png", frames[fidx])

print("Saved candidates")
