import { fireEvent, render, screen, waitFor } from '@/test/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BackupPanel from './BackupPanel'
import {
  clearProductivityData,
  exportProductivityBackup,
  importProductivityBackup,
  type ProductivityBackupData,
} from '@/features/analytics/hooks/useProductivityData'

const { errorToast, successToast } = vi.hoisted(() => ({
  successToast: vi.fn(),
  errorToast: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: successToast,
    error: errorToast,
  },
}))

vi.mock('@/features/analytics/hooks/useProductivityData', async () => {
  const actual = await vi.importActual<typeof import('@/features/analytics/hooks/useProductivityData')>('@/features/analytics/hooks/useProductivityData')

  return {
    ...actual,
    exportProductivityBackup: vi.fn(),
    importProductivityBackup: vi.fn(),
    clearProductivityData: vi.fn(),
  }
})

describe('BackupPanel', () => {
  const reload = vi.fn().mockResolvedValue(undefined)
  const confirmSpy = vi.spyOn(window, 'confirm')
  const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

  const getReloadTimerCalls = () => setTimeoutSpy.mock.calls.filter(([callback]) => (
    typeof callback === 'function' && callback.toString().includes('location.reload')
  ))

  beforeEach(() => {
    reload.mockClear()
    successToast.mockClear()
    errorToast.mockClear()
    confirmSpy.mockReset()
    setTimeoutSpy.mockClear()
    vi.mocked(exportProductivityBackup).mockReset()
    vi.mocked(importProductivityBackup).mockReset()
    vi.mocked(clearProductivityData).mockReset()
  })

  it('exports backup data as a local JSON file and shows a success toast', async () => {
    const backupData: ProductivityBackupData = {
      version: 1,
      timestamp: 123456,
      appVersion: '1.0.0',
      tasks: [],
      pomodoroHistory: [],
      timerState: null,
      activeTaskId: null,
      settings: {},
    }

    vi.mocked(exportProductivityBackup).mockResolvedValue(backupData)

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(),
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
      configurable: true,
    })

    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:backup')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<BackupPanel reload={reload} />)

    fireEvent.click(screen.getByRole('button', { name: /export data/i }))

    await waitFor(() => {
      expect(successToast).toHaveBeenCalledWith('Backup exported successfully', {
        description: 'Your data has been downloaded as a JSON file.',
      })
    })

    expect(exportProductivityBackup).toHaveBeenCalledTimes(1)
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:backup')

    clickSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
  })

  it('shows a graceful error when exporting fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.mocked(exportProductivityBackup).mockRejectedValue(new Error('Export blocked'))

    render(<BackupPanel reload={reload} />)

    fireEvent.click(screen.getByRole('button', { name: /export data/i }))

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith('Failed to export backup', {
        description: 'Please try again or contact support if the issue persists.',
      })
    })

    expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error))
    expect(reload).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('refreshes analytics in place after a successful import without hard reloading the page', async () => {
    vi.mocked(importProductivityBackup).mockResolvedValue(undefined)

    render(<BackupPanel reload={reload} />)

    const inputElement = screen.getByLabelText(/import data/i) as HTMLInputElement

    const file = {
      name: 'backup.json',
      type: 'application/json',
      text: vi.fn().mockResolvedValue(JSON.stringify({
        version: 1,
        timestamp: 123456,
        appVersion: '1.0.0',
        tasks: [],
        pomodoroHistory: [],
        timerState: null,
        activeTaskId: null,
        settings: {},
      })),
    }

    fireEvent.change(inputElement, { target: { files: [file] } })

    await waitFor(() => {
      expect(importProductivityBackup).toHaveBeenCalledTimes(1)
    })

    expect(reload).toHaveBeenCalledTimes(1)
    expect(getReloadTimerCalls()).toHaveLength(0)
    expect(successToast).toHaveBeenCalledWith('Backup imported successfully', {
      description: 'Your data has been restored and analytics were refreshed.',
    })
    expect(inputElement.value).toBe('')
  })

  it('shows a graceful error for malformed imports and does not refresh analytics', async () => {
    render(<BackupPanel reload={reload} />)

    const inputElement = screen.getByLabelText(/import data/i) as HTMLInputElement

    const invalidFile = {
      name: 'invalid.json',
      type: 'application/json',
      text: vi.fn().mockResolvedValue('{"broken":true}'),
    }

    fireEvent.change(inputElement, { target: { files: [invalidFile] } })

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith('Failed to import backup', {
        description: 'Invalid backup file format',
      })
    })

    expect(importProductivityBackup).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
    expect(getReloadTimerCalls()).toHaveLength(0)
    expect(inputElement.value).toBe('')
  })

  it('clears data after confirmation and reloads analytics without leaving the page', async () => {
    confirmSpy.mockReturnValue(true)
    vi.mocked(clearProductivityData).mockResolvedValue(undefined)

    render(<BackupPanel reload={reload} />)

    fireEvent.click(screen.getByRole('button', { name: /clear all data/i }))

    await waitFor(() => {
      expect(clearProductivityData).toHaveBeenCalledTimes(1)
    })

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to clear all data? This action cannot be undone.')
    expect(reload).toHaveBeenCalledTimes(1)
    expect(getReloadTimerCalls()).toHaveLength(0)
    expect(successToast).toHaveBeenCalledWith('All data cleared', {
      description: 'Your data has been removed and analytics were refreshed.',
    })
  })

  it('does not clear or reload when the destructive confirmation is declined', () => {
    confirmSpy.mockReturnValue(false)

    render(<BackupPanel reload={reload} />)

    fireEvent.click(screen.getByRole('button', { name: /clear all data/i }))

    expect(clearProductivityData).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
    expect(successToast).not.toHaveBeenCalled()
    expect(errorToast).not.toHaveBeenCalled()
  })

  it('shows a graceful error when clearing data fails after confirmation', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    confirmSpy.mockReturnValue(true)
    vi.mocked(clearProductivityData).mockRejectedValue(new Error('Clear blocked'))

    render(<BackupPanel reload={reload} />)

    fireEvent.click(screen.getByRole('button', { name: /clear all data/i }))

    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledWith('Failed to clear data', {
        description: 'Please try again or contact support.',
      })
    })

    expect(reload).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith('Clear data failed:', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
