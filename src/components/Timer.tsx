import React, { useState, useEffect } from 'react';
import { TimerMode } from '@/hooks/useTimer';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Maximize, Minimize } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const getBgClass = () => {
    if (isFullscreen) {
      if (theme === 'dark') {
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
      } else {
        // For light theme in fullscreen
        return 'fullscreen-gradient';
      }
    }
    
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

  const getHeaderText = () => {
    switch (mode) {
      case 'pomodoro':
        return 'Time to focus!';
      case 'shortBreak':
        return 'Take a quick break!';
      case 'longBreak':
        return 'Time for a long break!';
      default:
        return 'Time to focus!';
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
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
  useEffect(() => {
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
        <div className={`fullscreen-mode ${getBgClass()}`}>
          <motion.div 
            className="flex flex-col items-center justify-center p-4 md:p-8 text-center w-full max-w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-white/80 text-xl md:text-3xl font-medium mb-4 md:mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              key={`header-${mode}`}
            >
              {getHeaderText()}
            </motion.h2>
            
            <motion.div 
              className={`${isMobile ? 'text-[5rem] md:text-[8rem] lg:text-[14rem]' : 'fullscreen-timer'} font-bold text-white tracking-tight`}
              key={timeString}
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {timeString}
            </motion.div>
            
            <div className="flex space-x-3 md:space-x-6 mt-6">
              {!isRunning ? (
                <button
                  onClick={onStart}
                  className="p-3 md:p-5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Start timer"
                >
                  <Play className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} fill-white`} />
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="p-3 md:p-5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
                  aria-label="Pause timer"
                >
                  <Pause className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} fill-white`} />
                </button>
              )}
              
              <button
                onClick={onReset}
                className="p-3 md:p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                aria-label="Reset timer"
              >
                <RotateCcw className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-3 md:p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                aria-label="Exit fullscreen"
              >
                <Minimize className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              </button>
            </div>
            
            <motion.p 
              className="text-white/60 text-base md:text-xl mt-6 md:mt-12 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Bottom Text */}
            </motion.p>
          </motion.div>
        </div>
      ) : (
        <div className="w-full rounded-2xl shadow-lg overflow-hidden relative">
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
          
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            aria-label="Enter fullscreen mode"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default Timer;