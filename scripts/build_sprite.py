#!/usr/bin/env python3
"""
scripts/build_sprite.py  (v3 - column-projection detection)
Reads sprite/sprite1.png, outputs public/sprite/pikachu/ strips + manifest.
Re-run any time sprite1.png changes.

Usage: python scripts/build_sprite.py
"""

import os
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from collections import deque

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
ROOT          = os.path.dirname(SCRIPT_DIR)
SRC_PATH      = os.path.join(ROOT, "sprite", "sprite1.png")
OUT_DIR       = os.path.join(ROOT, "public", "sprite", "pikachu")
CONTACT_PATH  = os.path.join(SCRIPT_DIR, "out", "pikachu_contact_sheet.png")
MANIFEST_PATH = os.path.join(OUT_DIR, "pikachu.json")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.join(SCRIPT_DIR, "out"), exist_ok=True)

# ─── 1. Load + remove background (flood-fill from borders only) ───────────────
src  = Image.open(SRC_PATH).convert("RGBA")
arr  = np.array(src)
H, W = arr.shape[:2]
print(f"Source: {SRC_PATH}  ({W}x{H})")

def flood_fill_bg(a):
    h, w = a.shape[:2]
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    def is_bg(y, x): return np.all(a[y, x, :3] == 255)
    seeds = ([(0,x) for x in range(w)] + [(h-1,x) for x in range(w)] +
             [(y,0) for y in range(h)] + [(y,w-1) for y in range(h)])
    for y, x in seeds:
        if is_bg(y, x) and not visited[y, x]:
            visited[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        a[y, x, 3] = 0
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = y+dy, x+dx
            if 0<=ny<h and 0<=nx<w and not visited[ny,nx] and is_bg(ny,nx):
                visited[ny,nx] = True; q.append((ny, nx))

arr_bg = arr.copy()
flood_fill_bg(arr_bg)
print("Background removed (flood-fill from borders; interior whites like eyes/cheeks preserved).")

# ─── 2. Row bands & frame boundaries (derived from pixel analysis) ─────────────
# Each entry: (y0, y1, name, x_limit, fps)
# x_limit cuts off the text labels on the right side of each row.
BANDS = [
    ( 11,  44, "idle",  170,  6),   # 4 frames: y=11-44, x in [9-45,47-87,90-128,130-169]
    ( 52,  94, "idle2", 360,  6),   # 8 frames (2 of 10 col-runs are narrow artifacts, filtered)
    (110, 142, "idle3", 280,  6),   # 6 frames
    (157, 212, "walk",  370, 10),   # 6 good frames (2 col-runs are artifacts at edges)
    (219, 286, "jump",  280, 12),   # 6 frames
    (288, 357, "b",     200,  6),   # 4 frames (crouch/bow)
]

# ─── 3. Column-projection frame detection ────────────────────────────────────
def has_yellow(patch_rgba, min_count=8):
    """True if patch has >= min_count Pikachu-yellow pixels (not text)."""
    r, g, b, a = patch_rgba[:,:,0], patch_rgba[:,:,1], patch_rgba[:,:,2], patch_rgba[:,:,3]
    return int(np.sum((r > 170) & (g > 120) & (b < 120) & (a > 0))) >= min_count

def detect_frames_colproj(arr_rgba, y0, y1, x_lim, min_run_w=20, min_area=60):
    """
    Detect frames by column projection: find runs of columns that have any
    opaque pixel, then verify each run contains yellow Pikachu pixels.
    No dilation - works at pixel-art precision.
    """
    band  = arr_rgba[y0:y1+1, :x_lim, :]
    col_has = np.any(band[:,:,3] > 0, axis=0)  # W bool

    runs = []
    in_run, x0 = False, 0
    for x, v in enumerate(col_has):
        if v and not in_run:  in_run = True;  x0 = x
        elif not v and in_run:
            in_run = False
            if x - x0 >= min_run_w:
                runs.append((x0, x-1))
    if in_run and x_lim - x0 >= min_run_w:
        runs.append((x0, x_lim-1))

    frames = []
    for (cx0, cx1) in runs:
        patch = band[:, cx0:cx1+1, :]
        if patch[:,:,3].sum() >= min_area and has_yellow(patch):
            frames.append((y0, y1, cx0, cx1))

    return frames

# ─── 4. Normalise (tight-crop -> uniform cell -> bottom-centre anchor) ─────────
def tight_crop(patch):
    a = patch[:,:,3]
    rs = np.where(np.any(a>0, axis=1))[0]
    cs = np.where(np.any(a>0, axis=0))[0]
    if not len(rs) or not len(cs): return None
    return patch[rs[0]:rs[-1]+1, cs[0]:cs[-1]+1]

def normalise(frame_bboxes, arr_rgba):
    crops = [tight_crop(arr_rgba[y0:y1+1, x0:x1+1, :].copy())
             for y0, y1, x0, x1 in frame_bboxes]
    crops = [c for c in crops if c is not None]
    if not crops: return []
    mh = max(c.shape[0] for c in crops)
    mw = max(c.shape[1] for c in crops)
    cells = []
    for c in crops:
        ch, cw = c.shape[:2]
        cell = np.zeros((mh, mw, 4), dtype=np.uint8)
        # Bottom-centre anchor (feet stay on baseline)
        cell[mh-ch:, (mw-cw)//2:(mw-cw)//2+cw] = c
        cells.append(Image.fromarray(cell, "RGBA"))
    return cells

# ─── 5. Process & save strips ─────────────────────────────────────────────────
def make_strip(imgs):
    if not imgs: return None
    w, h = imgs[0].size
    s = Image.new("RGBA", (w*len(imgs), h), (0,0,0,0))
    for i, im in enumerate(imgs): s.paste(im, (i*w, 0))
    return s

anim_data = {}
for y0, y1, name, xlim, fps in BANDS:
    bboxes = detect_frames_colproj(arr_bg, y0, y1, xlim)
    imgs   = normalise(bboxes, arr_bg)
    anim_data[name] = {"imgs": imgs, "fps": fps}
    print(f"  {name:7s}  {len(imgs)} frames  cell={imgs[0].size if imgs else 'n/a'}")

STRIP_MAP = {
    "idle":   (["idle"],  6),
    "idle2":  (["idle2"], 6),
    "idle3":  (["idle3"], 6),
    "walk":   (["walk"], 10),
    "jump":   (["jump"], 12),
    "crouch": (["b"],     6),
}

manifest = {}
for strip_name, (groups, fps) in STRIP_MAP.items():
    imgs = []
    for g in groups:
        imgs.extend(anim_data.get(g, {}).get("imgs", []))
    if not imgs:
        print(f"  WARNING: no frames for {strip_name}")
        continue
    fname = f"{strip_name}.png"
    make_strip(imgs).save(os.path.join(OUT_DIR, fname))
    manifest[strip_name] = {
        "file":         fname,
        "frames":       len(imgs),
        "cellW":        imgs[0].width,
        "cellH":        imgs[0].height,
        "fps":          fps,
        "nativeFacing": "right",
    }
    print(f"  Saved {fname}  ({imgs[0].width}x{imgs[0].height} x{len(imgs)})")

# The 'b' row (crouch) is kept as crouch.png - not used in the runner but
# available as a future crouching rest animation.
if "crouch" in manifest:
    manifest["crouch"]["note"] = (
        "Row 'b' from source sheet: 4 crouch/bow poses. "
        "Saved as crouch.png. Not used in the runner; available for future use."
    )

with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)
print(f"\nManifest -> {MANIFEST_PATH}")

# ─── 6. Contact sheet for visual verification ─────────────────────────────────
ORDER   = ["idle", "idle2", "idle3", "walk", "jump", "crouch"]
LABEL_H = 20; PAD = 8

max_w    = max(manifest[n]["cellW"]*manifest[n]["frames"] for n in ORDER if n in manifest) + PAD*2
total_h  = sum(manifest[n]["cellH"] + LABEL_H + PAD for n in ORDER if n in manifest) + PAD
contact  = Image.new("RGBA", (max_w, total_h), (30,30,30,255))
draw     = ImageDraw.Draw(contact)
try:    font = ImageFont.truetype("arial.ttf", 11)
except: font = ImageFont.load_default()

y_cur = PAD
for name in ORDER:
    if name not in manifest: continue
    m = manifest[name]
    draw.text((PAD, y_cur),
              f"{name}  ({m['frames']}f @ {m['fps']}fps  {m['cellW']}x{m['cellH']}px  facing={m['nativeFacing']})",
              fill=(255,220,50,255), font=font)
    y_cur += LABEL_H
    strip = Image.open(os.path.join(OUT_DIR, m["file"])).convert("RGBA")
    bg    = Image.new("RGBA", strip.size, (60,40,80,255))
    bg.paste(strip, (0,0), strip)
    contact.paste(bg, (PAD, y_cur))
    y_cur += m["cellH"] + PAD

contact.convert("RGB").save(CONTACT_PATH)
print(f"Contact sheet -> {CONTACT_PATH}")
print("=== Open scripts/out/pikachu_contact_sheet.png to verify ===")
