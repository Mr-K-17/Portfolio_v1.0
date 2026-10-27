# Kishore S V — Luxury Portfolio

A bespoke luxury developer portfolio engineered with Vite, React, TypeScript, and Tailwind CSS. Features an interactive 360° rotational 3D character engine rendered via 64 pre-extracted WebP canvas frames with exponential-decay mouse tracking, an animated wandering Pikachu hero sprite, and a continuous SVG scroll runner navigating dedicated lanes and inter-section corridors.

## Quick Start

### Prerequisites
- Node.js `>=20` (specified in `.nvmrc`)
- Windows development uses `npm.cmd`; Linux/macOS uses `npm`

### Local Development
```bash
# Install dependencies
npm.cmd ci

# Validate runtime assets and exact letter-case integrity
npm.cmd run check:assets

# Start local development server (port 5173)
npm.cmd run dev
```

### Production Build & Preview
```bash
# Type check and bundle for production
npm.cmd run build

# Preview production build locally (port 4173)
npm.cmd run preview

# Simulate GitHub Pages subpath deployment locally
$env:VITE_BASE="/portfolio/"; npm.cmd run build; npm.cmd run preview
```

## Deployment & Hosting

The project is configured for automated multi-target deployment:
- **GitHub Pages:** Static build and deployment orchestrated via GitHub Actions (`.github/workflows/deploy-pages.yml`).
- **Render:** Production static site hosting configured via `render.yaml`.
- **GitLab CI:** Automated quality gate and deploy trigger pipeline configured via `.gitlab-ci.yml`.

For comprehensive step-by-step instructions, click paths, environment variables, and rollback procedures, consult:
👉 **[Deployment Guide](docs/DEPLOY.md)**

## Architecture & Documentation

Full architectural specifications, design systems, and rules are documented under `docs/`:
- [docs/Rules.md](docs/Rules.md) — 16 inviolable development and architectural rules.
- [docs/Architecture.md](docs/Architecture.md) — Canvas engine, dual-engine switcher, sprite scale, and asset URL resolution.
- [docs/Design.md](docs/Design.md) — Luxury editorial design tokens, color palette, and typography system.
- [docs/Memory.md](docs/Memory.md) — Project decisions, known quirks, and release tag history.
- [docs/Phases.md](docs/Phases.md) — Development phases roadmap and milestone history.
- [docs/PRD.md](docs/PRD.md) — Product requirements and technical acceptance criteria.
- [docs/DEPLOY.md](docs/DEPLOY.md) — Step-by-step hosting and release management manual.
