# Multi-Target Deployment Manual (GitHub Pages, Render, GitLab CI)

This guide provides step-by-step instructions for deploying Kishore S V's portfolio to **GitHub Pages** (via GitHub Actions) and **Render** (via automated GitLab CI webhook triggers). Every step is documented with exact click paths, PowerShell commands, and troubleshooting diagnostics.

---

## Architecture Overview

```
                      ┌───────────────────────────────────────────────┐
                      │              Local Development               │
                      │   Windows PowerShell (Node 20, npm.cmd)       │
                      └───────┬───────────────────────────────┬───────┘
                              │ git push release              │ git push release
                              ▼                               ▼
      ┌────────────────────────────────────────┐    ┌───────────────────────────────────┐
      │             GitHub Repository          │    │          GitLab Project           │
      │         (github.com/<user>/<repo>)     │    │     (gitlab.com/<user>/<repo>)    │
      └───────────────────┬────────────────────┘    └─────────────────┬─────────────────┘
                          │ Push Trigger                              │ Push Trigger
                          ▼                                           ▼
      ┌────────────────────────────────────────┐    ┌───────────────────────────────────┐
      │     GitHub Actions Workflow            │    │        GitLab CI Pipeline         │
      │  (.github/workflows/deploy-pages.yml)  │    │         (.gitlab-ci.yml)          │
      │  • npm ci                              │    │  • Stage 1: validate (assets+tsc) │
      │  • npm run check:assets                │    │  • Stage 2: build (<30MB, no .mp4)│
      │  • VITE_BASE=/<repo>/ npm run build    │    │  • Stage 3: trigger deploy hook   │
      └───────────────────┬────────────────────┘    └─────────────────┬─────────────────┘
                          │                                           │ POST $RENDER_DEPLOY_HOOK
                          ▼                                           ▼
      ┌────────────────────────────────────────┐    ┌───────────────────────────────────┐
      │          GitHub Pages CDN              │    │          Render Hosting           │
      │  https://<user>.github.io/<repo>/      │    │  https://<service>.onrender.com   │
      └────────────────────────────────────────┘    └───────────────────────────────────┘
```

> [!IMPORTANT]
> **Which branch to publish? (`release` vs `main`):**
> Historical commits in the project contained large backup archive zips (`Portfolio_v1.2_backup.zip`, `Portfolio_v1.3_backup.zip`, `Portfolio_v1.4_backup.zip`), causing `.git` to exceed 480MB with individual historical git objects over 115MB. Because GitHub strictly rejects any push containing blobs over 100MB (`remote: error: GH001: Large files detected`), we have preserved the complete local development history on `v1.6-deploy` / `master` without rewriting history, and created a dedicated clean orphan branch: **`release`**.
>
> **Always push the `release` branch to GitHub and GitLab.**

---

## A. One-Time Local Preparation

All commands should be executed from PowerShell in the project directory (`c:\Users\USER\Desktop\Portfolio`).

### 1. Verify Clean Working State & Node Version
```powershell
# Confirm Node version is >= 20
node -v

# Perform clean dependency installation
npm.cmd ci

# Validate runtime assets and exact letter-case integrity
npm.cmd run check:assets
```

### 2. Local Production Build & Simulation
Test both root hosting (Render) and repository subpath hosting (GitHub Pages):

#### Test Root Hosting (`/` - Render simulation):
```powershell
$env:VITE_BASE="/"
npm.cmd run build
npm.cmd run preview
# Open http://localhost:4173 in browser to test
```

#### Test Subpath Hosting (`/portfolio/` - GitHub Pages simulation):
```powershell
$env:VITE_BASE="/portfolio/"
npm.cmd run build
npm.cmd run preview
# Open http://localhost:4173/portfolio/ in browser to test
```

---

## B. GitHub Pages Setup

### Step 1: Create GitHub Repository
1. Log into your GitHub account at [github.com](https://github.com).
2. Click the **`+`** icon in the upper right corner $\to$ **New repository**.
3. Name your repository (e.g., `portfolio` or `luxury-portfolio`).
4. Set visibility to **Public** (required for free GitHub Pages).
5. Do **not** initialize with README, `.gitignore`, or license (we already have them).
6. Click **Create repository**.

### Step 2: Push the `release` Branch
In PowerShell:
```powershell
# Add GitHub remote (replace with your actual username and repository name)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# Push release branch and tags
git push -u origin release
git push origin --tags
```

### Step 3: Enable GitHub Pages with Actions
1. On your GitHub repository page, navigate to **Settings** (top tab bar).
2. In the left navigation menu, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment** $\to$ **Source**, select:
   👉 **`GitHub Actions`** (do *not* select "Deploy from a branch").
4. A card will indicate that `.github/workflows/deploy-pages.yml` is detected.

### Step 4: Verify Deployment & Live URL
1. Click the **Actions** tab in GitHub.
2. Observe the running workflow: `Deploy to GitHub Pages`.
3. When green, click the run. Under the **deploy** step, your live URL will be shown:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/`
4. Visit the live URL. Verify that:
   - 3D character frames load and track cursor.
   - Wandering Pikachu appears on Hero perches.
   - Pikachu scroll runner navigates the scroll path without 404s.
   - Resume button downloads `resume.pdf`.

### Re-running a Failed Deploy
If a deployment fails:
1. Go to **Actions** $\to$ select the failed workflow run.
2. In the top-right corner, click **Re-run all jobs**.

### Using a Custom Domain (Optional)
1. In repository **Settings** $\to$ **Pages** $\to$ **Custom domain**.
2. Enter your domain (e.g. `kishoresv.com`).
3. Add a `CNAME` record in your DNS provider pointing to `<YOUR_GITHUB_USERNAME>.github.io`.
4. In this case, `VITE_BASE` should be set to `/`.

---

## C. Render Static Site Setup

Render serves the production static site directly at root (`/`) with CDN edge caching and SSL.

### Step 1: Sign up / Log into Render
1. Open [render.com](https://render.com) and log in.

### Step 2: Create New Static Site
1. From the Render Dashboard, click **New +** (top right) $\to$ **Static Site**.
2. Connect your GitHub or GitLab repository:
   - Select the repository you pushed to.
3. Configure the static site settings:
   - **Name:** `kishore-portfolio` (or your preferred service name)
   - **Branch:** `release`
   - **Root Directory:** *(leave blank / default root)*
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
4. Under **Advanced**:
   - Add Environment Variable:
     - Key: `NODE_VERSION` $\to$ Value: `20`
     - Key: `VITE_BASE` $\to$ Value: `/`
   - **Auto-Deploy:** Set to **`No`** (disabled).
     *(We turn Auto-Deploy OFF because the GitLab CI pipeline acts as our quality gate and triggers deployment only after asset and build tests pass).*
5. Click **Create Static Site**.

### Step 3: Obtain the Deploy Hook
1. Once created, click into your Static Site dashboard on Render.
2. Go to **Settings** in the left sidebar.
3. Scroll down to the **Deploy Hook** section.
4. Click **Create Deploy Hook** (or copy the existing URL).
   The URL looks like:
   `https://api.render.com/deploy/srv-xxxxxxxxxxxxxxxxxxxx?key=yyyyyyyyyy`
5. Keep this URL secret! You will paste it into GitLab in the next section.

---

## D. GitLab CI Pipeline Setup

GitLab CI acts as your automated quality gate: on every push, it installs dependencies, validates assets with exact letter case, runs TypeScript type checks, guards against `.mp4` leaks, checks dist size, and triggers Render only if all checks pass.

### Step 1: Create GitLab Project
1. Log into [gitlab.com](https://gitlab.com).
2. Click **New project / repository** $\to$ **Create blank project**.
3. Project name: `portfolio` (or `luxury-portfolio`).
4. Set Visibility Level (Public or Private).
5. Uncheck "Initialize repository with a README".
6. Click **Create project**.

### Step 2: Add GitLab Remote & Push
In PowerShell:
```powershell
# Add GitLab remote
git remote add gitlab https://gitlab.com/<YOUR_GITLAB_USERNAME>/<YOUR_REPO_NAME>.git

# Push release branch and tags
git push -u gitlab release
git push gitlab --tags
```

> [!TIP]
> **Repository Mirroring Alternative:**
> Instead of manually pushing to both remotes, you can configure GitHub to automatically push to GitLab, or in GitLab: **Settings** $\to$ **Repository** $\to$ **Mirroring repositories** $\to$ mirror your GitHub repository.

### Step 3: Add `RENDER_DEPLOY_HOOK` Secret
1. In GitLab, navigate to **Settings** (left sidebar) $\to$ **CI/CD**.
2. Expand the **Variables** section.
3. Click **Add variable**:
   - **Type:** Variable
   - **Environments:** All (or `production`)
   - **Visibility:** Masked (hides from pipeline logs)
   - **Flags:** Protected (available only on protected branches like `release` or `main`)
   - **Key:** `RENDER_DEPLOY_HOOK`
   - **Value:** Paste your Render Deploy Hook URL from Section C.
4. Click **Add variable**.

### Step 4: Validate with GitLab CI Lint
1. In GitLab, go to **Build** (left sidebar) $\to$ **Pipeline editor**.
2. Click the **Lint** tab to verify `.gitlab-ci.yml` syntax.
3. Go to **Build** $\to$ **Pipelines** to view your running pipeline.
4. Observe the stages:
   - `validate`: Runs `npm ci`, `check:assets`, and `tsc --noEmit`.
   - `build`: Runs `npm run build` with `VITE_BASE=/`, checks for `.mp4` and $<30\text{MB}$ dist size.
   - `deploy`: Triggers Render webhook via `curl`.

---

## E. Release Routine & Rollback

### Publishing Future Updates
When making future changes to the portfolio:
```powershell
# 1. Ensure working directory is clean and tests pass
npm.cmd run check:assets
npm.cmd run build

# 2. Update code and commit to your working branch
git add -A
git commit -m "feat: description of update"

# 3. Merge or update release branch
git checkout release
git merge v1.6-deploy --ff-only

# 4. Push release to GitHub and GitLab
git push origin release
git push gitlab release
```

### Rollback Procedure
If a production issue occurs:
```powershell
# Option A: Fast rollback to an approved version tag (e.g. v1.5)
git checkout release
git reset --hard v1.5
# (Ensure backup zips are untracked)
git rm --cached -f *.zip
git commit -m "rollback: revert to v1.5"
git push origin release --force
git push gitlab release --force

# Option B: In Render Dashboard
# Render -> Deploys tab -> click on the previous successful deploy -> "Rollback to this deploy"
```

---

## F. Troubleshooting Diagnostics

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **Blank white page on GitHub Pages** | `VITE_BASE` was not set to `/<repo>/`, resulting in failed root `/assets/...` script loads. | Ensure `.github/workflows/deploy-pages.yml` computes `VITE_BASE=/${REPO_NAME}/`. Run `$env:VITE_BASE="/<repo>/"; npm.cmd run build` to verify locally. |
| **Character frames missing or showing red box** | Frame URLs are hard-coded to `/frames/` instead of using the `assetUrl` helper. | Ensure `src/components/CharacterCanvas.tsx` wraps all image paths with `assetUrl(...)`. Run `npm.cmd run check:assets`. |
| **404 Not Found on resume download** | Link `href` points to `/resume.pdf` without `assetUrl` prefix on GitHub Pages. | Check `HeroSection.tsx` and `ContactSection.tsx` to ensure `href={assetUrl('/resume.pdf')}` is used. |
| **Build fails on Linux CI but passes on Windows** | Letter case mismatch in file path (e.g. `center.Webp` vs `center.webp`). Windows NTFS is case-insensitive, while Linux is case-sensitive. | Run `npm.cmd run check:assets` locally. It explicitly inspects case sensitivity via Node directory listings. |
| **GitLab pipeline fails at deploy stage** | `RENDER_DEPLOY_HOOK` variable is missing, mistyped, or not accessible on this branch. | Verify variable name under GitLab **Settings** $\to$ **CI/CD** $\to$ **Variables**. If marked "Protected", ensure the branch is marked as protected in **Settings** $\to$ **Repository** $\to$ **Protected branches**. |
| **Render is not updating after git push** | Auto-Deploy is disabled on Render and GitLab CI deploy job was skipped or failed. | Check GitLab pipeline status. Verify `deploy` job output in GitLab for curl response. You can also manually click "Clear build cache & deploy" on Render. |
| **GitHub rejects push with error `GH001`** | Attempting to push historical branch containing zip files $>100\text{MB}$. | Push the `release` branch (`git push origin release`), which excludes all zip archives and historical blobs. |

---

## G. Configuration & Secrets Reference

| Property | Location | Expected Value | Purpose |
| :--- | :--- | :--- | :--- |
| **GitHub Pages Live URL** | Web Browser | `https://<github-user>.github.io/<repo>/` | Public portfolio website |
| **Render Live URL** | Web Browser | `https://<service-name>.onrender.com` | Production custom URL |
| **`VITE_BASE` (GitHub Pages)** | GitHub Actions Env | `/<repo>/` (or `/` for user sites) | Base routing path |
| **`VITE_BASE` (Render)** | Render Environment | `/` | Root asset routing |
| **`RENDER_DEPLOY_HOOK`** | GitLab CI/CD Variables | `https://api.render.com/deploy/srv-...?key=...` | Masked secret deploy trigger |
| **Target Branch** | GitHub / GitLab / Render | `release` | Clean branch without large archive history |
