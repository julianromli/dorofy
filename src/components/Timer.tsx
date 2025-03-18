
import React from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion } from 'framer-motion';

interface TimerProps {
  timeString: string;
  mode: TimerMode;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({
  timeString,
  mode,
  isRunning,
  onStart,
  onPause,
  onReset
}) => {
  const getBgColor = () => {
    switch (mode) {
      case 'pomodoro':
        return 'bg-gradient-to-br from-pomodoro to-pomodoro-light dark:from-pomodoro-dark dark:to-pomodoro';
      case 'shortBreak':
        return 'bg-gradient-to-br from-shortbreak to-shortbreak-light dark:from-shortbreak-dark dark:to-shortbreak';
      case 'longBreak':
        return 'bg-gradient-to-br from-longbreak to-longbreak-light dark:from-longbreak-dark dark:to-longbreak';
      default:
        return 'bg-gradient-to-br from-pomodoro to-pomodoro-light';
    }
  };

  return (
    <div className={`w-full rounded-xl p-6 md:p-8 ${getBgColor()} shadow-lg`}>
      <motion.div 
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="text-7xl md:text-8xl font-semibold text-white my-6 md:my-8"
          key={timeString}
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {timeString}
        </motion.div>
        
        <div className="flex space-x-3">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="px-8 py-3 bg-white text-gray-800 font-medium rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300 btn-shine"
              aria-label="Start timer"
            >
              START
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-8 py-3 bg-white text-gray-800 font-medium rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300 btn-shine"
              aria-label="Pause timer"
            >
              PAUSE
            </button>
          )}
          
          <button
            onClick={onReset}
            className="px-4 py-3 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-300"
            aria-label="Reset timer"
          >
            RESET
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Timer;
