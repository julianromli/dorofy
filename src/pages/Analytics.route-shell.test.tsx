import { render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

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
})

afterAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: originalMatchMedia,
  })
})

afterEach(() => {
  window.history.pushState({}, '', '/')
  vi.restoreAllMocks()
})

describe('Analytics route shell', () => {
  it('renders the analytics page at /analytics', async () => {
    window.history.pushState({}, '', '/analytics')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
  })

  it('falls back to NotFound for unknown routes', () => {
    window.history.pushState({}, '', '/missing-route')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<App />)

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument()
  })
})
