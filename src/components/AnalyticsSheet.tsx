import React from 'react';

import { GlassButton, GlassCard, GlassSheet } from '@/components/glass';
import CompletedTasksLog from '@/components/analytics/CompletedTasksLog';
const DailyPomodoroChart = React.lazy(() => import('@/components/analytics/DailyPomodoroChart'));
import SummaryStats from '@/components/analytics/SummaryStats';
import BackupSystem from '@/components/BackupSystem';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';
import { Task } from '@/hooks/useTasks';

interface AnalyticsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  pomodoroHistory: PomodoroSession[];
}

const AnalyticsSheet: React.FC<AnalyticsSheetProps> = ({ isOpen, onClose, tasks, pomodoroHistory }) => {
  const completedTasks = tasks.filter((task) => task.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const [rangeDays, setRangeDays] = React.useState<7 | 30>(7);
  const [chartMetric, setChartMetric] = React.useState<'sessions' | 'minutes'>('sessions');

  return (
    <GlassSheet.Root open={isOpen} onOpenChange={onClose}>
      <GlassSheet.Content className="left-auto right-4 w-[min(72rem,calc(100vw-2rem))]">
        <GlassSheet.Header>
          <GlassSheet.Title>Productivity Analytics</GlassSheet.Title>
          <GlassSheet.Description>
            Review your focus rhythm, completed tasks, and backups from a single glass workspace.
          </GlassSheet.Description>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GlassButton
              onClick={() => setRangeDays(7)}
              variant={rangeDays === 7 ? 'active' : 'default'}
              size="sm"
              className={rangeDays === 7 ? 'glass-mode-accent text-white' : ''}
            >
              Last 7 days
            </GlassButton>
            <GlassButton
              onClick={() => setRangeDays(30)}
              variant={rangeDays === 30 ? 'active' : 'default'}
              size="sm"
              className={rangeDays === 30 ? 'glass-mode-accent text-white' : ''}
            >
              Last 30 days
            </GlassButton>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <GlassButton
                onClick={() => setChartMetric('sessions')}
                variant={chartMetric === 'sessions' ? 'active' : 'ghost'}
                size="sm"
                className={chartMetric === 'sessions' ? 'glass-mode-accent text-white' : ''}
              >
                Sessions
              </GlassButton>
              <GlassButton
                onClick={() => setChartMetric('minutes')}
                variant={chartMetric === 'minutes' ? 'active' : 'ghost'}
                size="sm"
                className={chartMetric === 'minutes' ? 'glass-mode-accent text-white' : ''}
              >
                Minutes
              </GlassButton>
            </div>
          </div>
        </GlassSheet.Header>

        <GlassSheet.Body className="space-y-6">
          <SummaryStats sessions={pomodoroHistory} tasks={tasks} rangeDays={rangeDays} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
            <GlassCard variant="elevated" className="min-h-[360px]">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">Focus sessions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Trend view of completed sessions over the selected range.</p>
                </div>
                <div className="min-h-[300px]">
                  <React.Suspense fallback={<div className="h-[300px] w-full animate-pulse rounded-[1.25rem] bg-muted/30" />}>
                    <DailyPomodoroChart sessions={pomodoroHistory} rangeDays={rangeDays} metric={chartMetric} />
                  </React.Suspense>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="default" className="min-h-[360px]">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">Completed tasks log</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Everything you finished, filtered by completion date.</p>
                </div>
                <div className="min-h-[300px]">
                  <CompletedTasksLog tasks={completedTasks} forcedRangeDays={rangeDays} />
                </div>
              </div>
            </GlassCard>
          </div>

          <BackupSystem onDataImported={() => window.location.reload()} />
        </GlassSheet.Body>
      </GlassSheet.Content>
    </GlassSheet.Root>
  );
};

export default AnalyticsSheet;
