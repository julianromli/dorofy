
import React from 'react';
import { Clock, HelpCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Switch } from "@/components/ui/switch";

interface HeaderProps {
  openHowToUse: () => void;
  toggleLongPomodoro: () => void;
  isLongPomodoro: boolean;
}

const Header: React.FC<HeaderProps> = ({ openHowToUse, toggleLongPomodoro, isLongPomodoro }) => {
  return (
    <header className="w-full flex justify-between items-center px-4 py-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Clock className="w-6 h-6 text-white" />
        <h1 className="text-xl font-semibold text-white">ZenFocus</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/80">
            {isLongPomodoro ? '50 min' : '25 min'}
          </span>
          <Switch
            checked={isLongPomodoro}
            onCheckedChange={toggleLongPomodoro}
            className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/20"
            aria-label={isLongPomodoro ? "Switch to 25-minute pomodoro" : "Switch to 50-minute pomodoro"}
          />
        </div>
        
        <ThemeToggle />
        
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
