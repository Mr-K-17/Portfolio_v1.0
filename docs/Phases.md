# Development Phases & Roadmap

This document outlines the phased development lifecycle of the portfolio, detailing completed deliverables, verification milestones, and upcoming architectural enhancements.

---

## Phase 1: Video Inspection & Frame Extraction (Completed)
- **Objective:** Analyze raw video files (`character.mp4`, `character1.mp4`) and extract optimized WebP frames along the 360° circular trajectory.
- **Key Deliverables:**
  - `scripts/inspect_video.py` & `scripts/build_all_frames.py`: Inspected frame count (192 frames @ 24fps), resolution (1280×720), and detected background color (`#a9282d`).
  - Identified compass frames across both source videos and harmonized `character1.mp4` background using alpha-distance mask.
  - Pre-extracted 64 WebP frames ($\sim 40\text{KB}$ each) + `center.webp` into `public/frames/`, `public/frames_v1/`, and `public/frames_v2/`.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 2: Zero-Ghosting 60 FPS Canvas Engine (Completed)
- **Objective:** Build an HTML5 Canvas rendering engine with zero CSS 3D transforms, real-time shortest-path circular lerping, and deadzone eye contact.
- **Key Deliverables:**
  - `CharacterCanvas.tsx`: Preloads all 64 WebP images + `center.webp` with progress loader.
  - Shortest-path angular lerp: wraps angle difference into $[-\pi, \pi]$ to eliminate 360° reverse flips.
  - Center eye contact deadzone: switches instantly to `center.webp` when cursor enters within $12\%$ of screen radius.
  - Single-frame crisp rendering at 100% opacity without alpha blending ghosting.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 3: Fixed Background Layout & Stacking Context Fix (Completed)
- **Objective:** Keep character constant in background during page scrolling and showcase Kishore S V's complete resume credentials.
- **Key Deliverables:**
  - Set `CharacterCanvas` to `fixed inset-0 w-screen h-screen pointer-events-none z-0`.
  - Resolved negative z-index stacking bug where `-z-10` rendered underneath root background.
  - Continuous exponential decay delta-time lerping ($\text{decay} = 18.0$) for smooth tracking on 60Hz, 120Hz, 144Hz displays.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 4: Baseline v1.0 Release & Tagging (Completed)
- **Objective:** Create stable baseline release checkpoint for Kishore S V portfolio.
- **Key Deliverables:**
  - Created zip archive `Portfolio_v1.0_backup.zip` (excluding `node_modules` and `dist`).
  - Committed baseline and created annotated git tag `v1.0`.
  - Created working branch `v1.1-improvements`.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 5: v1.1 Editorial Refinements & Scroll-Driven Path (Completed)
- **Objective:** Perform aesthetic overhaul to achieve clean velvet editorial layout, factual resume alignment, and a smooth scroll-driven path.
- **Key Deliverables:**
  - **Task 1 (Name & Typography):** Replaced Dancing Script with Playfair Display 700 uppercase (`KISHORE S V`) with letter-spacing 0.06em and responsive `clamp()`. Removed Dancing Script and Space Grotesk.
  - **Task 2 (Hero Intro):** Added resume eyebrow "Aspiring Software Engineer Intern", removed "Hi, I'm", and crafted a 3-line factual bio strictly derived from the resume summary. Removed unverified badges and fictitious titles.
  - **Task 3 (Scroll-Driven Path):** Built `src/components/ScrollPath.tsx` with smooth cubic-Bezier SVG curve passing through section waypoints (Hero, About, Work, Skills, Certificates, Contact), delta-time exponential decay lerp (decay ~ 10), traveling dot, IntersectionObserver node tracking, mobile left-spine adaptation, and `prefers-reduced-motion` support.
  - **Task 4 (CSS Clean-up & Velvet Cards):** Replaced heavy backdrop-filter cards with flat deep-velvet surface (`bg-[#8b1f23]/85`, 1px border, 16px radius, hover border color change only). Restricted blur(12px) strictly to floating header pill. Added accessible `:focus-visible` styling. Disabled custom cursor on touch devices and removed pulsing focal dot.
  - **Task 5 (Filler Removal & Resume Alignment):** Removed `[DUAL 360°]`, `[V1]`, `[V2]` buttons from header and moved engine switching to URL parameter `?engine=v1|v2`. Used exact resume project names and tech stacks. Grouped certificates by issuer with direct "View" links. Corrected spelling to "Hackathons & Events".
  - **Task 6 (Docs Suite):** Synchronized all 6 documentation files in `docs/`.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 6: v1.2 Pikachu Animated Path & Hero Face Zone (Completed)
- **Objective:** Introduce animated Pikachu sprite runner along the SVG scroll path, reposition path to start strictly at About, clear the Hero face zone, and optimize layout contrast.
- **Key Deliverables:**
  - **Task 1 (Hero Smaller Name & Face Zone):** Set Hero to exactly `100svh` (`max-h-[100svh] overflow-hidden`). Scaled name clamp to `clamp(1.75rem, 5vw, 3rem)` guaranteeing single-line display across all viewports. Anchored content bottom-left (desktop right edge $\le 36\%$ viewport width, mobile occupies bottom $\le 38\%$ viewport). Completely cleared central face zone ($x=32\%-68\%, y=15\%-65\%$).
  - **Task 2 (Path Starts at About & Reference Line LUT):** Removed Hero waypoint. Waypoints updated to 5: `about`, `work`, `skills`, `certificates`, `contact`. Path strictly starts at About heading and terminates at Contact node. Built pre-computed lookup table (LUT) sampling every 4px with binary search on $y$ relative to reference line $y = \text{scrollY} + 0.55 \cdot \text{innerHeight}$ with zero layout queries in scroll handlers. Smooth exponential decay lerp ($\text{decay} = 10.0$). Runner fades in over 150px as About approaches.
  - **Task 3 (Pikachu Sprite Pipeline):** Created `scripts/build_sprite.py` using OpenCV column-projection and flood-fill alpha extraction to parse `sprite/sprite1.png`. Extracted normalized PNG strips into `public/sprite/pikachu/` (`walk.png`, `idle.png`, `idle2.png`, `idle3.png`, `jump.png`, `crouch.png`, and `pikachu.json`). Verified frame order and baseline via `scripts/out/pikachu_contact_sheet.png`. Row "b" preserved as `crouch.png` for future use.
  - **Task 4 (Pikachu Runner in DOM Layer):** Integrated Pikachu sprite runner into `ScrollPath.tsx` in DOM layer ($z\text{-30}$) using strictly 2D transforms (`translate`, `scaleX`). Implemented velocity-based state machine (`walk` for $|v| > 20$, `jump` for $|v| > 1400$ or section entry one-shot hop, `idle` for $|v| \le 20$ after 250ms with randomized idle variations). Frame advancement with accumulated $dt$. Direction of travel horizontal facing with hysteresis threshold ($|\text{dir}| > 0.25$). Integer scaling: 2x desktop, 1x mobile/tablet. Gutter padding expanded to `pl-16` / `md:pl-20` guaranteeing zero overlap with text. Preload with dot fallback; `prefers-reduced-motion` support.
  - **Task 5 (Nav Order & Contrast Consistency):** Updated `FloatingHeader.tsx` nav order to match page sequence: `[ABOUT] [WORK] [SKILLS] [CERTIFICATES] [CONTACT]`. Elevated metadata and secondary text to minimum `text-white/65` across all sections.
  - **Task 6 (Documentation Sync):** Synchronized all 6 documentation files in `docs/`. Added Rules 11 and 12 to `Rules.md`, updated rollback notes in `Memory.md`, and added architectural specifications.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 7: v1.3 Dedicated Lane & Lightning Trail Runner (Completed)
- **Objective:** Eliminate path-to-content crossings by confining the path to ONE dedicated measured lane, introduce animated cyan-white lightning trail sprite pipeline, and integrate dev validator.
- **Key Deliverables:**
  - **Task 1 (Dedicated Lane & Footprint Safety):** Bounding rects of content elements dynamically measured via `ResizeObserver`. Confined path to one side (left spine on mobile/tablet, larger free gutter at $\ge 1024\text{px}$). Footprint ($W + 2 \cdot L_{\text{trail}}$) fits lane width with $\ge 32\text{px}$ safety margin. Integer scale selected automatically (2x if fits, else 1x). Gentle wave formula $A = \max(0, (\text{laneWidth} - \text{footprint} - 32) / 2)$ capped at 28px ($A < 8\text{px}$ produces straight line). Dev-only validator (`import.meta.env.DEV`) tested every LUT sample against content boxes with zero violations, fully tree-shaken from production build.
  - **Task 2 (Lightning Sprite Pipeline):** Built `scripts/build_lightning.py` processing `sprite/sprite2.png`. Un-premultiplied cyan-white glow via $\alpha = \max(R, G, B)$ eliminating black fringes on `#a9282d`. Rotated 90 degrees clockwise offline (`np.rot90(..., k=3)`) so origin/starburst end aligns with right edge. Normalized cells to 112×66px. Exported `lightning.png` (18 frames: 8 loop frames, 9 fade frames, 1 ground flare frame) and `lightning.json`. Verified baseline and direction via `scripts/out/lightning_contact_sheet.png`.
  - **Task 3 (Pikachu Lightning Runner Integration):** Lightning trail rendered in DOM layer ($z\text{-30}$) attached to Pikachu's back at 55% top (45% up body), behind the sprite. Automatically shares Pikachu's facing flip and hysteresis via wrapper `scaleX`. Loops `loop` frames at 20 FPS during walk/jump with 80ms fade-in (max opacity 0.9). Plays `fade` frames once when stopped with 200ms fade-out. Plays ground `flare` at feet on section node hop.
  - **Task 4 (Documentation Suite):** Synchronized all 6 documentation files. Added Rules 13 and 14 to `Rules.md`, updated rollback notes in `Memory.md`, updated Design and Architecture specifications.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 8: v1.4 Hero Wandering Pikachu & Dual-Lane Corridor Zigzag Path (Completed)
- **Objective:** Introduce interactive wandering Pikachu living on Hero text perches, and enable dual-lane zigzag path alternating between left and right gutters exclusively inside measured inter-section corridors.
- **Key Deliverables:**
  - **Task 1 (Hero Wandering Pikachu):** Built `src/components/HeroPikachu.tsx` mounted inside `#hero`. Dynamically measures perches on Eyebrow (HOME), Name, and first line of Bio relative to hero container, refreshing on resize and `document.fonts.ready`. Feet sit visually on letter tops. Confined strictly outside character face zone ($x \in 32\%-68\%, y \in 15\%-65\%$) and above buttons. Implemented weighted random behaviour loop with memory (SIT 35%, FIDGET 15%, WALK 30%, HOP 20%) with dwell caps (eyebrow 6s, name 3s, bio 2s) and home return bias. During SIT, faces cursor $x$ with 24px hysteresis. Single rAF loop with 2D transforms and zero per-frame React re-renders. Pauses on `document.hidden` or hero off-screen; static idle under `prefers-reduced-motion`.
  - **Task 2 (Dual-Lane Zigzag via Corridors & refY LUT):** Expanded `ScrollPath.tsx` to support Dual-Lane mode when both gutters $\ge \text{sprite width} \times \text{scale} + 32\text{px}$ (alternates About L, Work R, Skills L, Certificates R, Contact L). Corridors widened to 224px (`pt-28 pb-28`) between sections. Path executes 40px radius turns completing strictly inside corridor gap before reaching content bounds, with horizontal feet row 16px above next section top. Built monotonic `refY` LUT allocating 0.28x innerHeight scroll span per crossing, ensuring runner stays on-screen (12%-92%) with speed ratios within 0.7-1.7. State machine velocity reads smoothed scroll velocity ($\Delta refY / \Delta t$) preventing false jumps; crossings sprint with 1.5x walk fps and lightning trail active.
  - **Task 3 (Extended Dev-Only Validator):** Expanded validator testing stroke and padded footprint against all content rects, refY monotonicity, on-screen band, speed ratios, and corridor clearances. Verified 0 collisions across 1440x900, 1280x720, 1024x768, 768x1024, and 390x844. Tree-shaken from production build.
  - **Task 4 (Visual Verification & Fixes):** Diagnosed and resolved unverified release issues:
    - Fixed Hero Pikachu perch baseline Y-offset from `+4px` to `-2px`, positioning his paws cleanly on top of the text ascenders (`overlapY: 0`, completely clear).
    - Fixed variable initialization order preventing TDZ runtime exceptions.
    - Added `document.fonts.ready` sync ensuring perch coordinates and corridor geometry re-snap as soon as fonts finish loading.
    - Added start gate fallback (1.2s timeout) and `img.onerror` handlers ensuring guaranteed rendering on cold load.
    - Latched corridor crossing facing direction (`tanX > 0 ? 1 : -1`) so Pikachu faces the direction of corridor travel with the lightning trail trailing behind his tail.
    - Captured 38 full-viewport screenshots across 1440x900, 1366x768, 1920x1080, and 390x844; visually confirmed with `view_file`.
    - Build stamp `<meta name="build" content="v1.4-<sha>">` injected via Vite plugin.
  - **Task 5 (Documentation Sync):** Synchronized all documentation files. Rewrote Rule 13, added Rule 15, updated Architecture, Design, Memory, and PRD.
- **Status:** **COMPLETE & VISUALLY VERIFIED**

---

## Phase 9: v1.5 Smaller Pikachu & Single Source of Truth (Completed)
- **Objective:** Establish a unified, single source of truth for sprite scaling (`src/lib/spriteScale.ts`), eliminate all 2x desktop logic and auto-selection, render Pikachu at crisp integer 1x scale across all viewports, and derive all speeds, offsets, and corridor clearances mathematically from `pikachu.json`.
- **Key Deliverables:**
  - **Task 1 (Single Source of Truth `src/lib/spriteScale.ts`):** Created central module exporting `HERO_SCALE = 1`, `RUNNER_SCALE = 1`, and `PIKACHU_METRICS` (reading cell dimensions from `pikachu.json`). Strictly integer scales with `image-rendering: pixelated`; fractional scaling and shrinking below 1x prohibited.
  - **Task 2 (Hero Wanderer at Unified 1x):** Updated `src/components/HeroPikachu.tsx` to read `HERO_SCALE` and `PIKACHU_METRICS`. Derived half-width ($24\text{px}$), perch feet offset ($-2\text{px}$), walk speed ($55\text{px/s}$), and hop apex height ($24\text{px}$) from `HERO_SCALE`. Maintained 0 text obscured, paws on top of letter ascenders, and face zone completely clear.
  - **Task 3 (Scroll Runner at Unified 1x):** Updated `src/components/ScrollPath.tsx` to read `RUNNER_SCALE` and `PIKACHU_METRICS`. Derived runner footprint ($158\text{px}$), lightning trail length ($55\text{px}$), minimum gutter requirement ($80\text{px} = 48 + 32$), and minimum corridor clearance ($116\text{px} = 60 \cdot 1 + 56$). Dual-lane zigzag corridor mode seamlessly activates on 1440x900, 1366x768, 1280x720, and 1024x768 viewports; 768x1024 and 390x844 use Single Left Lane Mode.
  - **Task 4 (Corridor Clearances & DEV Validator):** Measured inter-section card-to-card gaps across all 4 corridors ($249\text{px} - 250\text{px}$), providing $+133\text{px}$ safety margin above the $116\text{px}$ requirement without altering `pt-28 pb-28` spacing. Dev validator verified 0 band violations and 0 collisions across 1440x900, 1366x768, 1280x720, 1024x768, 768x1024, and 390x844. Tree-shaken from production build.
  - **Task 5 (Visual Verification & Production Build):** Captured 11 full-viewport screenshots across desktop, laptop, and mobile; visually inspected via `view_file`. Verified `npm.cmd run build` passes with zero errors, zero warnings, and clean bundle output.
  - **Task 6 (Documentation Synchronization):** Synchronized all 6 documentation files (`Rules.md`, `Design.md`, `Architecture.md`, `Memory.md`, `Phases.md`, `PRD.md`) with the new sprite scale architecture.
- **Status:** **COMPLETE & VISUALLY VERIFIED**

---

## Phase 10: v1.6 Multi-Target Packaging & CI/CD Deployment (Completed)
- **Objective:** Prepare portfolio for hosting on GitHub Pages and Render with automated CI/CD via GitHub Actions and GitLab CI, enforcing asset URL base-safety, exact filesystem letter-case validation, and runtime packaging hygiene.
- **Key Deliverables:**
  - **Task 1 (Base-Path-Safe Asset URLs):** Implemented `src/lib/assetUrl.ts` routing public asset paths through `import.meta.env.BASE_URL`. Updated `vite.config.ts` to consume `process.env.VITE_BASE || '/'` and compute CI-safe commit hashes from `GITHUB_SHA`, `CI_COMMIT_SHORT_SHA`, `RENDER_GIT_COMMIT`, or `git rev-parse`. Updated `CharacterCanvas.tsx` (preserving functional logic), `HeroPikachu.tsx`, `ScrollPath.tsx`, `HeroSection.tsx`, `ContactSection.tsx`, and `index.html`.
  - **Task 2 (Packaging & Hygiene):** Moved `character.mp4` and `character1.mp4` out of `public/` into `source-videos/`. Cleaned up public directory to contain strictly runtime assets (`frames/`, `frames_v1/`, `frames_v2/`, `center.webp`, `sprite/pikachu/`, `sprite/lightning/`, `resume.pdf`, and `favicon.svg`). Added `.gitignore`, `.gitattributes`, `.env.example`, and `.nvmrc` (Node 20).
  - **Task 3 (Asset Validation Gate):** Built `scripts/check-assets.mjs` (`npm run check:assets`) enforcing zero un-prefixed URLs, verifying exact letter case on disk for 204 runtime assets, and blocking `.mp4` video leakage into `public/` or `dist/`.
  - **Task 4 (GitHub Pages Automation):** Created `.github/workflows/deploy-pages.yml` triggering on push to `release` or `main`, installing with `npm ci`, verifying assets, building with computed `VITE_BASE`, and deploying to GitHub Pages CDN.
  - **Task 5 (Render & GitLab CI Integration):** Created `render.yaml` with static site blueprint, long immutable caching for `/assets/*`, 1-day caching for frames/sprites, and security headers. Created `.gitlab-ci.yml` image `node:20-alpine` with `validate`, `build` ($<30\text{MB}$ dist guard), and `deploy` stages triggering `$RENDER_DEPLOY_HOOK`.
  - **Task 6 (Documentation & Publishing Manual):** Authored `docs/DEPLOY.md` detailing step-by-step beginner instructions, PowerShell commands, exact click paths, release routine, and rollback procedures. Synchronized all 6 documentation files. Created clean orphan branch `release` to prevent historical large backup zips from blocking GitHub pushes.
- **Status:** **COMPLETE & VERIFIED**

---

## Phase 11: Future Roadmap
- **Feature 11.1 — Audio Scenography:** Subtle luxury audio feedback (gentle click ticks on hover, soft focus tone on direct eye contact).
- **Feature 11.2 — Mobile Gyroscope Parallax:** On mobile devices, utilize `DeviceOrientationEvent` to steer character gaze when no touches occur.
- **Feature 11.3 — Project Case Study Modals:** Expandable drawers displaying architectural diagrams and detailed code walkthroughs for LawPoint and AI Search Bot.




