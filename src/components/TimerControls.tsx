import React from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerControlsProps {
  currentMode: TimerMode;
  switchMode: (mode: TimerMode) => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ currentMode, switchMode }) => {
  return (
    <div className="w-full flex justify-center p-2 mb-4">
      <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md p-1 rounded-full shadow-md border border-white/10">
        <div className="relative">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-5 py-2 z-10 relative rounded-full text-sm font-medium transition-colors duration-200 ${
              currentMode === 'pomodoro' 
                ? 'text-white font-semibold' 
                : 'text-white/40 hover:text-white/80'
            }`}
            aria-label="Pomodoro mode"
          >
            Focus
          </button>
          <AnimatePresence initial={false}>
            {currentMode === 'pomodoro' && (
              <motion.div
                className="absolute inset-0 bg-pomodoro dark:bg-pomodoro rounded-full shadow-md"
                layoutId="activeBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  duration: 0.3 
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-5 py-2 z-10 relative rounded-full text-sm font-medium transition-colors duration-200 ${
              currentMode === 'shortBreak' 
                ? 'text-white font-semibold' 
                : 'text-white/40 hover:text-white/80'
            }`}
            aria-label="Short break mode"
          >
            Short Break
          </button>
          <AnimatePresence initial={false}>
            {currentMode === 'shortBreak' && (
              <motion.div
                className="absolute inset-0 bg-shortbreak dark:bg-shortbreak rounded-full shadow-md"
                layoutId="activeBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  duration: 0.3 
                }}
              />
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative">
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-5 py-2 z-10 relative rounded-full text-sm font-medium transition-colors duration-200 ${
              currentMode === 'longBreak' 
                ? 'text-white font-semibold' 
                : 'text-white/40 hover:text-white/80'
            }`}
            aria-label="Long break mode"
          >
            Long Break
          </button>
          <AnimatePresence initial={false}>
            {currentMode === 'longBreak' && (
              <motion.div
                className="absolute inset-0 bg-longbreak dark:bg-longbreak rounded-full shadow-md"
                layoutId="activeBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  duration: 0.3 
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TimerControls;
