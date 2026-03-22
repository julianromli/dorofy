import React from 'react';
import { BarChartHorizontal, Clock3, HelpCircle, MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';

import { GlassButton } from '@/components/glass';

interface HeaderProps {
  openHowToUse: () => void;
  toggleLongPomodoro: () => void;
  isLongPomodoro: boolean;
  onAnalyticsClick?: () => void;
  isFullscreen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  openHowToUse,
  toggleLongPomodoro,
  isLongPomodoro,
  onAnalyticsClick,
  isFullscreen = false,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    if (onAnalyticsClick) {
      onAnalyticsClick();
      return;
    }

    navigate('/analytics');
  };

  if (isFullscreen) return null;

  return (
    <header className="animate-fade-in">
      <div className="glass-panel glass-panel-dense rounded-[1.9rem] px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-floating-button flex h-12 w-12 items-center justify-center rounded-[1.2rem]">
              <Clock3 className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Dorofy</h1>
              <p className="text-sm text-muted-foreground">Liquid glass focus companion</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              onClick={toggleLongPomodoro}
              variant={isLongPomodoro ? 'active' : 'default'}
              size="sm"
              className={isLongPomodoro ? 'glass-mode-accent text-white' : ''}
              aria-label={isLongPomodoro ? 'Switch to 25-minute pomodoro' : 'Switch to 50-minute pomodoro'}
            >
              {isLongPomodoro ? '50 min focus' : '25 min focus'}
            </GlassButton>

            <GlassButton
              onClick={handleAnalyticsClick}
              variant="ghost"
              size="icon"
              icon={BarChartHorizontal}
              aria-label="View analytics"
            />

            <GlassButton
              onClick={openHowToUse}
              variant="ghost"
              size="icon"
              icon={HelpCircle}
              aria-label="How to use"
            />

            <GlassButton
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              variant="ghost"
              size="icon"
              icon={resolvedTheme === 'dark' ? SunMedium : MoonStar}
              aria-label="Toggle theme"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
