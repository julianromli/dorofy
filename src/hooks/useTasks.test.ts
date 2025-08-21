import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useTasks, { Task } from '@/hooks/useTasks'
import { dorofyDB } from '@/lib/indexeddb'
import { mockDateNow } from '@/test/test-utils'

// Mock the IndexedDB module
vi.mock('@/lib/indexeddb', () => ({
  dorofyDB: {
    init: vi.fn().mockResolvedValue(undefined),
    getTasks: vi.fn().mockResolvedValue([]),
    setTasks: vi.fn().mockResolvedValue(undefined),
    getSetting: vi.fn().mockResolvedValue(null),
    setSetting: vi.fn().mockResolvedValue(undefined),
  },
  migrateFromLocalStorage: vi.fn().mockResolvedValue(false),
  isMigrationComplete: vi.fn().mockResolvedValue(true),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('useTasks', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    completed: false,
    estimatedPomodoros: 3,
    completedPomodoros: 1,
    createdAt: 1000000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset IndexedDB mocks
    vi.mocked(dorofyDB.getTasks).mockResolvedValue([])
    vi.mocked(dorofyDB.getSetting).mockResolvedValue(null)
  })

  it('should initialize with empty tasks', async () => {
    const { result } = renderHook(() => useTasks())
    
    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.tasks).toEqual([])
    expect(result.current.activeTaskId).toBe(null)

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(dorofyDB.init).toHaveBeenCalled()
    expect(dorofyDB.getTasks).toHaveBeenCalled()
    expect(dorofyDB.getSetting).toHaveBeenCalledWith('activeTaskId')
  })

  it('should load existing tasks from IndexedDB', async () => {
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)
    vi.mocked(dorofyDB.getSetting).mockResolvedValue('1')

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toEqual(existingTasks)
    expect(result.current.activeTaskId).toBe('1')
  })

  it('should add a new task', async () => {
    const restoreDateNow = mockDateNow(2000000)
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.addTask('New Task', 2)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0]).toMatchObject({
      title: 'New Task',
      completed: false,
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      createdAt: 2000000,
    })
    expect(result.current.activeTaskId).toBe(result.current.tasks[0].id)

    restoreDateNow()
  })

  it('should not add task with empty title', async () => {
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.addTask('   ', 1)
    })

    expect(result.current.tasks).toHaveLength(0)
  })

  it('should update a task', async () => {
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.updateTask('1', { title: 'Updated Task' })
    })

    expect(result.current.tasks[0].title).toBe('Updated Task')
  })

  it('should delete a task', async () => {
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)
    vi.mocked(dorofyDB.getSetting).mockResolvedValue('1')

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.deleteTask('1')
    })

    expect(result.current.tasks).toHaveLength(0)
    expect(result.current.activeTaskId).toBe(null)
  })

  it('should toggle task completion', async () => {
    const restoreDateNow = mockDateNow(3000000)
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.toggleTaskCompletion('1')
    })

    expect(result.current.tasks[0].completed).toBe(true)
    expect(result.current.tasks[0].completedAt).toBe(3000000)

    // Toggle back
    act(() => {
      result.current.toggleTaskCompletion('1')
    })

    expect(result.current.tasks[0].completed).toBe(false)
    expect(result.current.tasks[0].completedAt).toBeUndefined()

    restoreDateNow()
  })

  it('should increment task pomodoros', async () => {
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)
    vi.mocked(dorofyDB.getSetting).mockResolvedValue('1')

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.incrementTaskPomodoros('1')
    })

    expect(result.current.tasks[0].completedPomodoros).toBe(2)
    expect(result.current.tasks[0].completed).toBe(false)
  })

  it('should auto-complete task when pomodoros reach estimate', async () => {
    const restoreDateNow = mockDateNow(4000000)
    const taskNearCompletion: Task = {
      ...mockTask,
      completedPomodoros: 2, // one short of estimated 3
    }
    const existingTasks = [taskNearCompletion]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)
    vi.mocked(dorofyDB.getSetting).mockResolvedValue('1')

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.incrementTaskPomodoros('1')
    })

    expect(result.current.tasks[0].completedPomodoros).toBe(3)
    expect(result.current.tasks[0].completed).toBe(true)
    expect(result.current.tasks[0].completedAt).toBe(4000000)

    restoreDateNow()
  })

  it('should set and get active task', async () => {
    const existingTasks = [mockTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setActiveTask('1')
    })

    expect(result.current.activeTaskId).toBe('1')
    expect(result.current.getActiveTask()).toEqual(mockTask)

    act(() => {
      result.current.setActiveTask(null)
    })

    expect(result.current.activeTaskId).toBe(null)
    expect(result.current.getActiveTask()).toBe(null)
  })

  it('should clear completed tasks', async () => {
    const completedTask: Task = { ...mockTask, id: '2', completed: true }
    const existingTasks = [mockTask, completedTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.clearCompletedTasks()
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe('1')
  })

  it('should clear active task when clearing completed tasks if active task is completed', async () => {
    const completedTask: Task = { ...mockTask, completed: true }
    const existingTasks = [completedTask]
    vi.mocked(dorofyDB.getTasks).mockResolvedValue(existingTasks)
    vi.mocked(dorofyDB.getSetting).mockResolvedValue('1')

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.clearCompletedTasks()
    })

    expect(result.current.tasks).toHaveLength(0)
    expect(result.current.activeTaskId).toBe(null)
  })
})", "original_text": "", "replace_all": false}]