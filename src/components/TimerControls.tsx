import React, { useRef } from 'react';
import { Coffee, Focus, Orbit, Waves } from 'lucide-react';

import { GlassButton, LiquidGlassSurface } from '@/components/glass';
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
              <GlassButton
                key={mode}
                onClick={() => switchMode(mode)}
                variant={isActive ? 'active' : 'ghost'}
                size="sm"
                icon={Icon}
                className={isActive ? 'glass-mode-accent text-white shadow-(--glow-primary)' : 'text-muted-foreground'}
                aria-label={`${modeConfig[mode].label} mode`}
              >
                {modeConfig[mode].label}
              </GlassButton>
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
