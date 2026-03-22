import { describe, expect, it, vi } from 'vitest'

import SessionTrendSection from './SessionTrendSection'
import AnalyticsRecentSessions from './AnalyticsRecentSessions'
import { fireEvent, render, screen } from '@/test/test-utils'

describe('SessionTrendSection', () => {
  it('toggles metric when buttons are clicked (page wiring simulation)', () => {
    const mockOnMetricChange = vi.fn()
    const chartSeries = [
      { dateKey: '1', label: '1', sessions: 2, minutes: 50, value: 2 },
    ]

    const { rerender } = render(
      <SessionTrendSection 
        chartSeries={chartSeries} 
        metric="sessions" 
        onMetricChange={mockOnMetricChange} 
      />
    )

    const minutesButton = screen.getByRole('button', { name: /minutes/i })
    expect(minutesButton).toBeInTheDocument()
    
    // Simulate clicking "Minutes" button
    fireEvent.click(minutesButton)
    expect(mockOnMetricChange).toHaveBeenCalledWith('minutes')

    // Rerender as if the page state updated
    rerender(
      <SessionTrendSection 
        chartSeries={[{ dateKey: '1', label: '1', sessions: 2, minutes: 50, value: 50 }]} 
        metric="minutes" 
        onMetricChange={mockOnMetricChange} 
      />
    )

    // Check if the aria-pressed or styling updated
    expect(minutesButton).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('AnalyticsRecentSessions', () => {
  it('explicitly labels orphaned and no-linked-task entries', () => {
    const sessions = [
      {
        id: '1',
        completedAt: Date.now(),
        durationSeconds: 1500,
        durationMinutes: 25,
        taskTitle: 'A real linked task',
        taskLinkStatus: 'linked' as const,
        taskId: 't1'
      },
      {
        id: '2',
        completedAt: Date.now() - 10000,
        durationSeconds: 1500,
        durationMinutes: 25,
        taskTitle: 'No linked task',
        taskLinkStatus: 'none' as const,
      },
      {
        id: '3',
        completedAt: Date.now() - 20000,
        durationSeconds: 1500,
        durationMinutes: 25,
        taskTitle: 'Unlinked task',
        taskLinkStatus: 'orphaned' as const,
        taskId: 't3'
      },
    ]

    render(<AnalyticsRecentSessions sessions={sessions} />)

    // Ensure the text fallback labels provided by selectors are visibly rendered
    expect(screen.getByText('A real linked task')).toBeInTheDocument()
    expect(screen.getByText('No linked task')).toBeInTheDocument()
    expect(screen.getByText('Unlinked task')).toBeInTheDocument()
  })
})
