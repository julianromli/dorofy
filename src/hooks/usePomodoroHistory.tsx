import { useState, useEffect } from 'react';

export type PomodoroSession = {
  id: string;
  completedAt: number; // timestamp
  duration: number; // in seconds
  taskId?: string; // optional associated task
};

const usePomodoroHistory = () => {
  const loadHistory = (): PomodoroSession[] => {
    try {
      const savedHistory = localStorage.getItem('pomodoroHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading pomodoro history:', error);
      return [];
    }
  };

  const [history, setHistory] = useState<PomodoroSession[]>(loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving pomodoro history:', error);
    }
  }, [history]);

  const addPomodoroSession = (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
      completedAt: Date.now(),
    };
    setHistory(prev => [newSession, ...prev]);
  };

  return {
    history,
    addPomodoroSession,
  };
};

export default usePomodoroHistory;
