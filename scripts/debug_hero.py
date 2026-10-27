from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:5173/')
    page.wait_for_timeout(1000)
    data = page.evaluate('''() => {
        const hero = document.getElementById('hero');
        const hR = hero.getBoundingClientRect();
        const eyebrow = document.querySelector('[data-perch="eyebrow"]');
        const name = document.querySelector('[data-perch="name"]');
        const bio = document.querySelector('[data-perch="bio"]');
        const pika = document.querySelector('#hero [aria-hidden="true"]');
        
        return {
            hero: { top: hR.top, bottom: hR.bottom, height: hR.height },
            eyebrow: { top: eyebrow.getBoundingClientRect().top - hR.top, bottom: eyebrow.getBoundingClientRect().bottom - hR.top },
            name: { top: name.getBoundingClientRect().top - hR.top, bottom: name.getBoundingClientRect().bottom - hR.top },
            bio: { top: bio.getBoundingClientRect().top - hR.top, bottom: bio.getBoundingClientRect().bottom - hR.top },
            pika: { top: pika.getBoundingClientRect().top - hR.top, bottom: pika.getBoundingClientRect().bottom - hR.top, transform: pika.style.transform }
        };
    }''')
    print(json.dumps(data, indent=2))
    browser.close()
