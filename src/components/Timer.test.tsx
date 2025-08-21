import { render, screen, fireEvent } from '@/test/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Timer from '@/components/Timer'
import { TimerMode } from '@/hooks/useTimer'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock the mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

describe('Timer Component', () => {
  const defaultProps = {
    timeString: '25:00',
    mode: 'pomodoro' as TimerMode,
    isRunning: false,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fullscreen API
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: vi.fn().mockResolvedValue(undefined),
    })
    Object.defineProperty(document, 'exitFullscreen', {
      value: vi.fn().mockResolvedValue(undefined),
    })
  })

  it('should render timer with correct time display', () => {
    render(<Timer {...defaultProps} />)
    
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('should show play button when timer is not running', () => {
    render(<Timer {...defaultProps} isRunning={false} />)
    
    const playButton = screen.getByLabelText('Start timer')
    expect(playButton).toBeInTheDocument()
  })

  it('should show pause button when timer is running', () => {
    render(<Timer {...defaultProps} isRunning={true} />)
    
    const pauseButton = screen.getByLabelText('Pause timer')
    expect(pauseButton).toBeInTheDocument()
  })

  it('should call onStart when play button is clicked', () => {
    const onStart = vi.fn()
    render(<Timer {...defaultProps} onStart={onStart} isRunning={false} />)
    
    const playButton = screen.getByLabelText('Start timer')
    fireEvent.click(playButton)
    
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('should call onPause when pause button is clicked', () => {
    const onPause = vi.fn()
    render(<Timer {...defaultProps} onPause={onPause} isRunning={true} />)
    
    const pauseButton = screen.getByLabelText('Pause timer')
    fireEvent.click(pauseButton)
    
    expect(onPause).toHaveBeenCalledTimes(1)
  })

  it('should call onReset when reset button is clicked', () => {
    const onReset = vi.fn()
    render(<Timer {...defaultProps} onReset={onReset} />)
    
    const resetButton = screen.getByLabelText('Reset timer')
    fireEvent.click(resetButton)
    
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should have fullscreen toggle button', () => {
    render(<Timer {...defaultProps} />)
    
    const fullscreenButton = screen.getByLabelText('Enter fullscreen')
    expect(fullscreenButton).toBeInTheDocument()
  })

  it('should handle different time formats correctly', () => {
    // Test different time strings
    const { rerender } = render(<Timer {...defaultProps} timeString="05:30" />)
    expect(screen.getByText('05:30')).toBeInTheDocument()
    
    rerender(<Timer {...defaultProps} timeString="00:15" />)
    expect(screen.getByText('00:15')).toBeInTheDocument()
    
    rerender(<Timer {...defaultProps} timeString="01:00:00" />)
    expect(screen.getByText('01:00:00')).toBeInTheDocument()
  })
})