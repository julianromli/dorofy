import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useAnalyticsPage from '@/features/analytics/hooks/useAnalyticsPage'
import useProductivityData from '@/features/analytics/hooks/useProductivityData'
import type { AnalyticsSession, AnalyticsTask } from '@/features/analytics/types'

vi.mock('@/features/analytics/hooks/useProductivityData', () => ({
  default: vi.fn(),
}))

const fixedNow = new Date(2026, 2, 22, 12, 0, 0, 0)

const timestampAt = (year: number, month: number, day: number, hour = 12, minute = 0, second = 0, millisecond = 0) => (
  new Date(year, month - 1, day, hour, minute, second, millisecond).getTime()
)

const tasks: AnalyticsTask[] = [
  {
    id: 'task-march',
    title: 'Ship March report',
    completed: true,
    estimatedPomodoros: 2,
    completedPomodoros: 2,
    createdAt: timestampAt(2026, 3, 1),
    completedAt: timestampAt(2026, 3, 20, 18),
  },
  {
    id: 'task-feb',
    title: 'Close February sprint',
    completed: true,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: timestampAt(2026, 2, 1),
    completedAt: timestampAt(2026, 2, 10, 12),
  },
  {
    id: 'task-open',
    title: 'Open task',
    completed: false,
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    createdAt: timestampAt(2026, 3, 21, 9),
  },
]

const sessions: AnalyticsSession[] = [
  {
    id: 'session-today',
    completedAt: timestampAt(2026, 3, 22, 9),
    duration: 1500,
    taskId: 'task-march',
  },
  {
    id: 'session-march',
    completedAt: timestampAt(2026, 3, 20, 14),
    duration: 3000,
  },
  {
    id: 'session-feb',
    completedAt: timestampAt(2026, 2, 10, 10),
    duration: 1800,
    taskId: 'task-feb',
  },
]

const createProductivityDataState = ({
  nextTasks = tasks,
  nextSessions = sessions,
  isLoading = false,
  error = null,
  reload = vi.fn().mockResolvedValue(undefined),
}: {
  nextTasks?: AnalyticsTask[]
  nextSessions?: AnalyticsSession[]
  isLoading?: boolean
  error?: Error | null
  reload?: () => Promise<void>
} = {}) => ({
  tasks: nextTasks,
  sessions: nextSessions,
  settings: {
    activeTaskId: null,
    isLongPomodoro: false,
    timerState: null,
  },
  isLoading,
  error,
  reload,
})

describe('useAnalyticsPage', () => {
  it('defaults to the 30-day minutes view and returns page-ready analytics models', () => {
    const reload = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useProductivityData).mockReturnValue(createProductivityDataState({ reload }))

    const { result } = renderHook(() => useAnalyticsPage({ now: fixedNow }))

    expect(result.current.preset).toBe('30d')
    expect(result.current.metric).toBe('minutes')
    expect(result.current.selectedMonth).toBeUndefined()
    expect(result.current.currentFilterLabel).toBe('Last 30 days')
    expect(result.current.monthOptions).toEqual([
      { value: '2026-03', label: 'March 2026' },
      { value: '2026-02', label: 'February 2026' },
    ])
    expect(result.current.summary).toEqual({
      focusMinutes: 75,
      sessionsCount: 2,
      tasksCompleted: 1,
      streak: 1,
    })
    expect(result.current.completedTasks.map((task) => task.id)).toEqual(['task-march'])
    expect(result.current.recentSessions.map((session) => session.id)).toEqual([
      'session-today',
      'session-march',
    ])
    expect(result.current.recentSessions[0]).toMatchObject({
      taskTitle: 'Ship March report',
      taskLinkStatus: 'linked',
    })
    expect(result.current.recentSessions[1]).toMatchObject({
      taskTitle: 'No linked task',
      taskLinkStatus: 'none',
    })
    expect(result.current.recentSessions[1]).toMatchObject({
      taskTitle: 'No linked task',
      taskLinkStatus: 'none',
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.reload).toBe(reload)

    const todayPoint = result.current.chartSeries.find((point) => point.dateKey === '2026-03-22')

    expect(result.current.chartSeries).toHaveLength(30)
    expect(todayPoint).toMatchObject({
      sessions: 1,
      minutes: 25,
      value: 25,
    })
  })

  it('updates shared derived outputs when preset, month, and metric change', async () => {
    vi.mocked(useProductivityData).mockReturnValue(createProductivityDataState())

    const { result } = renderHook(() => useAnalyticsPage({ now: fixedNow }))

    act(() => {
      result.current.setPreset('month')
    })

    await waitFor(() => {
      expect(result.current.selectedMonth).toBe('2026-03')
    })

    act(() => {
      result.current.setSelectedMonth('2026-02')
      result.current.setMetric('sessions')
    })

    expect(result.current.preset).toBe('month')
    expect(result.current.metric).toBe('sessions')
    expect(result.current.selectedMonth).toBe('2026-02')
    expect(result.current.currentFilterLabel).toBe('February 2026')
    expect(result.current.summary).toEqual({
      focusMinutes: 30,
      sessionsCount: 1,
      tasksCompleted: 1,
      streak: 1,
    })
    expect(result.current.completedTasks.map((task) => task.id)).toEqual(['task-feb'])
    expect(result.current.recentSessions.map((session) => session.id)).toEqual(['session-feb'])

    const februaryPoint = result.current.chartSeries.find((point) => point.dateKey === '2026-02-10')

    expect(result.current.chartSeries).toHaveLength(28)
    expect(februaryPoint).toMatchObject({
      sessions: 1,
      minutes: 30,
      value: 1,
    })
  })

  it('repairs stale selected months to the newest available option after data changes', async () => {
    let mockedProductivityData = createProductivityDataState()
    vi.mocked(useProductivityData).mockImplementation(() => mockedProductivityData)

    const { result, rerender } = renderHook(() => useAnalyticsPage({ now: fixedNow }))

    act(() => {
      result.current.setPreset('month')
    })

    await waitFor(() => {
      expect(result.current.selectedMonth).toBe('2026-03')
    })

    act(() => {
      result.current.setSelectedMonth('2026-02')
    })

    expect(result.current.selectedMonth).toBe('2026-02')

    mockedProductivityData = createProductivityDataState({
      nextTasks: [tasks[0]!],
      nextSessions: sessions.slice(0, 2),
    })

    rerender()

    await waitFor(() => {
      expect(result.current.selectedMonth).toBe('2026-03')
    })

    expect(result.current.monthOptions).toEqual([
      { value: '2026-03', label: 'March 2026' },
    ])
    expect(result.current.currentFilterLabel).toBe('March 2026')
    expect(result.current.completedTasks.map((task) => task.id)).toEqual(['task-march'])
  })
})
