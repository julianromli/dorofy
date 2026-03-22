import { eachDayOfInterval, endOfDay, endOfMonth, format, startOfDay, startOfMonth, subDays } from 'date-fns';

import type {
  AnalyticsChartMetric,
  AnalyticsChartPoint,
  AnalyticsDateRange,
  AnalyticsFilter,
  AnalyticsFilterPreset,
  AnalyticsRecentSession,
  AnalyticsSession,
  AnalyticsSummary,
  AnalyticsTask,
} from '@/features/analytics/types';

const ANALYTICS_PRESET_DAY_COUNT: Record<Exclude<AnalyticsFilterPreset, 'month'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const isValidMonthValue = (value?: string): value is string => {
  if (!value) {
    return false;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const month = Number(match[2]);
  return Number.isInteger(month) && month >= 1 && month <= 12;
};

export const resolveAnalyticsMonthStart = (selectedMonth: string | undefined, now: Date = new Date()): Date => {
  if (!isValidMonthValue(selectedMonth)) {
    return startOfMonth(now);
  }

  const [year, month] = selectedMonth.split('-').map(Number);
  return startOfMonth(new Date(year, month - 1, 1));
};

export const resolveAnalyticsPresetFromDays = (rangeDays: number): Exclude<AnalyticsFilterPreset, 'month'> => {
  if (rangeDays <= 7) {
    return '7d';
  }

  if (rangeDays <= 30) {
    return '30d';
  }

  return '90d';
};

export const createAnalyticsDateRange = (filter: AnalyticsFilter, now: Date = new Date()): AnalyticsDateRange => {
  if (filter.preset === 'month') {
    const start = resolveAnalyticsMonthStart(filter.selectedMonth, now);
    const end = endOfMonth(start);

    return {
      start,
      end,
      startTime: start.getTime(),
      endTime: end.getTime(),
      dayCount: eachDayOfInterval({ start, end }).length,
    };
  }

  const dayCount = ANALYTICS_PRESET_DAY_COUNT[filter.preset];
  const start = startOfDay(subDays(now, dayCount - 1));
  const end = endOfDay(now);

  return {
    start,
    end,
    startTime: start.getTime(),
    endTime: end.getTime(),
    dayCount,
  };
};

export const isTimestampInAnalyticsRange = (timestamp: number | undefined, filter: AnalyticsFilter, now: Date = new Date()): boolean => {
  if (timestamp === undefined) {
    return false;
  }

  const range = createAnalyticsDateRange(filter, now);
  return timestamp >= range.startTime && timestamp <= range.endTime;
};

export const createAnalyticsTaskLookup = (tasks: AnalyticsTask[]): Map<string, AnalyticsTask> => {
  return new Map(tasks.map((task) => [task.id, task]));
};

export const selectSessionSummary = ({
  sessions,
  tasks,
  filter,
  now = new Date(),
}: {
  sessions: AnalyticsSession[];
  tasks: AnalyticsTask[];
  filter: AnalyticsFilter;
  now?: Date;
}): AnalyticsSummary => {
  const range = createAnalyticsDateRange(filter, now);
  const sessionsInRange = sessions.filter(
    (session) => session.completedAt >= range.startTime && session.completedAt <= range.endTime,
  );

  const focusMinutes = Math.round(sessionsInRange.reduce((total, session) => total + session.duration, 0) / 60);
  const tasksCompleted = tasks.filter(
    (task) => task.completed && task.completedAt !== undefined && task.completedAt >= range.startTime && task.completedAt <= range.endTime,
  ).length;

  const sessionDayKeys = new Set(
    sessions.map((session) => startOfDay(new Date(session.completedAt)).getTime()),
  );

  let streak = 0;
  let cursor = startOfDay(now);
  while (sessionDayKeys.has(cursor.getTime())) {
    streak += 1;
    cursor = startOfDay(subDays(cursor, 1));
  }

  return {
    focusMinutes,
    sessionsCount: sessionsInRange.length,
    tasksCompleted,
    streak,
  };
};

export const selectSessionChartSeries = ({
  sessions,
  filter,
  metric = 'sessions',
  now = new Date(),
}: {
  sessions: AnalyticsSession[];
  filter: AnalyticsFilter;
  metric?: AnalyticsChartMetric;
  now?: Date;
}): AnalyticsChartPoint[] => {
  const range = createAnalyticsDateRange(filter, now);
  const totalsByDay = new Map<string, { sessions: number; durationSeconds: number }>();

  sessions.forEach((session) => {
    if (session.completedAt < range.startTime || session.completedAt > range.endTime) {
      return;
    }

    const dateKey = format(startOfDay(new Date(session.completedAt)), 'yyyy-MM-dd');
    const existing = totalsByDay.get(dateKey) ?? { sessions: 0, durationSeconds: 0 };
    totalsByDay.set(dateKey, {
      sessions: existing.sessions + 1,
      durationSeconds: existing.durationSeconds + session.duration,
    });
  });

  return eachDayOfInterval({ start: range.start, end: range.end }).map((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayTotals = totalsByDay.get(dateKey) ?? { sessions: 0, durationSeconds: 0 };
    const minutes = Math.round(dayTotals.durationSeconds / 60);

    return {
      dateKey,
      label: format(day, 'MMM d'),
      sessions: dayTotals.sessions,
      minutes,
      value: metric === 'sessions' ? dayTotals.sessions : minutes,
    };
  });
};

export const selectRecentSessions = ({
  sessions,
  tasks,
  filter,
  now = new Date(),
  limit = 10,
}: {
  sessions: AnalyticsSession[];
  tasks: AnalyticsTask[];
  filter?: AnalyticsFilter;
  now?: Date;
  limit?: number;
}): AnalyticsRecentSession[] => {
  const taskLookup = createAnalyticsTaskLookup(tasks);

  let targetSessions = sessions;
  if (filter) {
    const range = createAnalyticsDateRange(filter, now);
    targetSessions = sessions.filter(
      (session) => session.completedAt >= range.startTime && session.completedAt <= range.endTime,
    );
  }

  return [...targetSessions]
    .sort((left, right) => right.completedAt - left.completedAt)
    .slice(0, limit)
    .map((session): AnalyticsRecentSession => {
      if (!session.taskId) {
        return {
          id: session.id,
          completedAt: session.completedAt,
          durationSeconds: session.duration,
          durationMinutes: Math.round(session.duration / 60),
          taskTitle: 'No linked task',
          taskLinkStatus: 'none',
        };
      }

      const linkedTask = taskLookup.get(session.taskId);
      if (!linkedTask) {
        return {
          id: session.id,
          completedAt: session.completedAt,
          durationSeconds: session.duration,
          durationMinutes: Math.round(session.duration / 60),
          taskId: session.taskId,
          taskTitle: 'Unlinked task',
          taskLinkStatus: 'orphaned',
        };
      }

      return {
        id: session.id,
        completedAt: session.completedAt,
        durationSeconds: session.duration,
        durationMinutes: Math.round(session.duration / 60),
        taskId: session.taskId,
        taskTitle: linkedTask.title,
        taskLinkStatus: 'linked',
      };
    });
};
