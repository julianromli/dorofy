import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import DailyPomodoroChart from '@/components/analytics/DailyPomodoroChart';
import CompletedTasksLog from '@/components/analytics/CompletedTasksLog';
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-3/4 lg:w-1/2 p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6">
            <SheetTitle>Productivity Analytics</SheetTitle>
            <SheetDescription>
              Review your focus sessions and completed tasks to see your progress.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            <div className="p-6 bg-card rounded-lg border h-[400px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Focus Sessions (Last 7 Days)</h2>
              <div className="flex-grow">
                <DailyPomodoroChart sessions={pomodoroHistory} />
              </div>
            </div>
            <div className="p-6 bg-card rounded-lg border h-[400px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Completed Tasks Log</h2>
              <div className="flex-grow">
                <CompletedTasksLog tasks={completedTasks} />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnalyticsSheet;
