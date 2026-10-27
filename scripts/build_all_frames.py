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

bg0 = np.array([45, 40, 169], dtype=np.float32)
bg1 = np.array([56, 53, 180], dtype=np.float32)
shift = bg0 - bg1

def harmonize(f):
    diff = np.linalg.norm(f.astype(np.float32) - bg1, axis=2)
    bg_factor = np.clip((60.0 - diff) / 25.0, 0.0, 1.0)[:, :, np.newaxis]
    f_float = f.astype(np.float32) + shift * bg_factor
    return np.clip(f_float, 0, 255).astype(np.uint8)

# Directory setup
os.makedirs("public/frames", exist_ok=True)
os.makedirs("public/frames_v1", exist_ok=True)
os.makedirs("public/frames_v2", exist_ok=True)

# 1. BUILD FUSED OPTIMAL 64 FRAMES:
# 0° (RIGHT): character1 frame 80
# 45° (DOWN-RIGHT): character1 frame 98
# 90° (DOWN): character0 frame 160
# 135° (DOWN-LEFT): character0 frame 68
# 180° (LEFT): character0 frame 88
# 225° (UP-LEFT): character0 frame 114
# 270° (UP): character0 frame 20
# 315° (UP-RIGHT): character1 frame 68

fused_frames = []

# Seg 0: 0° -> 45° (RIGHT -> DOWN-RIGHT, from char1 frame 80 to 98)
for idx in np.linspace(80, 98, 8, endpoint=False):
    fused_frames.append(harmonize(frames1[int(round(idx))]))

# Seg 1: 45° -> 90° (DOWN-RIGHT -> DOWN, from char1 98 to char0 160)
# char1 98 -> 106, then char0 155 -> 160
c1_p1 = [int(round(x)) for x in np.linspace(98, 108, 4, endpoint=False)]
c0_p1 = [int(round(x)) for x in np.linspace(154, 160, 4, endpoint=False)]
for idx in c1_p1:
    fused_frames.append(harmonize(frames1[idx]))
for idx in c0_p1:
    fused_frames.append(frames0[idx])

# Seg 2: 90° -> 135° (DOWN -> DOWN-LEFT, from char0 160 to 68)
# In char0: 160 is down, 64 is down/down-left, 68 is down-left
c0_p2 = [160, 162, 164, 62, 64, 65, 66, 67]
for idx in c0_p2:
    fused_frames.append(frames0[idx])

# Seg 3: 135° -> 180° (DOWN-LEFT -> LEFT, from char0 68 to 88)
for idx in np.linspace(68, 88, 8, endpoint=False):
    fused_frames.append(frames0[int(round(idx))])

# Seg 4: 180° -> 225° (LEFT -> UP-LEFT, from char0 88 to 114)
for idx in np.linspace(88, 114, 8, endpoint=False):
    fused_frames.append(frames0[int(round(idx))])

# Seg 5: 225° -> 270° (UP-LEFT -> UP, from char0 114 to 20)
c0_p5 = [114, 116, 119, 122, 124, 16, 18, 19]
for idx in c0_p5:
    fused_frames.append(frames0[idx])

# Seg 6: 270° -> 315° (UP -> UP-RIGHT, from char0 20 to char1 68)
# char0 20..26, then char1 60..68
c0_p6 = [int(round(x)) for x in np.linspace(20, 26, 4, endpoint=False)]
c1_p6 = [int(round(x)) for x in np.linspace(60, 68, 4, endpoint=False)]
for idx in c0_p6:
    fused_frames.append(frames0[idx])
for idx in c1_p6:
    fused_frames.append(harmonize(frames1[idx]))

# Seg 7: 315° -> 360° (UP-RIGHT -> RIGHT, from char1 68 to 80)
for idx in np.linspace(68, 80, 8, endpoint=False):
    fused_frames.append(harmonize(frames1[int(round(idx))]))

print(f"Generated {len(fused_frames)} fused frames")

# Export fused 64 frames to public/frames/
for i, f in enumerate(fused_frames):
    cv2.imwrite(f"public/frames/{i}.webp", f, [cv2.IMWRITE_WEBP_QUALITY, 92])
    cv2.imwrite(f"public/frames/frame_{i:02d}.webp", f, [cv2.IMWRITE_WEBP_QUALITY, 92])

# Export center.webp (frame 190 from character.mp4)
cv2.imwrite("public/center.webp", frames0[190], [cv2.IMWRITE_WEBP_QUALITY, 95])
cv2.imwrite("public/frames/center.webp", frames0[190], [cv2.IMWRITE_WEBP_QUALITY, 95])

# Also export video 1 frames to public/frames_v1/
from extract_frames import frame_indices_64
for i, f_idx in enumerate(frame_indices_64):
    cv2.imwrite(f"public/frames_v1/{i}.webp", frames0[f_idx], [cv2.IMWRITE_WEBP_QUALITY, 92])

# Also export video 2 frames to public/frames_v2/
# Character1 circular mapping
v2_indices = [
    80, 82, 85, 88, 91, 94, 96, 98, # 0..45
    98, 100, 102, 105, 108, 110, 115, 120, # 45..90
    120, 122, 125, 128, 130, 132, 135, 138, # 90..135
    138, 140, 142, 145, 150, 155, 160, 165, # 135..180
    165, 168, 170, 172, 175, 178, 180, 182, # 180..225
    182, 185, 188, 190, 16, 20, 24, 28, # 225..270
    28, 32, 35, 40, 45, 50, 55, 60, # 270..315
    60, 62, 65, 68, 70, 72, 75, 78 # 315..360
]
for i, f_idx in enumerate(v2_indices):
    cv2.imwrite(f"public/frames_v2/{i}.webp", harmonize(frames1[f_idx]), [cv2.IMWRITE_WEBP_QUALITY, 92])

print("Completed exporting all frames for Fused, V1, and V2!")
