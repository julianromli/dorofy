import React from 'react';
import { Flame, ListChecks, TimerReset, Zap } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';

import { GlassBadge, GlassCard } from '@/components/glass';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { Task } from '@/hooks/useTasks';

interface SummaryStatsProps {
  sessions: PomodoroSession[];
  tasks: Task[];
  rangeDays: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ sessions, tasks, rangeDays }) => {
  const now = new Date();
  const since = subDays(now, rangeDays);
  const sessionsInRange = sessions.filter((session) => session.completedAt >= since.getTime());
  const focusMinutes = Math.round(sessionsInRange.reduce((total, session) => total + session.duration, 0) / 60);
  const sessionsCount = sessionsInRange.length;
  const tasksCompleted = tasks.filter((task) => task.completed && task.completedAt && task.completedAt >= since.getTime()).length;

  const dayKeys = new Set(sessions.map((session) => format(startOfDay(new Date(session.completedAt)), 'yyyy-MM-dd')));
  let streak = 0;
  for (let index = 0; index < 365; index += 1) {
    const key = format(startOfDay(subDays(now, index)), 'yyyy-MM-dd');
    if (!dayKeys.has(key)) break;
    streak += 1;
  }

  const cards = [
    { label: `Focus time · ${rangeDays}d`, value: `${focusMinutes}m`, icon: TimerReset, accent: 'default' as const },
    { label: `Sessions · ${rangeDays}d`, value: `${sessionsCount}`, icon: Zap, accent: 'outline' as const },
    { label: `Tasks done · ${rangeDays}d`, value: `${tasksCompleted}`, icon: ListChecks, accent: 'success' as const },
    { label: 'Current streak', value: `${streak}d`, icon: Flame, accent: 'warning' as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.label} variant={index === 0 ? 'elevated' : 'default'} className="min-h-32">
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">{card.value}</p>
                </div>
                <div className="glass-floating-button flex h-11 w-11 items-center justify-center rounded-[1.15rem]">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <GlassBadge variant={card.accent}>{card.label}</GlassBadge>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default SummaryStats;
