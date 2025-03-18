
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

const getTimerDurations = (isLongPomodoro: boolean): TimerDurations => {
  return {
    pomodoro: isLongPomodoro ? 50 * 60 : 25 * 60, // 25 or 50 minutes
    shortBreak: isLongPomodoro ? 10 * 60 : 5 * 60, // 5 or 10 minutes
    longBreak: isLongPomodoro ? 25 * 60 : 15 * 60, // 15 or 25 minutes
  };
};

const useTimer = (isLongPomodoro: boolean = false) => {
  // Get appropriate timer durations based on the pomodoro preference
  const [timerDurations, setTimerDurations] = useState<TimerDurations>(getTimerDurations(isLongPomodoro));
  
  // Try to load timer state from localStorage
  const loadTimerState = (): TimerState => {
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        return {
          ...parsedState,
          timeLeft: timerDurations[parsedState.mode as TimerMode] // Reset timeLeft based on current duration
        };
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

  // Update timer durations when isLongPomodoro changes
  useEffect(() => {
    const newDurations = getTimerDurations(isLongPomodoro);
    setTimerDurations(newDurations);
    
    // Update timeLeft based on current mode
    setTimerState(prev => ({
      ...prev,
      timeLeft: newDurations[prev.mode],
      isRunning: false // Stop timer when changing duration
    }));
    
    // Clear interval if running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isLongPomodoro]);

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
    
    setTimerState({
      ...timerState,
      mode,
      timeLeft: timerDurations[mode],
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
    setTimerState(prev => ({
      ...prev,
      timeLeft: timerDurations[prev.mode],
      isRunning: false
    }));
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
    formatTime,
  };
};

export default useTimer;
