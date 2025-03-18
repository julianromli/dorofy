
import React from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  currentMode: TimerMode;
  switchMode: (mode: TimerMode) => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ currentMode, switchMode }) => {
  return (
    <div className="w-full flex justify-center p-2 mb-4">
      <div className="flex space-x-2 bg-mono-200/60 dark:bg-mono-800/60 p-1 rounded-lg">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            currentMode === 'pomodoro' 
              ? 'text-white' 
              : 'text-mono-700 dark:text-mono-300 hover:bg-mono-300/50 dark:hover:bg-mono-700/50'
          }`}
          aria-label="Pomodoro mode"
        >
          {currentMode === 'pomodoro' && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 bg-pomodoro dark:bg-pomodoro-dark rounded-md -z-10"
              initial={false}
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          Pomodoro
        </button>
        
        <button
          onClick={() => switchMode('shortBreak')}
          className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            currentMode === 'shortBreak' 
              ? 'text-white' 
              : 'text-mono-700 dark:text-mono-300 hover:bg-mono-300/50 dark:hover:bg-mono-700/50'
          }`}
          aria-label="Short break mode"
        >
          {currentMode === 'shortBreak' && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 bg-shortbreak dark:bg-shortbreak-dark rounded-md -z-10"
              initial={false}
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          Short Break
        </button>
        
        <button
          onClick={() => switchMode('longBreak')}
          className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            currentMode === 'longBreak' 
              ? 'text-white' 
              : 'text-mono-700 dark:text-mono-300 hover:bg-mono-300/50 dark:hover:bg-mono-700/50'
          }`}
          aria-label="Long break mode"
        >
          {currentMode === 'longBreak' && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 bg-longbreak dark:bg-longbreak-dark rounded-md -z-10"
              initial={false}
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          Long Break
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
