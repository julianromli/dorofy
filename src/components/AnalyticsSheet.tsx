import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
const DailyPomodoroChart = React.lazy(() => import('@/components/analytics/DailyPomodoroChart'));
import CompletedTasksLog from '@/components/analytics/CompletedTasksLog';
import SummaryStats from '@/components/analytics/SummaryStats';
import BackupSystem from '@/components/BackupSystem';
import { Task } from '@/hooks/useTasks';
import { PomodoroSession } from '@/hooks/usePomodoroHistory';

interface AnalyticsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  pomodoroHistory: PomodoroSession[];
}

const AnalyticsSheet: React.FC<AnalyticsSheetProps> = ({ isOpen, onClose, tasks, pomodoroHistory }) => {
  const completedTasks = tasks.filter(task => task.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const [rangeDays, setRangeDays] = React.useState<7 | 30>(7);
  const [chartMetric, setChartMetric] = React.useState<'sessions' | 'minutes'>('sessions');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-4/5 lg:w-3/5 xl:w-2/3 p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <SheetTitle>Productivity Analytics</SheetTitle>
            <SheetDescription>
              Review your focus sessions and completed tasks to see your progress.
            </SheetDescription>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <label className="text-xs text-muted-foreground mr-2">Range</label>
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value) as 7 | 30)}
                className="bg-transparent border rounded px-2 py-1 text-sm"
                aria-label="Analytics range"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
              </select>

              <div className="ml-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Chart</span>
                <div className="inline-flex rounded overflow-hidden border">
                  <button
                    className={`px-2 py-1 text-sm ${chartMetric === 'sessions' ? 'bg-primary/20 text-white' : ''}`}
                    onClick={() => setChartMetric('sessions')}
                    aria-pressed={chartMetric === 'sessions'}
                  >
                    Sessions
                  </button>
                  <button
                    className={`px-2 py-1 text-sm ${chartMetric === 'minutes' ? 'bg-primary/20 text-white' : ''}`}
                    onClick={() => setChartMetric('minutes')}
                    aria-pressed={chartMetric === 'minutes'}
                  >
                    Minutes
                  </button>
                </div>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            <SummaryStats sessions={pomodoroHistory} tasks={tasks} rangeDays={rangeDays} />

            <div className="p-6 bg-card rounded-lg border min-h-[300px] md:h-[380px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Focus Sessions</h2>
              <div className="flex-grow">
                <React.Suspense fallback={<div className="h-[300px] w-full animate-pulse rounded bg-muted/30" />}>
                  <DailyPomodoroChart sessions={pomodoroHistory} rangeDays={rangeDays} metric={chartMetric} />
                </React.Suspense>
              </div>
            </div>
            <div className="p-6 bg-card rounded-lg border min-h-[300px] md:h-[380px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Completed Tasks Log</h2>
              <div className="flex-grow">
                <CompletedTasksLog tasks={completedTasks} forcedRangeDays={rangeDays} />
              </div>
            </div>
            <BackupSystem onDataImported={() => window.location.reload()} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnalyticsSheet;

