import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, BarChartHorizontal } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  openHowToUse: () => void;
  toggleLongPomodoro: () => void;
  isLongPomodoro: boolean;
  isFullscreen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  openHowToUse, 
  toggleLongPomodoro, 
  isLongPomodoro,
  isFullscreen = false 
}) => {
  if (isFullscreen) return null;

  return (
    <header className="w-full flex justify-between items-center px-4 py-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Clock className="w-6 h-6 text-white" />
        <h1 className="text-xl font-bold text-white">Dorofy</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleLongPomodoro}
          className="px-3 py-1.5 text-sm rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
          aria-label={isLongPomodoro ? "Switch to 25-minute pomodoro" : "Switch to 50-minute pomodoro"}
        >
          {isLongPomodoro ? '50 min' : '25 min'}
        </button>
        
        <ThemeToggle />

        <Link
          to="/analytics"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="View analytics"
        >
          <BarChartHorizontal className="w-5 h-5 text-white/80" />
        </Link>
        
        <button
          onClick={openHowToUse}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          aria-label="How to use"
        >
          <HelpCircle className="w-5 h-5 text-white/80" />
        </button>
      </div>
    </header>
  );
};

export default Header;
