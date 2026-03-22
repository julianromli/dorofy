import type { PomodoroSession } from '@/hooks/usePomodoroHistory';
import type { Task } from '@/hooks/useTasks';

export type AnalyticsSession = PomodoroSession;
export type AnalyticsTask = Task;

export type AnalyticsFilterPreset = '7d' | '30d' | '90d' | 'month';
export type AnalyticsChartMetric = 'sessions' | 'minutes';
export type AnalyticsSessionLinkStatus = 'linked' | 'none' | 'orphaned';

export interface AnalyticsFilter {
  preset: AnalyticsFilterPreset;
  selectedMonth?: string;
}

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
  startTime: number;
  endTime: number;
  dayCount: number;
}

export interface AnalyticsSummary {
  focusMinutes: number;
  sessionsCount: number;
  tasksCompleted: number;
  streak: number;
}

export interface AnalyticsChartPoint {
  dateKey: string;
  label: string;
  sessions: number;
  minutes: number;
  value: number;
}

export interface AnalyticsRecentSession {
  id: string;
  completedAt: number;
  durationSeconds: number;
  durationMinutes: number;
  taskId?: string;
  taskTitle: string;
  taskLinkStatus: AnalyticsSessionLinkStatus;
}

export interface AnalyticsMonthOption {
  value: string;
  label: string;
}

export interface AnalyticsCompletedTaskItem {
  id: string;
  title: string;
  completedAt: number;
  completedPomodoros: number;
  estimatedPomodoros: number;
}
