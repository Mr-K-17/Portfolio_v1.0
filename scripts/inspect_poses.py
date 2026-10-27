import cv2
import os

cap = cv2.VideoCapture("source-videos/character.mp4")
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

os.makedirs("scripts/poses", exist_ok=True)

# Let's save crops around the face (y: 50 to 550, x: 450 to 830) for frames every 2 or 3 frames,
# or let's inspect the 8 poses:
# Let's check:
# Poses in video:
# Let's inspect frame 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 191
test_indices = [0, 10, 20, 30, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185, 191]
for idx in test_indices:
    cv2.imwrite(f"scripts/poses/pose_{idx:03d}.png", frames[idx][50:550, 450:830])

print("Poses saved.")
