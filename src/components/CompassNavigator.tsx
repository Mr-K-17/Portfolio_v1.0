import React from 'react';
import { Compass, Focus } from 'lucide-react';

interface CompassNavigatorProps {
  currentHeading: string;
  isEyeContact: boolean;
}

const DIRECTIONS = [
  { label: 'NW', heading: 'UP-LEFT', angle: 225 },
  { label: 'N', heading: 'UP', angle: 270 },
  { label: 'NE', heading: 'UP-RIGHT', angle: 315 },
  { label: 'W', heading: 'LEFT', angle: 180 },
  { label: 'CENTER', heading: 'CENTER [DIRECT GAZE]', angle: -1 },
  { label: 'E', heading: 'RIGHT', angle: 0 },
  { label: 'SW', heading: 'DOWN-LEFT', angle: 135 },
  { label: 'S', heading: 'DOWN', angle: 90 },
  { label: 'SE', heading: 'DOWN-RIGHT', angle: 45 },
];

export const CompassNavigator: React.FC<CompassNavigatorProps> = ({
  currentHeading,
  isEyeContact,
}) => {
  const triggerPosition = (angle: number) => {
    // Dispatch simulated mouse move event to let user test without a physical mouse
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.43;

    let targetX = cx;
    let targetY = cy;

    if (angle >= 0) {
      const rad = (angle * Math.PI) / 180;
      const distance = Math.min(window.innerWidth, window.innerHeight) * 0.35;
      targetX = cx + Math.cos(rad) * distance;
      targetY = cy + Math.sin(rad) * distance;
    }

    const event = new MouseEvent('mousemove', {
      clientX: targetX,
      clientY: targetY,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 pointer-events-auto">
      <div className="p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2">
          <Compass className="w-3 h-3" />
          <span>Compass Guide</span>
        </div>

        {/* 3x3 Grid for 8 compass directions + center */}
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
          {DIRECTIONS.map((dir) => {
            const isCenter = dir.angle === -1;
            const isActive = isCenter
              ? isEyeContact
              : currentHeading === dir.heading && !isEyeContact;

            return (
              <button
                key={dir.label}
                onClick={() => triggerPosition(dir.angle)}
                title={`Look ${dir.heading}`}
                className={`flex items-center justify-center rounded-lg text-[9px] font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#a9282d] font-bold shadow-md shadow-white/20 scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {isCenter ? <Focus className="w-3.5 h-3.5" /> : dir.label}
              </button>
            );
          })}
        </div>

        <span className="text-[8px] font-mono text-white/40 mt-1.5 uppercase tracking-wider">
          Click any point to test
        </span>
      </div>
    </div>
  );
};
