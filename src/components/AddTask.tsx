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
        className="w-full flex items-center justify-center py-3 mt-4 border-2 border-dashed border-white/20 rounded-lg text-white/70 hover:bg-black/30 hover:text-white backdrop-blur-sm transition-colors group"
        aria-label="Add task"
      >
        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 animate-scale-in">
      <div className="w-full p-4 bg-black/50 backdrop-blur-md rounded-lg shadow-lg border border-white/10 transition-all">
        <div className="flex flex-col">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-3 py-2 mb-3 bg-black/50 border border-white/10 text-white placeholder-white/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-white/70">
              Estimated Pomodoros
            </label>
            
            <div className="flex items-center">
              <button
                type="button"
                onClick={decrementPomodoros}
                className="p-1 text-white/60 hover:text-white"
                aria-label="Reduce pomodoros"
                disabled={estimatedPomodoros <= 1}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <span className="w-8 text-center font-medium text-white">
                {estimatedPomodoros}
              </span>
              
              <button
                type="button"
                onClick={incrementPomodoros}
                className="p-1 text-white/60 hover:text-white"
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
              className="px-4 py-2 text-white/70 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Cancel"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
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
