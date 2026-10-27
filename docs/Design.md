# Design System & Aesthetic Guidelines

## 1. Aesthetic Philosophy: *Velvet Editorial & Technical Precision*
The design language combines **warm, rich crimson velvet tones** with **clean, high-legibility editorial typography**:
- Deep, velvet crimson tones (`#a9282d` base, `#8b1f23` card surface) provide an immersive atmosphere.
- Left-aligned editorial layout creates a clear, readable reading path.
- The interactive character animation remains anchored in the background, continuously engaging the user with zero distraction.
- A delicate, scroll-driven SVG Bezier path threads through the content, visualising progress without competing for attention.

---

## 2. Color Palette & Design Tokens

| Token Name | Value | Purpose |
| :--- | :--- | :--- |
| **Crimson Base** | `#a9282d` (`rgb(169, 40, 45)`) | Page background & canvas fill (exact video match) |
| **Deep Velvet Surface** | `#8b1f23` (`rgba(139, 31, 35, 0.85)`) | Content cards (`.velvet-card`) |
| **Hairline Border** | `rgba(255, 255, 255, 0.10)` | Card borders (intensifies to `0.25` on hover) |
| **Primary Text** | `#ffffff` / `rgba(255, 255, 255, 0.90)` | Headlines, primary text, buttons |
| **Secondary Text** | `rgba(255, 255, 255, 0.70)` to `0.75` | Body copy, descriptions, details |
| **Muted Metadata** | `rgba(255, 255, 255, 0.65)` | Minimum contrast token: tags, timestamps, labels |
| **Pikachu Pixel Scale** | 1x integer scale (`HERO_SCALE = 1`, `RUNNER_SCALE = 1` in `src/lib/spriteScale.ts`) across all viewports | Pixelated integer sprite scale (no distortion, no blur) |
| **Lightning Trail** | Cyan-white un-premultiplied glow, length $\approx 1.0-1.3\times W$ | Smooth glow art, loop/fade 20 FPS |
| **Accent Emerald** | `#34d399` | Distinction GPA, verification indicators |
| **Accent Gold** | `#fcd34d` | Key accents and highlight icons |

---

## 3. Typography Hierarchy

### 3.1 Primary Name Display
- **Font Family:** `'Playfair Display', Georgia, serif` (Google Fonts)
- **Weight:** 700 Bold
- **Styling:** Rendered in **uppercase** as `KISHORE S V`, `letter-spacing: ~0.06em`, `text-[clamp(1.75rem,5vw,3rem)]`, `leading-none`.
- **Responsive Size:** ~28px at 360–430px wide, ~40px at 768px, capped at 48px (3rem) from 1280px up. Guaranteed single-line display across all viewports.
- **Shadow:** `drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]` for crisp contrast against crimson.
- **Note:** Dancing Script has been completely removed in v1.1.

### 3.2 Eyebrow & Body Typography
- **Font Family:** `'Inter', system-ui, -apple-system, sans-serif`
- **Eyebrow:** `text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-white/85` ("Aspiring Software Engineer Intern").
- **Body Copy:** `text-xs md:text-sm font-normal text-white/90 leading-relaxed` (max-width ~340px in Hero).

### 3.3 Section Titles
- **Font Family:** `'Playfair Display', Georgia, serif`
- **Styling:** Plain titles: `Work`, `About`, `Skills`, `Certificates`, `Contact` (`text-4xl md:text-5xl font-bold tracking-tight text-white`).

### 3.4 Technical Labels & Monospace
- **Font Family:** `'JetBrains Mono', monospace`
- **Styling:** `text-[10px] md:text-xs font-mono uppercase tracking-widest text-white/65`.

---

## 4. Component Design Specifications

### 4.1 Floating Frosted-Glass Header Pill
- **Position:** `fixed top-6 left-0 right-0 z-40`, centered.
- **Glass Treatment:** `.header-glass` (`background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15)`).
- **Navigation:** Plain navigation links in page order: `[ABOUT]`, `[WORK]`, `[SKILLS]`, `[CERTIFICATES]`, `[CONTACT]`.
- **Engine Switching:** Read from URL parameter `?engine=v1|v2`, leaving the header clean and uncluttered.

### 4.2 Hero Action Buttons, First Viewport & Wandering Pikachu
- **Hero Viewport Height:** Exactly `100svh` (`max-h-[100svh] overflow-hidden`). About section does not peek.
- **Face Zone Clearance:** The central 36% of viewport width ($x=32\%-68\%$) $\times$ vertical band $15\%-65\%$ of viewport height is strictly kept clear. Character face is centered at $x=50\%, y=43\%$.
- **Anchoring:** Hero block is anchored bottom-left (desktop right edge $\le 36\%$ viewport width, mobile occupies $\le 38\%$ viewport).
- **Hero Wandering Pikachu (`HeroPikachu.tsx`):**
  - Rendered at fixed 1x integer scale (`HERO_SCALE = 1` from `src/lib/spriteScale.ts`).
  - Lives on top of hero text perches: Eyebrow (HOME), Name, and first line of Bio.
  - Feet sit visually on the top of the letters.
  - Constrained strictly outside the face zone and above buttons.
  - Behaviour loop: SIT 35% (faces cursor with 24px hysteresis), FIDGET 15% (turns/sniffs), WALK 30% (scampers along perch), HOP 20% (ballistic leap between adjacent perches with home bias).
  - Pauses on document hidden or hero off-screen; renders static idle on eyebrow under `prefers-reduced-motion`.
- **Resume Button:** Solid white pill (`bg-white text-[#a9282d]`), bold sans-serif, diagonal arrow transition on hover. Links to `/resume.pdf`.
- **Let's Talk Button:** Translucent white pill (`bg-white/10 hover:bg-white/20 border-white/40`), smooth scroll to `#contact`.

### 4.3 Velvet Content Cards (`.velvet-card`)
- **Styling:** `bg-[#8b1f23]/85`, `border: 1px solid rgba(255, 255, 255, 0.10)`, `border-radius: 1rem` (16px).
- **Hover State:** Border color changes to `rgba(255, 255, 255, 0.25)` without excessive scale or heavy box-shadow.
- **Performance:** No heavy `backdrop-filter` on cards, preserving fast paint performance.

### 4.4 Dual-Lane Zigzag Corridor Path & Lightning Runner (`ScrollPath.tsx`)
- Delicate SVG cubic-Bezier curve threading down the gutters and crossing side-to-side ONLY inside empty inter-section corridors.
- Dual-Lane mode active when both gutters $\ge \text{sprite width} \times \text{RUNNER\_SCALE} + 32\text{px}$ (80px at 1x); otherwise single left lane (mobile and tablet).
- Corridors widened to 224px (`pt-28 pb-28`), exceeding required tallest cell $\times \text{RUNNER\_SCALE} + 56\text{px}$ (116px at 1x).
- Horizontal crossing run has feet 16px above next section top with 8px slope; rounded turns (radius 40px) finish strictly inside the corridor gap before content bounds.
- **Pikachu Sprite Runner:**
  - Crisp integer pixel art rendering: `image-rendering: pixelated`, fixed 1x integer scale (`RUNNER_SCALE = 1` in `src/lib/spriteScale.ts`) across all viewports.
  - State machine velocity reads smoothed SCROLL velocity of reference line ($> 20\text{px/s}$ walk, $> 1400\text{px/s}$ jump).
  - Crossing sprints: walk animation runs at $\times 1.5$ FPS ($15\text{fps}$) with lightning trail active.
  - Horizontal facing follows travel tangent with hysteresis; reverses cleanly on upward scroll.
- **Lightning Sprite Trail:**
  - Soft glowing cyan-white bolts un-premultiplied without black fringe, rotated 90 deg clockwise offline.
  - Attached to Pikachu's back at 55% top (45% up body), rendered behind Pikachu in layer order.
  - Loops at 20 FPS during movement; plays fade frames once with 200ms fade-out upon stopping; ground flare burst at feet on section node hop.
- Pre-computed 4px LUT with monotonic `refY` mapping ($S + 0.55 \cdot \text{innerHeight}$), ensuring runner stays in 12%-92% on-screen band with speed ratios within 0.7-1.7.

### 4.5 Custom Magnetic Cursor
- Glowing white dot with trailing aura ring.
- Automatically disabled on touch screens (`@media (pointer: coarse)`).

---

## 5. Responsive Design Standards
- **Desktop ($\ge 1024\text{px}$):** Character canvas fixed in background; hero content left-aligned $\le 36\%$ width; content column centered (`max-w-[720px]` / `[800px]` / `[880px]`) with spacious outer gutters (152px–280px); runner in dedicated lane or corridor zigzag at fixed 1x scale (`RUNNER_SCALE = 1`) with gentle wave and animated lightning trail.
- **Tablet ($768\text{px} - 1023\text{px}$):** Content padding `md:pl-[120px] md:pr-8`; runner in dedicated left lane ($W_{\text{lane}} = 120\text{px}$) at fixed 1x scale (`RUNNER_SCALE = 1`) with lightning trail, 0 overlap.
- **Mobile ($< 768\text{px}$):** Path strictly vertical along left spine ($W_{\text{lane}} = 84\text{px}$); all section containers receive left padding `pl-[84px] pr-4` ensuring a minimum 18px clear margin between Pikachu and cards. Hero content constrained to bottom $\le 38\%$ of viewport. Name scales smoothly via `clamp(1.75rem, 5vw, 3rem)`. Hero Pikachu at 1x scale (`HERO_SCALE = 1`).

> [!NOTE]
> **v1.6 Packaging & Deployment Pass:** Zero visual or behavioral changes were introduced; all typography, layouts, colors, canvases, sprites, and animations remain 100% identical to v1.5 across all viewport breakpoints.

