import { render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import App from '@/App'

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
})

afterEach(() => {
  window.history.pushState({}, '', '/')
  vi.restoreAllMocks()
})

describe('Analytics route integration', () => {
  it('renders analytics as a route without the legacy analytics sheet surface', async () => {
    window.history.pushState({}, '', '/analytics')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
    expect(screen.queryByText('Productivity Analytics')).not.toBeInTheDocument()
    expect(screen.queryByText('Review your focus rhythm, completed tasks, and backups from a single glass workspace.')).not.toBeInTheDocument()
  })
})
