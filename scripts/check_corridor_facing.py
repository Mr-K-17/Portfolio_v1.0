import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge")
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:5173/")
    page.wait_for_selector("#about", timeout=10000)
    time.sleep(1)

    info = page.evaluate('''() => {
        const about = document.getElementById('about');
        const work = document.getElementById('work');
        const aRect = about.getBoundingClientRect();
        const wRect = work.getBoundingClientRect();
        const aBottom = window.scrollY + aRect.bottom;
        const wTop = window.scrollY + wRect.top;
        const corridorCenter = (aBottom + wTop) * 0.5;
        const targetY = corridorCenter - 450;
        window.scrollTo(0, targetY);
        return { targetY };
    }''')
    time.sleep(1)

    runner_info = page.evaluate('''() => {
        const runner = document.querySelector('main > div[aria-hidden="true"] > div');
        const sprite = runner ? runner.querySelector('div') : null;
        return {
            runnerTransform: runner ? runner.style.transform : null,
            spriteTransform: sprite ? sprite.style.transform : null,
        };
    }''')
    print("RUNNER INFO:", runner_info)
    browser.close()
