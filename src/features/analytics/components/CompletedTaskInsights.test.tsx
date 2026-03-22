import { endOfMonth, startOfMonth, subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'

import CompletedTaskInsights from './CompletedTaskInsights'
import { selectCompletedTasks } from '@/features/analytics/selectors/taskSelectors'
import { render, screen } from '@/test/test-utils'
import type { AnalyticsFilter, AnalyticsTask } from '@/features/analytics/types'

describe('CompletedTaskInsights', () => {
  it('relies entirely on shared page filters without rendering local dropdowns', () => {
    render(<CompletedTaskInsights tasks={[]} />)

    expect(screen.getByText(/No completed tasks match the selected range/i)).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('renders boundary-day task completions correctly when passed from the shared model', () => {
    const now = new Date('2026-03-15T12:00:00Z')
    const startOfMarch = startOfMonth(now).getTime()
    const endOfMarch = endOfMonth(now).getTime()
    const beforeMarch = subDays(startOfMonth(now), 1).getTime()

    const sourceTasks: AnalyticsTask[] = [
      { id: '1', title: 'Task on exact start boundary', completedAt: startOfMarch, completed: true, estimatedPomodoros: 2, completedPomodoros: 2, createdAt: startOfMarch - 1000 },
      { id: '2', title: 'Task on exact end boundary', completedAt: endOfMarch, completed: true, estimatedPomodoros: 1, completedPomodoros: 1, createdAt: endOfMarch - 1000 },
      { id: '3', title: 'Task before month', completedAt: beforeMarch, completed: true, estimatedPomodoros: 0, completedPomodoros: 0, createdAt: beforeMarch - 1000 },
    ]

    const filter: AnalyticsFilter = {
      preset: 'month',
      selectedMonth: '2026-03',
    }

    const completedTasks = selectCompletedTasks({ tasks: sourceTasks, filter, now })

    expect(completedTasks).toHaveLength(2)
    expect(completedTasks[0].id).toBe('2')
    expect(completedTasks[1].id).toBe('1')

    render(<CompletedTaskInsights tasks={completedTasks} />)

    expect(screen.getByText('Task on exact start boundary')).toBeInTheDocument()
    expect(screen.getByText('Task on exact end boundary')).toBeInTheDocument()
    expect(screen.queryByText('Task before month')).not.toBeInTheDocument()

    expect(screen.getAllByText('3')[0]).toBeInTheDocument()
    expect(screen.getAllByText('3')[1]).toBeInTheDocument()
  })

  it('omits the per-task sessions ratio when both completed and estimated pomodoros are zero', () => {
    render(
      <CompletedTaskInsights
        tasks={[
          {
            id: 'task-quiet',
            title: 'Task without tracked sessions',
            completedAt: new Date('2026-03-22T12:00:00Z').getTime(),
            completedPomodoros: 0,
            estimatedPomodoros: 0,
          },
        ]}
      />,
    )

    expect(screen.getByText('Task without tracked sessions')).toBeInTheDocument()
    expect(screen.queryByText('0 / 1 sessions')).not.toBeInTheDocument()
  })
})
