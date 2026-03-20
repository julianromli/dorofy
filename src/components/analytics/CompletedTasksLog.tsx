import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { endOfMonth, format, formatDistanceToNow, isAfter, isBefore, startOfMonth, subDays } from 'date-fns';
import { Virtuoso } from 'react-virtuoso';

import { GlassBadge, GlassCard } from '@/components/glass';
import { Task } from '@/hooks/useTasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompletedTasksLogProps {
  tasks: Task[];
  forcedRangeDays?: number;
}

type RangeType = '7d' | '30d' | 'month';

const getMonthOptions = (tasks: Task[]) => {
  const months = new Set<string>();
  tasks.forEach((task) => {
    if (task.completedAt) months.add(format(new Date(task.completedAt), 'yyyy-MM'));
  });

  const sorted = Array.from(months).sort().reverse();
  if (sorted.length > 0) return sorted;

  const now = new Date();
  return Array.from({ length: 12 }, (_, index) => format(new Date(now.getFullYear(), now.getMonth() - index, 1), 'yyyy-MM'));
};

const CompletedTasksLog: React.FC<CompletedTasksLogProps> = ({ tasks, forcedRangeDays }) => {
  const [range, setRange] = React.useState<RangeType>('7d');
  const monthOptions = React.useMemo(() => getMonthOptions(tasks), [tasks]);
  const [selectedMonth, setSelectedMonth] = React.useState<string>(monthOptions[0] ?? format(new Date(), 'yyyy-MM'));

  const filtered = React.useMemo(() => {
    const now = new Date();

    if (forcedRangeDays) {
      const after = subDays(now, forcedRangeDays);
      return tasks.filter((task) => task.completedAt && isAfter(new Date(task.completedAt), after));
    }

    if (range === '7d') {
      const after = subDays(now, 7);
      return tasks.filter((task) => task.completedAt && isAfter(new Date(task.completedAt), after));
    }

    if (range === '30d') {
      const after = subDays(now, 30);
      return tasks.filter((task) => task.completedAt && isAfter(new Date(task.completedAt), after));
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(year, (month ?? 1) - 1, 1));
    const end = endOfMonth(start);
    return tasks.filter((task) => {
      if (!task.completedAt) return false;
      const completedAt = new Date(task.completedAt);
      return isAfter(completedAt, start) && isBefore(completedAt, end);
    });
  }, [forcedRangeDays, range, selectedMonth, tasks]);

  const currentRangeLabel = forcedRangeDays
    ? `Last ${forcedRangeDays} days`
    : range === '7d'
      ? 'Last 7 days'
      : range === '30d'
        ? 'Last 30 days'
        : format(new Date(Number(selectedMonth.split('-')[0]), Number(selectedMonth.split('-')[1]) - 1, 1), 'MMMM yyyy');

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {!forcedRangeDays ? (
          <>
            <Select value={range} onValueChange={(value) => setRange(value as RangeType)}>
              <SelectTrigger className="glass-select-trigger w-40 rounded-[1.1rem]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent className="glass-select-content rounded-[1.1rem]">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="month">Specific month</SelectItem>
              </SelectContent>
            </Select>

            {range === 'month' ? (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="glass-select-trigger w-44 rounded-[1.1rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-select-content rounded-[1.1rem]">
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]) - 1, 1), 'MMMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <GlassBadge variant="outline">{currentRangeLabel}</GlassBadge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="glass-floating-button flex h-9 w-9 items-center justify-center rounded-full" aria-label="Range info">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="glass-select-content border-0">
                <p>Filters limit tasks by completion date and update live with your range selection.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {filtered.length === 0 ? (
        <GlassCard variant="dense" className="flex flex-1 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">No completed tasks match the selected range.</p>
        </GlassCard>
      ) : (
        <div className="h-full">
          <Virtuoso
            className="h-full"
            totalCount={filtered.length}
            itemContent={(index) => {
              const task = filtered[index]!;
              return (
                <GlassCard key={task.id} variant="dense" className="mb-4 rounded-[1.4rem]">
                  <div className="flex items-start gap-3">
                    <div className="glass-floating-button mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem]">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{task.title}</p>
                      {task.completedAt ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </GlassCard>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CompletedTasksLog;
