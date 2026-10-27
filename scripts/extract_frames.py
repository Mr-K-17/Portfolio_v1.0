import cv2
import numpy as np
import os

video_path = os.path.join("source-videos", "character.mp4")
cap = cv2.VideoCapture(video_path)
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

print(f"Total video frames: {len(frames)}")

# Key compass frame mapping:
# 0 (0 deg, RIGHT): Frame 46
# 8 (45 deg, DOWN-RIGHT): Frame 54
# 16 (90 deg, DOWN): Frame 60
# 24 (135 deg, DOWN-LEFT): Frame 68
# 32 (180 deg, LEFT): Frame 88
# 40 (225 deg, UP-LEFT): Frame 114
# 48 (270 deg, UP): Frame 20
# 56 (315 deg, UP-RIGHT): Frame 36

# Segments interpolation:
# Seg 0: idx 0..8   -> from 46 to 54  (len 8)
# Seg 1: idx 8..16  -> from 54 to 60  (len 8)
# Seg 2: idx 16..24 -> from 60 to 68  (len 8)
# Seg 3: idx 24..32 -> from 68 to 88  (len 8)
# Seg 4: idx 32..40 -> from 88 to 114 (len 8)
# Seg 5: idx 40..48 -> from 114 to 124, then 16 to 20 (len 8)
# Seg 6: idx 48..56 -> from 20 to 36  (len 8)
# Seg 7: idx 56..64 -> from 36 to 46  (len 8)

frame_indices_64 = []

# Seg 0: 0..8
s0 = np.linspace(46, 54, 8, endpoint=False)
frame_indices_64.extend(s0)

# Seg 1: 8..16
s1 = np.linspace(54, 60, 8, endpoint=False)
frame_indices_64.extend(s1)

# Seg 2: 16..24
s2 = np.linspace(60, 68, 8, endpoint=False)
frame_indices_64.extend(s2)

# Seg 3: 24..32
s3 = np.linspace(68, 88, 8, endpoint=False)
frame_indices_64.extend(s3)

# Seg 4: 32..40
# Between 88 and 114, note: 88..94 are LEFT, 98..114 move to UP-LEFT
s4 = np.linspace(88, 114, 8, endpoint=False)
frame_indices_64.extend(s4)

# Seg 5: 40..48 (from UP-LEFT 114 to UP 20)
# Transition via 114, 117, 120, 123, 125, then 16, 18, 19
s5 = [114, 116, 119, 122, 124, 16, 18, 19]
frame_indices_64.extend(s5)

# Seg 6: 48..56 (from UP 20 to UP-RIGHT 36)
s6 = np.linspace(20, 36, 8, endpoint=False)
frame_indices_64.extend(s6)

# Seg 7: 56..64 (from UP-RIGHT 36 to RIGHT 46)
s7 = np.linspace(36, 46, 8, endpoint=False)
frame_indices_64.extend(s7)

frame_indices_64 = [int(round(x)) for x in frame_indices_64]
print(f"Selected 64 frame indices: {frame_indices_64}")

# Create output directory
out_dir = os.path.join("public", "frames")
os.makedirs(out_dir, exist_ok=True)

# Export 64 webp frames with high quality
for i, f_idx in enumerate(frame_indices_64):
    out_path = os.path.join(out_dir, f"{i}.webp")
    # Also save with format frame_00.webp if needed, let's check
    # Let's save {i}.webp and frame_{i}.webp
    f = frames[f_idx]
    # WebP encoding with OpenCV (quality 92 for crisp luxury quality)
    cv2.imwrite(out_path, f, [cv2.IMWRITE_WEBP_QUALITY, 92])
    # Also save as frame_{i:02d}.webp
    alt_path = os.path.join(out_dir, f"frame_{i:02d}.webp")
    cv2.imwrite(alt_path, f, [cv2.IMWRITE_WEBP_QUALITY, 92])

# Export center.webp (frame 190)
center_frame = frames[190]
cv2.imwrite(os.path.join("public", "center.webp"), center_frame, [cv2.IMWRITE_WEBP_QUALITY, 95])
cv2.imwrite(os.path.join(out_dir, "center.webp"), center_frame, [cv2.IMWRITE_WEBP_QUALITY, 95])

print("Successfully exported all 64 WebP frames and center.webp!")
