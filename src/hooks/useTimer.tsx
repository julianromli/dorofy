
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

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

// Alarm sound URL
const ALARM_SOUND_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3';

const useTimer = (isLongPomodoro: boolean = false) => {
  const { theme } = useTheme();
  
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
    // Pre-load the audio
    if (!audioRef.current) {
      audioRef.current = new Audio(ALARM_SOUND_URL);
      
      // Add event listener for error handling
      audioRef.current.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        toast.error('Could not load alarm sound. Please check your internet connection.');
      });
      
      // Try to preload the audio
      audioRef.current.load();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title: string, body: string) => {
    // Desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      // Close any existing notifications
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      }
      
      // Create a new notification
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
    }
    
    // In-app toast notification (with the correct theme)
    toast(title, {
      description: body,
      duration: 5000,
    });
  };

  const playAlarmSound = () => {
    if (audioRef.current) {
      // Reset the audio to the beginning to ensure it plays
      audioRef.current.currentTime = 0;
      
      // Set volume to 80%
      audioRef.current.volume = 0.8;
      
      // Try to play the sound
      const playPromise = audioRef.current.play();
      
      // Handle play promise to avoid uncaught promise errors
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error('Error playing sound:', e);
          
          // Create a user interaction event to play audio later
          const handleUserInteraction = () => {
            if (audioRef.current) {
              audioRef.current.play().catch(err => 
                console.error('Still cannot play audio after user interaction:', err)
              );
            }
            
            // Remove the event listeners after trying once
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
          };
          
          // Add event listeners for user interaction
          document.addEventListener('click', handleUserInteraction, { once: true });
          document.addEventListener('keydown', handleUserInteraction, { once: true });
          
          // Let the user know they need to interact with the page
          toast.info('Click anywhere to enable alarm sounds', {
            duration: 3000,
          });
        });
      }
    }
  };

  // Handle timer countdown
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerState(prev => {
          // If time is up
          if (prev.timeLeft <= 1) {
            clearInterval(intervalRef.current!);
            
            // Play alarm sound
            playAlarmSound();
            
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
                showNotification(
                  'Great job! Time for a long break.',
                  `You've completed ${completedPomos} pomodoros. Take a well-deserved ${Math.floor(timerDurations.longBreak / 60)} minute break.`
                );
              } else {
                nextMode = 'shortBreak';
                nextTimeLeft = timerDurations.shortBreak;
                showNotification(
                  'Pomodoro completed!',
                  `Take a ${Math.floor(timerDurations.shortBreak / 60)} minute break before your next focus session.`
                );
              }
            } else {
              // After a break, go back to pomodoro
              nextMode = 'pomodoro';
              nextTimeLeft = timerDurations.pomodoro;
              
              if (prev.mode === 'shortBreak') {
                showNotification(
                  'Break finished',
                  'Ready for your next focus session?'
                );
              } else {
                showNotification(
                  'Long break finished',
                  'Ready to get back to work?'
                );
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
