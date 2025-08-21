import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import usePomodoroHistory, { PomodoroSession } from '@/hooks/usePomodoroHistory'
import { dorofyDB } from '@/lib/indexeddb'
import { mockDateNow } from '@/test/test-utils'

// Mock the IndexedDB module
vi.mock('@/lib/indexeddb', () => ({
  dorofyDB: {
    init: vi.fn().mockResolvedValue(undefined),
    getPomodoroHistory: vi.fn().mockResolvedValue([]),
    addPomodoroSession: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('usePomodoroHistory', () => {
  const mockSession: PomodoroSession = {
    id: '1',
    completedAt: 1000000,
    duration: 1500, // 25 minutes
    taskId: 'task-1',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dorofyDB.getPomodoroHistory).mockResolvedValue([])
  })

  it('should initialize with empty history', async () => {
    const { result } = renderHook(() => usePomodoroHistory())

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.history).toEqual([])

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dorofyDB.init).toHaveBeenCalled()
    expect(dorofyDB.getPomodoroHistory).toHaveBeenCalled()
  })

  it('should load existing history from IndexedDB', async () => {
    const existingHistory = [mockSession]
    vi.mocked(dorofyDB.getPomodoroHistory).mockResolvedValue(existingHistory)

    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual(existingHistory)
  })

  it('should add a new pomodoro session', async () => {
    const restoreDateNow = mockDateNow(2000000)
    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1500,
        taskId: 'task-2',
      })
    })

    expect(dorofyDB.addPomodoroSession).toHaveBeenCalledWith({
      id: '2000000',
      completedAt: 2000000,
      duration: 1500,
      taskId: 'task-2',
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toMatchObject({
      duration: 1500,
      taskId: 'task-2',
      completedAt: 2000000,
    })

    restoreDateNow()
  })

  it('should add session without taskId', async () => {
    const restoreDateNow = mockDateNow(3000000)
    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 3000, // 50 minutes
      })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toMatchObject({
      duration: 3000,
      completedAt: 3000000,
    })
    expect(result.current.history[0].taskId).toBeUndefined()

    restoreDateNow()
  })

  it('should handle multiple sessions and maintain order (newest first)', async () => {
    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Add first session
    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1500,
        taskId: 'task-1',
      })
    })

    // Add second session
    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1800,
        taskId: 'task-2',
      })
    })

    expect(result.current.history).toHaveLength(2)
    // Newest should be first
    expect(result.current.history[0].taskId).toBe('task-2')
    expect(result.current.history[1].taskId).toBe('task-1')
  })

  it('should handle IndexedDB errors when loading history', async () => {
    vi.mocked(dorofyDB.getPomodoroHistory).mockRejectedValue(new Error('DB Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error loading pomodoro history:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should handle IndexedDB errors when adding session', async () => {
    vi.mocked(dorofyDB.addPomodoroSession).mockRejectedValue(new Error('DB Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1500,
        taskId: 'task-1',
      })
    })

    // Session should not be added to local state if DB operation fails
    expect(result.current.history).toHaveLength(0)
    expect(consoleSpy).toHaveBeenCalledWith('Error saving pomodoro session:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should generate unique IDs for sessions', async () => {
    const restoreDateNow = mockDateNow(4000000)
    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1500,
      })
    })

    // Wait for the state to update
    await waitFor(() => {
      expect(result.current.history).toHaveLength(1)
    })

    // Advance time slightly
    restoreDateNow()
    const restoreDateNow2 = mockDateNow(4000001)

    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1500,
      })
    })

    // Wait for the state to update
    await waitFor(() => {
      expect(result.current.history).toHaveLength(2)
    })
    expect(result.current.history[0].id).toBe('4000001')
    expect(result.current.history[1].id).toBe('4000000')

    restoreDateNow2()
  })

  it('should work with existing history loaded from IndexedDB', async () => {
    const existingHistory = [mockSession]
    vi.mocked(dorofyDB.getPomodoroHistory).mockResolvedValue(existingHistory)

    const { result } = renderHook(() => usePomodoroHistory())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.history).toHaveLength(1)

    // Add a new session
    await act(async () => {
      await result.current.addPomodoroSession({
        duration: 1800,
        taskId: 'task-2',
      })
    })

    // Wait for the state to update
    await waitFor(() => {
      expect(result.current.history).toHaveLength(2)
    })
    // New session should be first
    expect(result.current.history[0].taskId).toBe('task-2')
    expect(result.current.history[1]).toEqual(mockSession)
  })
})