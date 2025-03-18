
import React, { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

interface AddTaskProps {
  onAddTask: (title: string, estimatedPomodoros: number) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onAddTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onAddTask(taskTitle, estimatedPomodoros);
      setTaskTitle('');
      setEstimatedPomodoros(1);
      setIsAdding(false);
    }
  };

  const incrementPomodoros = () => {
    setEstimatedPomodoros(prev => Math.min(prev + 1, 10));
  };

  const decrementPomodoros = () => {
    setEstimatedPomodoros(prev => Math.max(prev - 1, 1));
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center justify-center py-3 mt-4 border-2 border-dashed border-mono-300 dark:border-mono-700 rounded-lg text-mono-500 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors group"
        aria-label="Add task"
      >
        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 animate-scale-in">
      <div className="w-full p-4 bg-white dark:bg-mono-800 rounded-lg shadow-soft transition-all">
        <div className="flex flex-col">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 mb-3 bg-mono-100 dark:bg-mono-700 rounded-md focus:outline-none focus:ring-1 focus:ring-pomodoro dark:focus:ring-pomodoro-light"
            autoFocus
          />
          
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-mono-600 dark:text-mono-400">
              Estimated Pomodoros
            </label>
            
            <div className="flex items-center">
              <button
                type="button"
                onClick={decrementPomodoros}
                className="p-1 text-mono-500 dark:text-mono-400 hover:text-mono-700 dark:hover:text-mono-200"
                aria-label="Reduce pomodoros"
                disabled={estimatedPomodoros <= 1}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <span className="w-8 text-center font-medium">
                {estimatedPomodoros}
              </span>
              
              <button
                type="button"
                onClick={incrementPomodoros}
                className="p-1 text-mono-500 dark:text-mono-400 hover:text-mono-700 dark:hover:text-mono-200"
                aria-label="Add pomodoros"
                disabled={estimatedPomodoros >= 10}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-mono-500 hover:bg-mono-200 dark:hover:bg-mono-700 rounded-md transition-colors"
              aria-label="Cancel"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-pomodoro text-white rounded-md hover:bg-pomodoro-dark transition-colors"
              aria-label="Save task"
              disabled={!taskTitle.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddTask;
