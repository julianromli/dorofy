
import React from 'react';
import { Settings, HelpCircle, Clock } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  openHowToUse: () => void;
  toggleLongPomodoro: () => void;
  isLongPomodoro: boolean;
}

const Header: React.FC<HeaderProps> = ({ openHowToUse, toggleLongPomodoro, isLongPomodoro }) => {
  return (
    <header className="w-full flex justify-between items-center px-4 py-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Clock className="w-6 h-6 text-pomodoro" />
        <h1 className="text-xl font-semibold">ZenFocus</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleLongPomodoro}
          className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
            isLongPomodoro 
              ? 'bg-pomodoro/80 text-white'
              : 'bg-mono-200 text-mono-700 dark:bg-mono-700 dark:text-mono-300'
          }`}
          aria-label={isLongPomodoro ? "Switch to 25-minute pomodoro" : "Switch to 50-minute pomodoro"}
        >
          {isLongPomodoro ? '50 min' : '25 min'}
        </button>
        
        <ThemeToggle />
        
        <button
          onClick={openHowToUse}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-mono-200 dark:hover:bg-mono-700 transition-colors"
          aria-label="How to use"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
