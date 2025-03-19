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
      <div className="mt-6 p-6 text-center border border-white/10 rounded-lg bg-black/40 backdrop-blur-md shadow-lg text-white">
        <p className="text-white/70">No tasks yet. Add your first task to get started!</p>
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
            className={`relative group p-4 rounded-lg backdrop-blur-md transition-all duration-300 ${
              task.id === activeTaskId
                ? 'bg-black/60 border border-white/20 shadow-lg'
                : 'bg-black/40 border border-white/10 hover:bg-black/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex items-start cursor-pointer flex-1"
                onClick={() => onSetActive(task.id)}
              >
                <button
                  className="mt-1 mr-3 text-white/60 hover:text-primary dark:hover:text-primary transition-colors"
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
                  <h3 className={`font-medium text-white ${
                    task.completed ? 'text-white/50 line-through' : ''
                  }`}>
                    {task.title}
                  </h3>
                  
                  <div className="mt-1 text-xs text-white/60">
                    {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => handleMenuToggle(task.id)}
                  className="p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Task options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {openMenuId === task.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-black/80 backdrop-blur-md rounded-md shadow-md py-1 z-10 border border-white/10">
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center text-red-400 hover:bg-black/60"
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
            <h3 className="text-sm font-medium text-white/70">
              Completed ({completedTasks.length})
            </h3>
            
            <button
              onClick={onClearCompleted}
              className="text-xs text-white/60 hover:text-white flex items-center"
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
                className="group p-4 rounded-lg bg-black/30 backdrop-blur-md border border-white/5 hover:bg-black/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <button
                      className="mt-1 mr-3 text-primary/80 hover:text-primary transition-colors"
                      onClick={() => onToggleComplete(task.id)}
                      aria-label="Mark as incomplete"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    
                    <div>
                      <h3 className="font-medium text-white/50 line-through">
                        {task.title}
                      </h3>
                      
                      <div className="mt-1 text-xs text-white/40">
                        {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 rounded-full hover:bg-white/10 transition-all"
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
