import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Focus, Orbit, Waves } from 'lucide-react';

import { GlassButton, LiquidGlassSurface } from '@/components/glass';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/useTimer';

interface TimerControlsProps {
  currentMode: TimerMode;
  switchMode: (mode: TimerMode) => void;
}

const modeConfig: Record<
  TimerMode,
  { label: string; icon: typeof Focus; shellClass: string }
> = {
  pomodoro: {
    label: 'Focus',
    icon: Focus,
    shellClass: 'glass-mode-pomodoro',
  },
  shortBreak: {
    label: 'Short Break',
    icon: Coffee,
    shellClass: 'glass-mode-shortBreak',
  },
  longBreak: {
    label: 'Long Break',
    icon: Waves,
    shellClass: 'glass-mode-longBreak',
  },
};

const TimerControls: React.FC<TimerControlsProps> = ({ currentMode, switchMode }) => {
  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-4 flex justify-center">
      <div ref={shellRef} className={modeConfig[currentMode].shellClass}>
        <LiquidGlassSurface
          className="mx-auto w-fit"
          innerClassName="flex items-center gap-1.5 rounded-full"
          mouseContainer={shellRef}
          padding="6px"
          variant="active"
        >
          {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((mode) => {
            const Icon = modeConfig[mode].icon;
            const isActive = mode === currentMode;

            return (
              <div key={mode} className="relative z-0">
                {isActive && (
                  <motion.div
                    layoutId="timer-mode-highlight"
                    className="absolute inset-0 z-[-1] rounded-[1.25rem] border glass-mode-accent"
                    style={{ boxShadow: 'var(--glow-primary), var(--glass-stroke)' }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <GlassButton
                  onClick={() => switchMode(mode)}
                  variant="ghost"
                  size="sm"
                  icon={Icon}
                  className={cn(
                    "relative z-10 transition-colors duration-300",
                    isActive ? 'text-white' : 'text-muted-foreground'
                  )}
                  aria-label={`${modeConfig[mode].label} mode`}
                >
                  {modeConfig[mode].label}
                </GlassButton>
              </div>
            );
          })}

          <div className="hidden sm:flex items-center pr-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Orbit className="mr-1.5 h-3.5 w-3.5" />
            Mode
          </div>
        </LiquidGlassSurface>
      </div>
    </div>
  );
};

export default TimerControls;
