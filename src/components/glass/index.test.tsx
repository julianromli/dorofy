import type { ButtonHTMLAttributes, ComponentType, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { fireEvent, render, screen } from '@/test/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GlassButton, LiquidGlassSurface } from '@/components/glass'
import { useBrowserCapabilities } from '@/lib/browser-capabilities'

vi.mock('@yhooi2/shadcn-glass-ui/components', () => ({
  ButtonGlass: ({ children, icon: Icon, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ComponentType<{ className?: string }> }) => (
    <button {...props}>
      {Icon ? <Icon /> : null}
      {children}
    </button>
  ),
  GlassCard: ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  InputGlass: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  BadgeGlass: ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
  ProgressGlass: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  TabsGlass: {
    Root: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    List: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Trigger: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    Content: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  ModalGlass: {
    Root: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Overlay: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Content: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Header: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Title: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => <h2 {...props}>{children}</h2>,
    Description: ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    Body: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Footer: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    Close: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
  },
}))

vi.mock('@nkzw/liquid-glass', () => ({
  default: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div
      data-testid="liquid-glass"
      className={props.className}
    >
      {children}
    </div>
  ),
}))

vi.mock('@/lib/browser-capabilities', () => ({
  useBrowserCapabilities: vi.fn(),
}))

const mockUseBrowserCapabilities = vi.mocked(useBrowserCapabilities)

describe('glass adapters', () => {
  beforeEach(() => {
    mockUseBrowserCapabilities.mockReturnValue({
      supportsBackdropFilter: true,
      supportsDisplacementGlass: false,
      prefersReducedMotion: false,
      prefersReducedTransparency: false,
    })
  })

  it('renders local GlassButton and keeps click behavior', () => {
    const handleClick = vi.fn()

    render(<GlassButton onClick={handleClick}>Start</GlassButton>)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('falls back to frosted card when displacement glass is unavailable', () => {
    render(<LiquidGlassSurface>Fallback surface</LiquidGlassSurface>)

    expect(screen.getByText('Fallback surface')).toBeInTheDocument()
    expect(screen.queryByTestId('liquid-glass')).not.toBeInTheDocument()
  })

  it('uses liquid glass path when supported and motion is allowed', () => {
    mockUseBrowserCapabilities.mockReturnValue({
      supportsBackdropFilter: true,
      supportsDisplacementGlass: true,
      prefersReducedMotion: false,
      prefersReducedTransparency: false,
    })

    render(<LiquidGlassSurface>Hero surface</LiquidGlassSurface>)

    expect(screen.getByTestId('liquid-glass')).toBeInTheDocument()
    expect(screen.getByText('Hero surface')).toBeInTheDocument()
  })
})
