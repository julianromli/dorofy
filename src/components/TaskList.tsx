
import React, { useState } from 'react';
import { CheckCircle, Circle, Trash2, MoreVertical, Edit, CheckCheck } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onToggleComplete: (id: string) => void;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onToggleComplete,
  onSetActive,
  onDelete,
  onClearCompleted
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const handleMenuToggle = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };
  
  const completedTasks = tasks.filter(task => task.completed);
  const activeTasks = tasks.filter(task => !task.completed);
  
  if (tasks.length === 0) {
    return (
      <div className="mt-6 p-6 text-center border border-mono-200 dark:border-mono-700 rounded-lg">
        <p className="text-mono-500 dark:text-mono-400">No tasks yet. Add your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {/* Active Tasks */}
      <div className="space-y-2">
        {activeTasks.map(task => (
          <div
            key={task.id}
            className={`relative group p-4 rounded-lg transition-all duration-300 ${
              task.id === activeTaskId
                ? 'bg-mono-100 dark:bg-mono-800 shadow-soft'
                : 'bg-white dark:bg-mono-900 hover:bg-mono-50 dark:hover:bg-mono-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex items-start cursor-pointer flex-1"
                onClick={() => onSetActive(task.id)}
              >
                <button
                  className="mt-1 mr-3 text-mono-400 hover:text-pomodoro dark:text-mono-500 dark:hover:text-pomodoro-light transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    task.completed ? 'text-mono-400 line-through' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  <div className="mt-1 text-xs text-mono-500 dark:text-mono-400">
                    {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => handleMenuToggle(task.id)}
                  className="p-1 text-mono-400 hover:text-mono-600 dark:hover:text-mono-300 rounded-full hover:bg-mono-200 dark:hover:bg-mono-700 transition-colors"
                  aria-label="Task options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {openMenuId === task.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-mono-800 rounded-md shadow-md py-1 z-10">
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center text-red-500 hover:bg-mono-100 dark:hover:bg-mono-700"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-mono-500 dark:text-mono-400">
              Completed ({completedTasks.length})
            </h3>
            
            <button
              onClick={onClearCompleted}
              className="text-xs text-mono-500 hover:text-mono-700 dark:text-mono-400 dark:hover:text-mono-200 flex items-center"
              aria-label="Clear all completed tasks"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="group p-4 rounded-lg bg-white dark:bg-mono-900 hover:bg-mono-50 dark:hover:bg-mono-800 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <button
                      className="mt-1 mr-3 text-pomodoro dark:text-pomodoro-light hover:text-pomodoro-dark transition-colors"
                      onClick={() => onToggleComplete(task.id)}
                      aria-label="Mark as incomplete"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    
                    <div>
                      <h3 className="font-medium text-mono-400 line-through">
                        {task.title}
                      </h3>
                      
                      <div className="mt-1 text-xs text-mono-400">
                        {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-mono-400 hover:text-red-500 rounded-full hover:bg-mono-200 dark:hover:bg-mono-700 transition-all"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
