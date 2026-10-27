import cv2
import numpy as np
import os

cap0 = cv2.VideoCapture("source-videos/character.mp4")
frames0 = []
while True:
    ret, frame = cap0.read()
    if not ret:
        break
    frames0.append(frame)
cap0.release()

cap1 = cv2.VideoCapture("source-videos/character1.mp4")
frames1 = []
while True:
    ret, frame = cap1.read()
    if not ret:
        break
    frames1.append(frame)
cap1.release()

print(f"Loaded: character.mp4={len(frames0)} frames, character1.mp4={len(frames1)} frames")

# Harmonize character1 background to exactly match character.mp4 (#a9282d / BGR [45, 40, 169])
bg0 = np.array([45, 40, 169], dtype=np.float32)
bg1 = np.array([56, 53, 180], dtype=np.float32)
shift = bg0 - bg1

def harmonize_frame(f):
    # Detect background pixels in frame from character1
    diff = np.linalg.norm(f.astype(np.float32) - bg1, axis=2)
    # Smooth alpha mask for background (diff < 35 is background, diff > 60 is person)
    bg_factor = np.clip((60.0 - diff) / 25.0, 0.0, 1.0)[:, :, np.newaxis]
    # Apply color shift to background
    f_float = f.astype(np.float32) + shift * bg_factor
    return np.clip(f_float, 0, 255).astype(np.uint8)

# Now, let's construct the optimal 64-frame fused 360 circle:
# Angles 0..360:
# 0° (RIGHT): character1 frame 80 (or character frame 46)
# 45° (DOWN-RIGHT): character1 frame 98 (or character frame 54)
# 90° (DOWN): character frame 160 (or character1 frame 125)
# 135° (DOWN-LEFT): character frame 68
# 180° (LEFT): character frame 88
# 225° (UP-LEFT): character frame 114
# 270° (UP): character frame 20 (and character1 frame 35)
# 315° (UP-RIGHT): character1 frame 68 (or character frame 36)

# Let's inspect character1 frame 80 vs character frame 46
cv2.imwrite("scripts/poses1/comp_f46_c0.png", frames0[46])
cv2.imwrite("scripts/poses1/comp_f80_c1.png", harmonize_frame(frames1[80]))
cv2.imwrite("scripts/poses1/comp_f68_c1.png", harmonize_frame(frames1[68]))
cv2.imwrite("scripts/poses1/comp_f98_c1.png", harmonize_frame(frames1[98]))

print("Exported comparison frames")
