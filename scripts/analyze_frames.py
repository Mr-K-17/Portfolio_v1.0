import cv2
import numpy as np
import os

video_path = os.path.join("source-videos", "character.mp4")
cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

# Let's save a thumbnail grid (e.g. 16 cols x 12 rows = 192 frames) with frame numbers stamped on them
thumb_w, thumb_h = 160, 90
cols = 12
rows = (total_frames + cols - 1) // cols
grid = np.zeros((rows * thumb_h, cols * thumb_w, 3), dtype=np.uint8)

for idx, f in enumerate(frames):
    r = idx // cols
    c = idx % cols
    small = cv2.resize(f, (thumb_w, thumb_h))
    # Put frame index text
    cv2.putText(small, str(idx), (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    grid[r*thumb_h:(r+1)*thumb_h, c*thumb_w:(c+1)*thumb_w] = small

cv2.imwrite("scripts/output_samples/grid_192_frames.jpg", grid)
print("Saved grid_192_frames.jpg")

# Also let's inspect the last few frames to find where the neutral center pose is
for i in range(total_frames - 25, total_frames):
    cv2.imwrite(f"scripts/output_samples/end_frame_{i:03d}.png", frames[i])

print("Saved end frames")
