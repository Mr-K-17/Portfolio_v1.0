import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RUNNER_SCALE, PIKACHU_METRICS } from '../lib/spriteScale';
import { assetUrl } from '../lib/assetUrl';

interface Waypoint {
  id: string;
  x: number;
  y: number;
}

interface LUTEntry {
  len: number;
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
  refY: number;
  isCrossing: boolean;
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

const LIGHTNING_CONFIG = {
  file: 'lightning.png',
  frames: 18,
  cellW: 112,
  cellH: 66,
  fps: 20,
  loopRange: [0, 7] as [number, number],
  fadeRange: [8, 16] as [number, number],
  flareIndex: 17,
};

// 5 Waypoints: starts strictly at About, no Hero
const SECTION_IDS = ['about', 'work', 'skills', 'certificates', 'contact'];

export const ScrollPath: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const progressPathRef = useRef<SVGPathElement | null>(null);

  // Fallback dot refs
  const dotRef = useRef<SVGCircleElement | null>(null);
  const haloRef = useRef<SVGCircleElement | null>(null);

  // Pikachu Runner & Lightning refs
  const runnerRef = useRef<HTMLDivElement | null>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);
  const lightningRef = useRef<HTMLDivElement | null>(null);
  const flareRef = useRef<HTMLDivElement | null>(null);

  const [pathD, setPathD] = useState<string>('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [activeNodes, setActiveNodes] = useState<Record<string, boolean>>({});
  const [svgDimensions, setSvgDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // State machine & animation tracking refs (zero React state per frame)
  const lutRef = useRef<LUTEntry[]>([]);
  const totalLengthRef = useRef<number>(0);
  const currentLenRef = useRef<number>(0);
  const targetLenRef = useRef<number>(0);
  const targetRefYRef = useRef<number>(0);
  const prevRefYRef = useRef<number>(0);
  const smoothedScrollVelocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const isReducedMotionRef = useRef<boolean>(false);

  // Pikachu animation refs
  const facingRef = useRef<number>(1); // 1 = right (native facing), -1 = left
  const animStateRef = useRef<'idle' | 'walk' | 'jump'>('idle');
  const idleVariantRef = useRef<'idle' | 'idle2' | 'idle3'>('idle');
  const idleTimerRef = useRef<number>(0);
  const frameIndexRef = useRef<number>(0);
  const frameTimeRef = useRef<number>(0);
  const jumpTriggerRef = useRef<boolean>(false);
  const isOneShotHopRef = useRef<boolean>(false);
  const hopTimerRef = useRef<number>(0);
  const spriteLoadedRef = useRef<boolean>(false);

  // Lightning animation refs
  const lightningLoadedRef = useRef<boolean>(false);
  const lightningFrameRef = useRef<number>(0);
  const lightningTimeRef = useRef<number>(0);
  const lightningStateRef = useRef<'off' | 'loop' | 'fade'>('off');
  const lightningOpacityRef = useRef<number>(0);

  // Scale, lane mode and footprint refs
  const runnerScaleRef = useRef<number>(RUNNER_SCALE);
  const trailLenRef = useRef<number>(Math.round(1.15 * PIKACHU_METRICS.walkCellW * RUNNER_SCALE));
  const footprintWidthRef = useRef<number>(
    PIKACHU_METRICS.walkCellW * RUNNER_SCALE + 2 * Math.round(1.15 * PIKACHU_METRICS.walkCellW * RUNNER_SCALE)
  );
  const isDualLaneRef = useRef<boolean>(false);

  // Preload Pikachu and Lightning sprites
  useEffect(() => {
    let loadedPika = 0;
    const pikaKeys: (keyof typeof PIKACHU_CONFIG)[] = ['idle', 'idle2', 'idle3', 'walk', 'jump'];
    pikaKeys.forEach((key) => {
      const img = new Image();
      img.src = assetUrl(`/sprite/pikachu/${PIKACHU_CONFIG[key].file}`);
      img.onload = () => {
        loadedPika++;
        if (loadedPika === pikaKeys.length) spriteLoadedRef.current = true;
      };
      img.onerror = () => {
        spriteLoadedRef.current = false;
      };
    });

    const lImg = new Image();
    lImg.src = assetUrl(`/sprite/lightning/${LIGHTNING_CONFIG.file}`);
    lImg.onload = () => {
      lightningLoadedRef.current = true;
    };
    lImg.onerror = () => {
      lightningLoadedRef.current = false;
    };
  }, []);

  // Compute waypoints and SVG path (Dual-Lane Zigzag via Corridors or Single Left Lane)
  const computePath = useCallback(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.scrollHeight || document.documentElement.scrollHeight;

    setSvgDimensions({ width, height });

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    // Measure bounding rects of content blocks (cards, headings, etc.)
    const contentEls = document.querySelectorAll(
      '#about h2, #about .velvet-card, #work h2, #work .velvet-card, #skills h2, #skills .velvet-card, #certificates h2, #certificates .velvet-card, #contact h2, #contact .velvet-card'
    );

    let minContentLeft = width;
    let maxContentRight = 0;

    if (contentEls.length > 0) {
      const parentRect = parent?.getBoundingClientRect() || { left: 0 };
      contentEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const l = rect.left - parentRect.left;
        const r = rect.right - parentRect.left;
        if (l < minContentLeft) minContentLeft = l;
        if (r > maxContentRight) maxContentRight = r;
      });
    } else {
      minContentLeft = isMobile ? 84 : isTablet ? 120 : (width - 720) / 2;
      maxContentRight = width - minContentLeft;
    }

    const leftGutter = Math.max(0, minContentLeft);
    const rightGutter = Math.max(0, width - maxContentRight);

    // Scale is fixed to 1x via RUNNER_SCALE single source of truth
    const scale = RUNNER_SCALE;
    runnerScaleRef.current = scale;

    const spriteW = PIKACHU_METRICS.walkCellW * scale;
    const minRequiredGutter = spriteW + 32;

    // Dual-lane mode when BOTH measured gutters are >= sprite width * scale + 32px
    const isDualLane = !isMobile && !isTablet && leftGutter >= minRequiredGutter && rightGutter >= minRequiredGutter;
    isDualLaneRef.current = isDualLane;

    // Trail length & footprint calculation
    let trailLen = 0;
    const activeGutter = isDualLane ? Math.min(leftGutter, rightGutter) : leftGutter;
    const naturalTrail = Math.round(1.15 * spriteW);
    const neededWithTrail = spriteW + 2 * naturalTrail + 32;

    if (activeGutter >= neededWithTrail) {
      trailLen = naturalTrail;
    } else {
      trailLen = Math.max(0, Math.floor((activeGutter - spriteW - 32) / 2));
    }
    trailLenRef.current = trailLen;
    const footprintWidth = spriteW + 2 * trailLen;
    footprintWidthRef.current = footprintWidth;

    // Lane centers
    const leftLaneCenterX = leftGutter / 2;
    const rightLaneCenterX = maxContentRight + rightGutter / 2;

    // Wave amplitude capped at 28px
    let A = Math.max(0, Math.floor((activeGutter - footprintWidth - 32) / 2));
    if (A < 8) A = 0;
    else A = Math.min(28, A);

    // Collect section metrics
    interface SectionMetric {
      id: string;
      lane: 'left' | 'right';
      laneCenterX: number;
      headingY: number;
      contentTop: number;
      contentBottom: number;
    }

    const parentRect = parent?.getBoundingClientRect() || { top: 0 };
    const sectionMetrics: SectionMetric[] = [];

    SECTION_IDS.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (!el) return;

      const heading = el.querySelector('h2');
      const headingRect = heading?.getBoundingClientRect();
      const headingY = headingRect
        ? headingRect.top - parentRect.top + headingRect.height * 0.5
        : el.offsetTop + 60;

      // Find top and bottom of content inside this section
      const cards = el.querySelectorAll('.velvet-card, h2');
      let cTop = headingY - 20;
      let cBottom = headingY + 100;
      if (cards.length > 0) {
        let minT = Infinity;
        let maxB = -Infinity;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const t = r.top - parentRect.top;
          const b = r.bottom - parentRect.top;
          if (t < minT) minT = t;
          if (b > maxB) maxB = b;
        });
        if (minT !== Infinity) cTop = minT;
        if (maxB !== -Infinity) cBottom = maxB;
      }

      // Lane assignment: About L, Work R, Skills L, Certificates R, Contact L in dual-lane
      const lane: 'left' | 'right' = isDualLane && idx % 2 === 1 ? 'right' : 'left';
      const laneCenterX = lane === 'left' ? leftLaneCenterX : rightLaneCenterX;

      sectionMetrics.push({
        id,
        lane,
        laneCenterX,
        headingY,
        contentTop: cTop,
        contentBottom: cBottom,
      });
    });

    if (sectionMetrics.length === 0) return;

    // Build Waypoints (nodes at each heading)
    const points: Waypoint[] = sectionMetrics.map((sm, i) => {
      const waveX = sm.laneCenterX + (A > 0 ? (i % 2 === 0 ? -A : A) : 0);
      return { id: sm.id, x: waveX, y: sm.headingY };
    });
    setWaypoints(points);

    // Build SVG Path
    let d = '';

    if (!isDualLane) {
      // SINGLE LEFT LANE MODE (Mobile, Tablet, narrow desktop)
      d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const dy = p1.y - p0.y;
        const cp1x = p0.x;
        const cp1y = p0.y + dy * 0.5;
        const cp2x = p1.x;
        const cp2y = p1.y - dy * 0.5;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
    } else {
      // DUAL-LANE ZIGZAG MODE (Corridor crossings)
      const cornerR = 40; // Rounded corner radius kept strictly inside lane
      const slope = 8; // Slight downward slope to avoid degenerate curves

      d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < sectionMetrics.length - 1; i++) {
        const cur = sectionMetrics[i];
        const next = sectionMetrics[i + 1];

        // Turn 2 finishes at next.contentTop - 16 (feet row in corridor),
        // ensuring the path is 100% vertical inside the destination lane BEFORE reaching contentTop
        const turn2EndY = next.contentTop - 16;
        const crossEndY = turn2EndY - cornerR;
        const crossStartY = crossEndY - slope;
        const turn1Y = crossStartY - cornerR;

        const fromLeft = cur.lane === 'left';
        const curX = cur.laneCenterX;
        const nextX = next.laneCenterX;

        // Path down current lane to corridor turn
        d += ` L ${curX} ${turn1Y}`;

        if (fromLeft) {
          // Turn 1: Left lane turning right into corridor
          const cp1x = curX;
          const cp1y = turn1Y + cornerR * 0.55;
          const cp2x = curX + cornerR * 0.45;
          const cp2y = crossStartY;
          const pCrossStartX = curX + cornerR;
          d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pCrossStartX} ${crossStartY}`;

          // Straight horizontal run across content gap
          const pCrossEndX = nextX - cornerR;
          d += ` L ${pCrossEndX} ${crossEndY}`;

          // Turn 2: Corridor turning down into Right lane
          const cp3x = pCrossEndX + cornerR * 0.55;
          const cp3y = crossEndY;
          const cp4x = nextX;
          const cp4y = crossEndY + cornerR * 0.45;
          d += ` C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${nextX} ${turn2EndY}`;
        } else {
          // Turn 1: Right lane turning left into corridor
          const cp1x = curX;
          const cp1y = turn1Y + cornerR * 0.55;
          const cp2x = curX - cornerR * 0.45;
          const cp2y = crossStartY;
          const pCrossStartX = curX - cornerR;
          d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pCrossStartX} ${crossStartY}`;

          // Straight horizontal run across content gap
          const pCrossEndX = nextX + cornerR;
          d += ` L ${pCrossEndX} ${crossEndY}`;

          // Turn 2: Corridor turning down into Left lane
          const cp3x = pCrossEndX - cornerR * 0.55;
          const cp3y = crossEndY;
          const cp4x = nextX;
          const cp4y = crossEndY + cornerR * 0.45;
          d += ` C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${nextX} ${turn2EndY}`;
        }

        // Run down destination lane to next heading
        d += ` L ${nextX} ${next.headingY}`;
      }
    }

    setPathD(d);
  }, []);

  // Compute layout & setup observers
  useEffect(() => {
    isReducedMotionRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    computePath();
    const t1 = setTimeout(computePath, 150);
    const t2 = setTimeout(computePath, 600);

    const parent = containerRef.current?.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (parent && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        computePath();
      });
      resizeObserver.observe(parent);
    }

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(computePath);
    }

    window.addEventListener('resize', computePath, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', computePath);
      resizeObserver?.disconnect();
    };
  }, [computePath]);

  // Build refY LUT table whenever pathD changes + Run Extended Dev Validator
  useEffect(() => {
    if (!pathRef.current) return;

    try {
      const path = pathRef.current;
      const total = path.getTotalLength();
      totalLengthRef.current = total;

      const rawTable: { len: number; x: number; y: number; tx: number; ty: number; isCross: boolean }[] = [];
      const step = 4; // Sample every 4px

      for (let l = 0; l <= total; l += step) {
        const pt = path.getPointAtLength(l);
        const nextPt = path.getPointAtLength(Math.min(l + 1, total));
        const prevPt = path.getPointAtLength(Math.max(l - 1, 0));
        const tx = nextPt.x - prevPt.x;
        const ty = nextPt.y - prevPt.y;
        const tMag = Math.sqrt(tx * tx + ty * ty) || 1;
        const normTx = tx / tMag;
        const normTy = ty / tMag;
        const isCross = Math.abs(normTx) > 0.6;
        rawTable.push({ len: l, x: pt.x, y: pt.y, tx: normTx, ty: normTy, isCross });
      }

      if (rawTable.length === 0 || rawTable[rawTable.length - 1].len < total) {
        const pt = path.getPointAtLength(total);
        const prevPt = path.getPointAtLength(Math.max(total - 1, 0));
        const tx = pt.x - prevPt.x;
        const ty = pt.y - prevPt.y;
        const tMag = Math.sqrt(tx * tx + ty * ty) || 1;
        rawTable.push({ len: total, x: pt.x, y: pt.y, tx: tx / tMag, ty: ty / tMag, isCross: false });
      }

      // Construct refY (strictly increasing scroll reference coordinate)
      // Find contiguous crossing intervals
      interface CrossInterval {
        startIdx: number;
        endIdx: number;
        startLen: number;
        endLen: number;
        corrY: number;
      }
      const crossings: CrossInterval[] = [];
      let inCross = false;
      let startIdx = 0;

      for (let i = 0; i < rawTable.length; i++) {
        if (rawTable[i].isCross && !inCross) {
          inCross = true;
          startIdx = i;
        } else if (!rawTable[i].isCross && inCross) {
          inCross = false;
          if (i - startIdx > 8) {
            crossings.push({
              startIdx,
              endIdx: i - 1,
              startLen: rawTable[startIdx].len,
              endLen: rawTable[i - 1].len,
              corrY: (rawTable[startIdx].y + rawTable[i - 1].y) / 2,
            });
          }
        }
      }
      if (inCross && rawTable.length - startIdx > 8) {
        crossings.push({
          startIdx,
          endIdx: rawTable.length - 1,
          startLen: rawTable[startIdx].len,
          endLen: rawTable[rawTable.length - 1].len,
          corrY: (rawTable[startIdx].y + rawTable[rawTable.length - 1].y) / 2,
        });
      }

      const vh = window.innerHeight;
      const crossSpan = 0.28 * vh; // 0.28x innerHeight ensures speed ratio within 0.7 - 1.7

      // Assign refY to each segment
      const refYValues = new Float64Array(rawTable.length);

      if (crossings.length === 0) {
        // Single lane: 1:1 mapping with geometric y
        for (let i = 0; i < rawTable.length; i++) {
          refYValues[i] = rawTable[i].y;
        }
      } else {
        // Dual lane: crossings get allocated scroll spans, lane runs linearly interpolate
        let prevEndIdx = 0;
        let prevEndRefY = rawTable[0].y;

        crossings.forEach((c) => {
          const crossStartRefY = c.corrY - crossSpan * 0.5;
          const crossEndRefY = c.corrY + crossSpan * 0.5;

          // Interpolate lane run before this crossing
          const laneCount = c.startIdx - prevEndIdx;
          if (laneCount > 0) {
            for (let i = prevEndIdx; i < c.startIdx; i++) {
              const t = (i - prevEndIdx) / laneCount;
              refYValues[i] = prevEndRefY + t * (crossStartRefY - prevEndRefY);
            }
          }

          // Interpolate crossing run
          const crossCount = c.endIdx - c.startIdx;
          for (let i = c.startIdx; i <= c.endIdx; i++) {
            const t = crossCount > 0 ? (i - c.startIdx) / crossCount : 0;
            refYValues[i] = crossStartRefY + t * (crossEndRefY - crossStartRefY);
          }

          prevEndIdx = c.endIdx + 1;
          prevEndRefY = crossEndRefY;
        });

        // Lane run after the last crossing
        const finalRefY = rawTable[rawTable.length - 1].y + 0.15 * vh;
        const remCount = rawTable.length - prevEndIdx;
        if (remCount > 0) {
          for (let i = prevEndIdx; i < rawTable.length; i++) {
            const t = (i - prevEndIdx) / remCount;
            refYValues[i] = prevEndRefY + t * (finalRefY - prevEndRefY);
          }
        }
      }

      // Ensure strictly increasing refY by construction
      for (let i = 1; i < refYValues.length; i++) {
        if (refYValues[i] <= refYValues[i - 1]) {
          refYValues[i] = refYValues[i - 1] + 0.1;
        }
      }

      const table: LUTEntry[] = rawTable.map((r, i) => ({
        len: r.len,
        x: r.x,
        y: r.y,
        tangentX: r.tx,
        tangentY: r.ty,
        refY: refYValues[i],
        isCrossing: r.isCross,
      }));

      lutRef.current = table;

      if (progressPathRef.current) {
        progressPathRef.current.style.strokeDasharray = `${total} ${total}`;
        if (isReducedMotionRef.current) {
          progressPathRef.current.style.strokeDashoffset = '0';
        } else {
          progressPathRef.current.style.strokeDashoffset = `${total}`;
        }
      }

      // DEV-ONLY EXTENDED VALIDATOR (tree-shaken from production build)
      if (import.meta.env.DEV) {
        const contentEls = document.querySelectorAll(
          '#about h2, #about .velvet-card, #work h2, #work .velvet-card, #skills h2, #skills .velvet-card, #certificates h2, #certificates .velvet-card, #contact h2, #contact .velvet-card'
        );
        const parent = containerRef.current?.parentElement;
        const pRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };

        const cachedRects: { section: string; left: number; right: number; top: number; bottom: number }[] = [];
        contentEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          cachedRects.push({
            section: el.closest('section, footer')?.id || 'content',
            left: r.left - pRect.left,
            right: r.right - pRect.left,
            top: r.top - pRect.top,
            bottom: r.bottom - pRect.top,
          });
        });

        const halfFootprint = footprintWidthRef.current / 2;
        const spriteH = PIKACHU_METRICS.walkCellH * runnerScaleRef.current;
        const violations: { section: string; y: number; sampleX: number; box: string; contentRect: string }[] = [];

        // 1. Collision test
        for (let i = 0; i < table.length; i += 4) {
          const sample = table[i];
          const boxLeft = sample.x - halfFootprint - 8;
          const boxRight = sample.x + halfFootprint + 8;
          const boxTop = sample.y - spriteH - 8;
          const boxBottom = sample.y + 8;

          cachedRects.forEach((c) => {
            const overlaps = !(
              boxRight < c.left ||
              boxLeft > c.right ||
              boxBottom < c.top ||
              boxTop > c.bottom
            );
            if (overlaps) {
              violations.push({
                section: c.section,
                y: Math.round(sample.y),
                sampleX: Math.round(sample.x),
                box: `[${Math.round(boxLeft)}..${Math.round(boxRight)}]`,
                contentRect: `[${Math.round(c.left)}..${Math.round(c.right)}]`,
              });
            }
          });
        }

        // 2. Strict refY monotonicity test
        let refYMonotonic = true;
        for (let i = 1; i < table.length; i++) {
          if (table[i].refY <= table[i - 1].refY) {
            refYMonotonic = false;
            break;
          }
        }

        // 3. Runner on-screen band test (12% to 92% of viewport height at every 100px scroll)
        const docHeight = parent?.scrollHeight || document.documentElement.scrollHeight;
        const maxScroll = Math.max(0, docHeight - window.innerHeight);
        let onScreenViolations = 0;

        for (let s = 0; s <= maxScroll; s += 100) {
          const rY = s + 0.55 * window.innerHeight;
          // Binary search
          let l = 0;
          let r = table.length - 1;
          while (l <= r) {
            const m = (l + r) >> 1;
            if (table[m].refY <= rY) l = m + 1;
            else r = m - 1;
          }
          const idx = Math.max(0, Math.min(r, table.length - 1));
          const runnerScreenY = table[idx].y - s;
          const ratio = runnerScreenY / window.innerHeight;
          // Only check when runner is active (past path start)
          if (rY >= table[0].refY && rY <= table[table.length - 1].refY) {
            if (ratio < 0.12 || ratio > 0.92) {
              onScreenViolations++;
            }
          }
        }

        // 4. Speed ratio test on lane runs
        let minRatio = Infinity;
        let maxRatio = -Infinity;
        for (let i = 0; i < table.length - 5; i += 5) {
          if (!table[i].isCrossing && !table[i + 5].isCrossing) {
            const dArc = table[i + 5].len - table[i].len;
            const dRef = table[i + 5].refY - table[i].refY;
            if (dRef > 0.1) {
              const sr = dArc / dRef;
              if (sr < minRatio) minRatio = sr;
              if (sr > maxRatio) maxRatio = sr;
            }
          }
        }

        const modeStr = isDualLaneRef.current ? 'Dual-Lane Mode (Corridor Zigzag)' : 'Single Left Lane Mode';
        console.log(`[DEV-VALIDATOR] Mode: ${modeStr}`);
        console.log(`[DEV-VALIDATOR] refY Strictly Monotonic: ${refYMonotonic}`);
        console.log(`[DEV-VALIDATOR] Speed Ratio Range: [${minRatio.toFixed(2)} .. ${maxRatio.toFixed(2)}]`);
        const minCorridorRequired = PIKACHU_METRICS.maxCellH * runnerScaleRef.current + 56;
        console.log(`[DEV-VALIDATOR] Min Corridor Height Required: ${minCorridorRequired}px (tallest cell x scale + 56px)`);
        console.log(`[DEV-VALIDATOR] On-Screen Band (12%-92%) Violations: ${onScreenViolations}`);

        if (violations.length > 0) {
          console.warn(`[DEV-VALIDATOR] ${violations.length} content collisions detected:`);
          console.table(violations.slice(0, 15));
        } else {
          console.log(`[DEV-VALIDATOR] 0 content collisions across ${table.length} LUT samples (100% CLEAR).`);
        }
      }
    } catch {
      // Graceful fallback
    }
  }, [pathD]);

  // IntersectionObserver for section nodes and one-shot hop trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNodes((prev) => ({ ...prev, [entry.target.id]: true }));
            jumpTriggerRef.current = true;
          }
        });
      },
      {
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.15,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [waypoints]);

  const getRandomIdle = (): 'idle' | 'idle2' | 'idle3' => {
    const r = Math.random();
    if (r < 0.45) return 'idle';
    if (r < 0.75) return 'idle2';
    return 'idle3';
  };

  // Passive scroll handler: updates target reference line without layout queries
  useEffect(() => {
    if (isReducedMotionRef.current) return;

    const onScroll = () => {
      const lut = lutRef.current;
      if (!lut || lut.length === 0) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const innerHeight = window.innerHeight;
      const refY = scrollY + 0.55 * innerHeight;
      targetRefYRef.current = refY;

      const pathStartRefY = lut[0].refY;
      const pathEndRefY = lut[lut.length - 1].refY;

      if (refY <= pathStartRefY) {
        targetLenRef.current = 0;
      } else if (refY >= pathEndRefY) {
        targetLenRef.current = totalLengthRef.current;
      } else {
        // Binary search on refY in the pre-computed LUT
        let low = 0;
        let high = lut.length - 1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (lut[mid].refY <= refY) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        const idx = Math.max(0, Math.min(high, lut.length - 2));
        const p0 = lut[idx];
        const p1 = lut[idx + 1];
        const span = p1.refY - p0.refY;
        const t = span > 0.0001 ? (refY - p0.refY) / span : 0;
        targetLenRef.current = p0.len + t * (p1.len - p0.len);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Main rAF animation loop: exponential decay smoothing, runner positioning, Pikachu + Lightning rendering
  useEffect(() => {
    if (isReducedMotionRef.current) {
      if (progressPathRef.current && totalLengthRef.current > 0) {
        progressPathRef.current.style.strokeDashoffset = '0';
      }
      if (waypoints.length > 0 && runnerRef.current && spriteRef.current) {
        const last = waypoints[waypoints.length - 1];
        const anim = PIKACHU_CONFIG.idle;
        runnerRef.current.style.transform = `translate(${last.x}px, ${last.y}px) translate(-50%, -100%) scale(1, 1)`;
        runnerRef.current.style.opacity = '1';
        spriteRef.current.style.width = `${anim.cellW}px`;
        spriteRef.current.style.height = `${anim.cellH}px`;
        spriteRef.current.style.backgroundImage = `url("${assetUrl(`/sprite/pikachu/${anim.file}`)}")`;
        spriteRef.current.style.backgroundPosition = '0px 0px';
      }
      return;
    }

    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const lut = lutRef.current;
      const total = totalLengthRef.current;

      if (lut && lut.length > 0 && total > 0) {
        const decay = 10.0;
        const prevLen = currentLenRef.current;
        const targetLen = targetLenRef.current;

        // Exponential decay smoothing for runner length
        currentLenRef.current += (targetLen - prevLen) * (1 - Math.exp(-decay * dt));
        const currentLen = currentLenRef.current;

        // Scroll velocity (px/s) of the reference line (prevents false jumps during crossings)
        const targetRefY = targetRefYRef.current;
        const prevRefY = prevRefYRef.current;
        prevRefYRef.current = targetRefY;
        const instantScrollV = dt > 0.0001 ? (targetRefY - prevRefY) / dt : 0;
        smoothedScrollVelocityRef.current += (instantScrollV - smoothedScrollVelocityRef.current) * (1 - Math.exp(-8.0 * dt));
        const absV = Math.abs(smoothedScrollVelocityRef.current);

        // Update progress stroke: ends exactly at runner's current length
        if (progressPathRef.current) {
          const dashoffset = Math.max(0, total - currentLen);
          progressPathRef.current.style.strokeDashoffset = `${dashoffset}`;
        }

        // Interpolate position (x, y), tangent, and crossing state from LUT
        let posX = lut[0].x;
        let posY = lut[0].y;
        let tanX = lut[0].tangentX;
        let isCrossing = false;

        if (currentLen <= 0) {
          posX = lut[0].x;
          posY = lut[0].y;
          tanX = lut[0].tangentX;
        } else if (currentLen >= total) {
          const last = lut[lut.length - 1];
          posX = last.x;
          posY = last.y;
          tanX = last.tangentX;
          isCrossing = last.isCrossing;
        } else {
          const idx = Math.min(Math.floor(currentLen / 4), lut.length - 2);
          const p0 = lut[idx];
          const p1 = lut[idx + 1];
          const dLen = p1.len - p0.len;
          const t = dLen > 0.0001 ? (currentLen - p0.len) / dLen : 0;
          posX = p0.x + t * (p1.x - p0.x);
          posY = p0.y + t * (p1.y - p0.y);
          tanX = p0.tangentX + t * (p1.tangentX - p0.tangentX);
          isCrossing = p0.isCrossing || p1.isCrossing;
        }

        // Opacity fade-in: hidden on Hero; fades in over 150px as About approaches
        const scrollY = window.scrollY || window.pageYOffset;
        const refY = scrollY + 0.55 * window.innerHeight;
        const pathStartRefY = lut[0].refY;
        const dist = refY - pathStartRefY;
        const runnerOpacity = Math.min(Math.max(dist / 150, 0), 1);

        // Facing direction with hysteresis: follow motion along path
        if (isCrossing) {
          // In corridors, travel direction is governed by corridor slope
          if (smoothedScrollVelocityRef.current < -20) {
            // Scrolling up: face reverse of crossing tangent
            facingRef.current = tanX > 0 ? -1 : 1;
          } else {
            // Scrolling down or stationary in corridor: face forward along tangent
            facingRef.current = tanX > 0 ? 1 : -1;
          }
        } else if (absV > 8) {
          const motionX = smoothedScrollVelocityRef.current >= 0 ? tanX : -tanX;
          if (motionX > 0.2) {
            facingRef.current = 1; // Face right
          } else if (motionX < -0.2) {
            facingRef.current = -1; // Face left
          }
        }

        // Pikachu State Machine
        if (jumpTriggerRef.current) {
          jumpTriggerRef.current = false;
          if (animStateRef.current !== 'jump') {
            animStateRef.current = 'jump';
            frameIndexRef.current = 0;
            frameTimeRef.current = 0;
            isOneShotHopRef.current = true;
            hopTimerRef.current = 0;
          }
        }

        if (isOneShotHopRef.current) {
          hopTimerRef.current += dt;
        }

        if (absV > 1400) {
          if (animStateRef.current !== 'jump') {
            animStateRef.current = 'jump';
            frameIndexRef.current = 0;
            frameTimeRef.current = 0;
            isOneShotHopRef.current = false;
          }
          idleTimerRef.current = 0;
        } else if (absV > 20 || isCrossing) {
          if (animStateRef.current === 'jump' && isOneShotHopRef.current) {
            // Let hop complete
          } else {
            if (animStateRef.current !== 'walk') {
              animStateRef.current = 'walk';
              frameIndexRef.current = 0;
              frameTimeRef.current = 0;
            }
          }
          idleTimerRef.current = 0;
        } else {
          // Stationary
          if (animStateRef.current === 'jump' && isOneShotHopRef.current) {
            // Let hop complete
          } else if (animStateRef.current === 'walk') {
            idleTimerRef.current += dt;
            if (idleTimerRef.current >= 0.25) {
              animStateRef.current = 'idle';
              idleVariantRef.current = getRandomIdle();
              frameIndexRef.current = 0;
              frameTimeRef.current = 0;
            }
          } else if (animStateRef.current !== 'idle') {
            animStateRef.current = 'idle';
            idleVariantRef.current = getRandomIdle();
            frameIndexRef.current = 0;
            frameTimeRef.current = 0;
          }
        }

        // Pikachu frame timing (walk frame rate is 1.5x during corridor crossings)
        const activeAnim =
          animStateRef.current === 'idle'
            ? PIKACHU_CONFIG[idleVariantRef.current]
            : PIKACHU_CONFIG[animStateRef.current];

        const activeFps =
          isCrossing && animStateRef.current === 'walk'
            ? activeAnim.fps * 1.5
            : activeAnim.fps;

        const frameDuration = 1 / activeFps;
        frameTimeRef.current += dt;

        while (frameTimeRef.current >= frameDuration) {
          frameTimeRef.current -= frameDuration;
          frameIndexRef.current++;

          if (frameIndexRef.current >= activeAnim.frames) {
            if (animStateRef.current === 'jump') {
              if (isOneShotHopRef.current) {
                isOneShotHopRef.current = false;
                animStateRef.current = absV > 20 ? 'walk' : 'idle';
                if (animStateRef.current === 'idle') {
                  idleVariantRef.current = getRandomIdle();
                }
                frameIndexRef.current = 0;
                frameTimeRef.current = 0;
              } else if (absV <= 1400) {
                animStateRef.current = absV > 20 ? 'walk' : 'idle';
                if (animStateRef.current === 'idle') {
                  idleVariantRef.current = getRandomIdle();
                }
                frameIndexRef.current = 0;
                frameTimeRef.current = 0;
              } else {
                frameIndexRef.current = 0;
              }
            } else if (animStateRef.current === 'idle') {
              idleVariantRef.current = getRandomIdle();
              frameIndexRef.current = 0;
            } else {
              frameIndexRef.current = 0;
            }
          }
        }

        // Lightning Trail State Machine & Timing (20 FPS)
        // Active when walking/jumping or during corridor crossing
        const isMoving = animStateRef.current === 'walk' || animStateRef.current === 'jump' || isCrossing;
        const hasTrail = trailLenRef.current > 0 && lightningLoadedRef.current;

        if (hasTrail) {
          if (isMoving) {
            if (lightningStateRef.current !== 'loop') {
              lightningStateRef.current = 'loop';
              lightningFrameRef.current = LIGHTNING_CONFIG.loopRange[0];
              lightningTimeRef.current = 0;
            }
            // Fade opacity in over 80ms up to max 0.9
            lightningOpacityRef.current = Math.min(0.9, lightningOpacityRef.current + (dt / 0.08) * 0.9);
          } else {
            // Transition to fade
            if (lightningStateRef.current === 'loop') {
              lightningStateRef.current = 'fade';
              lightningFrameRef.current = LIGHTNING_CONFIG.fadeRange[0];
              lightningTimeRef.current = 0;
            }
            // Fade opacity out over 200ms down to 0
            lightningOpacityRef.current = Math.max(0, lightningOpacityRef.current - (dt / 0.20) * 0.9);
          }

          // Advance lightning frames
          if (lightningStateRef.current !== 'off') {
            const lFrameDur = 1 / LIGHTNING_CONFIG.fps;
            lightningTimeRef.current += dt;

            while (lightningTimeRef.current >= lFrameDur) {
              lightningTimeRef.current -= lFrameDur;
              lightningFrameRef.current++;

              if (lightningStateRef.current === 'loop') {
                if (lightningFrameRef.current > LIGHTNING_CONFIG.loopRange[1]) {
                  lightningFrameRef.current = LIGHTNING_CONFIG.loopRange[0];
                }
              } else if (lightningStateRef.current === 'fade') {
                if (lightningFrameRef.current > LIGHTNING_CONFIG.fadeRange[1]) {
                  lightningStateRef.current = 'off';
                  lightningOpacityRef.current = 0;
                  break;
                }
              }
            }
          }
        } else {
          lightningStateRef.current = 'off';
          lightningOpacityRef.current = 0;
        }

        const scale = runnerScaleRef.current;

        // Render Pikachu & Lightning in DOM layer via 2D transforms
        if (runnerRef.current && spriteRef.current && spriteLoadedRef.current) {
          const runner = runnerRef.current;
          const sprite = spriteRef.current;

          runner.style.opacity = runnerOpacity.toFixed(3);
          runner.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -100%) scale(${facingRef.current * scale}, ${scale})`;

          // Pikachu sprite frame
          sprite.style.width = `${activeAnim.cellW}px`;
          sprite.style.height = `${activeAnim.cellH}px`;
          sprite.style.backgroundImage = `url("${assetUrl(`/sprite/pikachu/${activeAnim.file}`)}")`;
          sprite.style.backgroundPosition = `-${frameIndexRef.current * activeAnim.cellW}px 0px`;

          // Lightning trail
          if (lightningRef.current && hasTrail && lightningStateRef.current !== 'off' && lightningOpacityRef.current > 0.01) {
            const lEl = lightningRef.current;
            const tLen = trailLenRef.current;
            const tHeight = Math.round(tLen * (LIGHTNING_CONFIG.cellH / LIGHTNING_CONFIG.cellW));

            lEl.style.display = 'block';
            lEl.style.width = `${tLen}px`;
            lEl.style.height = `${tHeight}px`;
            // Attach origin end (right edge of lightning) to Pikachu's back at x=0
            lEl.style.right = '100%';
            lEl.style.top = '55%';
            lEl.style.transform = 'translateY(-50%)';
            lEl.style.opacity = (lightningOpacityRef.current * runnerOpacity).toFixed(3);
            lEl.style.backgroundSize = `${LIGHTNING_CONFIG.frames * tLen}px ${tHeight}px`;
            lEl.style.backgroundPosition = `-${lightningFrameRef.current * tLen}px 0px`;
          } else if (lightningRef.current) {
            lightningRef.current.style.display = 'none';
          }

          // Hop Flare (played at his feet on section hop for 150ms)
          if (flareRef.current && isOneShotHopRef.current && hopTimerRef.current < 0.16 && lightningLoadedRef.current) {
            const flare = flareRef.current;
            flare.style.display = 'block';
            flare.style.width = '36px';
            flare.style.height = '22px';
            flare.style.left = '50%';
            flare.style.bottom = '0px';
            flare.style.transform = 'translateX(-50%)';
            flare.style.opacity = ((1 - hopTimerRef.current / 0.16) * 0.85 * runnerOpacity).toFixed(3);
            flare.style.backgroundSize = `${LIGHTNING_CONFIG.frames * 36}px 22px`;
            flare.style.backgroundPosition = `-${LIGHTNING_CONFIG.flareIndex * 36}px 0px`;
          } else if (flareRef.current) {
            flareRef.current.style.display = 'none';
          }
        } else if (dotRef.current && haloRef.current) {
          // Fallback dot
          dotRef.current.setAttribute('cx', posX.toString());
          dotRef.current.setAttribute('cy', posY.toString());
          dotRef.current.setAttribute('opacity', runnerOpacity.toString());

          haloRef.current.setAttribute('cx', posX.toString());
          haloRef.current.setAttribute('cy', posY.toString());
          haloRef.current.setAttribute('opacity', (runnerOpacity * 0.4).toString());
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-visible"
      aria-hidden="true"
    >
      {svgDimensions.width > 0 && svgDimensions.height > 0 && pathD && (
        <>
          <svg
            width={svgDimensions.width}
            height={svgDimensions.height}
            className="w-full h-full overflow-visible pointer-events-none"
          >
            {/* Faint track path */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Progress drawn path */}
            <path
              ref={progressPathRef}
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Section Nodes (About, Work, Skills, Certificates, Contact) */}
            {waypoints.map((pt) => {
              const isActive = !!activeNodes[pt.id];
              return (
                <g key={pt.id}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="7"
                    fill="none"
                    stroke={isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth="1"
                    className="transition-colors duration-300"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill={isActive ? '#ffffff' : '#8b1f23'}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    className="transition-colors duration-300"
                  />
                </g>
              );
            })}

            {/* Fallback Dot and Halo (if sprite fails to load) */}
            <circle
              ref={haloRef}
              cx="-100"
              cy="-100"
              r="10"
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="1"
              opacity="0"
            />
            <circle
              ref={dotRef}
              cx="-100"
              cy="-100"
              r="3.5"
              fill="#ffffff"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
              opacity="0"
            />
          </svg>

          {/* Pikachu Sprite Runner with Lightning Trail in DOM layer (z-30, 2D transforms) */}
          <div
            ref={runnerRef}
            className="absolute top-0 left-0 pointer-events-none z-30 opacity-0"
            style={{
              willChange: 'transform, opacity',
              transformOrigin: 'bottom center',
            }}
          >
            {/* Layer 1: Lightning Trail (BEHIND Pikachu, z-index: 1) */}
            <div
              ref={lightningRef}
              style={{
                position: 'absolute',
                backgroundImage: `url("${assetUrl('/sprite/lightning/lightning.png')}")`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'auto',
                pointerEvents: 'none',
                zIndex: 1,
                display: 'none',
              }}
            />

            {/* Layer 2: Hop Flare (at feet on node hop, z-index: 1) */}
            <div
              ref={flareRef}
              style={{
                position: 'absolute',
                backgroundImage: `url("${assetUrl('/sprite/lightning/lightning.png')}")`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'auto',
                pointerEvents: 'none',
                zIndex: 1,
                display: 'none',
              }}
            />

            {/* Layer 3: Pikachu Sprite (IN FRONT of lightning, z-index: 2, pixelated) */}
            <div
              ref={spriteRef}
              style={{
                position: 'relative',
                imageRendering: 'pixelated',
                backgroundRepeat: 'no-repeat',
                zIndex: 2,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
