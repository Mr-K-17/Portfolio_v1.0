import React from 'react';
import { ArrowUpRight, Layers, Cpu, Eye, Compass } from 'lucide-react';

const PROJECTS = [
  {
    id: '01',
    title: 'Maison Vendôme',
    subtitle: 'Spatial Runway & Digital Haute Couture',
    year: '2026',
    category: 'Creative Direction',
    tags: ['WebGL', 'Neural Gaze', 'Spatial Audio'],
  },
  {
    id: '02',
    title: 'Château Noir',
    subtitle: 'Interactive Architectural Monograph',
    year: '2025',
    category: 'Spatial Identity',
    tags: ['Generative Canvas', 'Bespoke Typography', 'Cannes Gold'],
  },
  {
    id: '03',
    title: 'Aethelgard Watchmaking',
    subtitle: 'High Horology Micro-Mechanics Experience',
    year: '2025',
    category: 'Product Direction',
    tags: ['Photoreal 60FPS', 'Physical Simulation', 'FWA of the Month'],
  },
];

const TECHNICAL_SPECIFICATIONS = [
  {
    icon: Layers,
    title: 'Zero CSS 3D Transforms',
    desc: 'Strictly zero perspective, rotateX, or rotateY applied. Character torso and world coordinate frame remain 100% rock-solid motionless.',
  },
  {
    icon: Cpu,
    title: '64 Pre-Extracted WebP Vectors',
    desc: 'Eliminates MP4 browser seeking latency completely. 64 optimized WebP frames at ~5.6° intervals plus center neutral eye contact.',
  },
  {
    icon: Compass,
    title: 'Shortest-Path Angular Lerp',
    desc: 'Circular atan2(dy, dx) smoothing with α=0.26 factor delivers fluid 35ms tracking response with zero overshoot.',
  },
  {
    icon: Eye,
    title: '12% Deadzone Direct Eye Contact',
    desc: 'When the cursor approaches the character face radius (≤12%), the engine snaps seamlessly to center.webp for direct eye contact.',
  },
];

export const ArchivesSection: React.FC = () => {
  return (
    <section id="work" className="relative w-full bg-[#8b1f23] text-white px-6 md:px-16 py-24 border-t border-white/10">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Section Header */}
        <div id="about" className="flex flex-col md:flex-row justify-between items-start md:items-end pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.25em] text-white/50 mb-3">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span>Selected Dossier // 2024—2026</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-6xl font-medium tracking-tight">
              Selected Works & Accolades
            </h2>
          </div>
          <p className="max-w-md text-xs md:text-sm text-white/60 font-light mt-4 md:mt-0 font-mono">
            Sculptural digital systems engineered for vanguard fashion houses, luxury maisons, and architectural institutions.
          </p>
        </div>

        {/* Projects List */}
        <div className="divide-y divide-white/10">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="group py-10 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/[0.03] transition-colors px-4 -mx-4 rounded-xl cursor-pointer"
            >
              <div className="flex items-baseline space-x-8 mb-4 md:mb-0">
                <span className="font-mono text-sm text-white/40 group-hover:text-amber-300 transition-colors">
                  /{project.id}
                </span>
                <div>
                  <h3 className="font-playfair text-2xl md:text-3xl font-medium group-hover:translate-x-2 transition-transform">
                    {project.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 font-light mt-1">
                    {project.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-6">
                <div className="flex gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-mono text-white/70 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#a9282d] transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Architecture Matrix */}
        <div id="method" className="pt-16 border-t border-white/10 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/50 block mb-2">
              Engineering Foundations
            </span>
            <h3 className="font-playfair text-3xl md:text-4xl font-medium">
              Architectural Constraints & Execution
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECHNICAL_SPECIFICATIONS.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-mono text-sm font-semibold tracking-wide text-white">
                    {spec.title}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    {spec.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer id="contact" className="pt-16 pb-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-white/50 space-y-4 md:space-y-0">
          <div>
            © MMXXVI ALEXANDER VANCE. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center space-x-6 uppercase tracking-wider">
            <span className="text-emerald-400 font-bold">• ZERO-GHOSTING 60FPS</span>
            <span>COLOR CODE: #A9282D</span>
            <span>OPENCV WEBP SUITE</span>
          </div>
        </footer>
      </div>
    </section>
  );
};
