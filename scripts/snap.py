from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:5173/")
    # Wait for canvas to load and render
    time.sleep(2)
    page.screenshot(path="public/preview_hero.png")
    # Move mouse to trigger tracking
    page.mouse.move(1200, 200)
    time.sleep(0.5)
    page.screenshot(path="public/preview_tracked.png")
    # Scroll down to verify character in background
    page.evaluate("window.scrollTo(0, 800)")
    time.sleep(0.5)
    page.screenshot(path="public/preview_scrolled.png")
    browser.close()

print("Snapshots taken successfully!")
