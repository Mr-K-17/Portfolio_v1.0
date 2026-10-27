#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const indexHtmlPath = path.join(rootDir, 'index.html');

let errorCount = 0;

function reportError(msg) {
  console.error(`\x1b[31m[CHECK-ASSETS ERROR]\x1b[0m ${msg}`);
  errorCount++;
}

function reportPass(msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

// 1. Guard against any .mp4 files in public/ or dist/
function checkMp4Forbidden(dir, dirName) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp4')) {
      reportError(`.mp4 file forbidden in ${dirName}: ${path.join(entry.parentPath || dir, entry.name)}`);
    }
  }
}

checkMp4Forbidden(publicDir, 'public/');
if (fs.existsSync(distDir)) {
  checkMp4Forbidden(distDir, 'dist/');
}

// 2. Case-sensitive filesystem existence check
function checkCaseSensitiveExists(relativePath) {
  const segments = relativePath.split(/[/\\]+/).filter(Boolean);
  let current = publicDir;

  for (const seg of segments) {
    if (!fs.existsSync(current)) {
      reportError(`Directory not found: ${current}`);
      return false;
    }
    const entries = fs.readdirSync(current);
    if (!entries.includes(seg)) {
      // Check if it exists with different case
      const lower = seg.toLowerCase();
      const match = entries.find(e => e.toLowerCase() === lower);
      if (match) {
        reportError(`Case mismatch for "${relativePath}": requested "${seg}" but filesystem has "${match}"`);
      } else {
        reportError(`Asset not found in public/: "${relativePath}" (segment "${seg}" missing)`);
      }
      return false;
    }
    current = path.join(current, seg);
  }
  return true;
}

// Check literal required runtime assets in public/
const requiredAssets = [
  'center.webp',
  'resume.pdf',
  'favicon.svg',
  'sprite/pikachu/idle.png',
  'sprite/pikachu/idle2.png',
  'sprite/pikachu/idle3.png',
  'sprite/pikachu/walk.png',
  'sprite/pikachu/jump.png',
  'sprite/pikachu/crouch.png',
  'sprite/pikachu/pikachu.json',
  'sprite/lightning/lightning.png',
  'sprite/lightning/lightning.json',
];

// Check all 64 frames in each model sequence
for (let i = 0; i < 64; i++) {
  requiredAssets.push(`frames/${i}.webp`);
  requiredAssets.push(`frames_v1/${i}.webp`);
  requiredAssets.push(`frames_v2/${i}.webp`);
}

let assetsChecked = 0;
for (const asset of requiredAssets) {
  if (checkCaseSensitiveExists(asset)) {
    assetsChecked++;
  }
}
reportPass(`Verified exact letter case for ${assetsChecked} required runtime assets in public/`);

// 3. Scan src/ and index.html for un-prefixed root-absolute public URLs
function scanFileForUnprefixedUrls(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Regex looking for raw '/frames/', '/sprite/', '/center.webp', '/resume.pdf', '/favicon'
  // that are NOT wrapped in assetUrl(...) and NOT inside comments or markdown text
  const rawUrlPattern = /(['"`])\/(frames|frames_v1|frames_v2|sprite|center\.webp|resume\.pdf|favicon\.svg|vite\.svg)\b/g;

  lines.forEach((line, idx) => {
    // Skip comment lines and markdown text lines in ArchivesSection / docs
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }
    // In index.html, %BASE_URL% is valid
    if (filePath.endsWith('index.html') && line.includes('%BASE_URL%')) {
      return;
    }

    let match;
    while ((match = rawUrlPattern.exec(line)) !== null) {
      // Check if wrapped in assetUrl(...)
      const lineBefore = line.slice(0, match.index);
      if (!lineBefore.endsWith('assetUrl(')) {
        reportError(
          `Unprefixed root-absolute URL in ${path.relative(rootDir, filePath)}:${idx + 1} -> "${match[0]}". Wrap with assetUrl(...)`
        );
      }
    }
  });
}

function walkSrc(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkSrc(full);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(f)) {
      scanFileForUnprefixedUrls(full);
    }
  }
}

walkSrc(srcDir);
scanFileForUnprefixedUrls(indexHtmlPath);

// Final report
if (errorCount > 0) {
  console.error(`\x1b[31m[CHECK-ASSETS FAILED] Found ${errorCount} error(s).\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32m[CHECK-ASSETS SUCCESS] All asset URLs and letter cases are valid.\x1b[0m');
  process.exit(0);
}
