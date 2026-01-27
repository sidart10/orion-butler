/**
 * StatusIndicator Component Unit Tests
 *
 * Story 1.9: Status Indicator Component
 * Tests cover all acceptance criteria for status states, sizes, animations, and accessibility
 *
 * Test ID Convention: 1.9-UNIT-{SEQ}
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { StatusIndicator, type StatusType } from '@/components/ui/status-indicator'

// =============================================================================
// 1.1 Status State Color Tests (AC#1, AC#2, AC#3, AC#5, AC#6)
// =============================================================================

describe('StatusIndicator State Colors', () => {
  // 1.9-UNIT-001: Idle indicator displays in muted gray (AC#3)
  it('1.9-UNIT-001: Idle indicator renders with muted gray background', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('bg-orion-fg-muted')
  })

  // 1.9-UNIT-002: Thinking indicator displays in gold (AC#1)
  it('1.9-UNIT-002: Thinking indicator renders with gold background', () => {
    render(<StatusIndicator status="thinking" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('bg-orion-gold')
  })

  // 1.9-UNIT-003: Acting indicator displays in gold
  it('1.9-UNIT-003: Acting indicator renders with gold background', () => {
    render(<StatusIndicator status="acting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('bg-orion-gold')
  })

  // 1.9-UNIT-004: Waiting indicator displays in blue (#3B82F6) (AC#2)
  it('1.9-UNIT-004: Waiting indicator renders with blue background', () => {
    render(<StatusIndicator status="waiting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('bg-[#3B82F6]')
  })

  // 1.9-UNIT-005: Success indicator displays in gold (AC#5)
  it('1.9-UNIT-005: Success indicator renders with gold color for checkmark', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    const iconContainer = indicator.querySelector('span[aria-hidden="true"]')
    expect(iconContainer?.className).toContain('text-orion-gold')
  })

  // 1.9-UNIT-006: Error indicator displays in red (AC#6)
  it('1.9-UNIT-006: Error indicator renders with red background', () => {
    render(<StatusIndicator status="error" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('bg-orion-error')
  })
})

// =============================================================================
// 1.2 Animation Tests (AC#1, AC#8)
// =============================================================================

describe('StatusIndicator Animations', () => {
  // 1.9-UNIT-007: Thinking indicator has pulse animation (AC#1, AC#8)
  it('1.9-UNIT-007: Thinking indicator applies pulse animation class', () => {
    render(<StatusIndicator status="thinking" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('animate-status-pulse')
  })

  // 1.9-UNIT-008: Waiting indicator has pulse animation (AC#8)
  it('1.9-UNIT-008: Waiting indicator applies pulse animation class', () => {
    render(<StatusIndicator status="waiting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('animate-status-pulse')
  })

  // 1.9-UNIT-009: Acting indicator has spin animation
  it('1.9-UNIT-009: Acting indicator applies spin animation class', () => {
    render(<StatusIndicator status="acting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('animate-status-spin')
  })

  // 1.9-UNIT-010: Idle indicator has no animation
  it('1.9-UNIT-010: Idle indicator has no animation class', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).not.toContain('animate-status-pulse')
    expect(dot?.className).not.toContain('animate-status-spin')
  })

  // 1.9-UNIT-011: Error indicator has no animation
  it('1.9-UNIT-011: Error indicator has no animation class', () => {
    render(<StatusIndicator status="error" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).not.toContain('animate-status-pulse')
    expect(dot?.className).not.toContain('animate-status-spin')
  })

  // 1.9-UNIT-012: Success indicator has no animation
  it('1.9-UNIT-012: Success indicator has no animation class', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    const iconContainer = indicator.querySelector('span[aria-hidden="true"]')
    expect(iconContainer?.className).not.toContain('animate-status-pulse')
    expect(iconContainer?.className).not.toContain('animate-status-spin')
  })
})

// =============================================================================
// 1.3 Size Variant Tests (AC#7)
// =============================================================================

describe('StatusIndicator Size Variants', () => {
  // 1.9-UNIT-013: Small size renders at 6px (AC#7)
  it('1.9-UNIT-013: Small size indicator has h-1.5 w-1.5 classes (6px)', () => {
    render(<StatusIndicator status="idle" size="sm" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('h-1.5')
    expect(dot?.className).toContain('w-1.5')
  })

  // 1.9-UNIT-014: Medium size renders at 8px (AC#7)
  it('1.9-UNIT-014: Medium size indicator has h-2 w-2 classes (8px)', () => {
    render(<StatusIndicator status="idle" size="md" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('h-2')
    expect(dot?.className).toContain('w-2')
  })

  // 1.9-UNIT-015: Large size renders at 12px (AC#7)
  it('1.9-UNIT-015: Large size indicator has h-3 w-3 classes (12px)', () => {
    render(<StatusIndicator status="idle" size="lg" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('h-3')
    expect(dot?.className).toContain('w-3')
  })

  // 1.9-UNIT-016: Default size is medium (8px)
  it('1.9-UNIT-016: Default size is medium (h-2 w-2)', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('h-2')
    expect(dot?.className).toContain('w-2')
  })
})

// =============================================================================
// 1.4 Geometric Shape Tests (AC#4)
// =============================================================================

describe('StatusIndicator Geometric Shapes', () => {
  const nonSuccessStatuses: StatusType[] = ['idle', 'thinking', 'acting', 'waiting', 'error']

  // 1.9-UNIT-017: Non-success states use filled circle (rounded-full)
  it.each(nonSuccessStatuses)(
    '1.9-UNIT-017+: %s status uses filled circle (rounded-full)',
    (status) => {
      render(<StatusIndicator status={status} />)
      const indicator = screen.getByRole('status')
      const dot = indicator.querySelector('span[aria-hidden="true"]')
      expect(dot?.className).toContain('rounded-full')
    }
  )

  // 1.9-UNIT-022: No emojis in any status state (AC#4)
  it('1.9-UNIT-022: No emoji characters in any status indicator', () => {
    const allStatuses: StatusType[] = ['idle', 'thinking', 'acting', 'waiting', 'success', 'error']

    allStatuses.forEach((status) => {
      const { container } = render(<StatusIndicator status={status} />)
      const text = container.textContent || ''
      // Check for common emoji unicode ranges
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
      expect(text.match(emojiRegex)).toBeNull()
    })
  })
})

// =============================================================================
// 1.5 Success State Tests (AC#5)
// =============================================================================

describe('StatusIndicator Success State', () => {
  // 1.9-UNIT-023: Success state renders checkmark icon (AC#5)
  it('1.9-UNIT-023: Success state renders Lucide checkmark icon', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    // Lucide icons render as SVG
    const svg = indicator.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  // 1.9-UNIT-024: Success state does NOT render a filled circle
  it('1.9-UNIT-024: Success state does not render filled circle dot', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    const dots = indicator.querySelectorAll('span.rounded-full.bg-orion-gold')
    expect(dots.length).toBe(0)
  })

  // 1.9-UNIT-025: Success checkmark is gold colored
  it('1.9-UNIT-025: Success checkmark has gold color class', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    const iconContainer = indicator.querySelector('span[aria-hidden="true"]')
    expect(iconContainer?.className).toContain('text-orion-gold')
  })
})

// =============================================================================
// 1.6 Accessibility Tests (AC#9, AC#10)
// =============================================================================

describe('StatusIndicator Accessibility', () => {
  // 1.9-UNIT-026: Has role="status" for ARIA live region
  it('1.9-UNIT-026: Indicator has role="status"', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    expect(indicator).toBeDefined()
  })

  // 1.9-UNIT-027: Idle state has correct aria-label
  it('1.9-UNIT-027: Idle state has aria-label "Agent is idle"', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Agent is idle')
  })

  // 1.9-UNIT-028: Thinking state has correct aria-label
  it('1.9-UNIT-028: Thinking state has aria-label "Agent is thinking"', () => {
    render(<StatusIndicator status="thinking" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Agent is thinking')
  })

  // 1.9-UNIT-029: Acting state has correct aria-label
  it('1.9-UNIT-029: Acting state has aria-label "Agent is acting"', () => {
    render(<StatusIndicator status="acting" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Agent is acting')
  })

  // 1.9-UNIT-030: Waiting state has correct aria-label
  it('1.9-UNIT-030: Waiting state has aria-label "Agent is waiting"', () => {
    render(<StatusIndicator status="waiting" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Agent is waiting')
  })

  // 1.9-UNIT-031: Success state has correct aria-label
  it('1.9-UNIT-031: Success state has aria-label "Action completed successfully"', () => {
    render(<StatusIndicator status="success" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Action completed successfully')
  })

  // 1.9-UNIT-032: Error state has correct aria-label
  it('1.9-UNIT-032: Error state has aria-label "An error occurred"', () => {
    render(<StatusIndicator status="error" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('An error occurred')
  })

  // 1.9-UNIT-033: Indicator is focusable (tabIndex=0)
  it('1.9-UNIT-033: Indicator has tabIndex=0 for keyboard focus', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('tabIndex')).toBe('0')
  })

  // 1.9-UNIT-034: Focus state uses 2px gold outline with 2px offset (AC#10)
  it('1.9-UNIT-034: Focus state has gold outline classes', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    expect(indicator.className).toContain('focus-visible:outline')
    expect(indicator.className).toContain('focus-visible:outline-2')
    expect(indicator.className).toContain('focus-visible:outline-offset-2')
    expect(indicator.className).toContain('focus-visible:outline-orion-gold')
  })

  // 1.9-UNIT-035: Visual element has aria-hidden="true"
  it('1.9-UNIT-035: Visual dot has aria-hidden="true"', () => {
    render(<StatusIndicator status="idle" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot?.getAttribute('aria-hidden')).toBe('true')
  })
})

// =============================================================================
// 1.7 Reduced Motion Tests (AC#9)
// =============================================================================

describe('StatusIndicator Reduced Motion', () => {
  // 1.9-UNIT-036: Thinking indicator has motion-reduce class
  it('1.9-UNIT-036: Thinking indicator respects prefers-reduced-motion', () => {
    render(<StatusIndicator status="thinking" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('motion-reduce:animate-none')
  })

  // 1.9-UNIT-037: Acting indicator has motion-reduce class
  it('1.9-UNIT-037: Acting indicator respects prefers-reduced-motion', () => {
    render(<StatusIndicator status="acting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('motion-reduce:animate-none')
  })

  // 1.9-UNIT-038: Waiting indicator has motion-reduce class
  it('1.9-UNIT-038: Waiting indicator respects prefers-reduced-motion', () => {
    render(<StatusIndicator status="waiting" />)
    const indicator = screen.getByRole('status')
    const dot = indicator.querySelector('span[aria-hidden="true"]')
    expect(dot?.className).toContain('motion-reduce:animate-none')
  })
})

// =============================================================================
// 1.8 Label Display Tests
// =============================================================================

describe('StatusIndicator Labels', () => {
  // 1.9-UNIT-039: showLabel=true displays label text
  it('1.9-UNIT-039: showLabel displays visible label text', () => {
    render(<StatusIndicator status="thinking" showLabel />)
    const indicator = screen.getByRole('status')
    expect(indicator.textContent).toContain('Thinking')
  })

  // 1.9-UNIT-040: showLabel=false does not display label text
  it('1.9-UNIT-040: showLabel=false hides label text', () => {
    render(<StatusIndicator status="thinking" />)
    const indicator = screen.getByRole('status')
    expect(indicator.textContent).not.toContain('Thinking')
  })

  // 1.9-UNIT-041: Each status has correct display label
  it('1.9-UNIT-041: All statuses have correct display labels', () => {
    const statusLabels: [StatusType, string][] = [
      ['idle', 'Idle'],
      ['thinking', 'Thinking'],
      ['acting', 'Acting'],
      ['waiting', 'Waiting'],
      ['success', 'Success'],
      ['error', 'Error'],
    ]

    statusLabels.forEach(([status, expectedLabel]) => {
      const { unmount } = render(<StatusIndicator status={status} showLabel />)
      const indicator = screen.getByRole('status')
      expect(indicator.textContent).toContain(expectedLabel)
      unmount()
    })
  })
})

// =============================================================================
// 1.9 Default Props Tests
// =============================================================================

describe('StatusIndicator Default Props', () => {
  // 1.9-UNIT-042: Default status is idle
  it('1.9-UNIT-042: Default status is idle', () => {
    render(<StatusIndicator />)
    const indicator = screen.getByRole('status')
    expect(indicator.getAttribute('aria-label')).toBe('Agent is idle')
  })

  // 1.9-UNIT-043: Default showLabel is false
  it('1.9-UNIT-043: Default showLabel is false', () => {
    render(<StatusIndicator />)
    const indicator = screen.getByRole('status')
    expect(indicator.textContent).not.toContain('Idle')
  })
})

// =============================================================================
// 1.10 Ref Forwarding Tests
// =============================================================================

describe('StatusIndicator Ref Forwarding', () => {
  // 1.9-UNIT-044: Ref is forwarded to span element
  it('1.9-UNIT-044: Forwards ref to span element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<StatusIndicator ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  // 1.9-UNIT-045: Ref element has role="status"
  it('1.9-UNIT-045: Ref element has role="status"', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<StatusIndicator ref={ref} />)
    expect(ref.current?.getAttribute('role')).toBe('status')
  })
})

// =============================================================================
// 1.11 Custom ClassName Tests
// =============================================================================

describe('StatusIndicator Custom ClassName', () => {
  // 1.9-UNIT-046: Custom className is applied
  it('1.9-UNIT-046: Custom className is applied to indicator', () => {
    render(<StatusIndicator className="custom-test-class" />)
    const indicator = screen.getByRole('status')
    expect(indicator.className).toContain('custom-test-class')
  })

  // 1.9-UNIT-047: Custom className does not override base classes
  it('1.9-UNIT-047: Custom className does not override focus classes', () => {
    render(<StatusIndicator className="custom-class" />)
    const indicator = screen.getByRole('status')
    expect(indicator.className).toContain('focus-visible:outline')
    expect(indicator.className).toContain('custom-class')
  })
})

// =============================================================================
// 1.12 Display Name Test
// =============================================================================

describe('StatusIndicator DisplayName', () => {
  // 1.9-UNIT-048: Component has displayName for DevTools
  it('1.9-UNIT-048: StatusIndicator has displayName', () => {
    expect(StatusIndicator.displayName).toBe('StatusIndicator')
  })
})

// =============================================================================
// 1.13 Size Variants with Success State
// =============================================================================

describe('StatusIndicator Success State Sizes', () => {
  // 1.9-UNIT-049: Success state sm renders appropriate icon size
  it('1.9-UNIT-049: Success sm renders SVG icon', () => {
    render(<StatusIndicator status="success" size="sm" />)
    const indicator = screen.getByRole('status')
    const svg = indicator.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  // 1.9-UNIT-050: Success state lg renders appropriate icon size
  it('1.9-UNIT-050: Success lg renders SVG icon', () => {
    render(<StatusIndicator status="success" size="lg" />)
    const indicator = screen.getByRole('status')
    const svg = indicator.querySelector('svg')
    expect(svg).not.toBeNull()
  })
})
