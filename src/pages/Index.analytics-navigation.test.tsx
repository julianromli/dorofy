import { fireEvent, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App'

const originalMatchMedia = window.matchMedia

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })

  if (typeof window.Notification === 'undefined') {
    ;(window as { Notification?: unknown }).Notification = {
      permission: 'default',
      requestPermission: vi.fn(),
    }
  }
})

beforeEach(() => {
  if (window.Notification && 'requestPermission' in window.Notification) {
    vi.spyOn(window.Notification, 'requestPermission').mockResolvedValue('default')
  }
})

afterEach(() => {
  window.history.pushState({}, '', '/')
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('Index analytics navigation', () => {
  it('keeps the user on / and preserves the running timer UI when analytics confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    expect(screen.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('View analytics'))

    expect(confirmSpy).toHaveBeenCalledWith(
      'Leaving the timer page will stop and reset your current session. Do you want to continue to analytics?',
    )
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument()
  })

  it('navigates directly to /analytics without prompting when no timer session is running', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    fireEvent.click(screen.getByLabelText('View analytics'))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/analytics')
  })

  it('navigates to /analytics and resets persisted timer state after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))
    fireEvent.click(screen.getByLabelText('View analytics'))

    expect(confirmSpy).toHaveBeenCalledWith(
      'Leaving the timer page will stop and reset your current session. Do you want to continue to analytics?',
    )
    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/analytics')
    expect(screen.queryByText('Productivity Analytics')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Review your focus rhythm, completed tasks, and backups from a single glass workspace.'),
    ).not.toBeInTheDocument()
  })
})

afterAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: originalMatchMedia,
  })
})
