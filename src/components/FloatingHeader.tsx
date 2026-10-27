import React from 'react';

export const FloatingHeader: React.FC = () => {
  return (
    <header className="fixed top-6 left-0 right-0 z-40 flex items-center justify-center px-4 pointer-events-none">
      {/* Floating Centered Frosted-Glass Pill */}
      <div className="pointer-events-auto flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full header-glass shadow-2xl transition-all">
        {/* Navigation items: ABOUT, WORK, SKILLS, CERTIFICATES, CONTACT */}
        <nav className="flex items-center space-x-1 md:space-x-2">
          <a
            href="#about"
            className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono font-medium tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/10 transition-all uppercase focus-visible:ring-1 focus-visible:ring-white"
          >
            [ABOUT]
          </a>
          <a
            href="#work"
            className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono font-medium tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/10 transition-all uppercase focus-visible:ring-1 focus-visible:ring-white"
          >
            [WORK]
          </a>
          <a
            href="#skills"
            className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono font-medium tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/10 transition-all uppercase focus-visible:ring-1 focus-visible:ring-white"
          >
            [SKILLS]
          </a>
          <a
            href="#certificates"
            className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono font-medium tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/10 transition-all uppercase focus-visible:ring-1 focus-visible:ring-white"
          >
            [CERTIFICATES]
          </a>
          <a
            href="#contact"
            className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono font-medium tracking-[0.2em] text-white/80 hover:text-white hover:bg-white/10 transition-all uppercase focus-visible:ring-1 focus-visible:ring-white"
          >
            [CONTACT]
          </a>
        </nav>
      </div>
    </header>
  );
};
