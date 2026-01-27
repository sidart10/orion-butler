/**
 * Button Component Unit Tests
 *
 * Story 1.7: Button Component Hierarchy
 * Tests cover all acceptance criteria for button variants, sizes, and states
 *
 * Test ID Convention: 1.7-UNIT-{SEQ}
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Button } from '@/components/ui/button'

// =============================================================================
// 1.1 Variant Rendering Tests
// =============================================================================

describe('Button Variants', () => {
  // 1.7-UNIT-001: Primary button has gold background
  it('1.7-UNIT-001: Primary button renders with gold background class', () => {
    render(<Button variant="default">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-orion-gold')
  })

  // 1.7-UNIT-002: Primary button has dark text
  it('1.7-UNIT-002: Primary button renders with dark text class', () => {
    render(<Button variant="default">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-[#1A1A1A]')
  })

  // 1.7-UNIT-003: Secondary button has transparent background
  it('1.7-UNIT-003: Secondary button renders with transparent background', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
  })

  // 1.7-UNIT-004: Secondary button has gold border
  it('1.7-UNIT-004: Secondary button renders with gold border', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-orion-gold')
  })

  // 1.7-UNIT-005: Secondary button has gold text
  it('1.7-UNIT-005: Secondary button renders with gold text', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-orion-gold')
  })

  // 1.7-UNIT-006: Tertiary button has no border
  it('1.7-UNIT-006: Tertiary button renders with no border', () => {
    render(<Button variant="tertiary">Tertiary</Button>)
    const button = screen.getByRole('button')
    // Tertiary should not have any border-related classes for visible borders
    expect(button.className).not.toMatch(/border-orion-gold/)
    expect(button.className).not.toMatch(/border-orion-error/)
  })

  // 1.7-UNIT-007: Tertiary button has underline
  it('1.7-UNIT-007: Tertiary button renders with underline', () => {
    render(<Button variant="tertiary">Tertiary</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('underline')
  })

  // 1.7-UNIT-008: Destructive button has red text
  it('1.7-UNIT-008: Destructive button renders with red text', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-orion-error')
  })

  // 1.7-UNIT-009: Destructive button has no border
  it('1.7-UNIT-009: Destructive button renders with no border', () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
    expect(button.className).not.toMatch(/border-orion-gold/)
  })
})

// =============================================================================
// 1.2 Border Radius Tests (AC#5)
// =============================================================================

describe('Button Border Radius', () => {
  const variants = ['default', 'secondary', 'tertiary', 'destructive'] as const

  // 1.7-UNIT-010: All button variants have rounded-none class for 0px border-radius
  it.each(variants)(
    '1.7-UNIT-010+: %s variant has rounded-none for sharp corners',
    (variant) => {
      render(<Button variant={variant}>Test</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('rounded-none')
    }
  )
})

// =============================================================================
// 1.3 Size Tests (AC#6)
// =============================================================================

describe('Button Sizes', () => {
  // 1.7-UNIT-015: Default size has h-11 class for 44px touch target
  it('1.7-UNIT-015: Default size has h-11 class for 44px touch target', () => {
    render(<Button size="default">Default</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-11')
  })

  // 1.7-UNIT-016: Small size has h-11 class for 44px touch target
  it('1.7-UNIT-016: Small size has h-11 class for 44px touch target', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-11')
  })

  // 1.7-UNIT-017: Large size has h-13 class for 52px height
  it('1.7-UNIT-017: Large size has h-13 class for 52px height', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-13')
  })

  // 1.7-UNIT-018: Icon size is 44x44px square
  it('1.7-UNIT-018: Icon size is 44x44px square', () => {
    render(
      <Button size="icon">
        <span>X</span>
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/h-11.*w-11|w-11.*h-11/)
  })

  // 1.7-UNIT-019: All sizes render with correct padding
  it('1.7-UNIT-019: Default size has correct padding', () => {
    render(<Button size="default">Default</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('1.7-UNIT-019b: Small size has correct padding', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-3')
  })

  it('1.7-UNIT-019c: Large size has correct padding', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-8')
  })
})

// =============================================================================
// 1.4 Disabled State Tests
// =============================================================================

describe('Button Disabled State', () => {
  // 1.7-UNIT-020: Disabled button has opacity-50 class
  it('1.7-UNIT-020: Disabled button has opacity-50 class', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('disabled:opacity-50')
  })

  // 1.7-UNIT-021: Disabled button has pointer-events-none class
  it('1.7-UNIT-021: Disabled button has pointer-events-none class', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('disabled:pointer-events-none')
  })

  // 1.7-UNIT-022: Disabled button is not in tab order
  it('1.7-UNIT-022: Disabled button is disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('1.7-UNIT-022b: Disabled button does not respond to click', () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})

// =============================================================================
// 1.5 Loading State Tests
// =============================================================================

describe('Button Loading State', () => {
  // 1.7-UNIT-023: Loading button shows spinner
  it('1.7-UNIT-023: Loading button shows spinner', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    // Spinner should be present (we use animate-spin class on an SVG)
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  // 1.7-UNIT-024: Loading button has aria-busy attribute
  it('1.7-UNIT-024: Loading button has aria-busy attribute', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  // 1.7-UNIT-025: Loading button is disabled
  it('1.7-UNIT-025: Loading button is disabled', () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('1.7-UNIT-025b: Loading button does not respond to click', () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Loading
      </Button>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})

// =============================================================================
// 1.6 Component API Tests
// =============================================================================

describe('Button Component API', () => {
  // 1.7-UNIT-026: Button forwards ref
  it('1.7-UNIT-026: Button forwards ref correctly', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  // 1.7-UNIT-027: asChild prop works with Slot
  it('1.7-UNIT-027: asChild prop renders child as button', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    // The link should have button styling classes
    expect(link.className).toContain('bg-orion-gold')
  })

  // 1.7-UNIT-028: className prop merges correctly
  it('1.7-UNIT-028: className merges with variant classes', () => {
    render(<Button className="custom-class">Merge</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
    expect(button.className).toContain('bg-orion-gold') // default variant
  })

  it('1.7-UNIT-028b: Props pass through correctly', () => {
    render(
      <Button type="submit" data-testid="submit-btn">
        Submit
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('data-testid', 'submit-btn')
  })
})

// =============================================================================
// 1.7 Focus State Tests (AC#7)
// =============================================================================

describe('Button Focus States', () => {
  // 1.7-INT-008: Focus ring uses design system tokens
  it('1.7-INT-008: Default variant has gold focus ring classes', () => {
    render(<Button variant="default">Focus Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('focus-visible:outline-orion-gold')
    expect(button.className).toContain('focus-visible:outline-2')
    expect(button.className).toContain('focus-visible:outline-offset-2')
  })

  it('1.7-INT-008b: Secondary variant has gold focus ring classes', () => {
    render(<Button variant="secondary">Focus Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('focus-visible:outline-orion-gold')
  })

  it('1.7-INT-008c: Tertiary variant has gold focus ring classes', () => {
    render(<Button variant="tertiary">Focus Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('focus-visible:outline-orion-gold')
  })

  it('1.7-INT-008d: Destructive variant has red focus ring classes', () => {
    render(<Button variant="destructive">Focus Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('focus-visible:outline-orion-error')
  })
})

// =============================================================================
// 1.8 Transition Tests (AC#4 related)
// =============================================================================

describe('Button Transitions', () => {
  it('Buttons have transition classes for state changes', () => {
    render(<Button>Transition Test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('transition-colors')
    expect(button.className).toContain('duration-100')
  })
})

// =============================================================================
// 1.9 Accessibility Tests
// =============================================================================

describe('Button Accessibility', () => {
  it('Button is keyboard accessible (native button element)', () => {
    render(<Button>Accessible</Button>)
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
  })

  it('Button with asChild keeps accessibility', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
  })

  it('Icon button can have aria-label', () => {
    render(
      <Button size="icon" aria-label="Close">
        <span>X</span>
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Close')
  })
})

// =============================================================================
// 1.10 Display Name Test
// =============================================================================

describe('Button DisplayName', () => {
  it('Button has displayName for debugging', () => {
    expect(Button.displayName).toBe('Button')
  })
})
