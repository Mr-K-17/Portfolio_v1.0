import cv2
import numpy as np
import os

video_path = os.path.join("source-videos", "character1.mp4")
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"Error opening video: {video_path}")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
duration = total_frames / fps if fps > 0 else 0

print(f"Character1 Stats: {width}x{height}, {fps} FPS, {total_frames} total frames, {duration:.2f}s duration")

bg_samples = []
frames = []

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
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
b, g, r = mean_bg_bgr[0], mean_bg_bgr[1], mean_bg_bgr[2]
hex_color = f"#{r:02x}{g:02x}{b:02x}"
print(f"Detected Background Color for character1: BGR=({b},{g},{r}), RGB=({r},{g},{b}), HEX={hex_color}")

os.makedirs("scripts/output_samples1", exist_ok=True)
# Save grid
thumb_w, thumb_h = 160, 90
cols = 12
rows = (total_frames + cols - 1) // cols
grid = np.zeros((rows * thumb_h, cols * thumb_w, 3), dtype=np.uint8)

for idx, f in enumerate(frames):
    r_idx = idx // cols
    c_idx = idx % cols
    small = cv2.resize(f, (thumb_w, thumb_h))
    cv2.putText(small, str(idx), (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    grid[r_idx*thumb_h:(r_idx+1)*thumb_h, c_idx*thumb_w:(c_idx+1)*thumb_w] = small

cv2.imwrite("scripts/output_samples1/grid_character1.jpg", grid)
print("Saved grid_character1.jpg")
