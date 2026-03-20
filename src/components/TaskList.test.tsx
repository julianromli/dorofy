import { render, screen, fireEvent, within } from '@/test/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import TaskList from '@/components/TaskList'
import { Task } from '@/hooks/useTasks'

const hasTextContent = (text: string) => (_content: string, node: Element | null) =>
  node?.textContent === text

describe('TaskList Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Active Task 1',
      completed: false,
      estimatedPomodoros: 3,
      completedPomodoros: 1,
      createdAt: 1000000,
    },
    {
      id: '2',
      title: 'Active Task 2',
      completed: false,
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      createdAt: 1000001,
    },
    {
      id: '3',
      title: 'Completed Task 1',
      completed: true,
      estimatedPomodoros: 4,
      completedPomodoros: 4,
      createdAt: 1000002,
      completedAt: 1001000,
    },
  ]

  const defaultProps = {
    tasks: mockTasks,
    activeTaskId: '1',
    onToggleComplete: vi.fn(),
    onSetActive: vi.fn(),
    onDelete: vi.fn(),
    onClearCompleted: vi.fn(),
    onReorderTasks: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no tasks', () => {
    render(<TaskList {...defaultProps} tasks={[]} />)
    
    expect(screen.getByText('No tasks yet. Add the first item you want to finish this session.')).toBeInTheDocument()
  })

  it('should render active tasks in the main section', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByText('Active Task 1')).toBeInTheDocument()
    expect(screen.getByText('Active Task 2')).toBeInTheDocument()
  })

  it('should render completed tasks in separate section', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should highlight active task with different styling', () => {
    render(<TaskList {...defaultProps} />)
    
    const activeTask = screen.getByText('Active Task 1').closest('.glass-panel-active')
    const inactiveTask = screen.getByText('Active Task 2').closest('.glass-panel')
    
    expect(activeTask).toBeInTheDocument()
    expect(activeTask).toHaveClass('glass-panel-active')
    expect(inactiveTask).toBeInTheDocument()
    expect(inactiveTask).not.toHaveClass('glass-panel-active')
  })

  it('should display pomodoro progress correctly', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getAllByText(hasTextContent('1/3 pomodoros')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(hasTextContent('0/2 pomodoros')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(hasTextContent('4/4 pomodoros')).length).toBeGreaterThan(0)
  })

  it('should call onSetActive when clicking on a task', () => {
    const onSetActive = vi.fn()
    render(<TaskList {...defaultProps} onSetActive={onSetActive} />)
    
    const task = screen.getByText('Active Task 2')
    fireEvent.click(task)
    
    expect(onSetActive).toHaveBeenCalledWith('2')
  })

  it('should call onToggleComplete when clicking task completion button', () => {
    const onToggleComplete = vi.fn()
    render(<TaskList {...defaultProps} onToggleComplete={onToggleComplete} />)
    
    const completionButtons = screen.getAllByLabelText(/Mark as/)
    fireEvent.click(completionButtons[0]) // First active task
    
    expect(onToggleComplete).toHaveBeenCalledWith('1')
  })

  it('should show different icons for completed and incomplete tasks', () => {
    render(<TaskList {...defaultProps} />)
    
    // Active tasks should have Circle icon (empty circle)
    const incompleteButtons = screen.getAllByLabelText('Mark as complete')
    expect(incompleteButtons).toHaveLength(2)
    
    // Completed tasks should have CheckCircle icon
    const completeButtons = screen.getAllByLabelText('Mark as incomplete')
    expect(completeButtons).toHaveLength(1)
  })

  it('should show task options menu when clicking more button', () => {
    render(<TaskList {...defaultProps} />)
    
    const moreButtons = screen.getAllByLabelText('Task options')
    fireEvent.click(moreButtons[0])
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should call onDelete when clicking delete in options menu', () => {
    const onDelete = vi.fn()
    render(<TaskList {...defaultProps} onDelete={onDelete} />)
    
    // Open menu for first task
    const moreButtons = screen.getAllByLabelText('Task options')
    fireEvent.click(moreButtons[0])
    
    // Click delete
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('should close menu after deleting task', () => {
    render(<TaskList {...defaultProps} />)
    
    // Open menu
    const moreButtons = screen.getAllByLabelText('Task options')
    fireEvent.click(moreButtons[0])
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
    
    // Delete task
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    // Menu should be closed
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('should show clear all button for completed tasks', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByLabelText('Clear all completed tasks')).toBeInTheDocument()
    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('should call onClearCompleted when clicking clear all button', () => {
    const onClearCompleted = vi.fn()
    render(<TaskList {...defaultProps} onClearCompleted={onClearCompleted} />)
    
    const clearAllButton = screen.getByLabelText('Clear all completed tasks')
    fireEvent.click(clearAllButton)
    
    expect(onClearCompleted).toHaveBeenCalledTimes(1)
  })

  it('should not show completed section when no completed tasks', () => {
    const tasksWithoutCompleted = mockTasks.filter(task => !task.completed)
    render(<TaskList {...defaultProps} tasks={tasksWithoutCompleted} />)
    
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })

  it('should apply line-through styling to completed tasks', () => {
    render(<TaskList {...defaultProps} />)
    
    const completedTaskTitle = screen.getByText('Completed Task 1')
    expect(completedTaskTitle).toHaveClass('line-through')
  })

  it('should show delete button on hover for completed tasks', () => {
    render(<TaskList {...defaultProps} />)
    
    const completedTaskContainer = screen.getByText('Completed Task 1').closest('.glass-panel')
    expect(completedTaskContainer).toBeInTheDocument()
    
    expect(within(completedTaskContainer as HTMLElement).getByLabelText('Delete task')).toBeInTheDocument()
  })

  it('should handle clicking outside menu to close it', () => {
    render(<TaskList {...defaultProps} />)
    
    // Open menu
    const moreButtons = screen.getAllByLabelText('Task options')
    fireEvent.click(moreButtons[0])
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
    
    // Click another menu button (should close first and open second)
    fireEvent.click(moreButtons[1])
    
    // Should now show menu for second task
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should prevent event propagation when clicking completion button', () => {
    const onSetActive = vi.fn()
    const onToggleComplete = vi.fn()
    
    render(
      <TaskList 
        {...defaultProps} 
        onSetActive={onSetActive} 
        onToggleComplete={onToggleComplete} 
      />
    )
    
    const completionButton = screen.getAllByLabelText('Mark as complete')[0]
    fireEvent.click(completionButton)
    
    // Should call toggle but not setActive (event should be stopped)
    expect(onToggleComplete).toHaveBeenCalledWith('1')
    expect(onSetActive).not.toHaveBeenCalled()
  })

  it('should handle tasks with different completion states correctly', () => {
    const mixedTasks: Task[] = [
      { ...mockTasks[0], completedPomodoros: 3, estimatedPomodoros: 3 }, // Complete pomodoros but not marked complete
      { ...mockTasks[1], completed: true, completedPomodoros: 1, estimatedPomodoros: 2 }, // Marked complete but incomplete pomodoros
    ]
    
    render(<TaskList {...defaultProps} tasks={mixedTasks} />)
    
    expect(screen.getAllByText(hasTextContent('3/3 pomodoros')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(hasTextContent('1/2 pomodoros')).length).toBeGreaterThan(0)
  })

  it('should maintain menu state independently for each task', () => {
    render(<TaskList {...defaultProps} />)
    
    const moreButtons = screen.getAllByLabelText('Task options')
    
    // Open first menu
    fireEvent.click(moreButtons[0])
    expect(screen.getByText('Delete')).toBeInTheDocument()
    
    // Click same button to close
    fireEvent.click(moreButtons[0])
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    
    // Open second menu
    fireEvent.click(moreButtons[1])
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})
