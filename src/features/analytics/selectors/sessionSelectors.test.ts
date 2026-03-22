import { describe, expect, it } from 'vitest'
import { format, startOfDay, subDays } from 'date-fns'

import {
  createAnalyticsTaskLookup,
  isTimestampInAnalyticsRange,
  resolveAnalyticsMonthStart,
  resolveAnalyticsPresetFromDays,
  selectRecentSessions,
  selectSessionChartSeries,
  selectSessionSummary,
} from '@/features/analytics/selectors/sessionSelectors'
import type { AnalyticsSession, AnalyticsTask } from '@/features/analytics/types'

const fixedNow = new Date(2026, 2, 22, 12, 0, 0, 0)

const timestampAt = (year: number, month: number, day: number, hour = 12, minute = 0, second = 0, millisecond = 0) => (
  new Date(year, month - 1, day, hour, minute, second, millisecond).getTime()
)

describe('sessionSelectors', () => {
  it('resolves month starts and preset thresholds for analytics filters', () => {
    expect(format(resolveAnalyticsMonthStart(undefined, fixedNow), 'yyyy-MM-dd')).toBe('2026-03-01')
    expect(format(resolveAnalyticsMonthStart('2026-13', fixedNow), 'yyyy-MM-dd')).toBe('2026-03-01')
    expect(format(resolveAnalyticsMonthStart('2026-02', fixedNow), 'yyyy-MM-dd')).toBe('2026-02-01')

    expect(resolveAnalyticsPresetFromDays(7)).toBe('7d')
    expect(resolveAnalyticsPresetFromDays(8)).toBe('30d')
    expect(resolveAnalyticsPresetFromDays(30)).toBe('30d')
    expect(resolveAnalyticsPresetFromDays(31)).toBe('90d')
  })

  it('checks timestamps inclusively and builds task lookups by id', () => {
    const inRangeTimestamp = timestampAt(2026, 3, 22, 9)
    const outOfRangeTimestamp = timestampAt(2026, 3, 1, 9)

    const tasks: AnalyticsTask[] = [
      {
        id: 'task-a',
        title: 'Lookup me',
        completed: false,
        estimatedPomodoros: 1,
        completedPomodoros: 0,
        createdAt: timestampAt(2026, 3, 20),
      },
    ]

    expect(isTimestampInAnalyticsRange(undefined, { preset: '7d' }, fixedNow)).toBe(false)
    expect(isTimestampInAnalyticsRange(inRangeTimestamp, { preset: '7d' }, fixedNow)).toBe(true)
    expect(isTimestampInAnalyticsRange(outOfRangeTimestamp, { preset: '7d' }, fixedNow)).toBe(false)

    const lookup = createAnalyticsTaskLookup(tasks)

    expect(lookup.get('task-a')?.title).toBe('Lookup me')
    expect(lookup.has('missing-task')).toBe(false)
  })

  it('returns zero-safe summary and chart models for empty datasets', () => {
    const summary = selectSessionSummary({
      sessions: [],
      tasks: [],
      filter: { preset: '7d' },
      now: fixedNow,
    })

    const chartSeries = selectSessionChartSeries({
      sessions: [],
      filter: { preset: '7d' },
      metric: 'minutes',
      now: fixedNow,
    })

    expect(summary).toEqual({
      focusMinutes: 0,
      sessionsCount: 0,
      tasksCompleted: 0,
      streak: 0,
    })
    expect(chartSeries).toHaveLength(7)
    expect(chartSeries.every((point) => point.value === 0 && point.sessions === 0 && point.minutes === 0)).toBe(true)
  })

  it('computes 30-day summary values with inclusive start boundaries', () => {
    const inclusiveBoundary = startOfDay(subDays(fixedNow, 29)).getTime()
    const outsideBoundary = inclusiveBoundary - 1

    const sessions: AnalyticsSession[] = [
      { id: 'session-today', completedAt: timestampAt(2026, 3, 22, 9), duration: 1500, taskId: 'task-a' },
      { id: 'session-boundary', completedAt: inclusiveBoundary, duration: 1800, taskId: 'task-b' },
      { id: 'session-outside', completedAt: outsideBoundary, duration: 1200 },
    ]

    const tasks: AnalyticsTask[] = [
      {
        id: 'task-a',
        title: 'Write recap',
        completed: true,
        estimatedPomodoros: 2,
        completedPomodoros: 2,
        createdAt: timestampAt(2026, 3, 20),
        completedAt: timestampAt(2026, 3, 21, 16),
      },
      {
        id: 'task-b',
        title: 'Prep sprint',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 2, 20),
        completedAt: inclusiveBoundary,
      },
      {
        id: 'task-c',
        title: 'Too old',
        completed: true,
        estimatedPomodoros: 1,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 2, 20),
        completedAt: outsideBoundary,
      },
    ]

    const summary = selectSessionSummary({
      sessions,
      tasks,
      filter: { preset: '30d' },
      now: fixedNow,
    })

    expect(summary).toEqual({
      focusMinutes: 55,
      sessionsCount: 2,
      tasksCompleted: 2,
      streak: 1,
    })
  })

  it('computes the current streak from consecutive session days ending today', () => {
    const sessions: AnalyticsSession[] = [
      { id: 'session-1', completedAt: timestampAt(2026, 3, 22, 8), duration: 1500 },
      { id: 'session-2', completedAt: timestampAt(2026, 3, 21, 14), duration: 1500 },
      { id: 'session-3', completedAt: timestampAt(2026, 3, 20, 18), duration: 1500 },
      { id: 'session-4', completedAt: timestampAt(2026, 3, 18, 12), duration: 1500 },
    ]

    const summary = selectSessionSummary({
      sessions,
      tasks: [],
      filter: { preset: '7d' },
      now: fixedNow,
    })

    expect(summary.streak).toBe(3)
  })

  it('builds 90-day chart points with inclusive boundaries and zero-filled gaps', () => {
    const inclusiveBoundary = startOfDay(subDays(fixedNow, 89))
    const sessions: AnalyticsSession[] = [
      { id: 'session-boundary', completedAt: inclusiveBoundary.getTime(), duration: 1800 },
      { id: 'session-today-a', completedAt: timestampAt(2026, 3, 22, 9), duration: 1500 },
      { id: 'session-today-b', completedAt: timestampAt(2026, 3, 22, 15), duration: 1500 },
      { id: 'session-outside', completedAt: inclusiveBoundary.getTime() - 1, duration: 3600 },
    ]

    const chartSeries = selectSessionChartSeries({
      sessions,
      filter: { preset: '90d' },
      metric: 'minutes',
      now: fixedNow,
    })

    const boundaryPoint = chartSeries.find((point) => point.dateKey === format(inclusiveBoundary, 'yyyy-MM-dd'))
    const todayPoint = chartSeries.find((point) => point.dateKey === format(fixedNow, 'yyyy-MM-dd'))
    const zeroPoint = chartSeries.find((point) => point.dateKey === format(subDays(fixedNow, 1), 'yyyy-MM-dd'))

    expect(chartSeries).toHaveLength(90)
    expect(boundaryPoint).toMatchObject({ sessions: 1, minutes: 30, value: 30 })
    expect(todayPoint).toMatchObject({ sessions: 2, minutes: 50, value: 50 })
    expect(zeroPoint).toMatchObject({ sessions: 0, minutes: 0, value: 0 })
  })

  it('maps recent sessions to linked, orphaned, and unlinked task labels safely', () => {
    const tasks: AnalyticsTask[] = [
      {
        id: 'task-a',
        title: 'Deep work',
        completed: false,
        estimatedPomodoros: 2,
        completedPomodoros: 1,
        createdAt: timestampAt(2026, 3, 20),
      },
    ]

    const sessions: AnalyticsSession[] = [
      { id: 'linked', completedAt: timestampAt(2026, 3, 22, 9), duration: 1500, taskId: 'task-a' },
      { id: 'orphaned', completedAt: timestampAt(2026, 3, 22, 8), duration: 1200, taskId: 'missing-task' },
      { id: 'none', completedAt: timestampAt(2026, 3, 22, 7), duration: 900 },
    ]

    const recentSessions = selectRecentSessions({ sessions, tasks })

    expect(recentSessions).toHaveLength(3)
    expect(recentSessions[0]).toMatchObject({ id: 'linked', taskTitle: 'Deep work', taskLinkStatus: 'linked' })
    expect(recentSessions[1]).toMatchObject({ id: 'orphaned', taskTitle: 'Unlinked task', taskLinkStatus: 'orphaned' })
    expect(recentSessions[2]).toMatchObject({ id: 'none', taskTitle: 'No linked task', taskLinkStatus: 'none' })
  })
})
