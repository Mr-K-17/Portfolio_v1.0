import cv2
import numpy as np

# Load end frames to inspect the center neutral pose
# Let's check difference between consecutive frames to find where pauses or smooth rotations happen
cap = cv2.VideoCapture("source-videos/character.mp4")
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

print(f"Total frames loaded: {len(frames)}")

# Find face bounding box or crop around center
# Let's crop center (e.g. y: 150 to 500, x: 450 to 830)
h, w, _ = frames[0].shape
head_crop = (slice(100, 550), slice(450, 830))

diffs = []
for i in range(len(frames) - 1):
    diff = np.mean(np.abs(frames[i+1][head_crop].astype(float) - frames[i][head_crop].astype(float)))
    diffs.append(diff)

print("Differences between consecutive frames (top 15 transitions):")
sorted_diffs = sorted(enumerate(diffs), key=lambda x: x[1], reverse=True)
for idx, d in sorted_diffs[:15]:
    print(f"Frame {idx} -> {idx+1}: {d:.2f}")

print("\nLowest differences (stable poses or hold frames):")
for idx, d in sorted_diffs[-15:]:
    print(f"Frame {idx} -> {idx+1}: {d:.2f}")

# Also let's save 16 evenly spaced crops or keyframes to check head orientation
step = len(frames) // 16
for i in range(0, len(frames), step):
    crop = frames[i][100:550, 450:830]
    cv2.imwrite(f"scripts/output_samples/head_{i:03d}.png", crop)

