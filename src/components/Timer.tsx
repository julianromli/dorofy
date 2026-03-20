import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { GlassBadge, GlassButton, LiquidGlassSurface } from '@/components/glass';
import { TimerMode } from '@/hooks/useTimer';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimerProps {
  timeString: string;
  mode: TimerMode;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const modeCopy: Record<TimerMode, { title: string; subtitle: string; shellClass: string; badge: string }> = {
  pomodoro: {
    title: 'Deep focus in progress',
    subtitle: 'Single-task, calm, and uninterrupted.',
    shellClass: 'glass-mode-pomodoro',
    badge: 'Focus',
  },
  shortBreak: {
    title: 'Reset in a few quiet minutes',
    subtitle: 'Step away, breathe, and let the session settle.',
    shellClass: 'glass-mode-shortBreak',
    badge: 'Short Break',
  },
  longBreak: {
    title: 'Longer recovery window',
    subtitle: 'Recharge properly before the next block.',
    shellClass: 'glass-mode-longBreak',
    badge: 'Long Break',
  },
};

const Timer: React.FC<TimerProps> = ({
  timeString,
  mode,
  isRunning,
  onStart,
  onPause,
  onReset,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setTimeout(() => {
            const event = new CustomEvent('dorofyFullscreenChanged', {
              detail: { isFullscreen: true },
            });
            document.dispatchEvent(event);
          }, 100);
        })
        .catch((error) => {
          console.error('Error attempting to enable fullscreen mode:', error);
        });
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          setTimeout(() => {
            const event = new CustomEvent('dorofyFullscreenChanged', {
              detail: { isFullscreen: false },
            });
            document.dispatchEvent(event);
          }, 100);
        })
        .catch((error) => {
          console.error('Error attempting to exit fullscreen mode:', error);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      const event = new CustomEvent('dorofyFullscreenChanged', {
        detail: { isFullscreen: active },
      });
      document.dispatchEvent(event);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isFullscreen) {
    return (
      <div className={`fullscreen-mode ${modeCopy[mode].shellClass}`}>
        <motion.div
          className="w-full max-w-5xl px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="glass-panel glass-panel-hero rounded-[2rem] px-6 py-8 md:px-10 md:py-12">
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <GlassBadge className="glass-mode-accent text-white">{modeCopy[mode].badge}</GlassBadge>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{modeCopy[mode].title}</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{modeCopy[mode].subtitle}</p>
              </div>
            </div>

            <motion.div
              className={`${isMobile ? 'text-[5rem] md:text-[8rem] lg:text-[14rem]' : 'fullscreen-timer'} text-center text-foreground`}
              key={timeString}
              initial={{ opacity: 0.8, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {timeString}
            </motion.div>

            <div className="mt-8 flex justify-center md:mt-10">
              <LiquidGlassSurface
                className="mx-auto w-fit"
                innerClassName="flex items-center gap-1.5 rounded-full"
                padding="6px"
                variant="active"
              >
                <div className="relative z-0">
                  <motion.div
                    className="absolute inset-0 z-[-1] rounded-[1.25rem] border glass-mode-accent"
                    style={{ boxShadow: 'var(--glow-primary), var(--glass-stroke)' }}
                    initial={false}
                  />
                  {!isRunning ? (
                    <GlassButton onClick={onStart} variant="ghost" size="md" icon={Play} className="relative z-10 text-white" aria-label="Start timer">
                      Start focus
                    </GlassButton>
                  ) : (
                    <GlassButton onClick={onPause} variant="ghost" size="md" icon={Pause} className="relative z-10 text-white" aria-label="Pause timer">
                      Pause
                    </GlassButton>
                  )}
                </div>

                <GlassButton onClick={onReset} variant="ghost" size="md" icon={RotateCcw} className="text-muted-foreground hover:text-foreground" aria-label="Reset timer">
                  Reset
                </GlassButton>

                <div className="mx-2 h-4 w-px bg-white/10" />

                <GlassButton onClick={toggleFullscreen} variant="ghost" size="icon" icon={Minimize} className="text-muted-foreground hover:text-foreground" aria-label="Exit fullscreen" />
              </LiquidGlassSurface>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={heroRef} className={modeCopy[mode].shellClass}>
      <LiquidGlassSurface
        className="w-full"
        innerClassName="relative"
        mouseContainer={heroRef}
        padding="28px"
        variant="hero"
      >
        <div className="glass-mode-accent absolute right-0 top-0 h-32 w-32 rounded-full opacity-20 blur-3xl" />

        <div className="flex flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <GlassBadge className="glass-mode-accent text-white">{modeCopy[mode].badge}</GlassBadge>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{modeCopy[mode].title}</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{modeCopy[mode].subtitle}</p>
              </div>
            </div>

            <GlassButton
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              icon={Maximize}
              className="shrink-0"
              aria-label="Enter fullscreen mode"
            />
          </div>

          <motion.div
            className="text-center"
            key={timeString}
            initial={{ opacity: 0.82, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground glass-chip">
              <Sparkles className="h-3.5 w-3.5" />
              Session
            </div>
            <div className="text-[4.8rem] font-extrabold tracking-[-0.08em] text-foreground sm:text-[5.8rem] md:text-[6.7rem]">
              {timeString}
            </div>
          </motion.div>

          <div className="flex justify-center">
            <LiquidGlassSurface
              className="mx-auto w-fit"
              innerClassName="flex items-center gap-1.5 rounded-full"
              mouseContainer={heroRef}
              padding="6px"
              variant="active"
            >
              <div className="relative z-0">
                <motion.div
                  className="absolute inset-0 z-[-1] rounded-[1.25rem] border glass-mode-accent"
                  style={{ boxShadow: 'var(--glow-primary), var(--glass-stroke)' }}
                  initial={false}
                />
                {!isRunning ? (
                  <GlassButton onClick={onStart} variant="ghost" size="md" icon={Play} className="relative z-10 text-white" aria-label="Start timer">
                    Start focus
                  </GlassButton>
                ) : (
                  <GlassButton onClick={onPause} variant="ghost" size="md" icon={Pause} className="relative z-10 text-white" aria-label="Pause timer">
                    Pause
                  </GlassButton>
                )}
              </div>

              <GlassButton onClick={onReset} variant="ghost" size="md" icon={RotateCcw} className="text-muted-foreground hover:text-foreground" aria-label="Reset timer">
                Reset
              </GlassButton>
            </LiquidGlassSurface>
          </div>
        </div>
      </LiquidGlassSurface>
    </div>
  );
};

export default Timer;
