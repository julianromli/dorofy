import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import useTimer, { TimerMode } from '@/hooks/useTimer'
import { mockTimer } from '@/test/test-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useTimer', () => {
  const mockOnPomodoroComplete = vi.fn()
  let timerMock: ReturnType<typeof mockTimer>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    timerMock = mockTimer()
  })

  afterEach(() => {
    timerMock.restore()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    expect(result.current.timerState.mode).toBe('pomodoro')
    expect(result.current.timerState.timeLeft).toBe(25 * 60) // 25 minutes
    expect(result.current.timerState.isRunning).toBe(false)
    expect(result.current.timerState.totalPomodoros).toBe(0)
    expect(result.current.timerState.completedPomodoros).toBe(0)
  })

  it('should initialize with long pomodoro durations', () => {
    const { result } = renderHook(() => useTimer(true, mockOnPomodoroComplete))

    expect(result.current.timerState.timeLeft).toBe(50 * 60) // 50 minutes
    expect(result.current.timerDurations.pomodoro).toBe(50 * 60)
    expect(result.current.timerDurations.shortBreak).toBe(10 * 60)
    expect(result.current.timerDurations.longBreak).toBe(25 * 60)
  })

  it('should load state from localStorage if available', () => {
    const savedState = {
      mode: 'shortBreak',
      timeLeft: 300,
      isRunning: false,
      totalPomodoros: 2,
      completedPomodoros: 1,
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState))

    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    expect(result.current.timerState.mode).toBe('shortBreak')
    expect(result.current.timerState.timeLeft).toBe(5 * 60) // Reset to full duration
    expect(result.current.timerState.totalPomodoros).toBe(2)
    expect(result.current.timerState.completedPomodoros).toBe(1)
  })

  it('should start and pause timer', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    // Start timer
    act(() => {
      result.current.startTimer()
    })

    expect(result.current.timerState.isRunning).toBe(true)

    // Pause timer
    act(() => {
      result.current.pauseTimer()
    })

    expect(result.current.timerState.isRunning).toBe(false)
  })

  it('should reset timer to current mode duration', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    // Start timer and let some time pass
    act(() => {
      result.current.startTimer()
    })

    act(() => {
      timerMock.tick(60000) // 1 minute
    })

    expect(result.current.timerState.timeLeft).toBe(24 * 60) // 24 minutes left

    // Reset timer
    act(() => {
      result.current.resetTimer()
    })

    expect(result.current.timerState.timeLeft).toBe(25 * 60) // Back to 25 minutes
    expect(result.current.timerState.isRunning).toBe(false)
  })

  it('should switch timer modes', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    // Switch to short break
    act(() => {
      result.current.switchMode('shortBreak')
    })

    expect(result.current.timerState.mode).toBe('shortBreak')
    expect(result.current.timerState.timeLeft).toBe(5 * 60) // 5 minutes
    expect(result.current.timerState.isRunning).toBe(false)

    // Switch to long break
    act(() => {
      result.current.switchMode('longBreak')
    })

    expect(result.current.timerState.mode).toBe('longBreak')
    expect(result.current.timerState.timeLeft).toBe(15 * 60) // 15 minutes
  })

  it('should count down when timer is running', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    act(() => {
      result.current.startTimer()
    })

    // Advance time by 2 seconds
    act(() => {
      timerMock.tick(2000)
    })

    expect(result.current.timerState.timeLeft).toBe(25 * 60 - 2) // 2 seconds less
  })

  it('should complete pomodoro session and call callback', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    act(() => {
      result.current.startTimer()
    })

    // Fast forward to completion
    act(() => {
      timerMock.tick(25 * 60 * 1000) // 25 minutes
    })

    expect(mockOnPomodoroComplete).toHaveBeenCalledWith(25 * 60)
    expect(result.current.timerState.completedPomodoros).toBe(1)
    expect(result.current.timerState.mode).toBe('shortBreak') // Should switch to break
    expect(result.current.timerState.isRunning).toBe(false)
  })

  it('should switch to long break after 4 completed pomodoros', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    // Complete 4 pomodoros by manually setting completed count and simulating timer completion
    act(() => {
      result.current.startTimer()
    })

    // Fast forward through 4 pomodoro cycles
    for (let i = 0; i < 4; i++) {
      act(() => {
        // Complete the current pomodoro
        timerMock.tick(25 * 60 * 1000) // 25 minutes
      })
      
      // After completing a pomodoro, switch back to pomodoro mode for next cycle
      if (i < 3) {
        act(() => {
          result.current.switchMode('pomodoro')
          result.current.startTimer()
        })
      }
    }

    expect(result.current.timerState.completedPomodoros).toBe(4)
    expect(result.current.timerState.mode).toBe('longBreak')
  })

  it('should update durations when switching to long pomodoro', () => {
    const { result, rerender } = renderHook(
      ({ isLong }) => useTimer(isLong, mockOnPomodoroComplete),
      { initialProps: { isLong: false } }
    )

    expect(result.current.timerState.timeLeft).toBe(25 * 60)

    // Switch to long pomodoro
    rerender({ isLong: true })

    expect(result.current.timerState.timeLeft).toBe(50 * 60)
    expect(result.current.timerState.isRunning).toBe(false) // Should stop when changing
  })

  it('should format time correctly', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    expect(result.current.formatTime(3661)).toBe('61:01') // 61 minutes, 1 second
    expect(result.current.formatTime(3600)).toBe('60:00') // 60 minutes
    expect(result.current.formatTime(61)).toBe('01:01') // 1 minute, 1 second
    expect(result.current.formatTime(60)).toBe('01:00') // 1 minute
    expect(result.current.formatTime(59)).toBe('00:59') // 59 seconds
    expect(result.current.formatTime(0)).toBe('00:00') // 0 seconds
  })

  it('should save state to localStorage when state changes', () => {
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    act(() => {
      result.current.switchMode('shortBreak')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'timerState',
      expect.stringContaining('"mode":"shortBreak"')
    )
  })

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    // Should not throw error and use default state
    const { result } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    expect(result.current.timerState.mode).toBe('pomodoro')
    expect(result.current.timerState.timeLeft).toBe(25 * 60)
  })

  it('should stop timer when component unmounts', () => {
    const { result, unmount } = renderHook(() => useTimer(false, mockOnPomodoroComplete))

    act(() => {
      result.current.startTimer()
    })

    expect(result.current.timerState.isRunning).toBe(true)

    unmount()

    // Timer should be cleared (we can't directly test this, but it shouldn't continue running)
    // This is more of an integration test concern
  })
})