
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: number;
  completedAt?: number;
};

const useTasks = () => {
  // Load tasks from localStorage
  const loadTasks = (): Task[] => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    return [];
  };

  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('activeTaskId');
    } catch (error) {
      console.error('Error loading active task ID:', error);
      return null;
    }
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

  // Save active task ID to localStorage
  useEffect(() => {
    try {
      if (activeTaskId) {
        localStorage.setItem('activeTaskId', activeTaskId);
      } else {
        localStorage.removeItem('activeTaskId');
      }
    } catch (error) {
      console.error('Error saving active task ID:', error);
    }
  }, [activeTaskId]);

  // Add a new task
  const addTask = (title: string, estimatedPomodoros: number = 1) => {
    if (!title.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      estimatedPomodoros,
      completedPomodoros: 0,
      createdAt: Date.now(),
    };
    
    setTasks(prev => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
    
    toast.success('Task added successfully');
  };

  // Update a task
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    
    // If we're deleting the active task, clear the active task ID
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
    
    toast.info('Task deleted');
  };

  // Toggle task completion
  const toggleTaskCompletion = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const isCompleted = !task.completed;
          return {
            ...task,
            completed: isCompleted,
            completedAt: isCompleted ? Date.now() : undefined,
          };
        }
        return task;
      })
    );
  };

  // Increment completed pomodoros for a task
  const incrementTaskPomodoros = (id: string | null = activeTaskId) => {
    if (!id) return;
    
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const newCompletedPomodoros = task.completedPomodoros + 1;
          const isCompleted = newCompletedPomodoros >= task.estimatedPomodoros;

          if (isCompleted && !task.completed) {
            // Task is being auto-completed
            return {
              ...task,
              completedPomodoros: newCompletedPomodoros,
              completed: true,
              completedAt: Date.now(),
            };
          }

          return {
            ...task,
            completedPomodoros: newCompletedPomodoros,
          };
        }
        return task;
      })
    );
  };

  // Set the active task
  const setActiveTask = (id: string | null) => {
    setActiveTaskId(id);
  };

  // Get the active task
  const getActiveTask = (): Task | null => {
    if (!activeTaskId) return null;
    return tasks.find(task => task.id === activeTaskId) || null;
  };

  // Clear completed tasks
  const clearCompletedTasks = () => {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
      toast.info('No completed tasks to clear');
      return;
    }
    
    setTasks(prev => prev.filter(task => !task.completed));
    
    // If the active task was completed and cleared, reset the active task ID
    const activeTask = tasks.find(task => task.id === activeTaskId);
    if (activeTask?.completed) {
      setActiveTaskId(null);
    }
    
    toast.success(`Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`);
  };

  return {
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
  };
};

export default useTasks;
