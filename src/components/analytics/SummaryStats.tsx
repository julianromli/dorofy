import React from 'react';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { Task } from '@/hooks/useTasks';
import { startOfDay, subDays, format } from 'date-fns';

interface SummaryStatsProps {
  sessions: PomodoroSession[];
  tasks: Task[];
  rangeDays: number; // 7 or 30
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ sessions, tasks, rangeDays }) => {
  const now = new Date();
  const since = subDays(now, rangeDays);

  const sessionsInRange = sessions.filter(s => s.completedAt >= since.getTime());
  const focusMinutes = Math.round(sessionsInRange.reduce((acc, s) => acc + s.duration, 0) / 60);
  const sessionsCount = sessionsInRange.length;
  const tasksCompleted = tasks.filter(t => t.completed && t.completedAt && t.completedAt >= since.getTime()).length;

  // Compute current streak (consecutive days with >=1 session, starting today)
  const dayKeys = new Set(
    sessions.map(s => format(startOfDay(new Date(s.completedAt)), 'yyyy-MM-dd'))
  );
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = format(startOfDay(subDays(now, i)), 'yyyy-MM-dd');
    if (dayKeys.has(d)) streak += 1; else break;
  }

  const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="rounded-lg border bg-card p-4 md:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <StatCard label={`Focus time (last ${rangeDays}d)`} value={`${focusMinutes}m`} />
      <StatCard label={`Sessions (last ${rangeDays}d)`} value={`${sessionsCount}`} />
      <StatCard label={`Tasks done (last ${rangeDays}d)`} value={`${tasksCompleted}`} />
      <StatCard label="Current streak" value={`${streak}d`} sub="days with at least one session" />
    </div>
  );
};

export default SummaryStats;

