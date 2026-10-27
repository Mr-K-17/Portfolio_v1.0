import cv2

cap = cv2.VideoCapture("source-videos/character.mp4")
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

# Let's save frames 88, 92, 96, 100, 104, 108, 112, 116, 120, 124
for i in range(88, 125, 3):
    cv2.imwrite(f"scripts/poses/seq_{i:03d}.png", frames[i])

print("Saved sequence 88..124")
