import os
import time
import json
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join(os.path.dirname(__file__), "out", "v14_shots")
os.makedirs(OUT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "1440x900", "w": 1440, "h": 900},
    {"name": "1366x768", "w": 1366, "h": 768},
    {"name": "1920x1080", "w": 1920, "h": 1080},
    {"name": "390x844", "w": 390, "h": 844},
]

def run_evidence():
    findings = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)

        for vp in VIEWPORTS:
            w, h, name = vp["w"], vp["h"], vp["name"]
            print(f"\n==========================================")
            print(f"COLLECTING EVIDENCE FOR VIEWPORT: {name}")
            print(f"==========================================")

            context = browser.new_context(viewport={"width": w, "height": h})
            page = context.new_page()

            console_msgs = []
            failed_requests = []

            page.on("console", lambda m: console_msgs.append(f"[{m.type}] {m.text}"))
            page.on("response", lambda r: failed_requests.append(f"{r.status} {r.url}") if r.status >= 400 else None)

            page.goto("http://localhost:5173/")

            # Wait for loader overlay to finish
            try:
                page.wait_for_selector(".loader-overlay", state="detached", timeout=10000)
                print("Loader overlay finished/detached.")
            except Exception as e:
                print("Loader overlay wait note:", e)

            # Let page settle
            page.wait_for_timeout(500)

            # Hero timed shots: t=1s, 4s, 8s, 15s, 30s
            times = [1, 4, 8, 15, 30]
            start_t = time.time()

            hero_telemetry = []

            for target_t in times:
                elapsed = time.time() - start_t
                needed = target_t - elapsed
                if needed > 0:
                    page.wait_for_timeout(int(needed * 1000))

                shot_path = os.path.join(OUT_DIR, f"hero_{name}_{target_t}s.png")
                page.screenshot(path=shot_path, full_page=False)
                print(f"Saved: {shot_path}")

                # Query hero pikachu state
                state = page.evaluate('''() => {
                    const el = document.querySelector('#hero [aria-hidden="true"]');
                    const sprite = el ? el.querySelector('div') : null;
                    if (!el) return { exists: false };
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    const sStyle = sprite ? window.getComputedStyle(sprite) : null;
                    
                    let natW = 0;
                    if (sStyle && sStyle.backgroundImage) {
                        const urlMatch = sStyle.backgroundImage.match(/url\\(["']?([^"']*)["']?\\)/);
                        if (urlMatch) {
                            const img = new Image();
                            img.src = urlMatch[1];
                            natW = img.naturalWidth;
                        }
                    }

                    return {
                        exists: true,
                        opacity: style.opacity,
                        visibility: style.visibility,
                        display: style.display,
                        zIndex: style.zIndex,
                        rect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
                        transform: el.style.transform,
                        bgImage: sStyle ? sStyle.backgroundImage : 'none',
                        naturalWidth: natW
                    };
                }''')
                hero_telemetry.append({"time": target_t, "state": state})

            # Check corridors and sections at 1440x900 and 1366x768
            corridor_shots = []
            if name in ["1440x900", "1366x768"]:
                # Measure sections and corridors
                locs = page.evaluate('''() => {
                    const sections = ['about', 'work', 'skills', 'certificates', 'contact'];
                    const data = {};
                    sections.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) {
                            const r = el.getBoundingClientRect();
                            const top = window.scrollY + r.top;
                            const h = r.height;
                            data[id] = { top, bottom: top + h, mid: top + h * 0.5 };
                        }
                    });
                    return data;
                }''')

                # Scroll to middle of each section
                for sec_id in ['about', 'work', 'skills', 'certificates', 'contact']:
                    if sec_id in locs:
                        target_y = locs[sec_id]['mid'] - h * 0.5
                        page.evaluate(f"window.scrollTo(0, {max(0, target_y)})")
                        page.wait_for_timeout(500)
                        sec_shot = os.path.join(OUT_DIR, f"section_{name}_{sec_id}.png")
                        page.screenshot(path=sec_shot, full_page=False)
                        print(f"Saved: {sec_shot}")
                        corridor_shots.append(sec_shot)

                # Scroll to center of each of 4 corridors
                sec_pairs = [('about', 'work'), ('work', 'skills'), ('skills', 'certificates'), ('certificates', 'contact')]
                for s1, s2 in sec_pairs:
                    if s1 in locs and s2 in locs:
                        corridor_center = (locs[s1]['bottom'] + locs[s2]['top']) * 0.5
                        target_y = corridor_center - h * 0.5
                        page.evaluate(f"window.scrollTo(0, {max(0, target_y)})")
                        page.wait_for_timeout(500)
                        c_shot = os.path.join(OUT_DIR, f"corridor_{name}_{s1}_to_{s2}.png")
                        page.screenshot(path=c_shot, full_page=False)
                        print(f"Saved: {c_shot}")
                        corridor_shots.append(c_shot)

            findings.append({
                "viewport": name,
                "console_errors": [c for c in console_msgs if c.lower().startswith("[error]")],
                "console_warnings": [c for c in console_msgs if "[warn" in c.lower()],
                "failed_requests": failed_requests,
                "hero_telemetry": hero_telemetry
            })

            context.close()

        browser.close()

    # Save summary json
    with open(os.path.join(OUT_DIR, "telemetry.json"), "w") as f:
        json.dump(findings, f, indent=2)

    print("\nTelemetry saved to scripts/out/v14_shots/telemetry.json")

if __name__ == "__main__":
    run_evidence()
