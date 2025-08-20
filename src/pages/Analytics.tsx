import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import usePomodoroHistory from '@/hooks/usePomodoroHistory';
import useTasks from '@/hooks/useTasks';
import DailyPomodoroChart from '@/components/analytics/DailyPomodoroChart';
import CompletedTasksLog from '@/components/analytics/CompletedTasksLog';

const Analytics = () => {
  const { history: pomodoroHistory } = usePomodoroHistory();
  const { tasks } = useTasks();

  const completedTasks = tasks.filter(task => task.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-white">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Productivity Analytics</h1>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Timer
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
  );
};

export default Analytics;
