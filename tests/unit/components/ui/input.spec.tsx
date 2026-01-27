/**
 * Input and Textarea Component Unit Tests
 *
 * Story 1.8: Input Field Component
 * Tests cover all acceptance criteria for input variants, states, and accessibility
 *
 * Test ID Convention: 1.8-UNIT-{SEQ}
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// =============================================================================
// 1. Input Component - Basic Rendering
// =============================================================================

describe('Input Component - Basic Rendering', () => {
  // 1.8-UNIT-001: Input renders with placeholder
  it('1.8-UNIT-001: Input renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  // 1.8-UNIT-002: Input renders as input element
  it('1.8-UNIT-002: Input renders as input element', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.tagName).toBe('INPUT')
  })

  // 1.8-UNIT-003: Input forwards ref correctly
  it('1.8-UNIT-003: Input forwards ref correctly', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  // 1.8-UNIT-004: Input accepts custom className
  it('1.8-UNIT-004: Input accepts custom className', () => {
    render(<Input className="custom-class" data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('custom-class')
  })
})

// =============================================================================
// 2. Input Component - Design System Styling (AC#1, AC#3)
// =============================================================================

describe('Input Component - Design System Styling', () => {
  // 1.8-UNIT-005: Input has 0px border-radius (rounded-none) - AC#3
  it('1.8-UNIT-005: Input has 0px border-radius (rounded-none)', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('rounded-none')
  })

  // 1.8-UNIT-006: Input uses design system surface background
  it('1.8-UNIT-006: Input uses design system surface background', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('bg-orion-surface')
  })

  // 1.8-UNIT-007: Input uses design system border color
  it('1.8-UNIT-007: Input uses design system border color', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('border-orion-border')
  })

  // 1.8-UNIT-008: Input has 44px minimum height (h-11) for touch target
  it('1.8-UNIT-008: Input has 44px minimum height for touch target', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('h-11')
  })

  // 1.8-UNIT-009: Input uses design system text color
  it('1.8-UNIT-009: Input uses design system text color', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('text-orion-fg')
  })
})

// =============================================================================
// 3. Input Component - Placeholder Styling (AC#4)
// =============================================================================

describe('Input Component - Placeholder Styling', () => {
  // 1.8-UNIT-010: Placeholder text uses muted color from design tokens - AC#4
  it('1.8-UNIT-010: Placeholder text uses muted color from design tokens', () => {
    render(<Input data-testid="test-input" placeholder="Placeholder" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('placeholder:text-orion-fg-muted')
  })
})

// =============================================================================
// 4. Input Component - Focus State (AC#2)
// =============================================================================

describe('Input Component - Focus State', () => {
  // 1.8-UNIT-011: Focus state shows 2px gold outline - AC#2
  // Updated: Uses focus-visible:outline pattern per Story 1.16
  it('1.8-UNIT-011: Focus state shows 2px gold outline', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('focus-visible:outline-2')
    expect(input.className).toContain('focus-visible:outline-orion-gold')
  })

  // 1.8-UNIT-012: Focus state has 2px offset - AC#2
  it('1.8-UNIT-012: Focus state has 2px offset', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('focus-visible:outline-offset-2')
  })

  // 1.8-UNIT-013: Focus outline is removed via outline-none
  it('1.8-UNIT-013: Default outline is removed', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('focus:outline-none')
  })
})

// =============================================================================
// 5. Input Component - Error State
// =============================================================================

describe('Input Component - Error State', () => {
  // 1.8-UNIT-014: Error state shows error border
  it('1.8-UNIT-014: Error state shows error border', () => {
    render(<Input error data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('border-orion-error')
  })

  // 1.8-UNIT-015: Error state does not show default border
  it('1.8-UNIT-015: Error state does not show default border', () => {
    render(<Input error data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).not.toContain('border-orion-border')
  })

  // 1.8-UNIT-016: Error state focus ring is error color
  // Updated: Uses focus-visible:outline pattern per Story 1.16
  it('1.8-UNIT-016: Error state focus ring is error color', () => {
    render(<Input error data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('focus-visible:outline-orion-error')
  })

  // 1.8-UNIT-017: Error state can have aria-invalid attribute
  it('1.8-UNIT-017: Error state can have aria-invalid attribute', () => {
    render(<Input error aria-invalid={true} data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})

// =============================================================================
// 6. Input Component - Disabled State
// =============================================================================

describe('Input Component - Disabled State', () => {
  // 1.8-UNIT-018: Disabled input has 50% opacity
  it('1.8-UNIT-018: Disabled input has 50% opacity class', () => {
    render(<Input disabled data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('disabled:opacity-50')
  })

  // 1.8-UNIT-019: Disabled input has cursor-not-allowed
  it('1.8-UNIT-019: Disabled input has cursor-not-allowed', () => {
    render(<Input disabled data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('disabled:cursor-not-allowed')
  })

  // 1.8-UNIT-020: Disabled input is actually disabled
  it('1.8-UNIT-020: Disabled input is actually disabled', () => {
    render(<Input disabled data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input).toBeDisabled()
  })
})

// =============================================================================
// 7. Input Component - Icon Slots
// =============================================================================

describe('Input Component - Icon Slots', () => {
  // 1.8-UNIT-021: Left icon renders correctly
  it('1.8-UNIT-021: Left icon renders correctly', () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  // 1.8-UNIT-022: Right icon renders correctly
  it('1.8-UNIT-022: Right icon renders correctly', () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  // 1.8-UNIT-023: Both icons can render simultaneously
  it('1.8-UNIT-023: Both icons can render simultaneously', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      />
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  // 1.8-UNIT-024: Input with left icon has padding adjustment
  it('1.8-UNIT-024: Input with left icon has padding adjustment', () => {
    render(<Input leftIcon={<span>L</span>} data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('pl-12')
  })

  // 1.8-UNIT-025: Input with right icon has padding adjustment
  it('1.8-UNIT-025: Input with right icon has padding adjustment', () => {
    render(<Input rightIcon={<span>R</span>} data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('pr-12')
  })
})

// =============================================================================
// 8. Input Component - Full Width Mode
// =============================================================================

describe('Input Component - Full Width Mode', () => {
  // 1.8-UNIT-026: fullWidth prop makes input full width
  it('1.8-UNIT-026: fullWidth prop makes container full width', () => {
    const { container } = render(<Input fullWidth data-testid="test-input" />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('w-full')
  })
})

// =============================================================================
// 9. Input Component - Transition Animation
// =============================================================================

describe('Input Component - Transition Animation', () => {
  // 1.8-UNIT-027: Input has transition classes for state changes
  it('1.8-UNIT-027: Input has transition classes', () => {
    render(<Input data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    expect(input.className).toContain('transition-all')
    expect(input.className).toContain('duration-100')
  })
})

// =============================================================================
// 10. Textarea Component - Basic Rendering
// =============================================================================

describe('Textarea Component - Basic Rendering', () => {
  // 1.8-UNIT-028: Textarea renders with placeholder
  it('1.8-UNIT-028: Textarea renders with placeholder', () => {
    render(<Textarea placeholder="Enter message..." />)
    expect(screen.getByPlaceholderText('Enter message...')).toBeInTheDocument()
  })

  // 1.8-UNIT-029: Textarea renders as textarea element
  it('1.8-UNIT-029: Textarea renders as textarea element', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  // 1.8-UNIT-030: Textarea forwards ref correctly
  it('1.8-UNIT-030: Textarea forwards ref correctly', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})

// =============================================================================
// 11. Textarea Component - Design System Styling
// =============================================================================

describe('Textarea Component - Design System Styling', () => {
  // 1.8-UNIT-031: Textarea has 0px border-radius (rounded-none)
  it('1.8-UNIT-031: Textarea has 0px border-radius', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('rounded-none')
  })

  // 1.8-UNIT-032: Textarea uses design system surface background
  it('1.8-UNIT-032: Textarea uses design system surface background', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('bg-orion-surface')
  })

  // 1.8-UNIT-033: Textarea uses design system border color
  it('1.8-UNIT-033: Textarea uses design system border color', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('border-orion-border')
  })

  // 1.8-UNIT-034: Textarea has minimum height of 88px
  it('1.8-UNIT-034: Textarea has minimum height of 88px', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('min-h-[88px]')
  })

  // 1.8-UNIT-035: Textarea placeholder uses muted color
  it('1.8-UNIT-035: Textarea placeholder uses muted color', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('placeholder:text-orion-fg-muted')
  })
})

// =============================================================================
// 12. Textarea Component - Focus State
// =============================================================================

describe('Textarea Component - Focus State', () => {
  // 1.8-UNIT-036: Textarea focus state shows 2px gold outline
  // Updated: Uses focus-visible:outline pattern per Story 1.16
  it('1.8-UNIT-036: Textarea focus state shows 2px gold outline', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('focus-visible:outline-2')
    expect(textarea.className).toContain('focus-visible:outline-orion-gold')
  })

  // 1.8-UNIT-037: Textarea focus state has 2px offset
  it('1.8-UNIT-037: Textarea focus state has 2px offset', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('focus-visible:outline-offset-2')
  })
})

// =============================================================================
// 13. Textarea Component - Error State
// =============================================================================

describe('Textarea Component - Error State', () => {
  // 1.8-UNIT-038: Textarea error state shows error border
  it('1.8-UNIT-038: Textarea error state shows error border', () => {
    render(<Textarea error data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('border-orion-error')
  })

  // 1.8-UNIT-039: Textarea error state focus ring is error color
  // Updated: Uses focus-visible:outline pattern per Story 1.16
  it('1.8-UNIT-039: Textarea error state focus ring is error color', () => {
    render(<Textarea error data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('focus-visible:outline-orion-error')
  })

  // 1.8-UNIT-040: Textarea error can have aria-invalid attribute
  it('1.8-UNIT-040: Textarea error can have aria-invalid attribute', () => {
    render(<Textarea error aria-invalid={true} data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })
})

// =============================================================================
// 14. Textarea Component - Disabled State
// =============================================================================

describe('Textarea Component - Disabled State', () => {
  // 1.8-UNIT-041: Disabled textarea has 50% opacity
  it('1.8-UNIT-041: Disabled textarea has 50% opacity class', () => {
    render(<Textarea disabled data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('disabled:opacity-50')
  })

  // 1.8-UNIT-042: Disabled textarea has cursor-not-allowed
  it('1.8-UNIT-042: Disabled textarea has cursor-not-allowed', () => {
    render(<Textarea disabled data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('disabled:cursor-not-allowed')
  })

  // 1.8-UNIT-043: Disabled textarea is actually disabled
  it('1.8-UNIT-043: Disabled textarea is actually disabled', () => {
    render(<Textarea disabled data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea).toBeDisabled()
  })
})

// =============================================================================
// 15. Textarea Component - Auto-Resize
// =============================================================================

describe('Textarea Component - Auto-Resize', () => {
  // 1.8-UNIT-044: autoResize prop sets resize-none class
  it('1.8-UNIT-044: autoResize prop sets resize-none class', () => {
    render(<Textarea autoResize data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('resize-none')
  })

  // 1.8-UNIT-045: Without autoResize, textarea has resize-y
  it('1.8-UNIT-045: Without autoResize, textarea has resize-y', () => {
    render(<Textarea data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('resize-y')
  })

  // 1.8-UNIT-046: autoResize textarea has overflow-hidden
  it('1.8-UNIT-046: autoResize textarea has overflow-hidden', () => {
    render(<Textarea autoResize data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('overflow-hidden')
  })
})

// =============================================================================
// 16. Textarea Component - Full Width Mode
// =============================================================================

describe('Textarea Component - Full Width Mode', () => {
  // 1.8-UNIT-047: fullWidth prop makes textarea full width
  it('1.8-UNIT-047: fullWidth prop makes textarea full width', () => {
    render(<Textarea fullWidth data-testid="test-textarea" />)
    const textarea = screen.getByTestId('test-textarea')
    expect(textarea.className).toContain('w-full')
  })
})

// =============================================================================
// 17. Display Name Tests
// =============================================================================

describe('Component Display Names', () => {
  // 1.8-UNIT-048: Input has displayName for debugging
  it('1.8-UNIT-048: Input has displayName for debugging', () => {
    expect(Input.displayName).toBe('Input')
  })

  // 1.8-UNIT-049: Textarea has displayName for debugging
  it('1.8-UNIT-049: Textarea has displayName for debugging', () => {
    expect(Textarea.displayName).toBe('Textarea')
  })
})

// =============================================================================
// 18. Input Event Handling Tests
// =============================================================================

describe('Input Event Handling', () => {
  // 1.8-UNIT-050: Input onChange fires correctly
  it('1.8-UNIT-050: Input onChange fires correctly', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} data-testid="test-input" />)
    const input = screen.getByTestId('test-input')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalled()
  })
})
