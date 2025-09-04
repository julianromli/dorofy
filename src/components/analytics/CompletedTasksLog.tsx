import React from 'react';
import { Task } from '@/hooks/useTasks';
import { format, formatDistanceToNow, startOfMonth, endOfMonth, subDays, isAfter, isBefore } from 'date-fns';
import { CheckCircle, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Virtuoso } from 'react-virtuoso';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompletedTasksLogProps {
  tasks: Task[];
}

type RangeType = '7d' | '30d' | 'month';

const getMonthOptions = (tasks: Task[]) => {
  // Build list of months from tasks (fallback: last 12 months)
  const monthsSet = new Set<string>();
  tasks.forEach(t => {
    if (t.completedAt) {
      monthsSet.add(format(new Date(t.completedAt), 'yyyy-MM'));
    }
  });
  let months = Array.from(monthsSet).sort().reverse();
  if (months.length === 0) {
    const now = new Date();
    months = Array.from({ length: 12 }, (_, i) => format(new Date(now.getFullYear(), now.getMonth() - i, 1), 'yyyy-MM'));
  }
  return months;
};

const CompletedTasksLog: React.FC<CompletedTasksLogProps> = ({ tasks }) => {
  const [range, setRange] = React.useState<RangeType>('7d');
  const monthOptions = React.useMemo(() => getMonthOptions(tasks), [tasks]);
  const [selectedMonth, setSelectedMonth] = React.useState<string>(monthOptions[0] ?? format(new Date(), 'yyyy-MM'));

  const filtered = React.useMemo(() => {
    const now = new Date();
    if (range === '7d') {
      const after = subDays(now, 7);
      return tasks.filter(t => !!t.completedAt && isAfter(new Date(t.completedAt!), after));
    }
    if (range === '30d') {
      const after = subDays(now, 30);
      return tasks.filter(t => !!t.completedAt && isAfter(new Date(t.completedAt!), after));
    }
    // month
    const [y, m] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(y, (m ?? 1) - 1, 1));
    const end = endOfMonth(start);
    return tasks.filter(t => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      return isAfter(d, start) && isBefore(d, end);
    });
  }, [range, selectedMonth, tasks]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <Select value={range} onValueChange={v => setRange(v as RangeType)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="month">Specific month</SelectItem>
          </SelectContent>
        </Select>

        {range === 'month' && (
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => (
                <SelectItem key={m} value={m}>
                  {format(new Date(Number(m.split('-')[0]), Number(m.split('-')[1]) - 1, 1), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            Showing: {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : format(new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]) - 1, 1), 'MMMM yyyy')}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 opacity-70" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Filters limit tasks by completion date. Live updates as you change options.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No tasks match the selected range.</p>
        </div>
      ) : (
        <div className="h-full">
          <Virtuoso
            totalCount={filtered.length}
            className="h-full"
            itemContent={(index) => {
              const task = filtered[index]!;
              return (
                <div className="flex items-start space-x-3 p-3 bg-background rounded-md mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-medium text-white">{task.title}</p>
                    {task.completedAt && (
                      <p className="text-sm text-muted-foreground">
                        Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CompletedTasksLog;
