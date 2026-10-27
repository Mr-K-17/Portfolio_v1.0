import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-6 flex items-center justify-between pointer-events-none">
      {/* Brand Identity */}
      <div className="pointer-events-auto flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center">
          <span className="font-cinzel text-sm font-semibold tracking-wider text-white">AV</span>
        </div>
        <div>
          <h1 className="font-cinzel text-sm md:text-base font-bold tracking-[0.25em] text-white uppercase">
            Alexander Vance
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
            Creative Direction & Spatial Systems
          </p>
        </div>
      </div>

      {/* Center Availability Indicator */}
      <div className="hidden lg:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md pointer-events-auto">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wider text-white/80 uppercase">
          Available for Q2/Q3 Commissions
        </span>
      </div>

      {/* Navigation Links & Action */}
      <div className="pointer-events-auto flex items-center space-x-4 md:space-x-8">
        <nav className="hidden md:flex items-center space-x-6 text-xs font-mono uppercase tracking-widest text-white/70">
          <a href="#archives" className="hover:text-white transition-colors">Archives</a>
          <a href="#method" className="hover:text-white transition-colors">Method</a>
          <a href="#accolades" className="hover:text-white transition-colors">Accolades</a>
        </nav>

        <button className="px-5 py-2 rounded-full bg-white text-[#a9282d] text-xs font-mono font-medium tracking-wider uppercase hover:bg-neutral-100 hover:shadow-lg hover:shadow-black/20 transition-all flex items-center space-x-1.5">
          <span>Inquire</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
