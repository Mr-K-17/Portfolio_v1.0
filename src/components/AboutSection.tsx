import React from 'react';
import { GraduationCap, Award, Compass, Trophy, Users } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative w-full pl-[84px] pr-4 pt-24 pb-28 md:pl-[120px] md:pr-8 lg:px-8 text-white z-10">
      <div className="max-w-[720px] xl:max-w-[800px] 2xl:max-w-[880px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/65 block mb-2">
              Background & Education
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-white">
              About
            </h2>
          </div>
          <p className="max-w-md text-xs md:text-sm text-white/75 font-light mt-4 md:mt-0 font-sans leading-relaxed">
            Computer Science student skilled in full-stack development, Java, React, Spring Boot, and databases, with experience building end-to-end applications.
          </p>
        </div>

        {/* Education Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 block">2023 — 2027</span>
              <h3 className="font-sans text-base font-bold mt-1 text-white">B.E. in Computer Science</h3>
              <p className="text-xs text-white/70 mt-0.5">ATME College of Engineering, Mysuru</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/65">GPA</span>
              <span className="font-bold text-emerald-400">9.0 / 10.0</span>
            </div>
          </div>

          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 block">Pre-University</span>
              <h3 className="font-sans text-base font-bold mt-1 text-white">Pre-University</h3>
              <p className="text-xs text-white/70 mt-0.5">Sadvidya Composite PU College</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/65">Score</span>
              <span className="font-bold text-amber-300">85.83%</span>
            </div>
          </div>

          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 block">Secondary Education</span>
              <h3 className="font-sans text-base font-bold mt-1 text-white">Secondary Education</h3>
              <p className="text-xs text-white/70 mt-0.5">GSSS Bantwal Madhava Shenoy High School</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/65">Score</span>
              <span className="font-bold text-emerald-300">93.44%</span>
            </div>
          </div>
        </div>

        {/* Hackathons & Events */}
        <div className="velvet-card p-6 md:p-8 space-y-6">
          <h3 className="font-sans text-lg font-bold text-white tracking-tight">
            Hackathons & Events
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80 font-sans leading-relaxed">
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Hackathons & Competitions</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-white/70 font-light pt-1">
                <li>Participated in 24-hour Hackathons at JSS and Devnote Bengaluru.</li>
                <li>Participated in TCS TechBytes, CodeHunt, and Technical Treasure Hunt competitions.</li>
              </ul>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center space-x-2 font-bold text-white text-sm">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Workshops & Conferences</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-white/70 font-light pt-1">
                <li>Attended Google DevFest.</li>
                <li>Attended Bengaluru Tech Summit 2025.</li>
                <li>Attended IET Technical Seminar.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
