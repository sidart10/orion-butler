# Story 1.8: Input Field Component

## Story Definition

**Story ID:** 1-8-input-field-component
**Epic:** 1 - Application Shell & Design System Foundation
**Status:** done

---

## User Story

As a **user**,
I want styled input fields for chat,
So that text entry feels polished.

---

## Acceptance Criteria

```gherkin
Given a chat interface
When I see input fields
Then they use the design system styling
And focus state shows a 2px gold outline with 2px offset
And the input has 0px border-radius
And placeholder text uses muted color from design tokens
```

---

## Design References

### UX Specification

From `thoughts/planning-artifacts/ux-design-specification.md`:

**Focus States (Section: Visual Design Foundation):**
| Element | Focus Style |
|---------|-------------|
| Buttons | 2px gold outline, 2px offset |
| Inputs | Gold underline thickens |
| Cards | Subtle gold border |
| Links | Gold underline |

> **DESIGN NOTE:** This story implements 2px gold outline focus states for inputs (matching buttons) rather than the gold underline specified in the UX spec. This deviation was a deliberate design decision to maintain visual consistency across all interactive form elements and provide clearer accessibility focus indicators. The outline approach ensures keyboard users always see a consistent, highly visible focus ring regardless of element type.

**Design Tokens:**
- `--orion-fg-muted` (#6B6B6B light / #9CA3AF dark) for placeholder text
- `--orion-surface` (#FFFFFF light / #1A1A1A dark) for input background
- `--orion-border` (#E5E5E5 light / #2D2D2D dark) for input border
- `--orion-gold` (#D4AF37) for focus outline (constant in both modes)

**Touch Targets (Section: Responsive Design & Accessibility):**
- Minimum 44px height for all interactive elements
- Achieved via padding, not visual size increase

**Animation Timing:**
- State change: 100ms ease

### Story Chain Notes (from Story 1.7)

From `.ralph/story-chain.md`:
- Input fields use 0px border-radius (matching buttons)
- Focus state: 2px gold outline with 2px offset
- Dark mode: cream background darkens to surface color
- Touch target: 44px minimum height
- Border: 1px --orion-border

---

## Technical Requirements

### Component Variants

| Variant | Purpose | Notes |
|---------|---------|-------|
| `default` | Standard single-line input | Chat message, form fields |
| `textarea` | Multi-line text input | Extended messages, notes |
| `with-icon` | Input with icon adornment | Send button, search icon |

### Component Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Optional icon on the right side
  rightIcon?: React.ReactNode;
  // Optional icon on the left side
  leftIcon?: React.ReactNode;
  // Error state
  error?: boolean;
  // Full width mode
  fullWidth?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Error state
  error?: boolean;
  // Full width mode
  fullWidth?: boolean;
  // Auto-resize based on content
  autoResize?: boolean;
}
```

### CSS Custom Properties Used

| Token | Usage |
|-------|-------|
| `--orion-surface` | Input background |
| `--orion-border` | Input border (1px solid) |
| `--orion-fg` | Input text color |
| `--orion-fg-muted` | Placeholder text color |
| `--orion-gold` | Focus outline color |
| `--orion-error` | Error border color |
| `--orion-anim-state` | Focus transition (100ms ease) |

### Visual Specifications

**Default State:**
- Background: `--orion-surface`
- Border: 1px solid `--orion-border`
- Border radius: 0px
- Height: 44px minimum (via padding)
- Padding: 12px 16px (adjust for touch target)
- Font: Inter, 16px, `--orion-fg`

**Placeholder:**
- Color: `--orion-fg-muted`

**Focus State:**
- Outline: 2px solid `--orion-gold`
- Outline offset: 2px
- Transition: 100ms ease

**Error State:**
- Border: 1px solid `--orion-error`
- Focus outline: 2px solid `--orion-error`

**Disabled State:**
- Opacity: 0.5
- Cursor: not-allowed
- No focus ring

**Textarea Specific:**
- Min-height: 88px (2 lines + padding)
- Resize: vertical only (or none if autoResize)
- Line-height: 1.5

---

## Implementation Tasks

### Task 1: Customize shadcn/ui Input Component

**File:** `src/components/ui/input.tsx`

Modify the existing shadcn/ui Input component with Orion styling:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  rightIcon?: React.ReactNode
  leftIcon?: React.ReactNode
  error?: boolean
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rightIcon, leftIcon, error, fullWidth, ...props }, ref) => {
    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orion-fg-muted">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles
            "h-11 w-full rounded-none border bg-orion-surface px-4 py-3",
            "text-base text-orion-fg placeholder:text-orion-fg-muted",
            "transition-all duration-100 ease-linear",
            // Border styles
            error
              ? "border-orion-error"
              : "border-orion-border",
            // Focus styles
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error
              ? "focus:ring-orion-error"
              : "focus:ring-orion-gold",
            // Disabled styles
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Icon padding adjustments
            leftIcon && "pl-12",
            rightIcon && "pr-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orion-fg-muted">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### Task 2: Create Textarea Component

**File:** `src/components/ui/textarea.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  fullWidth?: boolean
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, fullWidth, autoResize, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        const adjustHeight = () => {
          textarea.style.height = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
        }
        textarea.addEventListener('input', adjustHeight)
        adjustHeight()
        return () => textarea.removeEventListener('input', adjustHeight)
      }
    }, [autoResize])

    return (
      <textarea
        className={cn(
          // Base styles
          "min-h-[88px] w-full rounded-none border bg-orion-surface px-4 py-3",
          "text-base leading-relaxed text-orion-fg placeholder:text-orion-fg-muted",
          "transition-all duration-100 ease-linear",
          // Border styles
          error
            ? "border-orion-error"
            : "border-orion-border",
          // Focus styles
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          error
            ? "focus:ring-orion-error"
            : "focus:ring-orion-gold",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Resize control
          autoResize ? "resize-none overflow-hidden" : "resize-y",
          fullWidth && "w-full",
          className
        )}
        ref={(el) => {
          textareaRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

### Task 3: Add Tailwind Configuration

**File:** `tailwind.config.ts` (additions)

Ensure the following colors are configured:

```typescript
// In extend.colors:
orion: {
  surface: 'var(--orion-surface)',
  border: 'var(--orion-border)',
  fg: 'var(--orion-fg)',
  'fg-muted': 'var(--orion-fg-muted)',
  gold: 'var(--orion-gold)',
  error: 'var(--orion-error)',
}
```

### Task 4: Unit Tests

**File:** `tests/unit/components/ui/input.test.tsx`

> **Note:** Test file location follows component structure pattern (`components/ui/` -> `tests/unit/components/ui/`). This mirrors the source directory layout for easy navigation between implementation and tests.

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  it('applies error styling when error prop is true', () => {
    render(<Input error data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('border-orion-error')
  })

  it('renders with left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders with right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })

  it('has 0px border-radius (rounded-none)', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('rounded-none')
  })

  it('sets aria-invalid when error prop is true', () => {
    render(<Input error aria-invalid={true} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('Textarea Component', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter message..." />)
    expect(screen.getByPlaceholderText('Enter message...')).toBeInTheDocument()
  })

  it('applies error styling when error prop is true', () => {
    render(<Textarea error data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('border-orion-error')
  })

  it('has 0px border-radius (rounded-none)', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('rounded-none')
  })

  it('sets aria-invalid when error prop is true', () => {
    render(<Textarea error aria-invalid={true} data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
  })
})
```

---

## Dependencies

### Required From Previous Stories

| Dependency | Story | What's Needed |
|------------|-------|---------------|
| Project scaffold | 1.1 | `src/components/ui/` directory, Tailwind config |
| Font CSS variables | 1.2 | `--font-inter` for input text |
| Design tokens | 1.3 | All color tokens: `--orion-*` |
| Button patterns | 1.7 | Focus state pattern (2px outline, 2px offset) |

### Provides For Future Stories

| Story | What's Provided |
|-------|-----------------|
| 1.5 (ChatInput) | Styled Input/Textarea components for ChatInput to compose upon |
| 6.2 (Quick Capture) | Input field for quick capture modal |
| Email Canvas | Textarea for email body |
| Canvas forms | Consistent form inputs |

> **Dependency Note:** Story 1.8 provides the foundational Input and Textarea components that Story 1.5 (ChatInput) will use. The ChatInput component will compose these styled primitives into a specialized chat interface with send button integration.

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Focus visible | 2px gold outline with 2px offset |
| Color contrast | WCAG AA (4.5:1 minimum) |
| Touch target | 44px minimum height |
| Screen reader | Native HTML input/textarea elements |
| Keyboard nav | Tab to focus, standard input behavior |
| Error state | Visual + aria-invalid attribute |

---

## File Locations

| File | Purpose |
|------|---------|
| `src/components/ui/input.tsx` | Input component (modify existing or create) |
| `src/components/ui/textarea.tsx` | Textarea component |
| `tests/unit/components/ui/input.test.tsx` | Unit tests |

---

## Definition of Done

- [ ] Input component renders with design system styling
- [ ] Textarea component renders with design system styling
- [ ] Focus state shows 2px gold outline with 2px offset
- [ ] 0px border-radius on all variants
- [ ] Placeholder text uses `--orion-fg-muted`
- [ ] Error state shows red border and focus ring
- [ ] Disabled state has 50% opacity
- [ ] Touch targets are 44px minimum height
- [ ] Left and right icon slots work correctly
- [ ] Textarea auto-resize works when enabled
- [ ] Dark mode colors apply correctly
- [ ] All unit tests pass
- [ ] Components exported from `src/components/ui/index.ts`

---

## Test Strategy

### Unit Tests
- Component rendering with various props
- Focus state class application
- Error state class application
- Icon slot rendering
- Disabled state behavior
- Border-radius class verification

### Visual Verification
- Light mode appearance
- Dark mode appearance
- Focus ring visibility
- Placeholder text color
- Error state appearance

---

## Estimation

**Story Points:** 2
**Complexity:** Low
**Risk:** Low

---

## Notes

### Design Rationale

1. **0px Border-Radius:** Maintains Editorial Luxury aesthetic consistency with buttons (Story 1.7) and the overall sharp-corner design language.

2. **Focus State Pattern (DESIGN DEVIATION):** The UX specification (line 961) specifies "Gold underline thickens" for input focus states, differentiating from buttons which use "2px gold outline, 2px offset". This story implements the **outline pattern for inputs** rather than underline. Rationale:
   - **Consistency:** All interactive form elements (buttons, inputs) use the same focus indicator
   - **Accessibility:** Outline focus rings provide clearer visibility than underline thickening, especially for users with low vision
   - **Implementation:** CSS `outline` with `outline-offset` is more reliable cross-browser than border-bottom animations
   - This deviation should be reviewed with design if underline focus is preferred for differentiation.

3. **44px Minimum Height:** Achieved via padding to maintain compact visual appearance while meeting touch target requirements.

4. **Icon Slots:** Support for common patterns like search inputs (left icon) and chat inputs (send button on right).

5. **Auto-Resize Textarea:** Useful for chat input that grows with content, preventing scroll within the input.

### shadcn/ui Integration

The Input component customizes the shadcn/ui primitive. If the project already has a shadcn/ui Input component installed, this story modifies it. If not, this creates a compatible component following shadcn/ui patterns.

### CSS Variable Dependencies

Ensure these CSS variables are defined in `globals.css` (from Story 1.3).

**Semantic Token Usage:**
- Use `--orion-error` throughout implementation (not raw hex values)
- The token adapts between modes: #9B2C2C (light) / #EF4444 (dark) per UX spec "Adaptive Status Colors"

```css
:root {
  --orion-surface: #FFFFFF;
  --orion-border: #E5E5E5;
  --orion-fg: #1A1A1A;
  --orion-fg-muted: #6B6B6B;
  --orion-gold: #D4AF37;
  --orion-error: #9B2C2C;  /* Adaptive: brighter in dark mode */
}

.dark {
  --orion-surface: #1A1A1A;
  --orion-border: #2D2D2D;
  --orion-fg: #FAF8F5;
  --orion-fg-muted: #9CA3AF;
  --orion-error: #EF4444;  /* Brighter for dark mode visibility per UX spec line 671 */
}
```
