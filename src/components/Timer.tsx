
import React from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
  const getBgClass = () => {
    switch (mode) {
      case 'pomodoro':
        return 'pomodoro-gradient';
      case 'shortBreak':
        return 'shortbreak-gradient';
      case 'longBreak':
        return 'longbreak-gradient';
      default:
        return 'pomodoro-gradient';
    }
  };

  return (
    <div className="w-full rounded-2xl shadow-lg overflow-hidden">
      <div className={`w-full p-6 md:p-8 ${getBgClass()}`}>
        <motion.div 
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-7xl md:text-8xl font-bold text-white my-6 md:my-8 tracking-tight"
            key={timeString}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {timeString}
          </motion.div>
          
          <div className="flex space-x-4">
            {!isRunning ? (
              <button
                onClick={onStart}
                className="p-4 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                aria-label="Start timer"
              >
                <Play className="w-6 h-6 fill-white" />
              </button>
            ) : (
              <button
                onClick={onPause}
                className="p-4 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                aria-label="Pause timer"
              >
                <Pause className="w-6 h-6 fill-white" />
              </button>
            )}
            
            <button
              onClick={onReset}
              className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Timer;
