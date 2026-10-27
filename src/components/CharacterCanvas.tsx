import React, { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../lib/assetUrl';

export type ModelType = 'fused' | 'v1' | 'v2';

interface CharacterCanvasProps {
  activeModel?: ModelType;
  onAngleChange?: (angleDeg: number, heading: string, isCenter: boolean) => void;
  className?: string;
}

const TOTAL_FRAMES = 64;
// Exponential decay coefficient for delta-time lerp (~35ms half-life, ultra-responsive)
const EXP_DECAY = 18.0; 
const DEADZONE_SCREEN_RATIO = 0.12; // 12% screen radius

function getHeadingLabel(angleDeg: number): string {
  const normalized = (angleDeg % 360 + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'RIGHT';
  if (normalized >= 22.5 && normalized < 67.5) return 'DOWN-RIGHT';
  if (normalized >= 67.5 && normalized < 112.5) return 'DOWN';
  if (normalized >= 112.5 && normalized < 157.5) return 'DOWN-LEFT';
  if (normalized >= 157.5 && normalized < 202.5) return 'LEFT';
  if (normalized >= 202.5 && normalized < 247.5) return 'UP-LEFT';
  if (normalized >= 247.5 && normalized < 292.5) return 'UP';
  return 'UP-RIGHT';
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  activeModel = 'fused',
  onAngleChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cached frame stores
  const modelsCacheRef = useRef<Record<ModelType, HTMLImageElement[]>>({
    fused: [],
    v1: [],
    v2: [],
  });
  const centerFrameRef = useRef<HTMLImageElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // High performance tracking state
  const mousePosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  });
  const currentAngleRef = useRef<number>(0);
  const isEyeContactRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);
  const activeModelRef = useRef<ModelType>(activeModel);
  const lastTimeRef = useRef<number>(performance.now());

  // Cached face center in viewport coordinates
  const faceCenterRef = useRef<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.43 : 0,
  });

  useEffect(() => {
    activeModelRef.current = activeModel;
  }, [activeModel]);

  // Window resize handler to maintain face coordinates without layout thrashing
  useEffect(() => {
    const updateMetrics = () => {
      faceCenterRef.current = {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.43,
      };
    };
    updateMetrics();
    window.addEventListener('resize', updateMetrics, { passive: true });
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // Preload frames for models
  useEffect(() => {
    let mounted = true;
    let loadedCount = 0;
    const totalToLoad = TOTAL_FRAMES + 1; // 64 fused + 1 center

    const checkDone = () => {
      if (!mounted) return;
      loadedCount++;
      const pct = Math.min(100, Math.round((loadedCount / totalToLoad) * 100));
      setLoadProgress(pct);
      if (loadedCount >= totalToLoad) {
        setIsLoading(false);
      }
    };

    // Fallback: force dismiss loader after 800ms max so character is NEVER blocked
    const fallbackTimer = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 800);

    // 1. Load center frame
    const centerImg = new Image();
    centerImg.onload = checkDone;
    centerImg.onerror = checkDone;
    centerImg.src = assetUrl('/center.webp');
    if (centerImg.complete) checkDone();
    centerFrameRef.current = centerImg;

    // 2. Load fused frames
    const fusedArr: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = checkDone;
      img.onerror = checkDone;
      img.src = assetUrl(`/frames/${i}.webp`);
      if (img.complete) checkDone();
      fusedArr[i] = img;
    }
    modelsCacheRef.current.fused = fusedArr;

    // 3. Load v1 and v2 in background
    const v1Arr: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const v2Arr: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img1 = new Image();
      img1.src = assetUrl(`/frames_v1/${i}.webp`);
      v1Arr[i] = img1;

      const img2 = new Image();
      img2.src = assetUrl(`/frames_v2/${i}.webp`);
      v2Arr[i] = img2;
    }
    modelsCacheRef.current.v1 = v1Arr;
    modelsCacheRef.current.v2 = v2Arr;

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Global mouse and touch tracking (works continuously while scrolling)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Ultra-Smooth Delta-Time 60Hz - 240Hz Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let lastTelemetryTime = performance.now();
    lastTimeRef.current = performance.now();

    const render = (time: number) => {
      rafIdRef.current = requestAnimationFrame(render);

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      const faceX = faceCenterRef.current.x;
      const faceY = faceCenterRef.current.y;

      const dx = mouseX - faceX;
      const dy = mouseY - faceY;
      const dist = Math.hypot(dx, dy);

      // Deadzone threshold (12% of screen dimension)
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      const deadzoneRadius = minDimension * DEADZONE_SCREEN_RATIO;

      const isDeadzone = dist <= deadzoneRadius;
      isEyeContactRef.current = isDeadzone;

      let chosenImage: HTMLImageElement | null = null;
      let displayAngleDeg = 0;
      let heading = 'CENTER EYE CONTACT';

      const currentModel = activeModelRef.current;
      const currentFrames =
        modelsCacheRef.current[currentModel]?.length > 0
          ? modelsCacheRef.current[currentModel]
          : modelsCacheRef.current.fused;

      if (isDeadzone) {
        chosenImage = centerFrameRef.current;
        displayAngleDeg = 0;
        heading = 'CENTER [DIRECT GAZE]';
      } else {
        const targetAngle = Math.atan2(dy, dx);

        // Shortest-path circular difference wrapped into [-PI, PI]
        let angleDiff = targetAngle - currentAngleRef.current;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;

        // Continuous exponential smoothing (smooth at any refresh rate: 60Hz, 120Hz, 144Hz+)
        const factor = 1 - Math.exp(-EXP_DECAY * dt);
        currentAngleRef.current += angleDiff * factor;

        // Normalize to [0, 2*PI)
        let smoothedNorm = currentAngleRef.current % (2 * Math.PI);
        if (smoothedNorm < 0) smoothedNorm += 2 * Math.PI;

        displayAngleDeg = (smoothedNorm * 180) / Math.PI;
        heading = getHeadingLabel(displayAngleDeg);

        // Map to 0..63 frame index
        const frameIndex =
          Math.round((smoothedNorm / (2 * Math.PI)) * TOTAL_FRAMES) %
          TOTAL_FRAMES;

        const candidate = currentFrames[frameIndex];
        if (candidate && candidate.complete && candidate.naturalWidth > 0) {
          chosenImage = candidate;
        } else {
          chosenImage = centerFrameRef.current;
        }
      }

      // Draw exactly ONE crisp frame at 100% opacity (Zero Ghosting)
      if (chosenImage && chosenImage.complete && chosenImage.naturalWidth > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.round(window.innerWidth * dpr);
        const displayHeight = Math.round(window.innerHeight * dpr);

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
        }

        // Draw seamless background matching video #a9282d
        ctx.fillStyle = '#a9282d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Full Screen object-fit: cover calculation anchored to keep head fully visible
        const imgRatio = chosenImage.naturalWidth / chosenImage.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;

        let drawW = canvas.width;
        let drawH = canvas.height;
        let drawX = 0;
        let drawY = 0;

        if (canvasRatio > imgRatio) {
          drawW = canvas.width;
          drawH = canvas.width / imgRatio;
          // When screen is wider than video, anchor slightly higher so head is never cut off
          drawY = (canvas.height - drawH) * 0.25;
        } else {
          drawH = canvas.height;
          drawW = canvas.height * imgRatio;
          drawX = (canvas.width - drawW) / 2;
        }

        ctx.drawImage(chosenImage, drawX, drawY, drawW, drawH);
      }

      if (onAngleChange && time - lastTelemetryTime > 50) {
        lastTelemetryTime = time;
        onAngleChange(
          Math.round(displayAngleDeg * 10) / 10,
          heading,
          isDeadzone
        );
      }
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onAngleChange]);

  return (
    <>
      {/* 
        CRITICAL FIX: 
        Character canvas is FIXED in the background at z-0 (NOT -z-10).
        Remains rock-solid constant as the page scrolls!
        NO CSS 3D transforms.
      */}
      <div
        className={`fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden bg-[#a9282d] ${className}`}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#a9282d] text-white transition-opacity duration-300">
            <div className="w-16 h-16 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-30" />
              <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-[10px] font-mono tracking-widest text-white/80">
                {loadProgress}%
              </span>
            </div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/80">
              Initializing Mr.K Portfolio
            </p>
            <p className="text-[10px] font-mono text-white/40 mt-1">
              Loading 64-Frame Neural Vector Canvas
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover select-none pointer-events-none"
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#a9282d',
            transform: 'none',
          }}
        />
      </div>
    </>
  );
};
