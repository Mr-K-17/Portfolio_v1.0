# Context Memory & Cross-Model Handoff

This document stores the complete contextual memory, user identity, verified credentials, architectural rationale, and execution quirks for any AI agent or developer continuing work on this project.

---

## 1. Versioning & Rollback Points

### Current Branch (v1.6 Packaging & Deployment):
```bash
git checkout v1.6-deploy
# Release branch (for GitHub / GitLab / Render publishing):
git checkout release
```

### Rollback to v1.5:
```bash
git checkout v1.5
# or git checkout v1.5.1
```
An uncompressed archive of the v1.5 state is stored in `../Portfolio_backups/Portfolio_v1.5_backup.zip`.

### Rollback to v1.4:
If you need to restore the v1.4 baseline state:
```bash
git checkout v1.4
# or git checkout v1.4.1
```
Alternatively, an uncompressed archive of the v1.4 release is stored in the project root:
`Portfolio_v1.4_backup.zip` (excludes `node_modules`, `dist`, and `.git`).

### Rollback to v1.3:
If you need to restore the v1.3 baseline state:
```bash
git checkout v1.3
```
Alternatively, an uncompressed archive of the v1.3 release is stored in the project root:
`Portfolio_v1.3_backup.zip` (excludes `node_modules` and `dist`).

### Rollback to v1.2:
If you need to restore the v1.2 baseline state:
```bash
git checkout v1.2
```
Alternatively, an uncompressed archive of the v1.2 release is stored in the project root:
`Portfolio_v1.2_backup.zip` (excludes `node_modules` and `dist`).

### Rollback to v1.1:
If you need to restore the v1.1 baseline state:
```bash
git checkout v1.1
```
Or use: `Portfolio_v1.1_backup.zip`.

### Rollback to v1.0:
If you need to restore the original v1.0 baseline state:
```bash
git checkout v1.0
```
Or use the archive: `Portfolio_v1.0_backup.zip`.

### Current Branch:
- `v1.5-smaller-pikachu`: Active branch implementing the single source of truth for sprite scaling (`src/lib/spriteScale.ts`, `HERO_SCALE = 1`, `RUNNER_SCALE = 1`), fixed 1x integer scale across all viewports, derived walk speeds, hop apexes, lane footprints, and verified DEV validator reports.

---

## 2. User Identity & Verified Profile

| Field | Value |
| :--- | :--- |
| **Full Name** | **KISHORE S V** |
| **Headline / Role** | Aspiring Software Engineer Intern |
| **Target Roles** | Software Engineer Intern, Full Stack Developer |
| **Email** | `kishoresathyagala@gmail.com` |
| **Phone** | `+91 8971301934` |
| **Location** | SVP Nagar, Mysuru, Karnataka, India |
| **LinkedIn** | [https://www.linkedin.com/in/kishore-s-v-948b92290/](https://www.linkedin.com/in/kishore-s-v-948b92290/) |
| **GitHub** | [https://github.com/Mr-K-17](https://github.com/Mr-K-17) |
| **Resume PDF** | Located at `resume/KISHORE S V_Resume.pdf` and served from `public/resume.pdf` |

### Academic Record
- **B.E. in Computer Science & Engineering (2023–2027):** ATME College of Engineering, Mysuru — **GPA: 9.0 / 10.0**
- **Pre-University:** Sadvidya Composite PU College — **85.83%**
- **Secondary Education (SSLC):** GSSS Bantwal Madhava Shenoy High School — **93.44%**

### Exact Resume Projects
1. **Line Follower Obstacle Avoiding Robot:** Arduino C/C++, Sensors, Arduino UNO, L298 Motor Driver.
2. **Stock Management System:** PHP, HTML, CSS, JavaScript, MySQL.
3. **AI Search Bot:** Python, Google Gemini 2.5 Flash (`https://github.com/Mr-K-17/AI-search-bot.git`).
4. **LawPoint:** React.js, Node.js, Express.js, MongoDB, Socket.io, Gemini 2.5 Flash (`https://github.com/Mr-K-17/LawPoint.git`).
5. **Habit Tracker (Coding activities):** Java Swing, JDBC, MySQL (`https://github.com/Mr-K-17/CodeHabitTracker.git`).

### Verified Certificate Links (Google Drive)
- **Joy of Computing Using Python (NPTEL):** `https://drive.google.com/file/d/1to7aDhQOhd7Hd694nFccdjGWaQBJ8Vz1/view?usp=sharing`
- **Introduction to LLMs (NPTEL):** `https://drive.google.com/file/d/1oueEdB4rUTqiUyDXQ_IHr9rf-6pG6QtW/view?usp=sharing`
- **Fundamentals of Data Networking (Infosys):** `https://drive.google.com/file/d/1LBvc5aDE-CXDrnYl-LpzQ1JfEfd-pnaw/view?usp=sharing`
- **Azure DevOps (Infosys):** `https://drive.google.com/file/d/1SVYkio3fd6a7nf4qTi08_7iN4OkzDGkS/view?usp=sharing`
- **Introduction to NoSQL Databases (Infosys):** `https://drive.google.com/file/d/1-1A6hJYsMQGLSFlYL4gcU1arRe_t9T0f/view?usp=drive_link`
- **Agile Scrum in Practice (Infosys):** `https://drive.google.com/file/d/1cCnX_EzSWHdwKpV-TX4FdP6fL3kDtU2S/view?usp=drive_link`
- **Agile Scrum Certification (Infosys):** `https://drive.google.com/file/d/1sEZ2wHLrfqmksxrarg4v09zDEUJpFZH_/view?usp=drive_link`
- **Software Engineering & Agile (Infosys):** `https://drive.google.com/file/d/1bFfaAu1wp4M_wq4bvfrk_4QAyhX3-V9F/view?usp=drive_link`
- **Natural Language Processing (VTU Honors):** `https://drive.google.com/file/d/1rBJGobQq0DuAJZOdPXJM4VgEYsUo1jxQ/view?usp=sharing`
- **Blockchain and Applications (VTU Honors):** `https://drive.google.com/file/d/1uphwFSPpbAc0Ar5lyqlaqyLosQP8egLo/view?usp=sharing`
- **Affective Computing (VTU Honors):** `https://drive.google.com/file/d/1hv0qDhlB2X4ziBAdwYVj1BjDUENUSGMp/view?usp=sharing`
- **Master Credentials Google Drive Folder:** `https://drive.google.com/drive/folders/1wwhFrEVSH8mRZf-IUB981AXmC_W_IQ3l?usp=drive_link`

---

## 3. Key Architectural Decisions & Context

### Why Not Video Seeking or CSS 3D?
- MP4 video files generated with a single I-frame freeze when `video.currentTime` is manipulated in-browser.
- CSS 3D transforms (`rotateX`, `rotateY`, `perspective`) artificially warp the subject's neck and shoulders.
- **Decision:** Pre-extracting 64 WebP frames with OpenCV creates a rock-solid, zero-ghosting, 60–144Hz canvas render loop with motionless shoulders and authentic head rotation.

### How Dual-Video Engine Selection Works
- Frame assets:
  - `public/frames/`: Fused 64 WebP frames combining the sharpest quadrants of `character.mp4` and harmonized `character1.mp4`.
  - `public/frames_v1/`: Native `character.mp4` frames.
  - `public/frames_v2/`: Harmonized `character1.mp4` frames.
  - `public/center.webp`: Neutral direct gaze frame.
- **URL Parameter:** `?engine=v1` or `?engine=v2` or default `'fused'`.

### Canvas Stacking Context
- `CharacterCanvas` is mounted in `App.tsx` at `fixed inset-0 w-screen h-screen pointer-events-none z-0`.
- Stacking context fix: Never use `-z-10` on the canvas inside positioned containers (`relative`), as CSS renders negative z-index elements beneath the parent's background color. Using `z-0` on canvas and `relative z-10` on content guarantees continuous visibility.

### Dedicated Lane Path, Pikachu Runner & Lightning Trail (`ScrollPath.tsx`)
- **One Dedicated Lane & Zigzag Corridors:** The path and runner never cross side-to-side through content cards. The lane is measured dynamically from actual content bounding rects (`minContentLeft`, `maxContentRight`). On mobile/tablet ($<1024\text{px}$), the lane is strictly the left spine. On desktop ($\ge 1024\text{px}$), it alternates corridors between section cards (About on Left, Work on Right, Skills on Left, Certificates on Right, Contact on Left).
- **Single Source of Truth Sprite Scale:** Sprites read `RUNNER_SCALE = 1` and `HERO_SCALE = 1` from `src/lib/spriteScale.ts`. No 2x desktop scaling or auto-selection. Sprites render at crisp, native integer 1x pixel dimensions with `image-rendering: pixelated`.
- **Gentle Wave Amplitude:** $A = \max(0, (\text{laneWidth} - \text{footprint} - 32) / 2)$ capped at 28px; if $A < 8\text{px}$, the path is a straight vertical line.
- **Lightning Sprite Pipeline (`scripts/build_lightning.py`):**
  - Input: `sprite/sprite2.png` (soft glowing cyan-white bolts).
  - Alpha un-premultiplied via $\alpha = \max(R, G, B)$ eliminating black fringes on `#a9282d`.
  - Rotated 90 degrees clockwise offline via `np.rot90(..., k=3)` so origin/starburst is on the right edge.
  - Normalized cells: 112×66px.
  - Exported to `public/sprite/lightning/lightning.png` (18 frames: 8 loop frames, 9 fade frames, 1 ground flare frame) and `lightning.json`.
  - Re-run pipeline: `python scripts/build_lightning.py`.
- **Lightning Runner Integration:**
  - Trail rendered in DOM layer at $z\text{-30}$ behind Pikachu (layer order: lightning first child, Pikachu second child inside `runnerRef`).
  - Attached to Pikachu's back at 55% top ($45\%$ up body).
  - Automatically shares facing flip and hysteresis via wrapper `scaleX`.
  - Loops `loop` frames (0..7) at 20 FPS during walk/jump with 80ms fade-in (max opacity 0.9).
  - Plays `fade` frames (8..16) once when stopped (idle) with 200ms fade-out.
  - Plays `flare` at his feet on section node hop.
- **Dev-Only Validator:** Under `if (import.meta.env.DEV)`, tests every LUT point against cached content bounding rects. Verified 0 collisions across 1440x900, 1366x768, 1280x720, 1024x768, 768x1024, and 390x844. Tree-shaken from production.
- Respects `prefers-reduced-motion` with static stroke and static idle frame on the contact node with no lightning.

### v1.4 Visual Verification & Root Cause Fixes
- **Build Stamp:** Vite plugin injects `<meta name="build" content="v1.4-<short-sha>">` and `__BUILD_VERSION__` define.
- **Hero Pikachu Perch Y-Offset:** Adjusted feet baseline offset from `+4px` to `-2px` relative to `rect.top - heroRect.top`. Pikachu's feet rest cleanly on top of the text ascenders, with zero overlap across Eyebrow, Name, and Bio perches (`overlapY: 0`).
- **Font Settlement Anchor:** Added `document.fonts.ready` listener in `HeroPikachu.tsx` and `ScrollPath.tsx` to re-measure perches and snap `posY`/`posX` and recalculate the dual-lane zigzag corridor once webfonts (`Playfair Display`, `Inter`) have settled.
- **Robust Start Gate:** Added `fallbackTimer` (1.2s) and `img.onerror` handlers so sprite load delays can never prevent Hero Pikachu from appearing.
- **Corridor Crossing Facing Direction:** Latched `facingRef.current = tanX > 0 ? 1 : -1` during corridor crossings ($v \ge -20$). Ensures Pikachu faces forward along the crossing tangent and the lightning trail is strictly behind his tail across all 4 corridors.
- **Visual Evidence:** 38 full-viewport screenshots captured across 1440x900, 1366x768, 1920x1080, and 390x844; 0 console errors, 0 console warnings, 0 failed network requests, 0 content collisions across 2057 LUT samples.

### v1.5 Smaller Pikachu & Single Source of Truth
- **Single Source of Truth (`src/lib/spriteScale.ts`):** Centralized `HERO_SCALE = 1` and `RUNNER_SCALE = 1` constants across all screen widths. Removed 2x desktop scaling and auto-selection; everything derives mathematically from `pikachu.json` cell sizes multiplied by integer scale constants.
- **Hero Wanderer Scaling:** Half-width ($24\text{px}$), walk speed ($55\text{px/s}$), hop apex ($24\text{px}$), perch offset ($-2\text{px}$), and face zone avoidance derive directly from `HERO_SCALE`. Feet rest cleanly on top of letters with 0 text obscured and face zone clear.
- **Scroll Runner Scaling:** Footprint ($158\text{px}$), gutter requirement ($80\text{px}$), lightning trail length ($55\text{px}$), and corridor clearance derive directly from `RUNNER_SCALE`.
- **Corridor Clearance Safety:** Minimum corridor clearance is $60 \cdot \text{scale} + 56 = 116\text{px}$. Measured card-to-card gaps are $249\text{px} - 250\text{px}$, providing $+133\text{px}$ margin.
- **Dual-Lane Across Viewports:** With $80\text{px}$ gutter requirement, dual-lane corridor mode activates seamlessly on 1440x900, 1366x768, 1280x720, and 1024x768, while 768x1024 and 390x844 use Single Left Lane Mode. Verified 0 collisions across all 6 viewports.

### v1.6 Deployment Packaging & Multi-Target CI/CD
- **Base-Safe Asset URLs:** Public assets route through `assetUrl(path)` (`import.meta.env.BASE_URL`), enabling simultaneous hosting at `/` (Render) and `/<repo>/` (GitHub Pages).
- **Runtime Assets Hygiene:** Public folder contains only runtime assets. Raw video sources (`character.mp4`, `character1.mp4`) moved to `source-videos/`. Backup zips and screenshot outputs untracked via `.gitignore`.
- **Pre-Flight Asset Verification:** `scripts/check-assets.mjs` verifies no hard-coded root URLs remain, checks exact letter case on disk (avoiding Linux CI failures), and blocks `.mp4` leakage into `public/` or `dist/`.
- **Publish Branch Strategy:** Due to historical large backup zip objects in `.git` exceeding 115MB (which GitHub rejects via pre-receive hook `GH001`), the clean orphan branch `release` is created without large blobs to publish cleanly to GitHub, GitLab, and Render.



---

## 4. Environment & Tooling Quirks (Windows)
1. **PowerShell Script Execution Policy:**
   - Standard `npm` commands error because `npm.ps1` execution is disabled on Windows.
   - **Solution:** ALWAYS run `npm.cmd` (e.g. `npm.cmd run build`, `npm.cmd run dev`).
2. **TypeScript `noUnusedLocals`:**
   - `tsconfig.json` enforces `noUnusedLocals: true`. Clean all unused imports before building.
3. **Canvas HiDPI Crispness:**
   - Canvas buffer dimensions are scaled by `min(window.devicePixelRatio || 1, 2)` with CSS width/height at `100vw`/`100vh`.
