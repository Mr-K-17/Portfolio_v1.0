import os
import time
import json
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join("scripts", "out", "v15_shots")
os.makedirs(OUT_DIR, exist_ok=True)

VIEWPORTS = [
    {"name": "1440x900", "w": 1440, "h": 900},
    {"name": "1366x768", "w": 1366, "h": 768},
    {"name": "1280x720", "w": 1280, "h": 720},
    {"name": "1024x768", "w": 1024, "h": 768},
    {"name": "768x1024", "w": 768, "h": 1024},
    {"name": "390x844", "w": 390, "h": 844},
]

def run_tests():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")

        for vp in VIEWPORTS:
            name = vp["name"]
            w = vp["w"]
            h = vp["h"]
            print(f"\n==========================================")
            print(f"TESTING VIEWPORT: {name}")
            print(f"==========================================")

            context = browser.new_context(viewport={"width": w, "height": h})
            page = context.new_page()

            validator_logs = []
            console_errors = []
            page.on("console", lambda m: validator_logs.append(m.text) if "[DEV-VALIDATOR]" in m.text else (console_errors.append(m.text) if m.type == "error" else None))

            page.goto("http://localhost:5173/")
            try:
                page.wait_for_selector(".loader-overlay", state="detached", timeout=10000)
            except Exception:
                pass
            page.wait_for_timeout(1000)

            # Measure corridor heights
            corridor_metrics = page.evaluate('''() => {
                const sections = ['about', 'work', 'skills', 'certificates', 'contact'];
                const rects = {};
                sections.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        const r = el.getBoundingClientRect();
                        const top = window.scrollY + r.top;
                        rects[id] = { top, bottom: top + r.height };
                    }
                });
                const gaps = {};
                for (let i = 0; i < sections.length - 1; i++) {
                    const s1 = sections[i];
                    const s2 = sections[i+1];
                    if (rects[s1] && rects[s2]) {
                        gaps[`${s1}_to_${s2}`] = Math.round(rects[s2].top - rects[s1].bottom);
                    }
                }
                return gaps;
            }''')

            # Hero timed shots for 1440x900, 1366x768, 390x844
            hero_shots_data = {}
            if name in ["1440x900", "1366x768", "390x844"]:
                start_t = time.time()
                for target_s in [3, 10, 20]:
                    elapsed = time.time() - start_t
                    needed = target_s - elapsed
                    if needed > 0:
                        page.wait_for_timeout(int(needed * 1000))
                    
                    shot_path = os.path.join(OUT_DIR, f"hero_{name}_{target_s}s.png")
                    page.screenshot(path=shot_path, full_page=False)
                    print(f"Saved: {shot_path}")

                    pika_info = page.evaluate('''() => {
                        const el = document.querySelector('#hero [aria-hidden="true"]');
                        const sprite = el ? el.querySelector('div') : null;
                        if (!el || !sprite) return null;
                        const rect = el.getBoundingClientRect();
                        const style = window.getComputedStyle(el);
                        const sStyle = window.getComputedStyle(sprite);
                        const eb = document.querySelector('[data-perch="eyebrow"]');
                        const ebRect = eb ? eb.getBoundingClientRect() : null;
                        return {
                            rect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
                            transform: el.style.transform,
                            imageRendering: sStyle.imageRendering,
                            bgImage: sStyle.backgroundImage,
                            overlapWithEyebrowY: ebRect ? Math.max(0, rect.bottom - ebRect.top) : 0
                        };
                    }''')
                    hero_shots_data[f"{target_s}s"] = pika_info

            # Scroll runner shots at 1440x900: in a lane (e.g. Work heading) and in a corridor (About -> Work)
            runner_shots_data = {}
            if name == "1440x900":
                # Scroll to About section (in a lane)
                page.evaluate('''() => {
                    const about = document.getElementById('about');
                    const r = about.getBoundingClientRect();
                    window.scrollTo(0, window.scrollY + r.top + 100);
                }''')
                page.wait_for_timeout(600)
                lane_shot = os.path.join(OUT_DIR, "runner_1440x900_lane.png")
                page.screenshot(path=lane_shot, full_page=False)
                print(f"Saved: {lane_shot}")

                # Scroll to About -> Work corridor
                page.evaluate('''() => {
                    const about = document.getElementById('about');
                    const work = document.getElementById('work');
                    const aRect = about.getBoundingClientRect();
                    const wRect = work.getBoundingClientRect();
                    const corridorCenter = ((window.scrollY + aRect.bottom) + (window.scrollY + wRect.top)) * 0.5;
                    window.scrollTo(0, corridorCenter - 450);
                }''')
                page.wait_for_timeout(600)
                corridor_shot = os.path.join(OUT_DIR, "runner_1440x900_corridor.png")
                page.screenshot(path=corridor_shot, full_page=False)
                print(f"Saved: {corridor_shot}")

                runner_info = page.evaluate('''() => {
                    const runner = document.querySelector('main > div[aria-hidden="true"] > div');
                    const sprite = runner ? runner.querySelector('div:last-child') : null;
                    if (!runner || !sprite) return null;
                    const r = runner.getBoundingClientRect();
                    const s = window.getComputedStyle(sprite);
                    return {
                        rect: { width: Math.round(r.width), height: Math.round(r.height) },
                        transform: runner.style.transform,
                        imageRendering: s.imageRendering
                    };
                }''')
                runner_shots_data["corridor"] = runner_info

            results[name] = {
                "validator_logs": validator_logs,
                "console_errors": console_errors,
                "corridor_metrics": corridor_metrics,
                "hero_shots_data": hero_shots_data,
                "runner_shots_data": runner_shots_data
            }
            context.close()

        browser.close()

    with open(os.path.join(OUT_DIR, "results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\nAll verification tests completed. Summary saved to scripts/out/v15_shots/results.json")

if __name__ == "__main__":
    run_tests()
