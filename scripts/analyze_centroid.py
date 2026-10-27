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

# Let's inspect the facial landmarks or feature center
# The face is roughly in the center horizontal, upper vertical.
# Let's calculate the center of mass of the hair/head or detect the eyes/nose/mouth.
# Since the background is uniform red (#a9282d), we can segment the character very cleanly!
bg_color = np.array([45, 40, 169]) # BGR

frame_angles = []
for idx, f in enumerate(frames):
    # Mask of the person (where distance from background is significant)
    diff = np.linalg.norm(f.astype(float) - bg_color.astype(float), axis=2)
    person_mask = (diff > 40).astype(np.uint8)
    
    # We are interested in the head region: y: 50..450, x: 420..860
    head_region = person_mask[50:450, 420:860]
    # Moments of the head region
    M = cv2.moments(head_region)
    if M["m00"] > 0:
        cx = M["m10"] / M["m00"]
        cy = M["m01"] / M["m00"]
    else:
        cx, cy = 0, 0
    frame_angles.append((idx, cx, cy))

print("Head centroid sample:")
for i in range(0, 192, 10):
    print(f"Frame {i:3d}: cx={frame_angles[i][1]:.2f}, cy={frame_angles[i][2]:.2f}")
