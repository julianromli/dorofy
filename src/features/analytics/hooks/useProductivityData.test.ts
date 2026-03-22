import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useProductivityData from '@/features/analytics/hooks/useProductivityData'
import type { PomodoroSession } from '@/hooks/usePomodoroHistory'
import type { Task } from '@/hooks/useTasks'
import { dorofyDB, isMigrationComplete, migrateFromLocalStorage } from '@/lib/indexeddb'

vi.mock('@/lib/indexeddb', () => ({
  dorofyDB: {
    init: vi.fn().mockResolvedValue(undefined),
    getTasks: vi.fn().mockResolvedValue([]),
    getPomodoroHistory: vi.fn().mockResolvedValue([]),
    getSetting: vi.fn().mockResolvedValue(undefined),
  },
  migrateFromLocalStorage: vi.fn().mockResolvedValue(false),
  isMigrationComplete: vi.fn().mockResolvedValue(true),
}))

describe('useProductivityData', () => {
  const initialTask: Task = {
    id: 'task-1',
    title: 'Deep work',
    completed: false,
    estimatedPomodoros: 4,
    completedPomodoros: 2,
    createdAt: 1_700_000_000_000,
  }

  const reloadedTask: Task = {
    id: 'task-2',
    title: 'Write summary',
    completed: true,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: 1_700_000_100_000,
    completedAt: 1_700_000_200_000,
  }

  const initialSession: PomodoroSession = {
    id: 'session-1',
    completedAt: 1_700_000_050_000,
    duration: 1500,
    taskId: 'task-1',
  }

  const reloadedSession: PomodoroSession = {
    id: 'session-2',
    completedAt: 1_700_000_300_000,
    duration: 3000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    vi.mocked(isMigrationComplete).mockResolvedValue(true)
    vi.mocked(migrateFromLocalStorage).mockResolvedValue(false)
    vi.mocked(dorofyDB.init).mockResolvedValue(undefined)
    vi.mocked(dorofyDB.getTasks).mockResolvedValue([])
    vi.mocked(dorofyDB.getPomodoroHistory).mockResolvedValue([])
    vi.mocked(dorofyDB.getSetting).mockResolvedValue(undefined)
  })

  it('loads tasks, sessions, and settings after running the migration check', async () => {
    vi.mocked(isMigrationComplete).mockResolvedValue(false)
    vi.mocked(migrateFromLocalStorage).mockResolvedValue(true)
    vi.mocked(dorofyDB.getTasks).mockResolvedValue([initialTask])
    vi.mocked(dorofyDB.getPomodoroHistory).mockResolvedValue([initialSession])
    vi.mocked(dorofyDB.getSetting).mockResolvedValueOnce('task-1')

    window.localStorage.setItem('isLongPomodoro', 'true')
    window.localStorage.setItem('timerState', JSON.stringify({ mode: 'pomodoro', isRunning: false }))

    const { result } = renderHook(() => useProductivityData())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.tasks).toEqual([])
    expect(result.current.sessions).toEqual([])
    expect(result.current.settings).toEqual({
      activeTaskId: null,
      isLongPomodoro: false,
      timerState: null,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(isMigrationComplete).toHaveBeenCalledTimes(1)
    expect(migrateFromLocalStorage).toHaveBeenCalledTimes(1)
    expect(dorofyDB.init).toHaveBeenCalledTimes(1)
    expect(dorofyDB.getTasks).toHaveBeenCalledTimes(1)
    expect(dorofyDB.getPomodoroHistory).toHaveBeenCalledTimes(1)
    expect(dorofyDB.getSetting).toHaveBeenNthCalledWith(1, 'activeTaskId')
    expect(dorofyDB.getSetting).toHaveBeenCalledTimes(1)
    expect(result.current.tasks).toEqual([initialTask])
    expect(result.current.sessions).toEqual([initialSession])
    expect(result.current.settings).toEqual({
      activeTaskId: 'task-1',
      isLongPomodoro: true,
      timerState: { mode: 'pomodoro', isRunning: false },
    })
    expect(result.current.error).toBeNull()
  })

  it('reload refreshes analytics data in place and keeps a stable reload reference', async () => {
    vi.mocked(dorofyDB.getTasks)
      .mockResolvedValueOnce([initialTask])
      .mockResolvedValueOnce([reloadedTask])
    vi.mocked(dorofyDB.getPomodoroHistory)
      .mockResolvedValueOnce([initialSession])
      .mockResolvedValueOnce([reloadedSession])
    vi.mocked(dorofyDB.getSetting)
      .mockResolvedValueOnce('task-1')
      .mockResolvedValueOnce('task-2')

    window.localStorage.setItem('isLongPomodoro', 'false')
    window.localStorage.setItem('timerState', JSON.stringify({ mode: 'pomodoro', isRunning: false }))

    const { result } = renderHook(() => useProductivityData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialReload = result.current.reload

    expect(result.current.tasks).toEqual([initialTask])
    expect(result.current.sessions).toEqual([initialSession])
    expect(result.current.settings).toEqual({
      activeTaskId: 'task-1',
      isLongPomodoro: false,
      timerState: { mode: 'pomodoro', isRunning: false },
    })

    await act(async () => {
      window.localStorage.setItem('isLongPomodoro', 'true')
      window.localStorage.setItem('timerState', JSON.stringify({ mode: 'longBreak', isRunning: true }))
      await result.current.reload()
    })

    await waitFor(() => {
      expect(result.current.tasks).toEqual([reloadedTask])
    })

    expect(result.current.reload).toBe(initialReload)
    expect(result.current.sessions).toEqual([reloadedSession])
    expect(result.current.settings).toEqual({
      activeTaskId: 'task-2',
      isLongPomodoro: true,
      timerState: { mode: 'longBreak', isRunning: true },
    })
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(dorofyDB.getTasks).toHaveBeenCalledTimes(2)
    expect(dorofyDB.getPomodoroHistory).toHaveBeenCalledTimes(2)
  })

  it('returns empty-safe data and an error when a reload fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(dorofyDB.getTasks)
      .mockResolvedValueOnce([initialTask])
      .mockRejectedValueOnce(new Error('DB Error'))
    vi.mocked(dorofyDB.getPomodoroHistory)
      .mockResolvedValueOnce([initialSession])
      .mockResolvedValueOnce([reloadedSession])
    vi.mocked(dorofyDB.getSetting)
      .mockResolvedValueOnce('task-1')
      .mockResolvedValueOnce('task-2')

    window.localStorage.setItem('isLongPomodoro', 'false')
    window.localStorage.setItem('timerState', JSON.stringify({ mode: 'pomodoro', isRunning: false }))

    const { result } = renderHook(() => useProductivityData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toEqual([initialTask])
    expect(result.current.sessions).toEqual([initialSession])

    await act(async () => {
      window.localStorage.setItem('isLongPomodoro', 'true')
      window.localStorage.setItem('timerState', JSON.stringify({ mode: 'longBreak', isRunning: true }))
      await result.current.reload()
    })

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
    })

    expect(result.current.tasks).toEqual([])
    expect(result.current.sessions).toEqual([])
    expect(result.current.settings).toEqual({
      activeTaskId: null,
      isLongPomodoro: false,
      timerState: null,
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error?.message).toBe('DB Error')
    expect(consoleSpy).toHaveBeenCalledWith('Error loading productivity data:', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
