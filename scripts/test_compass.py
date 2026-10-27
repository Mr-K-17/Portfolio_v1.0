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

# Let's inspect LEFT candidates (where he looks to the viewer's left)
# In chunk 1: F#70..F#95. Notice around F#88, he is looking LEFT!
# Let's check F#84, F#88, F#92, F#95.
# Let's also check F#100..F#125 (UP-LEFT).
# Let's create a montage of compass candidate frames:
# We want:
# 1. RIGHT (0 deg): e.g. frame 45, 46, 47, 48
# 2. DOWN-RIGHT (45 deg): e.g. frame 52, 54, 56
# 3. DOWN (90 deg): e.g. frame 158, 160, 162
# 4. DOWN-LEFT (135 deg): e.g. frame 66, 68, 70, or frame 150
# 5. LEFT (180 deg): e.g. frame 76, 80, 84, 88
# 6. UP-LEFT (225 deg): e.g. frame 112, 116, 118, 120
# 7. UP (270 deg): e.g. frame 18, 20, 22
# 8. UP-RIGHT (315 deg): e.g. frame 32, 34, 36, 38
# 9. CENTER: frame 190

candidates = [
    ("RIGHT_46", 46),
    ("DOWN_RIGHT_54", 54),
    ("DOWN_162", 162),
    ("DOWN_LEFT_68", 68),
    ("LEFT_84", 84),
    ("LEFT_88", 88),
    ("UP_LEFT_116", 116),
    ("UP_20", 20),
    ("UP_RIGHT_36", 36),
    ("CENTER_190", 190)
]

for name, idx in candidates:
    cv2.imwrite(f"scripts/poses/comp_{name}.png", frames[idx])

print("Saved comp frames.")
