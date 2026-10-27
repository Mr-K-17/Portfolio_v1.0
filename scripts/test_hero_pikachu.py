import time
from playwright.sync_api import sync_playwright

def test_hero_behavior(width, height, duration_sec=30):
    print(f"\nTesting Hero Pikachu at {width}x{height} for {duration_sec}s...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(1000)

        # Get face zone bounds
        face_left = 0.32 * width
        face_right = 0.68 * width
        face_top = 0.15 * height
        face_bottom = 0.65 * height

        # Get Resume and Contact button positions
        buttons_rect = page.evaluate('''() => {
            const btns = document.querySelector('#hero a');
            if (!btns) return null;
            const r = btns.getBoundingClientRect();
            return { top: r.top, left: r.left, right: r.right };
        }''')

        actions_seen = set()
        perches_visited = set()
        face_zone_violations = 0
        button_violations = 0

        start_time = time.time()
        prev_x = None
        prev_y = None

        while time.time() - start_time < duration_sec:
            # Query Pikachu position and strip
            info = page.evaluate('''() => {
                const container = document.querySelector('#hero [aria-hidden="true"]');
                const sprite = container ? container.querySelector('div') : null;
                if (!container || !sprite) return null;

                const cRect = container.getBoundingClientRect();
                const transform = container.style.transform;
                const bgPos = sprite.style.backgroundPosition;
                const bgImg = sprite.style.backgroundImage;

                return {
                    left: cRect.left,
                    right: cRect.right,
                    top: cRect.top,
                    bottom: cRect.bottom,
                    x: (cRect.left + cRect.right) / 2,
                    y: cRect.bottom,
                    width: cRect.width,
                    height: cRect.height,
                    bgImg,
                    opacity: parseFloat(container.style.opacity || '0')
                };
            }''')

            if info and info['opacity'] > 0.5:
                # Classify action from image/geometry
                bg = info['bgImg']
                if 'idle.png' in bg:
                    actions_seen.add('SIT')
                elif 'idle2.png' in bg or 'idle3.png' in bg:
                    actions_seen.add('FIDGET')
                elif 'walk.png' in bg:
                    actions_seen.add('WALK')
                elif 'jump.png' in bg:
                    actions_seen.add('HOP')

                # Check face zone
                # Box overlaps face zone if:
                in_face_x = not (info['right'] < face_left or info['left'] > face_right)
                in_face_y = not (info['bottom'] < face_top or info['top'] > face_bottom)
                if in_face_x and in_face_y:
                    face_zone_violations += 1

                # Check buttons
                if buttons_rect and info['bottom'] > buttons_rect['top']:
                    button_violations += 1

                # Check perch based on y relative to hero
                if info['y'] < height * 0.75:
                    perches_visited.add('eyebrow_or_name')
                else:
                    perches_visited.add('lower_perch')

            page.wait_for_timeout(200)

        browser.close()

        print(f"  Actions seen: {actions_seen}")
        print(f"  Perches visited: {len(perches_visited)}")
        print(f"  Face zone violations: {face_zone_violations}")
        print(f"  Button violations: {button_violations}")

        assert len(actions_seen) >= 3, f"Expected multiple actions, got {actions_seen}"
        assert face_zone_violations == 0, f"Pikachu entered face zone {face_zone_violations} times"
        assert button_violations == 0, f"Pikachu touched buttons {button_violations} times"
        print("  => PASSED")

if __name__ == '__main__':
    test_hero_behavior(1440, 900, duration_sec=15)
    test_hero_behavior(390, 844, duration_sec=10)
