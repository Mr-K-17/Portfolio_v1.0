import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const dotRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const ringRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const ringElementRef = useRef<HTMLDivElement | null>(null);
  const dotElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Disable on coarse pointer / touch devices
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      dotRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if target is an interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('input') ||
          target.classList.contains('cursor-pointer') ||
          target.getAttribute('data-cursor') === 'interactive')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth animation loop for trailing aura ring
    const animate = () => {
      // Lerp aura ring position towards dot position
      const lerp = 0.18;
      ringRef.current.x += (dotRef.current.x - ringRef.current.x) * lerp;
      ringRef.current.y += (dotRef.current.y - ringRef.current.y) * lerp;

      if (dotElementRef.current) {
        dotElementRef.current.style.transform = `translate3d(${dotRef.current.x}px, ${dotRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringElementRef.current) {
        ringElementRef.current.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (typeof window === 'undefined' || isTouchDevice) return null;

  return (
    <>
      {/* Glowing White Custom Cursor Dot */}
      <div
        ref={dotElementRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full bg-white transition-all duration-150 ${
            isHovered
              ? 'w-2 h-2 shadow-[0_0_12px_rgba(255,255,255,1)]'
              : 'w-2 h-2 shadow-[0_0_8px_rgba(255,255,255,0.9)]'
          }`}
        />
      </div>

      {/* Smooth Trailing Aura Ring */}
      <div
        ref={ringElementRef}
        className={`fixed top-0 left-0 pointer-events-none z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className={`rounded-full border border-white/50 backdrop-blur-[1px] transition-all duration-300 ease-out flex items-center justify-center ${
            isHovered
              ? 'w-16 h-16 border-white/80 bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.3)] scale-110'
              : 'w-10 h-10 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.15)] scale-100'
          }`}
        />
      </div>
    </>
  );
};
