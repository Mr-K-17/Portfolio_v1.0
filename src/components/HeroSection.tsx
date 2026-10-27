import React from 'react';
import { ArrowUpRight, MessageCircle, ArrowDown } from 'lucide-react';
import { HeroPikachu } from './HeroPikachu';
import { assetUrl } from '../lib/assetUrl';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative w-full h-[100svh] max-h-[100svh] overflow-hidden flex flex-col justify-end pl-6 pr-6 pb-6 md:pl-12 md:pr-12 lg:pl-16 lg:pr-16 select-none pointer-events-none"
    >
      {/* Hero Wandering Pikachu */}
      <HeroPikachu />

      {/* 
        FACE ZONE CLEARANCE:
        Character face is at x=50%, y=43%.
        Central 36% (x=32%-68%) and vertical 15%-65% is kept completely clear.
        Hero block is left-aligned and anchored bottom-left.
        Desktop: right edge does not pass 36% of viewport width.
        Mobile: occupies at most the bottom 38% of viewport.
      */}
      <div className="w-full max-w-7xl mx-auto flex flex-col justify-end items-start z-10 mb-4 md:mb-6">
        <div className="pointer-events-auto w-full max-w-[340px] lg:max-w-[32vw] space-y-4 max-h-[38svh] md:max-h-none overflow-y-auto md:overflow-visible">
          {/* Eyebrow Line */}
          <p data-perch="eyebrow" className="font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-white/85">
            Aspiring Software Engineer Intern
          </p>

          {/* Name in Playfair Display 700 uppercase with clamp */}
          <div data-perch="name">
            <h1 className="font-playfair font-bold text-[clamp(1.75rem,5vw,3rem)] text-white uppercase tracking-[0.06em] leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] whitespace-nowrap">
              KISHORE S V
            </h1>
          </div>

          {/* 3-4 line factual bio max-w-[340px] */}
          <p data-perch="bio" className="font-sans text-xs md:text-[13px] text-white/90 leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] max-w-[340px]">
            Computer Science student building full-stack applications with Java, Spring Boot, React and MongoDB. Exploring DevOps, automation and deployment, and looking for a Software Engineer Intern role.
          </p>

          {/* Action buttons: Resume & Let's Talk */}
          <div className="pt-1 flex items-center space-x-3">
            <a
              href={assetUrl('/resume.pdf')}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-white text-[#a9282d] text-xs font-sans font-semibold tracking-wider hover:bg-neutral-100 hover:shadow-xl hover:shadow-black/30 active:scale-95 transition-all flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Resume</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#contact"
              className="px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/40 text-white text-xs font-sans font-semibold tracking-wider backdrop-blur-md hover:border-white/80 active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-black/15 focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white/90" />
              <span>Let's Talk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Natural Scroll Prompt */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-white/65 pt-3 border-t border-white/10 z-10">
        <span className="text-[10px] uppercase tracking-widest text-white/65">
          Scroll Down To Explore ↓
        </span>

        <a
          href="#about"
          className="pointer-events-auto flex items-center space-x-2 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/65">About Kishore</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-white/70" />
        </a>
      </div>
    </section>
  );
};
