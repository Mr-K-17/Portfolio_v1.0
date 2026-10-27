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

# Let's analyze the face region (y: 200..450, x: 500..780)
# Let's compute the difference between each frame and the neutral center frame 190.
ref_frame = frames[190]
ref_head = ref_frame[150:500, 500:780]

print("Comparing frames to neutral center frame 190...")
# Let's find for each frame the approximate movement of facial features using template matching or optical flow
# Let's take the nose/mouth patch from frame 190 (around y: 300..420, x: 580..700)
nose_patch = ref_frame[300:400, 600:680]

# Match template in search window (y: 200..480, x: 520..760)
results = []
for idx, f in enumerate(frames):
    search_area = f[200:480, 520:760]
    res = cv2.matchTemplate(search_area, nose_patch, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    # Relative offset from center
    # In frame 190, max_loc is at (600 - 520, 300 - 200) = (80, 100)
    dx = max_loc[0] - 80
    dy = max_loc[1] - 100
    results.append((idx, dx, dy, max_val))

# Let's print out dx, dy at intervals
for idx, dx, dy, val in results[::6]:
    angle = np.degrees(np.arctan2(dy, dx))
    dist = np.hypot(dx, dy)
    print(f"Frame {idx:3d}: dx={dx:3d}, dy={dy:3d}, dist={dist:4.1f}, angle={angle:6.1f}°, match={val:.2f}")

