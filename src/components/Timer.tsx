import React, { useState } from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getBgClass = () => {
    if (isFullscreen) return 'fullscreen-gradient';
    
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Force screen wake lock when entering fullscreen
        try {
          navigator.wakeLock?.request('screen');
        } catch (err) {
          console.error('Wake Lock error:', err);
        }
      }).catch(err => {
        console.error('Error attempting to enable fullscreen mode:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error('Error attempting to exit fullscreen mode:', err);
        });
      }
    }
  };

  // Listen for fullscreen change events (e.g., when user presses Escape)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      {isFullscreen ? (
        <div className={`fixed inset-0 z-50 ${getBgClass()} flex items-center justify-center`}>
          <motion.div 
            className="flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-[12rem] sm:text-[16rem] md:text-[20rem] font-bold text-white tracking-tighter leading-none"
              key={timeString}
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {timeString}
            </motion.div>
            
            <div className="flex space-x-6 mt-8">
              {!isRunning ? (
                <button
                  onClick={onStart}
                  className="p-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Start timer"
                >
                  <Play className="w-10 h-10 fill-white" />
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="p-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Pause timer"
                >
                  <Pause className="w-10 h-10 fill-white" />
                </button>
              )}
              
              <button
                onClick={onReset}
                className="p-6 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-10 h-10" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-6 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                aria-label="Exit fullscreen"
              >
                <Minimize className="w-10 h-10" />
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="w-full rounded-2xl shadow-lg overflow-hidden relative">
          <div className={`w-full p-8 md:p-12 ${getBgClass()}`}>
            <motion.div 
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-8xl md:text-9xl lg:text-[10rem] font-bold text-white my-8 md:my-10 tracking-tighter"
                key={timeString}
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {timeString}
              </motion.div>
              
              <div className="flex space-x-6">
                {!isRunning ? (
                  <button
                    onClick={onStart}
                    className="p-5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                    aria-label="Start timer"
                  >
                    <Play className="w-8 h-8 fill-white" />
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="p-5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                    aria-label="Pause timer"
                  >
                    <Pause className="w-8 h-8 fill-white" />
                  </button>
                )}
                
                <button
                  onClick={onReset}
                  className="p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            aria-label="Enter fullscreen mode"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default Timer;
