import { afterEach, describe, expect, it, vi } from 'vitest'

import Analytics from './Analytics'
import type { AnalyticsPageViewModel } from '@/features/analytics/hooks/useAnalyticsPage'
import * as useAnalyticsPageMod from '@/features/analytics/hooks/useAnalyticsPage'
import { render, screen, within } from '@/test/test-utils'

// Mock useAnalyticsPage hook
vi.mock('@/features/analytics/hooks/useAnalyticsPage', () => ({
  default: vi.fn(),
}))

const mockUseAnalyticsPage = vi.mocked(useAnalyticsPageMod.default)

const createAnalyticsPageViewModel = (
  overrides: Partial<AnalyticsPageViewModel> = {},
): AnalyticsPageViewModel => ({
  filter: { preset: '7d' },
  preset: '7d',
  selectedMonth: undefined,
  metric: 'sessions',
  monthOptions: [],
  currentFilterLabel: 'Last 7 days',
  summary: { focusMinutes: 0, sessionsCount: 0, tasksCompleted: 0, streak: 0 },
  chartSeries: [],
  recentSessions: [],
  completedTasks: [],
  isLoading: false,
  error: null,
  reload: vi.fn(),
  setPreset: vi.fn(),
  setMetric: vi.fn(),
  setSelectedMonth: vi.fn(),
  ...overrides,
})

afterEach(() => {
  mockUseAnalyticsPage.mockReset()
})

describe('Analytics Layout', () => {
  it('renders loading state', () => {
    mockUseAnalyticsPage.mockReturnValue(createAnalyticsPageViewModel({ isLoading: true, currentFilterLabel: '' }))

    render(<Analytics />)

    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders empty state safely and in correct session-first DOM order', () => {
    mockUseAnalyticsPage.mockReturnValue(createAnalyticsPageViewModel({
      monthOptions: [{ label: 'Jan 2024', value: '2024-01' }],
      chartSeries: [
        { dateKey: '1', label: '1', sessions: 0, minutes: 0, value: 0 },
        { dateKey: '2', label: '2', sessions: 0, minutes: 0, value: 0 },
      ],
    }))

    render(<Analytics />)

    const main = screen.getByRole('main')

    const sections = within(main).getAllByRole('region')
    expect(sections).toHaveLength(5)

    expect(sections[0]).toHaveAccessibleName('Session Summary')
    expect(sections[1]).toHaveAccessibleName('Session Trend Chart')
    expect(sections[2]).toHaveAccessibleName('Recent Sessions')
    expect(sections[3]).toHaveAccessibleName('Completed Tasks')
    expect(sections[4]).toHaveAccessibleName('Data Backup')

    expect(screen.getByText('No session data available for this range.')).toBeInTheDocument()
    expect(screen.getByText('No recent sessions found.')).toBeInTheDocument()
    expect(screen.getByText('No completed tasks match the selected range.')).toBeInTheDocument()
  })

  it('renders the shared analytics header controls and month picker for the month preset', () => {
    mockUseAnalyticsPage.mockReturnValue(createAnalyticsPageViewModel({
      filter: { preset: 'month', selectedMonth: '2024-01' },
      preset: 'month',
      selectedMonth: '2024-01',
      monthOptions: [{ label: 'January 2024', value: '2024-01' }],
      currentFilterLabel: 'January 2024',
    }))

    render(<Analytics />)

    expect(screen.getByText('Productivity analytics')).toBeInTheDocument()
    expect(screen.getByText('Review focus sessions and completed task history.')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(screen.getAllByText('January 2024')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Range info' })).toBeInTheDocument()
  })

  it('renders all presets including the 90d path', () => {
    mockUseAnalyticsPage.mockReturnValue(createAnalyticsPageViewModel({
      preset: '90d',
      currentFilterLabel: 'Last 90 days',
    }))

    render(<Analytics />)

    // The current filter label is displayed.
    const labels = screen.getAllByText('Last 90 days')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('renders the error state when analytics data fails to load', () => {
    mockUseAnalyticsPage.mockReturnValue(createAnalyticsPageViewModel({ error: new Error('Database unavailable') }))

    render(<Analytics />)

    expect(screen.getByText('Failed to load analytics data.')).toBeInTheDocument()
    expect(screen.getByText('Database unavailable')).toBeInTheDocument()
  })
})
