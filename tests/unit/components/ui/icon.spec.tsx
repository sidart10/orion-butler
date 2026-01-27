/**
 * Icon Component Unit Tests
 *
 * Story 1.20: Icon System
 * Tests cover all acceptance criteria for icon wrapper component
 *
 * Test ID Convention: 1.20-UNIT-{SEQ}
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from '@/components/ui/icon'
import { Home, Settings, User, Bell } from 'lucide-react'

// =============================================================================
// 1.1 Default Rendering Tests
// =============================================================================

describe('Icon Default Rendering', () => {
  // 1.20-UNIT-001: Icon renders with default size (md = 20px)
  it('1.20-UNIT-001: Icon renders with default md size (20px)', () => {
    render(<Icon icon={Home} data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  // 1.20-UNIT-002: Icon renders with default color (text-orion-fg)
  it('1.20-UNIT-002: Icon renders with default color class', () => {
    render(<Icon icon={Home} data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('text-orion-fg')
  })

  // 1.20-UNIT-003: Icon is aria-hidden by default (decorative)
  it('1.20-UNIT-003: Icon has aria-hidden="true" by default', () => {
    render(<Icon icon={Home} data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})

// =============================================================================
// 1.2 Size Variant Tests
// =============================================================================

describe('Icon Size Variants', () => {
  // 1.20-UNIT-010: xs size renders at 12px
  it('1.20-UNIT-010: xs size renders at 12px', () => {
    render(<Icon icon={Settings} size="xs" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('width', '12')
    expect(svg).toHaveAttribute('height', '12')
  })

  // 1.20-UNIT-011: sm size renders at 16px
  it('1.20-UNIT-011: sm size renders at 16px', () => {
    render(<Icon icon={Settings} size="sm" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })

  // 1.20-UNIT-012: md size renders at 20px
  it('1.20-UNIT-012: md size renders at 20px', () => {
    render(<Icon icon={Settings} size="md" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  // 1.20-UNIT-013: lg size renders at 24px
  it('1.20-UNIT-013: lg size renders at 24px', () => {
    render(<Icon icon={Settings} size="lg" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })
})

// =============================================================================
// 1.3 Color Variant Tests
// =============================================================================

describe('Icon Color Variants', () => {
  // 1.20-UNIT-020: default color uses text-orion-fg
  it('1.20-UNIT-020: default color applies text-orion-fg class', () => {
    render(<Icon icon={User} color="default" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('text-orion-fg')
  })

  // 1.20-UNIT-021: muted color uses text-orion-fg-muted
  it('1.20-UNIT-021: muted color applies text-orion-fg-muted class', () => {
    render(<Icon icon={User} color="muted" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('text-orion-fg-muted')
  })

  // 1.20-UNIT-022: active color uses text-orion-gold
  it('1.20-UNIT-022: active color applies text-orion-gold class', () => {
    render(<Icon icon={User} color="active" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('text-orion-gold')
  })

  // 1.20-UNIT-023: disabled color uses text-orion-fg-faint
  it('1.20-UNIT-023: disabled color applies text-orion-fg-faint class', () => {
    render(<Icon icon={User} color="disabled" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('text-orion-fg-faint')
  })
})

// =============================================================================
// 1.4 className Passthrough Tests
// =============================================================================

describe('Icon className Passthrough', () => {
  // 1.20-UNIT-030: Custom className is applied
  it('1.20-UNIT-030: Custom className is merged with default classes', () => {
    render(<Icon icon={Bell} className="custom-class rotate-45" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveClass('custom-class')
    expect(svg).toHaveClass('rotate-45')
    // Should also have the default color class
    expect(svg).toHaveClass('text-orion-fg')
  })

  // 1.20-UNIT-031: Custom className can override color
  it('1.20-UNIT-031: Custom className can override default styles via Tailwind merge', () => {
    render(<Icon icon={Bell} className="text-red-500" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    // With tailwind-merge, the last text-* class should win
    expect(svg).toHaveClass('text-red-500')
  })
})

// =============================================================================
// 1.5 Accessibility Tests
// =============================================================================

describe('Icon Accessibility', () => {
  // 1.20-UNIT-040: aria-hidden can be set to false for meaningful icons
  it('1.20-UNIT-040: aria-hidden can be explicitly set to false', () => {
    render(<Icon icon={Home} aria-hidden={false} data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('aria-hidden', 'false')
  })

  // 1.20-UNIT-041: Additional aria attributes are passed through
  it('1.20-UNIT-041: aria-label is passed through to SVG', () => {
    render(<Icon icon={Home} aria-hidden={false} aria-label="Home navigation" data-testid="icon" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('aria-label', 'Home navigation')
  })
})

// =============================================================================
// 1.6 Prop Spreading Tests
// =============================================================================

describe('Icon Prop Spreading', () => {
  // 1.20-UNIT-050: data-testid is passed through
  it('1.20-UNIT-050: data-testid is passed through to SVG', () => {
    render(<Icon icon={Home} data-testid="my-icon" />)
    const svg = screen.getByTestId('my-icon')
    expect(svg).toBeInTheDocument()
  })

  // 1.20-UNIT-051: Other HTML attributes are passed through
  it('1.20-UNIT-051: Additional SVG attributes are passed through', () => {
    render(<Icon icon={Home} data-testid="icon" role="img" />)
    const svg = screen.getByTestId('icon')
    expect(svg).toHaveAttribute('role', 'img')
  })
})

// =============================================================================
// 1.7 Different Icons Test
// =============================================================================

describe('Icon with Different Lucide Icons', () => {
  // 1.20-UNIT-060: Works with various Lucide icons
  it('1.20-UNIT-060: Renders different Lucide icons correctly', () => {
    const { rerender } = render(<Icon icon={Home} data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()

    rerender(<Icon icon={Settings} data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()

    rerender(<Icon icon={User} data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()

    rerender(<Icon icon={Bell} data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
