# Inviolable Rules & Technical Constraints

All developers and AI models working on this codebase must strictly observe the following technical constraints. Under no circumstances should these rules be violated.

---

## 1. Background Engine & Canvas Constraints

### RULE 1: STRICTLY ZERO CSS 3D TRANSFORMS
- **Prohibition:** NEVER apply `perspective`, `rotateX`, `rotateY`, `transform: rotate3d`, or `matrix3d` transforms to the `<canvas>`, its container, or the hero wrapper.
- **Rationale:** CSS 3D transforms distort the character's body and create artificial perspective skewing.
- **Mandate:** The character's torso, shoulders, and background frame must remain 100% rock-solid motionless. ONLY the head rotates via canvas frame switching.

### RULE 2: STRICTLY ZERO RUNTIME VIDEO SEEKING OR PLAYBACK
- **Prohibition:** NEVER call `video.currentTime = ...`, `video.play()`, or render an HTML `<video>` element on the page at runtime.
- **Rationale:** Generated MP4 video files contain only 1 keyframe. In-browser frame seeking causes severe browser freezes, stutter, and uncontrolled background playback.
- **Mandate:** All frames MUST be pre-extracted as high-quality WebP images and rendered through the 2D HTML5 Canvas engine.

### RULE 3: CRISP SINGLE-FRAME ZERO-GHOSTING CANVAS RENDER
- **Prohibition:** NEVER alpha-blend overlapping frames (e.g. drawing frame $A$ with opacity $0.4$ and frame $B$ with opacity $0.6$).
- **Rationale:** Alpha blending produces unsightly double-face ghosting, blurry contours, and artifacting.
- **Mandate:** Clear the canvas, paint the solid background `#a9282d`, and draw **EXACTLY ONE crisp frame at 100% opacity** per render tick.

### RULE 4: 100% SEAMLESS BACKGROUND COLOR MATCH
- **Prohibition:** NEVER use arbitrary black, gray, or mismatched background colors that create visible rectangular video borders.
- **Mandate:** The background color across `<body>`, canvas fill, and page containers MUST match the video's exact background color: `#a9282d` (`rgb(169, 40, 45)`).

### RULE 5: PERMANENT FIXED BACKGROUND CANVAS AT Z-0
- **Mandate:** The Character Canvas MUST remain fixed in the viewport at `z-0`: `fixed inset-0 w-screen h-screen pointer-events-none z-0`.
- **Warning on Negative Z-Index:** Do NOT set canvas container to `-z-10`. In CSS 2.1 stacking contexts, negative z-index elements inside positioned containers (`relative`) render underneath the background color and become invisible.
- **Behavior:** As the visitor scrolls down through the portfolio, the character remains constant in the background, continuously tracking the cursor across all sections.

---

## 2. Content & Design Constraints

### RULE 6: AUTHENTIC USER DATA INTEGRITY
- **Prohibition:** NEVER insert fictitious filler names, unverified awards, or marketing buzzword titles (e.g., "Full Stack & AI Systems Engineer" or "Key Credentials" badge).
- **Mandate:** All data, projects, educational records, GPA, certificates, and hyperlinks MUST strictly represent **Kishore S V** as parsed from `resume/KISHORE S V_Resume.pdf`.

### RULE 7: PLAIN SECTION TITLES & VELVET CARD STYLING
- Section titles must remain plain and direct: `Work`, `About`, `Skills`, `Certificates`, `Contact`.
- Card surfaces must use flat deep-velvet styling (`bg-[#8b1f23]/85`, 1px border-white/10, rounded-2xl). Do not apply heavy `backdrop-filter: blur(...)` to cards; restrict blur(12px) strictly to the top header pill.

### RULE 8: TOUCH DEVICE ACCESSIBILITY & REDUCED MOTION
- Custom cursor must automatically disable on touch / coarse pointer devices (`@media (pointer: coarse)`).
- When `prefers-reduced-motion` is active, the scroll path must be drawn statically without traveling dot motion.
- Interactive elements must include visible `:focus-visible` styling for keyboard navigation.

---

## 3. Engineering & Code Quality Standards

### RULE 9: DELTA-TIME LERPING FOR VARIABLE REFRESH RATES
- Tracking calculations must always incorporate delta time ($dt$) using continuous exponential decay:
  $$\text{factor} = 1 - e^{-\text{decay} \cdot dt} \quad (\text{decay} = 18.0)$$
- Never use fixed-multiplier per-frame lerps that behave inconsistently across 60Hz, 120Hz, and 144Hz monitors.

### RULE 10: STRICT TYPESCRIPT & ZERO UNUSED VARIABLES
- `noUnusedLocals: true` and `noUnusedParameters: true` are enabled in `tsconfig.json`.
- All unused imports, variables, and parameters must be cleaned up immediately.
- Running `npm.cmd run build` must complete with zero errors and zero warnings.
- Always execute `npm.cmd`, never `npm` directly on Windows PowerShell.

---

## 4. Layout & Sprite Runner Constraints

### RULE 11: HERO FIRST VIEWPORT KEEPS THE FACE ZONE CLEAR
- **Prohibition:** NEVER place text, cards, buttons, or scroll path elements across the character face zone on first load.
- **Specification:** The character face is centered at $x=50\%, y=43\%$. The central 36% of viewport width ($x = 32\% - 68\%$) $\times$ the vertical band $15\% - 65\%$ of viewport height must remain completely clear (the floating header pill is the only permitted exception).
- **Mandate:** Hero section height is exactly `100svh` (`max-h-[100svh] overflow-hidden`). Hero content is anchored bottom-left; on desktop ($\ge 1024\text{px}$) its right edge must never exceed 36% viewport width; on mobile it occupies at most the bottom 38% of the viewport. The About section must not peek into the first viewport.

### RULE 12: RUNNER LIVES IN THE DOM/SVG LAYER, NEVER IN THE CHARACTER CANVAS
- **Prohibition:** NEVER draw the animated runner or path elements onto the HTML5 Character Canvas.
- **Mandate:** The runner sprite lives strictly in the DOM content layer at $z\text{-30}$ (above card backgrounds, below header at $z\text{-40}$ and custom cursor at $z\text{-50}$).
- **Transform Constraints:** Only 2D transforms (`translate`, `scaleX`) are permitted for sprite positioning and horizontal flipping. Never apply `perspective`, `rotateX`, `rotateY`, `matrix3d`, or `rotate3d`.

### RULE 13: PATH AND RUNNER FOOTPRINT NEVER INTERSECT CONTENT; LANE SWITCHING ONLY IN MEASURED CORRIDORS
- **Prohibition:** Path and runner footprint never intersect content.
- **Mandate:** Lane switching is allowed ONLY inside measured corridors (empty vertical gaps between sections, height $\ge$ tallest sprite cell $\times \text{RUNNER\_SCALE} + 56\text{px}$: 116px at 1x); single left lane when gutters are too narrow (both gutters must be $\ge$ sprite width $\times \text{RUNNER\_SCALE} + 32\text{px}$: 80px at 1x for dual-lane mode).
- **Scale Standard:** Sprite scale is fixed to 1x via `RUNNER_SCALE = 1` from `src/lib/spriteScale.ts` across all viewports.
- **Measurement:** Measure actual bounding rects of content at layout time and on resize via ResizeObserver. Corridors are strictly between section $i$ content bottom and section $i+1$ content top.
- **Crossing Geometry:** The horizontal crossing run has feet positioned 16px above the next section's top with a 6-12px slope. Both entrance and exit rounded turns (radius 40-60px) complete strictly inside the corridor gap before reaching content bounds.

### RULE 14: LIGHTNING IS PRE-ROTATED OFFLINE, RENDERED IN THE DOM LAYER BEHIND THE SPRITE, NEVER ON THE CHARACTER CANVAS
- **Prohibition:** NEVER apply runtime CSS rotate to lightning bolts, and NEVER draw lightning on the HTML5 Character Canvas.
- **Mandate:** Lightning bolts from sprite/sprite2.png are rotated 90 degrees clockwise offline via np.rot90(..., k=3) in scripts/build_lightning.py so the origin/starburst end aligns with the right edge.
- **Rendering:** Rendered in the DOM layer at z-30 directly behind Pikachu (layer order: lightning first child, Pikachu second child inside the runner wrapper). It shares the sprite's scaleX facing flip automatically.

### RULE 15: HERO WANDERING PIKACHU
- **Mandate:** The hero Pikachu lives inside the hero, renders at fixed 1x integer scale (`HERO_SCALE = 1` from `src/lib/spriteScale.ts`) in the DOM layer at z-30 with 2D transforms only, never enters the face zone (x in 32%-68%, y in 15%-65%), and never goes below the bio or over the Resume / Let's Talk buttons.
- **Behavior:** Perches on the eyebrow (HOME), name, and bio first line; executes weighted random behavior (SIT 35%, FIDGET 15%, WALK 30%, HOP 20%) with memory; faces cursor during SIT with 24px hysteresis; pauses when document is hidden or hero is offscreen; renders static idle under prefers-reduced-motion.

### RULE 16: BASE-PATH-SAFE ASSET URLS & PACKAGING HYGIENE
- **Mandate:** All public asset URLs (frames, frames_v1, frames_v2, center.webp, sprite/pikachu/*, sprite/lightning/*, resume.pdf, favicon) must resolve through the base path helper (`assetUrl` in `src/lib/assetUrl.ts` or `%BASE_URL%` in `index.html`). Hard-coded root-absolute URLs are forbidden.
- **Packaging:** No `.mp4` video files may exist under `public/` or `dist/`. Source video files (`character.mp4`, `character1.mp4`) reside strictly in `source-videos/`.
- **Portability:** The build must pass cleanly with zero errors both at `VITE_BASE=/` (Render root hosting) and at `VITE_BASE=/<repo>/` (GitHub Pages subpath hosting). Verified by `npm.cmd run check:assets`.



