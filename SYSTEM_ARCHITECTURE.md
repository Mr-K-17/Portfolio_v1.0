# System Architecture & Technical Specifications

## 1. Overview
This project is an award-winning, luxury interactive portfolio for **Kishore S V** (Computer Science Engineer & Full-Stack Developer). 
The centerpiece is an ultra-smooth, zero-lag, zero-ghosting cursor-tracking character animation rendered on an HTML5 `<canvas>`.
The character remains **permanently fixed in the background** across the entire page, providing continuous gaze-tracking while the user scrolls through the portfolio.

---

## 2. Core Constraints & Guarantees
1. **Zero CSS 3D Transforms:**
   - No `perspective`, `rotateX`, or `rotateY` anywhere on the canvas or container.
   - Torso and page body are 100% rock-solid motionless. Only the character's head turns via canvas frame switching.
2. **Zero Runtime MP4 Seeking:**
   - Generated MP4s have keyframe limits. In-browser `video.currentTime` seeking causes severe lag and freezes.
   - Solution: Pre-extracted 64 high-quality WebP frames along the 360° circular trajectory, plus `center.webp`.
3. **Seamless Background Color Match:**
   - Background RGB: `(169, 40, 45)` / HEX `#a9282d`.
   - Page `<body>`, canvas fill, and background containers match this exact hex code. Zero visible borders or seams.
4. **Single-Frame Zero-Ghosting Render:**
   - Canvas clears and renders **exactly one frame at 100% opacity**.
   - No cross-frame alpha blending (which causes double-face ghosting).
5. **Delta-Time Shortest-Path Circular Angular Lerp:**
   - Normalized angle tracking with shortest-path wrap around $[-\pi, \pi]$.
   - Exponential delta-time smoothing: `factor = 1 - Math.exp(-decay * dt)` (~35ms response time) supporting 60Hz, 120Hz (ProMotion), and 144Hz+ displays.
6. **Center Eye Contact Deadzone:**
   - When cursor is within 12% of screen dimension from face center `(x: 50%, y: 43%)`, the engine locks onto `center.webp` for direct eye contact.
7. **Fixed Background Canvas Layering:**
   - Canvas is fixed (`fixed inset-0 w-screen h-screen pointer-events-none z-0`).
   - Scrollable UI layers sit on top (`relative z-10`) with frosted glass and translucent backdrops, allowing the character to watch the visitor anywhere on the page.

---

## 3. Video Assets & Extraction Pipeline
- Source 1: `public/character.mp4` (1280x720, 24fps, 192 frames, counter-clockwise rotation).
- Source 2: `public/character1.mp4` (1280x720, 24fps, 192 frames, clockwise rotation).
- Frame sets generated:
  - `public/frames/`: Optimal 64-frame fused dataset combining both videos.
  - `public/frames_v1/`: 64 frames from `character.mp4`.
  - `public/frames_v2/`: 64 frames from `character1.mp4` (harmonized to `#a9282d`).
  - `public/center.webp`: Frame 190 direct gaze neutral eye contact.
- Python tools:
  - `scripts/inspect_video.py`
  - `scripts/analyze_frames.py`
  - `scripts/extract_frames.py`
  - `scripts/inspect_character1.py`
  - `scripts/harmonize_and_fuse.py`
  - `scripts/build_all_frames.py`
  - `scripts/extract_resume.py`

---

## 4. Technology Stack
- **Framework:** React 18 + TypeScript + Vite 6
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Fonts:**
  - `Dancing Script` (Google Fonts): Signature cursive name
  - `Inter` / `Cabinet Grotesk`: Clean modern sans-serif
  - `Cinzel` / `Playfair Display`: Luxury editorial titles
- **Python / OpenCV:** OpenCV 5 (`cv2`), Pillow, NumPy, PyPDF
