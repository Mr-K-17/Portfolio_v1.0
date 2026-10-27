import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge")
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:5173/")
    page.wait_for_selector("#hero", timeout=10000)
    time.sleep(2)
    res = page.evaluate('''() => {
        const hero = document.querySelector('#hero');
        const heroRect = hero.getBoundingClientRect();
        const eyebrow = hero.querySelector('[data-perch="eyebrow"]');
        const ebRect = eyebrow.getBoundingClientRect();
        const pika = hero.querySelector('[aria-hidden="true"]');
        const pikaRect = pika.getBoundingClientRect();
        return {
            eyebrow: { top: ebRect.top, bottom: ebRect.bottom, text: eyebrow.innerText },
            pika: { top: pikaRect.top, bottom: pikaRect.bottom, height: pikaRect.height, transform: pika.style.transform },
            overlapY: Math.max(0, pikaRect.bottom - ebRect.top)
        };
    }''')
    print("COORDS:", res)
    browser.close()
