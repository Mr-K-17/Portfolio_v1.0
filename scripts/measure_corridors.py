import json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge")
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(1000)

    res = page.evaluate('''() => {
        const sections = ['about', 'work', 'skills', 'certificates', 'contact'];
        const metrics = [];
        const parent = document.querySelector('main');
        const pRect = parent.getBoundingClientRect();
        sections.forEach(id => {
            const el = document.getElementById(id);
            const cards = el.querySelectorAll('.velvet-card, h2');
            let minT = Infinity, maxB = -Infinity;
            cards.forEach(c => {
                const r = c.getBoundingClientRect();
                const t = r.top - pRect.top;
                const b = r.bottom - pRect.top;
                if (t < minT) minT = t;
                if (b > maxB) maxB = b;
            });
            metrics.push({ id, contentTop: minT, contentBottom: maxB });
        });
        const corridors = [];
        for (let i = 0; i < metrics.length - 1; i++) {
            const cur = metrics[i];
            const next = metrics[i + 1];
            corridors.push({
                corridor: cur.id + ' -> ' + next.id,
                contentGap: Math.round(next.contentTop - cur.contentBottom)
            });
        }
        return corridors;
    }''')
    print("CORRIDORS:", json.dumps(res, indent=2))
    browser.close()
