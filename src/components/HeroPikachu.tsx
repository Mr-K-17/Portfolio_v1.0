import React, { useEffect, useRef } from 'react';
import { HERO_SCALE, PIKACHU_METRICS } from '../lib/spriteScale';
import { assetUrl } from '../lib/assetUrl';

interface PerchRect {
  id: 'eyebrow' | 'name' | 'bio';
  left: number;
  right: number;
  y: number; // Feet baseline Y relative to hero
  minX: number;
  maxX: number;
  isValid: boolean;
}

interface SpriteDef {
  file: string;
  frames: number;
  cellW: number;
  cellH: number;
  fps: number;
}

const PIKACHU_CONFIG: Record<'idle' | 'idle2' | 'idle3' | 'walk' | 'jump', SpriteDef> = {
  idle: { file: 'idle.png', frames: 4, cellW: 41, cellH: 34, fps: 6 },
  idle2: { file: 'idle2.png', frames: 10, cellW: 43, cellH: 43, fps: 6 },
  idle3: { file: 'idle3.png', frames: 6, cellW: 44, cellH: 33, fps: 6 },
  walk: { file: 'walk.png', frames: 7, cellW: 48, cellH: 55, fps: 10 },
  jump: { file: 'jump.png', frames: 6, cellW: 41, cellH: 60, fps: 12 },
};

export const HeroPikachu: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const sprite = spriteRef.current;
    if (!container || !sprite) return;

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let heroEl: HTMLElement | null = container.closest('#hero');
    if (!heroEl) heroEl = container.parentElement;

    let rafId: number | null = null;
    let isVisible = true;
    let isLoaded = false;
    let fadeInStart = 0;
    const FADE_IN_DURATION = 300; // ms

    // Preload sprites
    let loadedCount = 0;
    const spriteKeys: (keyof typeof PIKACHU_CONFIG)[] = ['idle', 'idle2', 'idle3', 'walk', 'jump'];

    const triggerStart = () => {
      if (!isLoaded) {
        isLoaded = true;
        fadeInStart = performance.now();
        measurePerches();
        initPosition();
        if (import.meta.env.DEV) {
          console.log(
            `[HERO-PIKACHU] Spawned on perch: ${currentPerchId}, scale: ${scale}, pos: (${posX.toFixed(1)}, ${posY.toFixed(1)})`
          );
        }
      }
    };

    spriteKeys.forEach((key) => {
      const img = new Image();
      img.src = assetUrl(`/sprite/pikachu/${PIKACHU_CONFIG[key].file}`);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === spriteKeys.length) triggerStart();
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === spriteKeys.length) triggerStart();
      };
    });

    const fallbackTimer = setTimeout(triggerStart, 1200);

    // Cursor tracking for SIT idle facing
    let cursorX = window.innerWidth / 2;
    const onPointerMove = (e: PointerEvent) => {
      cursorX = e.clientX;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Perch measurement
    let perches: Record<'eyebrow' | 'name' | 'bio', PerchRect> = {
      eyebrow: { id: 'eyebrow', left: 0, right: 0, y: 0, minX: 0, maxX: 0, isValid: false },
      name: { id: 'name', left: 0, right: 0, y: 0, minX: 0, maxX: 0, isValid: false },
      bio: { id: 'bio', left: 0, right: 0, y: 0, minX: 0, maxX: 0, isValid: false },
    };

    const scale = HERO_SCALE;

    // State machine variables
    type ActionType = 'SIT' | 'FIDGET' | 'WALK' | 'HOP';
    let currentPerchId: 'eyebrow' | 'name' | 'bio' = 'eyebrow';
    let currentAction: ActionType = 'SIT';
    let actionTime = 0;
    let actionDuration = 3.0; // seconds for current action
    let actionHistory: ActionType[] = ['SIT'];
    let perchDwellTime = 0;

    let posX = 100;
    let posY = 100;
    let facing = 1; // 1 = right, -1 = left

    const measurePerches = () => {
      if (!heroEl) return;
      const heroRect = heroEl.getBoundingClientRect();
      const vw = window.innerWidth;

      const halfW = (PIKACHU_METRICS.maxCellW * scale) / 2;
      // Face zone: x in [0.32vw, 0.68vw], y in [0.15vh, 0.65vh]
      // To strictly avoid entering face zone, his right edge must not exceed 0.32vw
      const maxAllowedX = 0.32 * vw - halfW - 8;

      const measureEl = (
        selector: string,
        id: 'eyebrow' | 'name' | 'bio',
        yOffset: number
      ): PerchRect => {
        const el = heroEl?.querySelector(selector);
        if (!el) return { id, left: 0, right: 0, y: 0, minX: 0, maxX: 0, isValid: false };
        const rect = el.getBoundingClientRect();
        const left = rect.left - heroRect.left;
        const right = rect.right - heroRect.left;
        const y = rect.top - heroRect.top + yOffset;

        const minX = left + halfW + 4;
        const maxX = Math.min(right - halfW - 4, maxAllowedX);
        const isValid = maxX > minX + 16;

        return { id, left, right, y, minX, maxX, isValid };
      };

      // Measure: Eyebrow text top, Name text top, Bio first-line top
      // Feet baseline sits gently on top edge of text (-2px offset so 0 text is obscured)
      perches.eyebrow = measureEl('[data-perch="eyebrow"]', 'eyebrow', -2 * scale);
      perches.name = measureEl('[data-perch="name"]', 'name', -2 * scale);
      perches.bio = measureEl('[data-perch="bio"]', 'bio', -2 * scale);

      // Keep position anchored if sitting
      if (currentAction === 'SIT' && perches[currentPerchId].isValid) {
        posY = perches[currentPerchId].y;
        posX = Math.max(perches[currentPerchId].minX, Math.min(perches[currentPerchId].maxX, posX));
      }
    };

    measurePerches();
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        measurePerches();
        if (currentAction === 'SIT') {
          initPosition();
        }
      });
    }
    window.addEventListener('resize', measurePerches, { passive: true });

    // Walk state
    let walkStartX = 100;
    let walkTargetX = 100;

    // Hop state
    let hopPhase: 'anticipate' | 'arc' | 'land' = 'anticipate';
    let hopPhaseTime = 0;
    let hopStartX = 100;
    let hopStartY = 100;
    let hopTargetX = 100;
    let hopTargetY = 100;
    let hopApex = 30;
    let hopTargetPerchId: 'eyebrow' | 'name' | 'bio' = 'eyebrow';
    const HOP_ANTICIPATE_DUR = 0.15; // 150ms
    const HOP_ARC_DUR = 0.55; // 550ms
    const HOP_LAND_DUR = 0.15; // 150ms

    // Frame animation
    let activeStrip: keyof typeof PIKACHU_CONFIG = 'idle';
    let frameIndex = 0;
    let frameTime = 0;
    let fidgetLoopsRemaining = 1;

    // Initialize position on eyebrow
    const initPosition = () => {
      measurePerches();
      const p = perches.eyebrow;
      if (p.isValid) {
        posX = (p.minX + p.maxX) / 2;
        posY = p.y;
      } else {
        posX = 50;
        posY = 100;
      }
    };
    initPosition();

    // Dwell caps
    const DWELL_CAPS: Record<'eyebrow' | 'name' | 'bio', number> = {
      eyebrow: 6.0,
      name: 3.0,
      bio: 2.0,
    };

    // Helper to pick next action with memory
    const pickNextAction = () => {
      perchDwellTime += actionDuration;
      const mustHop =
        currentPerchId !== 'eyebrow' && perchDwellTime >= DWELL_CAPS[currentPerchId];

      if (mustHop) {
        currentAction = 'HOP';
      } else {
        // Probabilities: SIT 35%, FIDGET 15%, WALK 30%, HOP 20%
        let weights: { action: ActionType; weight: number }[] = [
          { action: 'SIT', weight: 35 },
          { action: 'FIDGET', weight: 15 },
          { action: 'WALK', weight: 30 },
          { action: 'HOP', weight: 20 },
        ];

        // Never hop twice in a row
        const lastAction = actionHistory[actionHistory.length - 1];
        if (lastAction === 'HOP') {
          weights = weights.filter((w) => w.action !== 'HOP');
        }

        // Never repeat same action > 2 times
        if (
          actionHistory.length >= 2 &&
          actionHistory[actionHistory.length - 1] === actionHistory[actionHistory.length - 2]
        ) {
          weights = weights.filter((w) => w.action !== actionHistory[actionHistory.length - 1]);
        }

        // If no adjacent perch is valid, cannot hop
        const canHop =
          (currentPerchId === 'eyebrow' && (perches.name.isValid || perches.bio.isValid)) ||
          (currentPerchId === 'name' && (perches.eyebrow.isValid || perches.bio.isValid)) ||
          (currentPerchId === 'bio' && (perches.name.isValid || perches.eyebrow.isValid));

        if (!canHop) {
          weights = weights.filter((w) => w.action !== 'HOP');
        }

        // Roll
        const totalW = weights.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalW;
        let chosen: ActionType = 'SIT';
        for (const w of weights) {
          if (roll <= w.weight) {
            chosen = w.action;
            break;
          }
          roll -= w.weight;
        }
        currentAction = chosen;
      }

      actionHistory.push(currentAction);
      if (actionHistory.length > 5) actionHistory.shift();
      actionTime = 0;

      // Setup action
      const curPerch = perches[currentPerchId];
      if (currentAction === 'SIT') {
        activeStrip = 'idle';
        frameIndex = 0;
        frameTime = 0;
        const maxDwell = Math.max(1.5, DWELL_CAPS[currentPerchId] - perchDwellTime);
        actionDuration = Math.min(2.0 + Math.random() * 4.0, maxDwell);
      } else if (currentAction === 'FIDGET') {
        activeStrip = Math.random() < 0.5 ? 'idle2' : 'idle3';
        frameIndex = 0;
        frameTime = 0;
        fidgetLoopsRemaining = Math.random() < 0.5 ? 1 : 2;
        const stripDef = PIKACHU_CONFIG[activeStrip];
        actionDuration = (stripDef.frames / stripDef.fps) * fidgetLoopsRemaining;
      } else if (currentAction === 'WALK') {
        activeStrip = 'walk';
        frameIndex = 0;
        frameTime = 0;
        walkStartX = posX;
        // Random target inside valid interval
        const minX = curPerch.isValid ? curPerch.minX : posX - 20;
        const maxX = curPerch.isValid ? curPerch.maxX : posX + 20;
        walkTargetX = minX + Math.random() * (maxX - minX);
        const dist = Math.abs(walkTargetX - walkStartX);
        const speed = 55 * scale; // 40-70 px/s at 1x
        actionDuration = Math.max(0.4, dist / speed);
        facing = walkTargetX >= walkStartX ? 1 : -1;
      } else if (currentAction === 'HOP') {
        hopPhase = 'anticipate';
        hopPhaseTime = 0;
        hopStartX = posX;
        hopStartY = posY;

        // Choose destination perch
        if (currentPerchId === 'bio') {
          hopTargetPerchId = perches.name.isValid ? 'name' : 'eyebrow';
        } else if (currentPerchId === 'name') {
          // Bias strongly toward eyebrow
          if (perches.eyebrow.isValid && (!perches.bio.isValid || Math.random() < 0.75)) {
            hopTargetPerchId = 'eyebrow';
          } else {
            hopTargetPerchId = 'bio';
          }
        } else {
          // Eyebrow -> name
          hopTargetPerchId = perches.name.isValid ? 'name' : 'bio';
        }

        const destPerch = perches[hopTargetPerchId];
        hopTargetX = destPerch.isValid
          ? destPerch.minX + Math.random() * (destPerch.maxX - destPerch.minX)
          : hopStartX;
        hopTargetY = destPerch.isValid ? destPerch.y : hopStartY;

        const dy = hopTargetY - hopStartY;
        hopApex = Math.max(24 * scale, 0.35 * Math.abs(dy) + 24 * scale);
        facing = hopTargetX >= hopStartX ? 1 : -1;
        actionDuration = HOP_ANTICIPATE_DUR + HOP_ARC_DUR + HOP_LAND_DUR;
      }

      if (import.meta.env.DEV) {
        console.log(
          `[HERO-PIKACHU] Action: ${currentAction}, Perch: ${currentPerchId}, Duration: ${actionDuration.toFixed(2)}s`
        );
      }
    };

    // IntersectionObserver to pause when hero is offscreen
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (heroEl) io.observe(heroEl);

    const onVisibilityChange = () => {
      if (document.hidden) isVisible = false;
      else if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Reduced motion handling
    if (isReducedMotion) {
      initPosition();
      container.style.opacity = '1';
      container.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -100%) scale(${scale}, ${scale})`;
      const anim = PIKACHU_CONFIG.idle;
      sprite.style.width = `${anim.cellW}px`;
      sprite.style.height = `${anim.cellH}px`;
      sprite.style.backgroundImage = `url("${assetUrl(`/sprite/pikachu/${anim.file}`)}")`;
      sprite.style.backgroundPosition = '0px 0px';
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', measurePerches);
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }

    // Main rAF animation loop
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isVisible || !isLoaded) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      // Handle 300ms fade-in
      const timeSinceLoaded = now - fadeInStart;
      const opacity = Math.min(1, Math.max(0, timeSinceLoaded / FADE_IN_DURATION));
      container.style.opacity = opacity.toFixed(3);

      actionTime += dt;

      // Update active state
      if (currentAction === 'SIT') {
        activeStrip = 'idle';
        // Face cursor with 24px hysteresis
        // Transform hero coordinate to viewport clientX
        if (heroEl) {
          const heroLeft = heroEl.getBoundingClientRect().left;
          const currentClientX = heroLeft + posX;
          if (cursorX > currentClientX + 24) facing = 1;
          else if (cursorX < currentClientX - 24) facing = -1;
        }

        if (actionTime >= actionDuration) {
          pickNextAction();
        }
      } else if (currentAction === 'FIDGET') {
        const stripDef = PIKACHU_CONFIG[activeStrip];
        frameTime += dt;
        const fDur = 1 / stripDef.fps;
        while (frameTime >= fDur) {
          frameTime -= fDur;
          frameIndex++;
          if (frameIndex >= stripDef.frames) {
            frameIndex = 0;
            fidgetLoopsRemaining--;
            if (fidgetLoopsRemaining <= 0) {
              pickNextAction();
              break;
            }
          }
        }
      } else if (currentAction === 'WALK') {
        activeStrip = 'walk';
        const t = Math.min(1, actionTime / actionDuration);
        posX = walkStartX + t * (walkTargetX - walkStartX);
        const curPerch = perches[currentPerchId];
        if (curPerch.isValid) posY = curPerch.y;

        if (actionTime >= actionDuration) {
          posX = walkTargetX;
          pickNextAction();
        }
      } else if (currentAction === 'HOP') {
        activeStrip = 'jump';
        hopPhaseTime += dt;

        if (hopPhase === 'anticipate') {
          // Crouch / anticipation: jump frame 0
          frameIndex = 0;
          posX = hopStartX;
          posY = hopStartY;
          if (hopPhaseTime >= HOP_ANTICIPATE_DUR) {
            hopPhase = 'arc';
            hopPhaseTime = 0;
          }
        } else if (hopPhase === 'arc') {
          const t = Math.min(1, hopPhaseTime / HOP_ARC_DUR);
          posX = hopStartX + t * (hopTargetX - hopStartX);
          const linearY = hopStartY + t * (hopTargetY - hopStartY);
          const parabola = 4 * hopApex * t * (1 - t);
          posY = linearY - parabola;

          // Velocity in Y to determine rising vs falling frame
          const dLinearY = hopTargetY - hopStartY;
          const dParabola = 4 * hopApex * (1 - 2 * t);
          const vY = dLinearY - dParabola;

          if (vY < -20) {
            // Rising
            frameIndex = Math.min(2, Math.floor((hopPhaseTime / (HOP_ARC_DUR * 0.5)) * 3));
          } else if (Math.abs(vY) <= 20) {
            // Apex somersault
            frameIndex = 3;
          } else {
            // Falling
            frameIndex = 4;
          }

          if (hopPhaseTime >= HOP_ARC_DUR) {
            hopPhase = 'land';
            hopPhaseTime = 0;
            posX = hopTargetX;
            posY = hopTargetY;
            currentPerchId = hopTargetPerchId;
            perchDwellTime = 0;
          }
        } else if (hopPhase === 'land') {
          // Landing contact: jump frame 5
          frameIndex = 5;
          posX = hopTargetX;
          posY = hopTargetY;
          if (hopPhaseTime >= HOP_LAND_DUR) {
            pickNextAction();
          }
        }
      }

      // Frame animation for idle / walk
      if (currentAction === 'SIT' || currentAction === 'WALK') {
        const stripDef = PIKACHU_CONFIG[activeStrip];
        frameTime += dt;
        const fDur = 1 / stripDef.fps;
        while (frameTime >= fDur) {
          frameTime -= fDur;
          frameIndex = (frameIndex + 1) % stripDef.frames;
        }
      }

      // Render directly into DOM
      const anim = PIKACHU_CONFIG[activeStrip];
      container.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -100%) scale(${facing * scale}, ${scale})`;

      sprite.style.width = `${anim.cellW}px`;
      sprite.style.height = `${anim.cellH}px`;
      sprite.style.backgroundImage = `url("${assetUrl(`/sprite/pikachu/${anim.file}`)}")`;
      sprite.style.backgroundPosition = `-${frameIndex * anim.cellW}px 0px`;

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      clearTimeout(fallbackTimer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', measurePerches);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-none z-30 opacity-0 select-none"
      style={{
        willChange: 'transform, opacity',
        transformOrigin: 'bottom center',
      }}
      aria-hidden="true"
    >
      <div
        ref={spriteRef}
        style={{
          imageRendering: 'pixelated',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};
