import os
import json
import cv2
import numpy as np

def build_lightning():
    src_path = 'sprite/sprite2.png'
    if not os.path.exists(src_path):
        raise FileNotFoundError(f"Missing {src_path}")

    img = cv2.imread(src_path)
    if img is None:
        raise ValueError(f"Could not read {src_path}")

    print(f"Loaded {src_path}: {img.shape}")

    # Alpha derivation & un-premultiplying
    B = img[:, :, 0].astype(np.float32)
    G = img[:, :, 1].astype(np.float32)
    R = img[:, :, 2].astype(np.float32)
    alpha = np.maximum(np.maximum(R, G), B)

    # Where alpha > 0, un-premultiply color so glow has no black fringe
    alpha_mask = alpha > 0
    scale = np.zeros_like(alpha)
    scale[alpha_mask] = 255.0 / alpha[alpha_mask]

    R_un = np.clip(R * scale, 0, 255).astype(np.uint8)
    G_un = np.clip(G * scale, 0, 255).astype(np.uint8)
    B_un = np.clip(B * scale, 0, 255).astype(np.uint8)
    A_out = alpha.astype(np.uint8)

    rgba = np.stack([B_un, G_un, R_un, A_out], axis=2)

    # Detect row bands by horizontal projection
    v = np.max(img, axis=2)
    
    dropped_groups = []

    # Helper to find column spans in a row band
    def extract_spans(y0, y1, min_lit=40):
        sub = v[y0:y1, :]
        col_proj = (sub > 15).sum(axis=0) > 0
        # Dilation by 5px
        dilated = np.convolve(col_proj.astype(int), np.ones(5, dtype=int), mode='same') > 0
        
        spans = []
        in_s = False
        s0 = 0
        for x, val in enumerate(dilated):
            if val and not in_s:
                in_s = True
                s0 = x
            elif not val and in_s:
                in_s = False
                spans.append((s0, x))
        if in_s:
            spans.append((s0, len(dilated)))
            
        frames = []
        for s_idx, (x0, x1) in enumerate(spans):
            crop = sub[:, x0:x1]
            ys, xs = np.where(crop > 15)
            if len(ys) == 0:
                continue
            lit = len(ys)
            if lit < min_lit:
                dropped_groups.append({
                    'y_range': [y0, y1],
                    'x_range': [int(x0 + xs.min()), int(x0 + xs.max())],
                    'lit_pixels': int(lit),
                    'reason': 'fewer than 40 lit pixels'
                })
                continue
            frames.append({
                'x0': int(x0 + xs.min()),
                'x1': int(x0 + xs.max() + 1),
                'y0': int(y0 + ys.min()),
                'y1': int(y0 + ys.max() + 1),
                'lit': int(lit)
            })
        return frames

    # Extract row 1 frames
    r1 = extract_spans(0, 120, min_lit=40)
    print(f"Row 1: {len(r1)} frames extracted")

    # In Row 2, split frame 5 at zero gap
    r2_raw = extract_spans(130, 270, min_lit=40)
    r2 = []
    for f in r2_raw:
        crop = v[f['y0']:f['y1'], f['x0']:f['x1']]
        col_c = (crop > 15).sum(axis=0)
        zero_runs = []
        cur_run = 0
        cur_start = 0
        for idx, c in enumerate(col_c):
            if c == 0:
                if cur_run == 0:
                    cur_start = idx
                cur_run += 1
            else:
                if cur_run >= 4:
                    zero_runs.append((cur_start, cur_start + cur_run))
                cur_run = 0
        if cur_run >= 4:
            zero_runs.append((cur_start, cur_start + cur_run))

        if len(zero_runs) > 0 and (f['x1'] - f['x0']) > 90:
            gap_s, gap_e = zero_runs[0]
            p1_x0, p1_x1 = f['x0'], f['x0'] + gap_s
            ys1, xs1 = np.where(v[f['y0']:f['y1'], p1_x0:p1_x1] > 15)
            r2.append({
                'x0': int(p1_x0 + xs1.min()),
                'x1': int(p1_x0 + xs1.max() + 1),
                'y0': int(f['y0'] + ys1.min()),
                'y1': int(f['y0'] + ys1.max() + 1),
                'lit': len(ys1)
            })
            p2_x0, p2_x1 = f['x0'] + gap_e, f['x1']
            ys2, xs2 = np.where(v[f['y0']:f['y1'], p2_x0:p2_x1] > 15)
            r2.append({
                'x0': int(p2_x0 + xs2.min()),
                'x1': int(p2_x0 + xs2.max() + 1),
                'y0': int(f['y0'] + ys2.min()),
                'y1': int(f['y0'] + ys2.max() + 1),
                'lit': len(ys2)
            })
        else:
            r2.append(f)

    print(f"Row 2: {len(r2)} frames extracted")

    # Inspect debris in Row 3 (y > 270)
    sub3 = v[270:, :]
    ys3, xs3 = np.where(sub3 > 15)
    if len(ys3) > 0:
        dropped_groups.append({
            'y_range': [270, 400],
            'x_range': [int(xs3.min()), int(xs3.max())],
            'lit_pixels': int(len(ys3)),
            'reason': 'row 3 debris specks (< 40 lit pixels per component)'
        })

    print(f"Dropped groups ({len(dropped_groups)}):")
    for d in dropped_groups:
        print(f"  {d}")

    # Row 1 Frame 0 is ground flare
    flare_bbox = r1[0]
    flare_crop = rgba[flare_bbox['y0']:flare_bbox['y1'], flare_bbox['x0']:flare_bbox['x1']]

    # Bolts: Row 1 Frames 1..8 (8 intact), Row 2 Frames 0..8 (9 fading)
    r1_bolts = r1[1:]
    r2_bolts = r2

    all_bolts_bboxes = r1_bolts + r2_bolts
    print(f"Total bolt frames: {len(all_bolts_bboxes)} (8 intact in Row 1, 9 in Row 2)")

    # Rotate all bolt frames 90 degrees CLOCKWISE (np.rot90 with k=3)
    # Original top (origin with starburst) -> RIGHT edge
    # Original bottom (tail) -> LEFT edge
    rotated_bolt_crops = []
    for b in all_bolts_bboxes:
        crop = rgba[b['y0']:b['y1'], b['x0']:b['x1']]
        rot = np.rot90(crop, k=3) # 90 deg clockwise
        rotated_bolt_crops.append(rot)

    # Find uniform cell size for bolts
    max_w = max(c.shape[1] for c in rotated_bolt_crops)
    max_h = max(c.shape[0] for c in rotated_bolt_crops)

    cellW = max_w + 4
    cellH = max_h + 4
    if cellW % 2 != 0: cellW += 1
    if cellH % 2 != 0: cellH += 1

    print(f"Bolt normalized cell size: {cellW} x {cellH} px")

    # Build bolt frames: origin end on RIGHT edge (x = cellW - w), vertical center (y = (cellH - h) // 2)
    normalized_bolts = []
    for rot in rotated_bolt_crops:
        h, w = rot.shape[:2]
        canvas = np.zeros((cellH, cellW, 4), dtype=np.uint8)
        x_off = cellW - w # Origin end on the RIGHT edge
        y_off = (cellH - h) // 2 # Center vertically
        canvas[y_off:y_off+h, x_off:x_off+w] = rot
        normalized_bolts.append(canvas)

    # Also normalize flare into same cell size (anchored at center-bottom)
    flare_canvas = np.zeros((cellH, cellW, 4), dtype=np.uint8)
    fh, fw = flare_crop.shape[:2]
    fx_off = max(0, (cellW - fw) // 2)
    fy_off = max(0, cellH - fh)
    flare_canvas[fy_off:fy_off+min(fh, cellH), fx_off:fx_off+min(fw, cellW)] = flare_crop[:min(fh, cellH), :min(fw, cellW)]

    # Final frame list:
    # Frames 0..7 (8 frames): intact bolt loop (Row 1 frames 1..8)
    # Frames 8..16 (9 frames): dissipating / fading frames (Row 2 frames 0..8)
    # Frame 17 (1 frame): ground flare
    final_frames = normalized_bolts + [flare_canvas]
    total_frames = len(final_frames)
    strip_w = total_frames * cellW
    strip_h = cellH

    strip = np.zeros((strip_h, strip_w, 4), dtype=np.uint8)
    for i, f in enumerate(final_frames):
        strip[:, i*cellW:(i+1)*cellW] = f

    # Export paths
    out_dir = 'public/sprite/lightning'
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs('scripts/out', exist_ok=True)

    png_path = os.path.join(out_dir, 'lightning.png')
    cv2.imwrite(png_path, strip)
    print(f"Saved {png_path} ({strip_w}x{strip_h})")

    # Manifest
    manifest = {
        'file': 'lightning.png',
        'frames': total_frames,
        'cellW': cellW,
        'cellH': cellH,
        'fps': 20,
        'originFacing': 'right',
        'ranges': {
            'loop': [0, 7],      # 8 intact bolt frames
            'fade': [8, 16],     # 9 dissipating frames
            'flare': 17          # 1 ground flare frame
        },
        'metadata': {
            'loop_count': 8,
            'fade_count': 9,
            'flare_count': 1,
            'dropped_groups': dropped_groups,
            'rotation': '90 deg clockwise (np.rot90 k=3)'
        }
    }

    json_path = os.path.join(out_dir, 'lightning.json')
    with open(json_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved {json_path}")

    # Generate Contact Sheet on #a9282d background
    bg_bgr = np.array([45, 40, 169], dtype=np.float32)

    cols_per_row = 6
    rows = (total_frames + cols_per_row - 1) // cols_per_row
    sheet_cell_w = cellW + 20
    sheet_cell_h = cellH + 30
    sheet = np.full((rows * sheet_cell_h, cols_per_row * sheet_cell_w, 3), bg_bgr, dtype=np.uint8)

    for i, frame in enumerate(final_frames):
        row = i // cols_per_row
        col = i % cols_per_row
        x = col * sheet_cell_w + 10
        y = row * sheet_cell_h + 20

        f_bgr = frame[:, :, :3].astype(np.float32)
        f_a = (frame[:, :, 3].astype(np.float32) / 255.0)[:, :, None]
        comp = f_bgr * f_a + bg_bgr * (1.0 - f_a)
        sheet[y:y+cellH, x:x+cellW] = np.clip(comp, 0, 255).astype(np.uint8)

        cv2.rectangle(sheet, (x, y), (x+cellW, y+cellH), (100, 100, 220), 1)

        if i <= 7:
            lbl = f"L{i}"
        elif i <= 16:
            lbl = f"F{i-8}"
        else:
            lbl = "FLARE"
        cv2.putText(sheet, lbl, (x + 2, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    contact_path = 'scripts/out/lightning_contact_sheet.png'
    cv2.imwrite(contact_path, sheet)
    print(f"Saved {contact_path}")

if __name__ == '__main__':
    build_lightning()
