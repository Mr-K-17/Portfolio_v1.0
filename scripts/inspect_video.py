import cv2
import numpy as np
import os

video_path = os.path.join("source-videos", "character.mp4")
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"Error opening video: {video_path}")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
duration = total_frames / fps if fps > 0 else 0

print(f"Video Stats: {width}x{height}, {fps} FPS, {total_frames} total frames, {duration:.2f}s duration")

# Sample corner pixels to find background color
bg_samples = []
frame_idx = 0
frames = []

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
    # Sample 4 corners
    corners = [
        frame[5, 5],
        frame[5, width - 6],
        frame[height - 6, 5],
        frame[height - 6, width - 6]
    ]
    for c in corners:
        bg_samples.append(c)

cap.release()

bg_samples = np.array(bg_samples)
mean_bg_bgr = np.median(bg_samples, axis=0).astype(int)
# OpenCV is BGR
b, g, r = mean_bg_bgr[0], mean_bg_bgr[1], mean_bg_bgr[2]
hex_color = f"#{r:02x}{g:02x}{b:02x}"
print(f"Detected Background Color: BGR=({b},{g},{r}), RGB=({r},{g},{b}), HEX={hex_color}")

# Let's save a contact sheet or sample frames to see what happens over time
os.makedirs("scripts/output_samples", exist_ok=True)

# Save every 5th or 10th frame or key frames
step = max(1, total_frames // 40)
for i in range(0, total_frames, step):
    cv2.imwrite(f"scripts/output_samples/frame_{i:04d}.png", frames[i])

print(f"Saved sample frames (step={step}) to scripts/output_samples/")
