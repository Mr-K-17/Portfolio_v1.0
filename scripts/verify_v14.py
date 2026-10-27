import time
from playwright.sync_api import sync_playwright

VIEWPORTS = [
    {"name": "Desktop 1440x900", "width": 1440, "height": 900},
    {"name": "Desktop 1280x720", "width": 1280, "height": 720},
    {"name": "Small Desktop 1024x768", "width": 1024, "height": 768},
    {"name": "Tablet 768x1024", "width": 768, "height": 1024},
    {"name": "Mobile 390x844", "width": 390, "height": 844},
]

def test_viewports():
    print("==================================================")
    print("RUNNING ACCEPTANCE TESTS ACROSS 5 VIEWPORTS")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)

        for vp in VIEWPORTS:
            context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            page = context.new_page()

            console_logs = []
            page.on("console", lambda msg: console_logs.append(msg.text))

            page.goto("http://localhost:5173/")
            page.wait_for_timeout(1000)

            # Scroll through page to trigger scroll listeners and validator
            doc_height = page.evaluate("document.documentElement.scrollHeight")
            for scroll_y in range(0, doc_height, 200):
                page.evaluate(f"window.scrollTo(0, {scroll_y})")
                page.wait_for_timeout(50)

            page.wait_for_timeout(500)

            # Filter validator logs
            v_logs = [log for log in console_logs if "[DEV-VALIDATOR]" in log]
            print(f"\n--- Viewport: {vp['name']} ({vp['width']}x{vp['height']}) ---")
            for vl in v_logs:
                print("  ", vl)

            context.close()

        browser.close()

if __name__ == "__main__":
    test_viewports()
