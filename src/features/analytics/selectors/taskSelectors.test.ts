import { describe, expect, it } from 'vitest'
import { endOfMonth, startOfDay, startOfMonth, subDays } from 'date-fns'

import {
  deriveAnalyticsFilterLabel,
  selectCompletedTaskMonthOptions,
  selectCompletedTasks,
  selectResolvedAnalyticsFilter,
} from '@/features/analytics/selectors/taskSelectors'
import type { AnalyticsMonthOption, AnalyticsTask } from '@/features/analytics/types'

const fixedNow = new Date(2026, 2, 22, 12, 0, 0, 0)

const timestampAt = (year: number, month: number, day: number, hour = 12, minute = 0, second = 0, millisecond = 0) => (
  new Date(year, month - 1, day, hour, minute, second, millisecond).getTime()
)

describe('taskSelectors', () => {
  it('creates sorted unique month options from completed tasks', () => {
    const tasks: AnalyticsTask[] = [
      {
        id: 'task-a',
        title: 'March task',
        completed: true,
        estimatedPomodoros: 2,
        completedPomodoros: 2,
        createdAt: timestampAt(2026, 3, 1),
        completedAt: timestampAt(2026, 3, 10),
      },
      {
        id: 'task-b',
        title: 'February task',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 2, 1),
        completedAt: timestampAt(2026, 2, 5),
      },
      {
        id: 'task-c',
        title: 'Another March task',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 3, 5),
        completedAt: timestampAt(2026, 3, 18),
      },
    ]

    const monthOptions = selectCompletedTaskMonthOptions(tasks, fixedNow)

    expect(monthOptions).toEqual([
      { value: '2026-03', label: 'March 2026' },
      { value: '2026-02', label: 'February 2026' },
    ])
  })

  it('falls back to the last 12 months when there are no completed tasks', () => {
    const monthOptions = selectCompletedTaskMonthOptions([], fixedNow)

    expect(monthOptions).toHaveLength(12)
    expect(monthOptions[0]).toEqual({ value: '2026-03', label: 'March 2026' })
    expect(monthOptions[11]).toEqual({ value: '2025-04', label: 'April 2025' })
  })

  it('filters completed tasks for preset ranges with inclusive start boundaries', () => {
    const inclusiveBoundary = startOfDay(subDays(fixedNow, 6)).getTime()
    const outsideBoundary = inclusiveBoundary - 1

    const tasks: AnalyticsTask[] = [
      {
        id: 'task-today',
        title: 'Today',
        completed: true,
        estimatedPomodoros: 2,
        completedPomodoros: 2,
        createdAt: timestampAt(2026, 3, 20),
        completedAt: timestampAt(2026, 3, 22, 9),
      },
      {
        id: 'task-boundary',
        title: 'Boundary',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 3, 10),
        completedAt: inclusiveBoundary,
      },
      {
        id: 'task-outside',
        title: 'Outside',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 3, 10),
        completedAt: outsideBoundary,
      },
      {
        id: 'task-incomplete',
        title: 'Incomplete',
        completed: false,
        estimatedPomodoros: 3,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 3, 19),
      },
    ]

    const filteredTasks = selectCompletedTasks({
      tasks,
      filter: { preset: '7d' },
      now: fixedNow,
    })

    expect(filteredTasks.map((task) => task.id)).toEqual(['task-today', 'task-boundary'])
  })

  it('filters a specific month inclusively at the start and end of the month', () => {
    const monthStart = startOfMonth(new Date(2026, 1, 1)).getTime()
    const monthEnd = endOfMonth(new Date(2026, 1, 1)).getTime()

    const tasks: AnalyticsTask[] = [
      {
        id: 'task-start',
        title: 'Month start',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 2, 1),
        completedAt: monthStart,
      },
      {
        id: 'task-end',
        title: 'Month end',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 2, 1),
        completedAt: monthEnd,
      },
      {
        id: 'task-outside',
        title: 'Outside month',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 1, 31),
        completedAt: monthStart - 1,
      },
    ]

    const filteredTasks = selectCompletedTasks({
      tasks,
      filter: { preset: 'month', selectedMonth: '2026-02' },
      now: fixedNow,
    })

    expect(filteredTasks.map((task) => task.id)).toEqual(['task-end', 'task-start'])
  })

  it('repairs invalid month selections to the newest available month option', () => {
    const monthOptions: AnalyticsMonthOption[] = [
      { value: '2026-03', label: 'March 2026' },
      { value: '2026-02', label: 'February 2026' },
    ]

    const resolvedFilter = selectResolvedAnalyticsFilter({
      filter: { preset: 'month', selectedMonth: '2025-12' },
      monthOptions,
      now: fixedNow,
    })

    expect(resolvedFilter).toEqual({ preset: 'month', selectedMonth: '2026-03' })
  })

  it('derives display labels for presets and specific months', () => {
    expect(deriveAnalyticsFilterLabel({ preset: '7d' }, fixedNow)).toBe('Last 7 days')
    expect(deriveAnalyticsFilterLabel({ preset: '30d' }, fixedNow)).toBe('Last 30 days')
    expect(deriveAnalyticsFilterLabel({ preset: '90d' }, fixedNow)).toBe('Last 90 days')
    expect(deriveAnalyticsFilterLabel({ preset: 'month', selectedMonth: '2026-02' }, fixedNow)).toBe('February 2026')
  })
})
