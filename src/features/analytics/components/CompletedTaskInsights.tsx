import React from 'react';
import { CheckCircle2, Target, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { GlassCard } from '@/components/glass';
import type { AnalyticsCompletedTaskItem } from '@/features/analytics/types';

interface CompletedTaskInsightsProps {
  tasks: AnalyticsCompletedTaskItem[];
}

const CompletedTaskInsights: React.FC<CompletedTaskInsightsProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">No completed tasks match the selected range.</p>
      </div>
    );
  }

  const totalPomodoros = tasks.reduce((sum, task) => sum + (task.completedPomodoros || 0), 0);
  const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedPomodoros || 0), 0);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Summary Insights */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <GlassCard variant="dense" className="flex flex-col gap-1 rounded-[1.2rem] p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Est.</span>
          </div>
          <p className="text-2xl font-semibold">
            {totalEstimated} <span className="text-sm font-normal text-muted-foreground">sessions</span>
          </p>
        </GlassCard>
        <GlassCard variant="dense" className="flex flex-col gap-1 rounded-[1.2rem] p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Actual</span>
          </div>
          <p className="text-2xl font-semibold">
            {totalPomodoros} <span className="text-sm font-normal text-muted-foreground">sessions</span>
          </p>
        </GlassCard>
      </div>

      {/* Scrollable Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[200px] max-h-[400px]">
        {tasks.map((task) => (
          <GlassCard key={task.id} variant="dense" className="rounded-[1.4rem]">
            <div className="flex items-start gap-3">
              <div className="glass-floating-button mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem]">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{task.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Completed {formatDistanceToNow(task.completedAt, { addSuffix: true })}</span>
                  {(task.completedPomodoros > 0 || task.estimatedPomodoros > 0) && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>
                        {task.completedPomodoros} / {task.estimatedPomodoros || 1} sessions
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default CompletedTaskInsights;