# System Architecture & Technical Specifications

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    BROWSER VIEWPORT                                     |
|                                                                                         |
|  [Layer 0: Fixed Background Canvas] (fixed inset-0, z-index: 0, pointer-events: none)   |
|  +-----------------------------------------------------------------------------------+  |
|  | HTML5 <canvas> (100vw x 100vh, object-fit: cover, DPR-scaled)                     |  |
|  | - Draws 1 crisp WebP frame (0..63 or center.webp) at 100% opacity                 |  |
|  | - Solid background fill: #a9282d (100% borderless match)                          |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  [Layer 1: Floating Navigation Header] (fixed top-6, z-index: 40)                       |
|  +-----------------------------------------------------------------------------------+  |
|  | Frosted Glass Pill (backdrop-filter: blur(12px), header-glass)                    |  |
|  | [ABOUT] [WORK] [SKILLS] [CERTIFICATES] [CONTACT]                                  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  [Layer 2: Scrollable Content Wrapper] (relative, z-index: 10, min-h-screen)            |
|  +-----------------------------------------------------------------------------------+  |
|  |  [Layer 2A: ScrollPath SVG] (absolute inset-0, z-index: 0, pointer-events: none)  |  |
|  |  - Smooth cubic-Bezier SVG path confined to ONE dedicated measured lane           |  |
|  |  - Gentle wave amplitude A = max(0, (laneWidth - footprint - 32)/2) capped at 28px|  |
|  |  - Stroke-drawn progress synced via reference-line LUT & exponential decay lerp   |  |
|  |  - Active nodes filled via IntersectionObserver                                   |  |
|  |                                                                                   |  |
|  |  [Layer 2B: Pikachu Runner + Lightning Trail] (absolute, z-30, pointer-events: none)|
|  |  - Layer 1 (behind): Cyan-white lightning trail (smooth glow, 20 FPS loop/fade)   |  |
|  |  - Layer 2: Hop ground flare at feet for 150ms on section node hop                |  |
|  |  - Layer 3 (front): Pixelated Pikachu sprite (walk, jump, idle)                   |  |
|  |  - Automatic integer scale: 2x if laneWidth >= footprint2x + 32, else 1x         |  |
|  |  - Shares 2D transform translate(posX, posY) & scale(facing * scale, scale)       |  |
|  |                                                                                   |  |
|  |  [Layer 2C: Content Cards] (relative, z-index: 10, natural document flow)         |  |
|  |  - Velvet Cards: bg-[#8b1f23]/85, 1px border-white/10, rounded-2xl               |  |
|  |  - Section 1: Hero (100svh, clear face zone, Playfair 700 name clamp, 3-line bio)  |  |
|  |  - Section 2: About (Path start waypoint, GPA 9.0, Sadvidya, GSSS, Hackathons)    |  |
|  |  - Section 3: Work (Line Follower Robot, Stock Management, AI Bot, LawPoint, etc) |  |
|  |  - Section 4: Skills (Strict resume categories: Frontend, Backend, Tools, etc)     |  |
|  |  - Section 5: Certificates (Compact grouped by NPTEL, Infosys, VTU Honors)        |  |
|  |  - Section 6: Contact (Direct email copy, phone, location, LinkedIn, GitHub)      |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  [Layer 3: Custom Magnetic Cursor] (fixed, z-index: 50, pointer-events: none)           |
|  +-----------------------------------------------------------------------------------+  |
|  | Glowing White Dot + Trailing Aura Ring (auto-disabled on touch devices)            |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Frame Extraction & Fusion Implementation (`scripts/build_all_frames.py`)

1. **Source Videos Inspection:**
   - `character.mp4`: 1280×720, 24 FPS, 192 frames, counter-clockwise rotation. Background: `#a9282d` (`RGB: 169, 40, 45`).
   - `character1.mp4`: 1280×720, 24 FPS, 192 frames, clockwise rotation. Background: `#b43538` (`RGB: 180, 53, 56`).

2. **OpenCV Extraction Pipeline:**
   - In `scripts/build_all_frames.py`, frames were sampled along the circular head-turn timeline.
   - For `character1.mp4`, color harmonization is executed by shifting background pixels towards the canonical `#a9282d`:
     $$\vec{\Delta}_{\text{BGR}} = [45, 40, 169] - [56, 53, 180] = [-11, -13, -11]$$
   - 64 WebP frames are exported to:
     - `public/frames/` (optimal fused sequence)
     - `public/frames_v1/` (`character.mp4` sequence)
     - `public/frames_v2/` (`character1.mp4` harmonized sequence)
     - `public/center.webp` (neutral eye contact frame at frame 190)

3. **URL-Driven Engine Switching:**
   Instead of cluttering the header UI with toggle buttons, `App.tsx` reads `?engine=v1|v2` from `window.location.search`, defaulting to `'fused'`.

---

## 3. Mathematical Formulations

### 3.1 Target Angle Calculation
Given cursor coordinates $(X_{\text{cursor}}, Y_{\text{cursor}})$ and face center $(X_{\text{face}}, Y_{\text{face}})$:
$$\Delta X = X_{\text{cursor}} - X_{\text{face}}$$
$$\Delta Y = Y_{\text{cursor}} - Y_{\text{face}}$$
$$\theta_{\text{target}} = \text{atan2}(\Delta Y, \Delta X) \in [-\pi, \pi]$$

### 3.2 Shortest-Path Circular Angular Difference
$$\Delta \theta = ((\theta_{\text{target}} - \theta_{\text{current}} + \pi) \pmod{2\pi}) - \pi$$

### 3.3 Continuous Exponential Decay Delta-Time Smoothing
$$\alpha = 1 - e^{-\lambda \cdot dt} \quad \text{where } \lambda = 18.0$$
$$\theta_{\text{next}} = \theta_{\text{current}} + \Delta \theta \cdot \alpha$$

### 3.4 Deadzone Direct Eye Contact
Threshold: $r \le 0.12 \times \min(W_{\text{viewport}}, H_{\text{viewport}})$. When inside this radius, the canvas switches to `center.webp`.

### 3.5 Frame Quantization
$$i = \text{round}\left(\frac{(\theta_{\text{norm}} \pmod{2\pi})}{2\pi} \times 64\right) \pmod{64}$$

---

## 4. Dual-Lane Zigzag Corridor Path & Runner Architecture (`ScrollPath.tsx`)

1. **Dual-Lane vs Single-Lane Modes:**
   - Evaluated on resize based on measured content bounding rects (`minContentLeft`, `maxContentRight`).
   - If both gutters are $\ge \text{sprite width} \times \text{RUNNER\_SCALE} + 32\text{px}$ (80px at 1x via `src/lib/spriteScale.ts`), **Dual-Lane Mode** is enabled.
   - Otherwise, fallback to **Single Left Lane Mode** (mobile < 768px and tablet < 1024px always use single left lane).
   - In Dual-Lane Mode, section lanes alternate:
     - About: **LEFT** lane
     - Work: **RIGHT** lane
     - Skills: **LEFT** lane
     - Certificates: **RIGHT** lane
     - Contact: **LEFT** lane

2. **Corridor Clearances & Geometry:**
   - Corridor = vertical gap between bottom of section $i$ content and top of section $i+1$ heading.
   - Required corridor height:
     $$H_{\text{corridor}} \ge \text{tallest sprite cell} \times \text{RUNNER\_SCALE} + 56\text{px}$$
     At 1x scale (`RUNNER_SCALE = 1`): $60\text{px} \times 1 + 56\text{px} = 116\text{px}$.
     Section padding is set to `pt-28 pb-28` ($112\text{px} + 112\text{px} = 224\text{px}$ gap, actual measured content gap 249–250px), providing a massive $+133\text{px}$ clearance buffer above the required $116\text{px}$.
   - Crossing path geometry:
     - Run down current lane to entrance turn.
     - Turn 1: 40px radius curve into the corridor.
     - Horizontal straight run with 8px downward slope. Feet positioned 16px above next section content top.
     - Turn 2: 40px radius curve down into the destination lane, completing at `next.contentTop - 16` before reaching content bounds.
     - Both turns complete 100% inside the vertical corridor gap.

3. **Monotonic refY Lookup Table (LUT):**
   - Each sample stores `refY` separately from geometric $y$, guaranteed strictly increasing ($refY_{i+1} > refY_i$).
   - Lane runs map proportionally with geometric progress ($\Delta L / \Delta refY \in [0.7, 1.7]$).
   - Each corridor crossing is allocated a dedicated scroll span:
     $$\text{crossSpan} = 0.28 \times \text{innerHeight}$$
     centered on its corridor row.
   - Passive scroll listener binary searches on `refY` ($S + 0.55 \cdot \text{innerHeight}$).
   - Guarantees runner stays within on-screen band ($12\% - 92\%$ of viewport height) across the entire scroll.

4. **Runner State Machine & Velocity Thresholds:**
   - State machine velocity reads the smoothed **SCROLL velocity of the reference line** ($\Delta refY / \Delta t$), not arc velocity:
     - Walk: $|v_{\text{scroll}}| > 20\text{px/s}$.
     - Jump: $|v_{\text{scroll}}| > 1400\text{px/s}$.
   - During corridor crossings (`isCrossing === true`):
     - Uses `walk` with frame rate $\times 1.5$ ($15\text{fps}$).
     - Lightning trail is active at Pikachu's back.
     - Facing aligns with travel direction ($+1$ for L $\to$ R, $-1$ for R $\to$ L, reverses cleanly on scroll up).

5. **Dev-Only Extended Validator:**
   - Tree-shaken from production builds (`import.meta.env.DEV`).
   - Asserts: zero content collisions, strictly monotonic refY, speed ratio in range $[0.7 .. 1.7]$, runner on-screen band compliance, and corridor height $\ge H_{\text{req}}$.
   - Verified 0 violations across 1440x900, 1280x720, 1024x768, 768x1024, and 390x844.

---

## 5. Hero Wandering Pikachu (`src/components/HeroPikachu.tsx`)

### 5.1 Action Analysis Table (from `pikachu.json` & Contact Sheet)

| Strip Name | Frames | Cell Size | FPS | Visual Pose Description | Action Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `idle.png` | 4 | $41 \times 34\text{px}$ | 6 | Sits upright on hind legs, calm breathing, ear twitch | **SIT / REST** |
| `idle2.png` | 10 | $43 \times 43\text{px}$ | 6 | Stands upright, twists torso, looks back over shoulder | **FIDGET** |
| `idle3.png` | 6 | $44 \times 33\text{px}$ | 6 | Sits, nods head/sniffs down, looks up, twitches ears | **FIDGET** |
| `walk.png` | 7 | $48 \times 55\text{px}$ | 10 | 4-legged scamper / run cycle forward with upright tail | **WALK** |
| `jump.png` | 6 | $41 \times 60\text{px}$ | 12 | Leap arc: f0=launch, f1-2=rising, f3=peak flip, f4=fall, f5=land | **AIR / HOP** |
| `crouch.png` | 4 | $48 \times 70\text{px}$ | 6 | Row 'b' bow / attack slash with top edge boundary artifact | **OMITTED** |

> [!NOTE]
> **Omitted Strip Rationale:** `crouch.png` was deliberately omitted because it contains combat attack/slash/bow frames from Row 'b' of the source sprite with clipping artifacts on frame 0, rather than an authentic crouch. For ballistic hops, `jump` frame 0 provides the anticipation takeoff crouch, and `jump` frame 5 provides the four-legged landing contact.

### 5.2 Perches & Clearance Geometry
- **Perches:** Top of eyebrow "Aspiring Software Engineer Intern" (HOME perch), name "KISHORE S V", and first line of bio. Measured dynamically from DOM rects relative to `#hero` and refreshed on resize and `document.fonts.ready`.
- **Exclusion Boundaries:**
  - Character face zone: $x \in [32\%, 68\%]$, $y \in [15\%, 65\%]$ of viewport.
  - Buttons exclusion: Pikachu never ventures below the bio or onto Resume / Let's Talk buttons.
  - Valid wander interval: $[x_{\min}, x_{\max}]$ where $x_{\min} = \text{perch.left} + \text{halfW} + 4$ and $x_{\max} = \min(\text{perch.right} - \text{halfW} - 4, 0.32 \cdot W_{\text{viewport}} - \text{halfW} - 8)$. Perches with intervals $< 16\text{px}$ are skipped.

### 5.3 Behaviour Loop & Memory
- **Weights:** SIT 35%, FIDGET 15%, WALK 30%, HOP 20%.
- **Constraints:** Never repeat same action $> 2$ times; never hop twice in a row; dwell caps: eyebrow 6s, name 3s, bio 2s.
- **Home Bias:** Hops from bio can only go to name; hops from name are biased 75% back to eyebrow.
- **Cursor Tracking:** During SIT, Pikachu faces cursor $x$ with 24px hysteresis.
- **Runtime:** Single rAF loop, direct DOM transforms, pauses on `document.hidden` or hero offscreen. Static idle under `prefers-reduced-motion`.



---

## 5. CSS Stacking Context & Performance
- Canvas container is positioned at `fixed inset-0 z-0 pointer-events-none`.
- Scrollable content container is at `relative z-10`.
- Cards are styled with `.velvet-card` (`background: rgba(139, 31, 35, 0.85); border: 1px solid rgba(255, 255, 255, 0.10); border-radius: 1rem;`).
- `backdrop-filter: blur(12px)` is restricted solely to the floating navigation header to conserve GPU compositing memory.

---

## 6. Multi-Target Deployment & Asset URL Resolution Architecture

### 6.1 Base-Path-Safe Asset Resolution (`src/lib/assetUrl.ts`)
- **Challenge:** The application is hosted both at the domain root (`/` on Render) and under a repository subpath (`/<repo>/` on GitHub Pages). Hard-coded absolute paths (e.g. `/frames/0.webp`, `/resume.pdf`) fail under subpath hosting.
- **Architecture:** All public asset URLs resolve through `assetUrl(path)` which strips leading slashes and prepends `import.meta.env.BASE_URL`:
  $$\text{URL} = \text{BASE\_URL} + \text{cleanPath}$$
- `index.html` uses Vite's native `%BASE_URL%favicon.svg` replacement.
- `vite.config.ts` evaluates `base: process.env.VITE_BASE || '/'`.

### 6.2 CI-Safe Build Stamp
- Generates `<meta name="build" content="v1.6-<hash>">` and `__BUILD_VERSION__`.
- Safely inspects environment variables (`GITHUB_SHA`, `CI_COMMIT_SHORT_SHA`, `RENDER_GIT_COMMIT`), falling back to `git rev-parse --short HEAD` inside a `try/catch`, and defaults gracefully to `"local"` on shallow CI clones.

### 6.3 Asset Verification Gate (`scripts/check-assets.mjs`)
- Executed on local builds and in CI (`npm run check:assets`).
- Enforces three invariants:
  1. No un-prefixed root-absolute public URLs exist in `src/` or `index.html`.
  2. All 204 required runtime assets exist in `public/` with exact letter case (detecting Linux CI case-sensitivity failures on Windows).
  3. No `.mp4` video files exist in `public/` or `dist/`.

### 6.4 Clean Runtime Packaging
- Raw source video files (`character.mp4`, `character1.mp4`) reside in `source-videos/` outside `public/`.
- `public/` contains strictly runtime assets: `frames/`, `frames_v1/`, `frames_v2/`, `center.webp`, `sprite/pikachu/`, `sprite/lightning/`, `resume.pdf`, and `favicon.svg`.
- Dist bundle output is verified under 30MB without media bloat.

