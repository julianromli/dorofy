import { format } from 'date-fns';

import type {
  AnalyticsCompletedTaskItem,
  AnalyticsFilter,
  AnalyticsMonthOption,
  AnalyticsTask,
} from '@/features/analytics/types';
import { createAnalyticsDateRange, resolveAnalyticsMonthStart } from '@/features/analytics/selectors/sessionSelectors';

const getMonthValue = (date: Date): string => format(date, 'yyyy-MM');

export const selectCompletedTaskMonthOptions = (tasks: AnalyticsTask[], now: Date = new Date()): AnalyticsMonthOption[] => {
  const values = new Set<string>();

  tasks.forEach((task) => {
    if (task.completedAt !== undefined) {
      values.add(getMonthValue(new Date(task.completedAt)));
    }
  });

  const sortedValues = Array.from(values).sort().reverse();
  const monthValues = sortedValues.length > 0
    ? sortedValues
    : Array.from({ length: 12 }, (_, index) => getMonthValue(new Date(now.getFullYear(), now.getMonth() - index, 1)));

  return monthValues.map((value) => {
    const monthStart = resolveAnalyticsMonthStart(value, now);
    return {
      value,
      label: format(monthStart, 'MMMM yyyy'),
    };
  });
};

export const selectResolvedAnalyticsFilter = ({
  filter,
  monthOptions,
  now = new Date(),
}: {
  filter: AnalyticsFilter;
  monthOptions: AnalyticsMonthOption[];
  now?: Date;
}): AnalyticsFilter => {
  if (filter.preset !== 'month') {
    return filter;
  }

  const fallbackMonth = monthOptions[0]?.value ?? format(resolveAnalyticsMonthStart(undefined, now), 'yyyy-MM');

  if (!filter.selectedMonth) {
    return {
      ...filter,
      selectedMonth: fallbackMonth,
    };
  }

  const hasSelectedMonth = monthOptions.some((option) => option.value === filter.selectedMonth);
  return hasSelectedMonth
    ? filter
    : {
        ...filter,
        selectedMonth: fallbackMonth,
      };
};

export const deriveAnalyticsFilterLabel = (filter: AnalyticsFilter, now: Date = new Date()): string => {
  if (filter.preset === 'month') {
    return format(resolveAnalyticsMonthStart(filter.selectedMonth, now), 'MMMM yyyy');
  }

  if (filter.preset === '90d') {
    return 'Last 90 days';
  }

  if (filter.preset === '30d') {
    return 'Last 30 days';
  }

  return 'Last 7 days';
};

export const selectCompletedTasks = ({
  tasks,
  filter,
  now = new Date(),
}: {
  tasks: AnalyticsTask[];
  filter: AnalyticsFilter;
  now?: Date;
}): AnalyticsCompletedTaskItem[] => {
  const range = createAnalyticsDateRange(filter, now);

  return tasks
    .filter(
      (task) => task.completed && task.completedAt !== undefined && task.completedAt >= range.startTime && task.completedAt <= range.endTime,
    )
    .sort((left, right) => (right.completedAt ?? 0) - (left.completedAt ?? 0))
    .map((task) => ({
      id: task.id,
      title: task.title,
      completedAt: task.completedAt ?? range.startTime,
      completedPomodoros: task.completedPomodoros,
      estimatedPomodoros: task.estimatedPomodoros,
    }));
};
