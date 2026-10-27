import React from 'react';
import { CharacterCanvas, ModelType } from './components/CharacterCanvas';
import { FloatingHeader } from './components/FloatingHeader';
import { CustomCursor } from './components/CustomCursor';
import { ScrollPath } from './components/ScrollPath';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import { CertificatesSection } from './components/CertificatesSection';
import { ContactSection } from './components/ContactSection';

export const App: React.FC = () => {
  // Read engine from URL parameter ?engine=v1|v2 with default fallback to fused
  const urlEngine =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('engine')
      : null;
  const activeModel: ModelType =
    urlEngine === 'v1' || urlEngine === 'v2' ? urlEngine : 'fused';

  return (
    <div className="relative min-h-screen bg-[#a9282d] text-white selection:bg-white selection:text-[#a9282d] cursor-none overflow-x-hidden">
      {/* Custom Cursor with touch device auto-disable */}
      <CustomCursor />

      {/* 
        CRITICAL TECHNICAL CONSTRAINT:
        Inviolable background character canvas at z-0 fixed to viewport.
        Continuously tracks cursor across all scroll depths with zero ghosting.
      */}
      <CharacterCanvas activeModel={activeModel} />

      {/* Floating Centered Frosted-Glass Navigation Pill at Top */}
      <FloatingHeader />

      {/* Scrollable Main Content Stream Over Fixed Character Background */}
      <main className="relative z-10 w-full flex flex-col min-h-screen">
        {/* Scroll-driven smooth SVG cubic-Bezier weaving path & traveling node dot */}
        <ScrollPath />

        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <CertificatesSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default App;
