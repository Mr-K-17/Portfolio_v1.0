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

# Let's create an annotated strip with every 4th frame from 0 to 191
# (48 frames total, 4 rows of 12)
thumb_w, thumb_h = 240, 180
cols = 8
rows = (len(frames) + cols*2 - 1) // (cols*2) # every 2 frames
# Let's save chunks
for chunk in range(4):
    start = chunk * 48
    end = min(len(frames), (chunk + 1) * 48)
    c_rows = 6
    c_cols = 8
    canvas = np.zeros((c_rows * thumb_h, c_cols * thumb_w, 3), dtype=np.uint8)
    for idx in range(start, end):
        local_idx = idx - start
        r = local_idx // c_cols
        c = local_idx % c_cols
        crop = frames[idx][50:590, 420:860] # Face and hair
        resized = cv2.resize(crop, (thumb_w, thumb_h))
        cv2.putText(resized, f"F#{idx}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        canvas[r*thumb_h:(r+1)*thumb_h, c*thumb_w:(c+1)*thumb_w] = resized
    cv2.imwrite(f"scripts/poses/chunk_{chunk}.jpg", canvas)

print("Saved chunk images 0..3")
