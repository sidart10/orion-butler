/**
 * IconButton Component Unit Tests
 *
 * Story 1.20: Icon System - IconButton (icon with optional visible label)
 * Tests cover all acceptance criteria for IconButton component
 *
 * Test ID Convention: 1.20-UNIT-{SEQ} (continuing from 100s for IconButton)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconButton } from '@/components/ui/icon-button'
import { Home, Settings, User, X, Plus } from 'lucide-react'

// =============================================================================
// 2.1 Label Accessibility Tests
// =============================================================================

describe('IconButton Label Accessibility', () => {
  // 1.20-UNIT-100: aria-label is used when showLabel=false (default)
  it('1.20-UNIT-100: Uses aria-label when showLabel is false (default)', () => {
    render(<IconButton icon={Home} label="Go home" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Go home')
    // Label text should NOT be visible
    expect(screen.queryByText('Go home')).not.toBeInTheDocument()
  })

  // 1.20-UNIT-101: Label is rendered visually when showLabel=true
  it('1.20-UNIT-101: Renders label visually when showLabel is true', () => {
    render(<IconButton icon={Home} label="Go home" showLabel />)
    const button = screen.getByRole('button')
    // Label text SHOULD be visible
    expect(screen.getByText('Go home')).toBeInTheDocument()
    // aria-label should NOT be present when label is visible
    expect(button).not.toHaveAttribute('aria-label')
  })

  // 1.20-UNIT-102: Button always has accessible name
  it('1.20-UNIT-102: Button always has accessible name via aria-label or visible text', () => {
    // Case 1: Hidden label (aria-label)
    const { rerender } = render(<IconButton icon={Settings} label="Settings" />)
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()

    // Case 2: Visible label
    rerender(<IconButton icon={Settings} label="Settings" showLabel />)
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })
})

// =============================================================================
// 2.2 Variant Tests
// =============================================================================

describe('IconButton Variants', () => {
  // 1.20-UNIT-110: Ghost variant (default) renders correctly
  it('1.20-UNIT-110: Ghost variant renders with transparent background', () => {
    render(<IconButton icon={Home} label="Home" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('bg-transparent')
  })

  // 1.20-UNIT-111: Outline variant renders with border
  it('1.20-UNIT-111: Outline variant renders with border', () => {
    render(<IconButton icon={Home} label="Home" variant="outline" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('border')
  })

  // 1.20-UNIT-112: Solid variant renders with filled background
  it('1.20-UNIT-112: Solid variant renders with filled background', () => {
    render(<IconButton icon={Home} label="Home" variant="solid" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('bg-orion-gold')
  })
})

// =============================================================================
// 2.3 Size Tests
// =============================================================================

describe('IconButton Sizes', () => {
  // 1.20-UNIT-120: sm size renders with 44px minimum (WCAG touch target)
  it('1.20-UNIT-120: sm size has 44px minimum touch target', () => {
    render(<IconButton icon={Home} label="Home" size="sm" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    // Uses min-h-[44px] min-w-[44px] for WCAG compliance
    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
  })

  // 1.20-UNIT-121: md size (default) renders with 44px minimum
  it('1.20-UNIT-121: md size has 44px minimum touch target', () => {
    render(<IconButton icon={Home} label="Home" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
  })

  // 1.20-UNIT-122: lg size renders with larger dimensions
  it('1.20-UNIT-122: lg size has larger dimensions', () => {
    render(<IconButton icon={Home} label="Home" size="lg" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('min-h-[52px]')
    expect(button).toHaveClass('min-w-[52px]')
  })
})

// =============================================================================
// 2.4 Disabled State Tests
// =============================================================================

describe('IconButton Disabled State', () => {
  // 1.20-UNIT-130: Disabled button has disabled attribute
  it('1.20-UNIT-130: Disabled prop sets disabled attribute', () => {
    render(<IconButton icon={Home} label="Home" disabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  // 1.20-UNIT-131: Disabled button has reduced opacity
  it('1.20-UNIT-131: Disabled button has disabled styling', () => {
    render(<IconButton icon={Home} label="Home" disabled data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('disabled:opacity-50')
  })

  // 1.20-UNIT-132: Disabled button blocks click events
  it('1.20-UNIT-132: Disabled button does not trigger onClick', () => {
    const handleClick = vi.fn()
    render(<IconButton icon={Home} label="Home" disabled onClick={handleClick} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})

// =============================================================================
// 2.5 onClick Handler Tests
// =============================================================================

describe('IconButton onClick Handler', () => {
  // 1.20-UNIT-140: onClick is called when button is clicked
  it('1.20-UNIT-140: onClick handler is called on click', () => {
    const handleClick = vi.fn()
    render(<IconButton icon={Home} label="Home" onClick={handleClick} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  // 1.20-UNIT-141: onClick receives event object
  it('1.20-UNIT-141: onClick receives MouseEvent', () => {
    const handleClick = vi.fn()
    render(<IconButton icon={Home} label="Home" onClick={handleClick} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }))
  })
})

// =============================================================================
// 2.6 Focus Ring Tests
// =============================================================================

describe('IconButton Focus Ring', () => {
  // 1.20-UNIT-150: Focus ring class is applied
  it('1.20-UNIT-150: Focus ring uses focus-ring-orion utility', () => {
    render(<IconButton icon={Home} label="Home" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    // Should have focus-visible outline classes (check className directly due to tailwind-merge)
    expect(button.className).toContain('focus-visible:outline-2')
    expect(button.className).toContain('focus-visible:outline-offset-2')
    expect(button.className).toContain('focus-visible:outline-orion-gold')
  })
})

// =============================================================================
// 2.7 className Passthrough Tests
// =============================================================================

describe('IconButton className Passthrough', () => {
  // 1.20-UNIT-160: Custom className is merged
  it('1.20-UNIT-160: Custom className is merged with defaults', () => {
    render(<IconButton icon={Home} label="Home" className="my-custom-class" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    expect(button).toHaveClass('my-custom-class')
    // Should still have base classes
    expect(button).toHaveClass('inline-flex')
  })
})

// =============================================================================
// 2.8 Icon Rendering Tests
// =============================================================================

describe('IconButton Icon Rendering', () => {
  // 1.20-UNIT-170: Icon is rendered inside button
  it('1.20-UNIT-170: Icon is rendered inside the button', () => {
    render(<IconButton icon={X} label="Close" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    // Find SVG inside button
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  // 1.20-UNIT-171: Different icons can be used
  it('1.20-UNIT-171: Works with different Lucide icons', () => {
    const { rerender } = render(<IconButton icon={Home} label="Home" data-testid="icon-btn" />)
    expect(screen.getByTestId('icon-btn').querySelector('svg')).toBeInTheDocument()

    rerender(<IconButton icon={Settings} label="Settings" data-testid="icon-btn" />)
    expect(screen.getByTestId('icon-btn').querySelector('svg')).toBeInTheDocument()

    rerender(<IconButton icon={Plus} label="Add" data-testid="icon-btn" />)
    expect(screen.getByTestId('icon-btn').querySelector('svg')).toBeInTheDocument()
  })

  // 1.20-UNIT-172: Icon is aria-hidden (decorative within button)
  it('1.20-UNIT-172: Icon inside button is aria-hidden', () => {
    render(<IconButton icon={User} label="User profile" data-testid="icon-btn" />)
    const button = screen.getByTestId('icon-btn')
    const svg = button.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})

// =============================================================================
// 2.9 Button Type Tests
// =============================================================================

describe('IconButton Type Attribute', () => {
  // 1.20-UNIT-180: Default type is "button" (not submit)
  it('1.20-UNIT-180: Default type is button', () => {
    render(<IconButton icon={Home} label="Home" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  // 1.20-UNIT-181: Type can be overridden
  it('1.20-UNIT-181: Type can be set to submit', () => {
    render(<IconButton icon={Home} label="Submit" type="submit" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

// =============================================================================
// 2.10 Combined Props Tests
// =============================================================================

describe('IconButton Combined Props', () => {
  // 1.20-UNIT-190: All props work together
  it('1.20-UNIT-190: Multiple props combine correctly', () => {
    const handleClick = vi.fn()
    render(
      <IconButton
        icon={Settings}
        label="Settings"
        showLabel
        variant="outline"
        size="lg"
        onClick={handleClick}
        className="extra-class"
        data-testid="icon-btn"
      />
    )

    const button = screen.getByTestId('icon-btn')

    // Visible label
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Outline variant
    expect(button).toHaveClass('border')

    // Large size
    expect(button).toHaveClass('min-h-[52px]')

    // Custom class
    expect(button).toHaveClass('extra-class')

    // Click works
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })
})
