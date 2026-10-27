# Product Requirements Document (PRD)

## 1. Project Overview
- **Product Name:** Kishore S V — Interactive Portfolio
- **Owner & Developer:** Kishore S V (Aspiring Software Engineer Intern)
- **Product Vision:** A high-performance, editorial digital portfolio featuring an ultra-smooth, zero-lag, zero-ghosting cursor-tracking character animation that stays permanently engaged in the background as visitors scroll through verified projects, education, certificates, and skills.

---

## 2. Target Audience & Personas
1. **Tech Recruiters & Talent Acquisition:** Seeking rapid evaluation of academic performance (GPA: 9.0), key technical proficiencies (Java, Spring Boot, React, MongoDB), and instant 1-click access to the verified resume PDF.
2. **Engineering Managers & Tech Leads:** Evaluating architectural depth, clean code structure, complex algorithmic implementations (delta-time circular lerp, canvas rendering, SVG Bezier math), and verified GitHub repositories (LawPoint, AI Search Bot, Habit Tracker).
3. **Peer Developers & Collaborators:** Reviewing factual technical project descriptions, open-source repositories, and verified credentials across NPTEL, Infosys Springboard, and VTU Honors.

---

## 3. Core Features & Functional Requirements

### 3.1 Fixed Background Character Engine
- **Permanent Viewport Anchor:** The character canvas is rendered as a fixed background layer (`fixed inset-0 w-screen h-screen pointer-events-none z-0`).
- **Continuous Gaze Tracking Across Scroll:** The character continuously tracks the visitor's cursor at every scroll position across the entire page (Hero, About, Work, Skills, Certificates, Contact).
- **Deadzone Direct Eye Contact:** When the cursor enters near the character's face (within $\le 12\%$ of screen radius), the canvas switches instantly to `center.webp`, establishing direct eye contact.
- **Shortest-Path Angular Lerping:** Real-time smoothing of `atan2(dy, dx)` with exponential decay factor ($\text{decay} = 18.0$) yielding a rapid $\sim 35\text{ms}$ tracking response with zero perceived latency.

### 3.2 Dual-Video Asset Engine & URL-Driven Selection
- Integration of both `character.mp4` (counter-clockwise rotation) and `character1.mp4` (clockwise rotation).
- Selection controlled cleanly via URL parameter `?engine=v1|v2` with default fallback to `fused` (optimal composite dataset using the highest-fidelity rotational quadrants from both sources).

### 3.3 Dual-Lane Zigzag Corridor Path, Pikachu Runner & Lightning Trail (`ScrollPath.tsx`)
- **Dual-Lane Corridor Path:** Enables path to alternate between Left and Right gutters exclusively through measured inter-section corridors (gap height $\ge \text{tallest sprite cell} \times \text{RUNNER\_SCALE} + 56\text{px}$: 116px at 1x). Dual-lane mode active when both gutters $\ge \text{sprite width} \times \text{RUNNER\_SCALE} + 32\text{px}$ (80px at 1x). Fallback to single left lane on mobile and tablet. Fixed 1x integer scale (`HERO_SCALE = 1`, `RUNNER_SCALE = 1` via `src/lib/spriteScale.ts`).
- **5 Section Waypoints:** `about` (L), `work` (R), `skills` (L), `certificates` (R), `contact` (L), anchored at each section heading.
- **Crossing Clearances:** Inter-section corridor height is set to 224px (`pt-28 pb-28`). Horizontal crossing has feet 16px above next section top with 8px slope; rounded turns (radius 40px) finish strictly inside the corridor gap before content bounds.
- **Monotonic refY LUT:** Path sampled every 4px with strictly increasing `refY` ($O(\log N)$ binary search on $S + 0.55 \cdot \text{innerHeight}$). Crossings allocated 0.28x innerHeight scroll span; runner guaranteed inside 12%-92% on-screen band with speed ratio within 0.7-1.7.
- **Pikachu Sprite Runner:**
  - Rendered in DOM layer ($z\text{-30}$) using strictly 2D CSS transforms (`translate`, `scaleX`).
  - Velocity-based state machine reading smoothed scroll velocity of reference line: `walk` ($|v_{\text{scroll}}| > 20$), `jump` ($|v_{\text{scroll}}| > 1400$ or section hop), `idle` ($|v_{\text{scroll}}| \le 20$ after 250ms).
  - Corridor crossing sprints: walk frame rate accelerates to $\times 1.5$ ($15\text{fps}$) with lightning trail active.
  - Horizontal facing follows travel tangent with hysteresis; reverses cleanly on scroll up.
- **Lightning Sprite Trail:**
  - Extracted from `sprite/sprite2.png` via `scripts/build_lightning.py` with un-premultiplied cyan-white glow (no black fringe) and rotated 90 degrees clockwise offline.
  - Attached behind Pikachu at his back (55% top, 45% up body) in layer order behind the sprite ($z\text{-index}: 1$).
  - Loops `loop` frames (0..7) at 20 FPS during walk/jump/crossings with 80ms fade-in. Plays `fade` frames (8..16) once on idle with 200ms fade-out. Plays ground `flare` at feet on section node hop.
- **Dev-Only Validator:** Under `if (import.meta.env.DEV)`, tests stroke and padded footprint against all content rects, refY monotonicity, on-screen band compliance, speed ratios, and corridor clearances. Tree-shaken from production build.
- Preloaded with fallback to glowing dot; static idle render under `prefers-reduced-motion`.

### 3.4 Custom Magnetic Cursor
- Glowing white center dot with smooth trailing aura ring.
- Automatically disabled on touch and coarse pointer devices (`@media (pointer: coarse)`).
- Clean interactive scaling on links and buttons without distracting pulsing focal animations.

### 3.5 Floating Frosted-Glass Header
- Centered at the top viewport with `backdrop-filter: blur(12px)` and semi-translucent pill styling (`header-glass`).
- Clean navigation anchors in page sequence: `[ABOUT]`, `[WORK]`, `[SKILLS]`, `[CERTIFICATES]`, `[CONTACT]`.

### 3.6 Hero Section & Wandering Pikachu
- **Viewport Height:** Exactly `100svh` (`max-h-[100svh] overflow-hidden`); About section never peeks on first load.
- **Face Zone Clearance:** The central 36% of viewport width ($x=32\%-68\%$) $\times$ vertical band $15\%-65\%$ of viewport height is strictly kept clear of text, cards, buttons, or path elements. Character face is centered at $x=50\%, y=43\%$.
- **Anchoring:** Hero block is anchored bottom-left. On desktop ($\ge 1024\text{px}$) right edge never exceeds 36% viewport width; on mobile content occupies at most the bottom 38% of viewport.
- **Hero Wandering Pikachu (`HeroPikachu.tsx`):**
  - Lives on top of hero text perches: Eyebrow (HOME), Name, and first line of Bio.
  - Feet sit visually on the top of the letters.
  - Constrained strictly outside the face zone and above buttons.
  - Behaviour loop: SIT 35% (faces cursor with 24px hysteresis), FIDGET 15% (turns/sniffs), WALK 30% (scampers along perch), HOP 20% (ballistic leap between adjacent perches with home return bias).
  - Pauses on document hidden or hero off-screen; renders static idle on eyebrow under `prefers-reduced-motion`.
- **Name:** **"KISHORE S V"** in uppercase Playfair Display 700 with responsive `clamp(1.75rem, 5vw, 3rem)` guaranteeing single-line display across 360px to 1440px.
- **Eyebrow:** "Aspiring Software Engineer Intern" in spaced modern sans-serif typography.
- **Factual Bio:** Compact 3-line statement (max-width ~340px) strictly derived from resume summary:
  *"Computer Science student building full-stack applications with Java, Spring Boot, React and MongoDB. Exploring DevOps, automation and deployment, and looking for a Software Engineer Intern role."*
- **Action Pill Buttons:**
  - `Resume`: Solid white pill with arrow icon, opening `/resume.pdf` directly.
  - `Let's Talk`: Frosted glass pill with white border, smoothly navigating to `#contact`.

### 3.7 About Section
- B.E. Computer Science & Engineering (2023–2027) at ATME College of Engineering, Mysuru (GPA: **9.0 / 10.0**).
- Pre-University PCMC Science at Sadvidya Composite PU College (**85.83%**).
- Secondary Education Distinction at GSSS Bantwal Madhava Shenoy High School (**93.44%**).
- Hackathons & Events: 24-hour hackathons (JSS, Devnote Bengaluru), coding competitions (TCS TechBytes, CodeHunt), and technical forums (Google DevFest, Bengaluru Tech Summit 2025).

### 3.8 Work Section (Featured Projects)
- **Line Follower Obstacle Avoiding Robot:** Arduino C/C++ autonomous robot using IR and ultrasonic sonar with L298 motor driver.
- **Stock Management System:** PHP, HTML, CSS, JavaScript, and MySQL inventory management and supplier tracking system.
- **AI Search Bot:** Python search assistant powered by Google Gemini 2.5 Flash. Direct link to [GitHub Repository](https://github.com/Mr-K-17/AI-search-bot.git).
- **LawPoint:** AI advocate-client matching platform with Socket.io real-time chat, MongoDB database, and Gemini 2.5 Flash. Direct link to [GitHub Repository](https://github.com/Mr-K-17/LawPoint.git).
- **Habit Tracker (Coding activities):** Java Swing desktop application with JDBC to track daily habits and automatically log VS Code coding time into MySQL. Direct link to [GitHub Repository](https://github.com/Mr-K-17/CodeHabitTracker.git).

### 3.9 Skills Section
- Strict resume categorization:
  - **Frontend:** HTML5, CSS3
  - **Backend:** Java, Spring Boot
  - **Database:** MySQL, MongoDB
  - **Languages:** Java, C, SQL
  - **Tools:** VS Code, NetBeans, Arduino IDE, Cursor, IntelliJ IDEA, Git, GitHub, GitLab, Docker
  - **Soft Skills:** Teamwork and collaboration, Critical thinking and Problem-solving, Adaptability, Time management, Communication and Active listening.

### 3.10 Certificates Section
- Compact list grouped by issuer with direct "View" links:
  - **NPTEL (IIT Madras):** The Joy of Computing Using Python (Jul–Oct 2024), Introduction to Large Language Models (Jul–Oct 2025).
  - **Infosys Springboard:** Fundamentals of Data Networking, Azure DevOps, Introduction to NoSQL Databases, Agile Scrum in Practice, Agile Scrum Certification, Software Engineering and Agile Software Development.
  - **VTU Honors Program:** Natural Language Processing (NLP), Blockchain and its Applications, Affective Computing.
  - Master Google Drive Credentials Folder.

### 3.11 Contact Section
- 1-click clipboard copy for `kishoresathyagala@gmail.com`.
- Direct telephone link for `+91 8971301934`.
- Location: *SVP Nagar, Mysuru, Karnataka, India*.
- Hyperlinks: LinkedIn, GitHub, Resume PDF.

---

## 4. Performance Budgets & Technical Standards
- **Frame Rate:** Constant 60 FPS minimum, supporting 120Hz/144Hz high-refresh displays via delta-time exponential decay smoothing.
- **Total Asset Weight:** 64 WebP frames @ $\sim 40\text{KB} \approx 2.6\text{MB}$ total, preloaded into memory before canvas init.
- **Color Consistency:** Exact color match `#a9282d` across body, canvas fill, and video frame backgrounds.
- **Zero Ghosting:** Single-frame canvas rendering without frame blending.
- **Card Aesthetics:** Velvet surface `bg-[#8b1f23]/85`, 1px border, 16px radius, hover border color change only.
- **Zero Dependencies Added:** ScrollPath implemented via native SVG, ResizeObserver, and IntersectionObserver.

---

## 4. Hosting & Deployment Requirements

### 4.1 Multi-Target Hosting Portability
- **Root Domain Hosting (Render):** Application builds with `VITE_BASE=/` and serves static assets directly from root.
- **Subpath Hosting (GitHub Pages):** Application dynamically builds with `VITE_BASE=/<repo>/` without broken image or script URLs.
- **Base URL Resolution:** All runtime assets route through `assetUrl(...)` or `%BASE_URL%`.

### 4.2 CI/CD Automation
- **GitHub Pages Workflow (`.github/workflows/deploy-pages.yml`):** Automatically builds and deploys to GitHub Pages on pushes to `release` or `main`.
- **GitLab CI Pipeline (`.gitlab-ci.yml`):** Validates assets, checks letter cases, performs TypeScript checks, builds production bundle, guards against `.mp4` files and bundle bloat ($< 30\text{MB}$), and triggers the Render deployment hook via protected secret.
- **Render Static Site (`render.yaml`):** Production static service with automated autoDeploy turned off, using edge caching for assets and 1-day caching for character/sprite frames.

