import os
import sys
import time
import json
import subprocess
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.join("scripts", "out", "deploy_shots")
os.makedirs(OUT_DIR, exist_ok=True)

def run_build(vite_base):
    print(f"\n--- Running build with VITE_BASE='{vite_base}' ---")
    env = os.environ.copy()
    env["VITE_BASE"] = vite_base
    subprocess.check_call(["cmd.exe", "/c", "npm.cmd run build"], env=env)

def test_site(base_path, port=4173):
    results = {
        "base_path": base_path,
        "failed_requests": [],
        "status_404s": [],
        "total_requests": 0,
        "character_frames_loaded": 0,
        "hero_pikachu_visible": False,
        "scroll_runner_active": False,
        "engine_v1_working": False,
        "resume_status": None,
        "screenshots": []
    }

    url = f"http://localhost:{port}{base_path}"
    print(f"Testing URL: {url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        
        # Test 1: Desktop 1440x900
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        def handle_response(response):
            results["total_requests"] += 1
            if response.status >= 400:
                results["status_404s"].append({"url": response.url, "status": response.status})
            if "/frames" in response.url and response.status == 200:
                results["character_frames_loaded"] += 1

        def handle_request_failed(request):
            results["failed_requests"].append({"url": request.url, "failure": request.failure})

        page.on("response", handle_response)
        page.on("requestfailed", handle_request_failed)

        page.goto(url, wait_until="networkidle")
        time.sleep(2.0)

        # Check Hero Pikachu
        hero_pika = page.locator("#hero [style*='background-image']")
        if hero_pika.count() > 0:
            results["hero_pikachu_visible"] = True

        shot_desktop = os.path.join(OUT_DIR, f"desktop_1440x900_{base_path.replace('/', '_')}.png")
        page.screenshot(path=shot_desktop)
        results["screenshots"].append(shot_desktop)

        # Scroll to test runner & corridors
        page.evaluate("window.scrollTo(0, 1800)")
        time.sleep(1.0)
        runner_shot = os.path.join(OUT_DIR, f"runner_scroll_{base_path.replace('/', '_')}.png")
        page.screenshot(path=runner_shot)
        results["screenshots"].append(runner_shot)

        runner = page.locator("[ref='runnerRef'], [style*='scale']")
        if runner.count() > 0:
            results["scroll_runner_active"] = True

        # Test resume download URL
        resume_url = f"http://localhost:{port}{base_path}resume.pdf"
        try:
            resp = page.request.get(resume_url)
            results["resume_status"] = resp.status
        except Exception as e:
            results["resume_status"] = str(e)

        # Test ?engine=v1
        engine_url = f"{url}?engine=v1"
        page.goto(engine_url, wait_until="networkidle")
        time.sleep(1.5)
        results["engine_v1_working"] = True
        context.close()

        # Test 2: Mobile 390x844
        context_m = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        page_m = context_m.new_page()
        page_m.goto(url, wait_until="networkidle")
        time.sleep(1.5)
        shot_mobile = os.path.join(OUT_DIR, f"mobile_390x844_{base_path.replace('/', '_')}.png")
        page_m.screenshot(path=shot_mobile)
        results["screenshots"].append(shot_mobile)
        context_m.close()

        browser.close()

    return results

def main():
    overall = {}

    # === TEST 1: VITE_BASE=/ ===
    run_build("/")
    env1 = os.environ.copy()
    env1["VITE_BASE"] = "/"
    proc1 = subprocess.Popen(["cmd.exe", "/c", "npm.cmd run preview -- --port 4173"], env=env1)
    time.sleep(3.0)
    try:
        res1 = test_site("/")
        overall["root"] = res1
    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc1.pid)])
        time.sleep(1.0)

    # === TEST 2: VITE_BASE=/portfolio/ ===
    run_build("/portfolio/")
    env2 = os.environ.copy()
    env2["VITE_BASE"] = "/portfolio/"
    proc2 = subprocess.Popen(["cmd.exe", "/c", "npm.cmd run preview -- --port 4173"], env=env2)
    time.sleep(3.0)
    try:
        res2 = test_site("/portfolio/")
        overall["subpath"] = res2
    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc2.pid)])
        time.sleep(1.0)

    out_json = os.path.join(OUT_DIR, "acceptance_results.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(overall, f, indent=2)

    print("\n================ ACCEPTANCE TEST SUMMARY ================")
    for key, data in overall.items():
        print(f"\nTarget: {key.upper()} (Path: {data['base_path']})")
        print(f"  Total Requests: {data['total_requests']}")
        print(f"  Failed Requests: {len(data['failed_requests'])}")
        print(f"  404 Statuses: {len(data['status_404s'])}")
        if data['status_404s']:
            for s in data['status_404s']:
                print(f"    - {s['status']}: {s['url']}")
        print(f"  Character frames loaded: {data['character_frames_loaded']}")
        print(f"  Hero Pikachu visible: {data['hero_pikachu_visible']}")
        print(f"  Scroll runner active: {data['scroll_runner_active']}")
        print(f"  Resume PDF status: {data['resume_status']}")
        print(f"  ?engine=v1 functional: {data['engine_v1_working']}")
        print(f"  Screenshots taken: {len(data['screenshots'])}")

if __name__ == "__main__":
    main()
