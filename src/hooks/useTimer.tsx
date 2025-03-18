
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type TimerDurations = {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
};

type TimerState = {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  totalPomodoros: number;
  completedPomodoros: number;
};

const defaultTimerDurations: TimerDurations = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

const useTimer = (longPomodoro: boolean = false) => {
  // Adjust durations based on the pomodoro preference
  const durationMultiplier = longPomodoro ? 2 : 1;
  
  const [timerDurations, setTimerDurations] = useState<TimerDurations>({
    pomodoro: defaultTimerDurations.pomodoro * durationMultiplier,
    shortBreak: defaultTimerDurations.shortBreak * durationMultiplier,
    longBreak: defaultTimerDurations.longBreak
  });
  
  // Try to load timer state from localStorage
  const loadTimerState = (): TimerState => {
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
    
    return {
      mode: 'pomodoro',
      timeLeft: timerDurations.pomodoro,
      isRunning: false,
      totalPomodoros: 0,
      completedPomodoros: 0
    };
  };

  const [timerState, setTimerState] = useState<TimerState>(loadTimerState);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ensure timer state is saved to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('timerState', JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, [timerState]);

  // Set up audio for timer completion
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerState(prev => {
          // If time is up
          if (prev.timeLeft <= 1) {
            clearInterval(intervalRef.current!);
            
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error('Error playing sound:', e));
            }
            
            let nextMode: TimerMode = prev.mode;
            let nextTimeLeft = 0;
            let completedPomos = prev.completedPomodoros;
            
            // Switch to the next mode
            if (prev.mode === 'pomodoro') {
              completedPomos += 1;
              
              // After 4 pomodoros, take a long break
              if (completedPomos % 4 === 0) {
                nextMode = 'longBreak';
                nextTimeLeft = timerDurations.longBreak;
                toast.success('Great job! Time for a long break.');
              } else {
                nextMode = 'shortBreak';
                nextTimeLeft = timerDurations.shortBreak;
                toast.success('Pomodoro completed! Take a short break.');
              }
            } else {
              // After a break, go back to pomodoro
              nextMode = 'pomodoro';
              nextTimeLeft = timerDurations.pomodoro;
              
              if (prev.mode === 'shortBreak') {
                toast.info('Break finished. Ready for your next focus session?');
              } else {
                toast.info('Long break finished. Ready to get back to work?');
              }
            }
            
            return {
              ...prev,
              isRunning: false,
              mode: nextMode,
              timeLeft: nextTimeLeft,
              completedPomodoros: completedPomos
            };
          }
          
          // Just decrement time
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, timerDurations]);

  // Switch timer mode
  const switchMode = (mode: TimerMode) => {
    // Stop the timer if it's running
    if (timerState.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    let timeLeft;
    switch (mode) {
      case 'pomodoro':
        timeLeft = timerDurations.pomodoro;
        break;
      case 'shortBreak':
        timeLeft = timerDurations.shortBreak;
        break;
      case 'longBreak':
        timeLeft = timerDurations.longBreak;
        break;
      default:
        timeLeft = timerDurations.pomodoro;
    }
    
    setTimerState({
      ...timerState,
      mode,
      timeLeft,
      isRunning: false
    });
  };

  // Start the timer
  const startTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true
    }));
  };

  // Pause the timer
  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }));
  };

  // Reset the timer
  const resetTimer = () => {
    let timeLeft;
    switch (timerState.mode) {
      case 'pomodoro':
        timeLeft = timerDurations.pomodoro;
        break;
      case 'shortBreak':
        timeLeft = timerDurations.shortBreak;
        break;
      case 'longBreak':
        timeLeft = timerDurations.longBreak;
        break;
      default:
        timeLeft = timerDurations.pomodoro;
    }
    
    setTimerState(prev => ({
      ...prev,
      timeLeft,
      isRunning: false
    }));
  };

  // Update timer durations
  const updateTimerDurations = (durations: Partial<TimerDurations>) => {
    setTimerDurations(prev => ({ ...prev, ...durations }));
    
    // Update current timeLeft if needed
    setTimerState(prev => {
      let newTimeLeft = prev.timeLeft;
      
      if (prev.mode === 'pomodoro' && durations.pomodoro) {
        newTimeLeft = durations.pomodoro;
      } else if (prev.mode === 'shortBreak' && durations.shortBreak) {
        newTimeLeft = durations.shortBreak;
      } else if (prev.mode === 'longBreak' && durations.longBreak) {
        newTimeLeft = durations.longBreak;
      }
      
      return {
        ...prev,
        timeLeft: newTimeLeft,
        isRunning: false
      };
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timerState,
    timerDurations,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTimerDurations,
    formatTime,
  };
};

export default useTimer;
