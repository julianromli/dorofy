import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useTimer, { TimerState, TimerMode, TimerDurations } from '@/hooks/useTimer';
import useTasks, { Task } from '@/hooks/useTasks';
import usePomodoroHistory, { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { useTheme } from '@/hooks/useTheme';

// Define the shape of the context
interface TimerContextType {
  // from useTimer
  timerState: TimerState;
  timerDurations: TimerDurations;
  switchMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
  isLongPomodoro: boolean;
  toggleLongPomodoro: () => void;

  // from useTasks
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string, estimatedPomodoros?: number) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  incrementTaskPomodoros: (id?: string | null) => void;
  setActiveTask: (id: string | null) => void;
  getActiveTask: () => Task | null;
  clearCompletedTasks: () => void;

  // from usePomodoroHistory
  pomodoroHistory: PomodoroSession[];
  addPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;

  // from useTheme
  theme: string;
  setTheme: (theme: string) => void;

  // local state from Index.tsx
  howToUseOpen: boolean;
  setHowToUseOpen: (open: boolean) => void;
  musicPlayerOpen: boolean;
  setMusicPlayerOpen: (open: boolean) => void;
  backgroundCustomizerOpen: boolean;
  setBackgroundCustomizerOpen: (open: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
}

// Create the context with a placeholder default value
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Define the provider component
export const TimerProvider = ({ children }: { children: ReactNode }) => {
  // All the state and logic from Index.tsx will go here
  const [isLongPomodoro, setIsLongPomodoro] = useState(() => {
    try {
      return localStorage.getItem('isLongPomodoro') === 'true';
    } catch { return false; }
  });

  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);
  const [backgroundCustomizerOpen, setBackgroundCustomizerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { theme, setTheme } = useTheme();

  const {
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    incrementTaskPomodoros,
    setActiveTask,
    getActiveTask,
    clearCompletedTasks,
  } = useTasks();

  const { history: pomodoroHistory, addPomodoroSession } = usePomodoroHistory();

  function handlePomodoroComplete(duration: number) {
    if (activeTaskId) {
      incrementTaskPomodoros(activeTaskId);
    }
    addPomodoroSession({ duration, taskId: activeTaskId || undefined });
  }

  const {
    timerState,
    timerDurations,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  } = useTimer(isLongPomodoro, handlePomodoroComplete);

  const toggleLongPomodoro = () => {
    setIsLongPomodoro(!isLongPomodoro);
  };

  // Set dark mode by default
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  // Save long pomodoro preference
  useEffect(() => {
    localStorage.setItem('isLongPomodoro', isLongPomodoro.toString());
  }, [isLongPomodoro]);

  // The value that will be supplied to any descendants of this provider
  const value = {
    timerState,
    timerDurations,
    switchMode,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    isLongPomodoro,
    toggleLongPomodoro,
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    incrementTaskPomodoros,
    setActiveTask,
    getActiveTask,
    clearCompletedTasks,
    pomodoroHistory,
    addPomodoroSession,
    theme,
    setTheme,
    howToUseOpen,
    setHowToUseOpen,
    musicPlayerOpen,
    setMusicPlayerOpen,
    backgroundCustomizerOpen,
    setBackgroundCustomizerOpen,
    isFullscreen,
    setIsFullscreen,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

// Custom hook to use the TimerContext
export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};
