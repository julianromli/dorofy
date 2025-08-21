import { useState, useEffect } from 'react';
import { dorofyDB } from '@/lib/indexeddb';

export type PomodoroSession = {
  id: string;
  completedAt: number; // timestamp
  duration: number; // in seconds
  taskId?: string; // optional associated task
};

const usePomodoroHistory = () => {
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        await dorofyDB.init();
        const loadedHistory = await dorofyDB.getPomodoroHistory();
        setHistory(loadedHistory);
      } catch (error) {
        console.error('Error loading pomodoro history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const addPomodoroSession = async (session: Omit<PomodoroSession, 'id' | 'completedAt'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
      completedAt: Date.now(),
    };
    
    try {
      await dorofyDB.addPomodoroSession(newSession);
      setHistory(prev => [newSession, ...prev]);
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
    }
  };

  return {
    history,
    isLoading,
    addPomodoroSession,
  };
};

export default usePomodoroHistory;
