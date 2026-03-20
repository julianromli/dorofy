import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

import { GlassBadge, GlassButton, GlassCard, GlassInput } from '@/components/glass';

interface AddTaskProps {
  onAddTask: (title: string, estimatedPomodoros: number) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onAddTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask(taskTitle, estimatedPomodoros);
    setTaskTitle('');
    setEstimatedPomodoros(1);
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="mt-4">
        <GlassButton onClick={() => setIsAdding(true)} variant="default" size="lg" icon={Plus} className="w-full justify-center">
          Add a task
        </GlassButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 animate-scale-in">
      <GlassCard variant="dense" className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">New task</h3>
              <p className="mt-1 text-sm text-muted-foreground">Capture the next unit of focused work.</p>
            </div>
            <GlassBadge variant="outline">Task</GlassBadge>
          </div>

          <GlassInput
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="What are you working on?"
            autoFocus
          />
        </div>

        <div className="glass-panel glass-panel-dense rounded-[1.4rem] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Estimated pomodoros</p>
              <p className="text-xs text-muted-foreground">Adjust the number of focus blocks you expect.</p>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                type="button"
                onClick={() => setEstimatedPomodoros((value) => Math.max(value - 1, 1))}
                variant="ghost"
                size="icon"
                icon={ChevronDown}
                disabled={estimatedPomodoros <= 1}
                aria-label="Reduce pomodoros"
              />
              <div className="glass-chip min-w-12 rounded-full px-3 py-2 text-center text-sm font-semibold text-foreground">
                {estimatedPomodoros}
              </div>
              <GlassButton
                type="button"
                onClick={() => setEstimatedPomodoros((value) => Math.min(value + 1, 10))}
                variant="ghost"
                size="icon"
                icon={ChevronUp}
                disabled={estimatedPomodoros >= 10}
                aria-label="Add pomodoros"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <GlassButton type="button" onClick={() => setIsAdding(false)} variant="ghost">
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="hero" disabled={!taskTitle.trim()}>
            Save task
          </GlassButton>
        </div>
      </GlassCard>
    </form>
  );
};

export default AddTask;
