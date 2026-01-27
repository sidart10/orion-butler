# Story 1.7: Button Component Hierarchy

Status: done

---

> **DESIGN CONFLICT NOTE:** The UX Design Specification (line 1665) specifies Primary buttons as "Black fill, gold hover", but the Epic specifies "Gold fill (#D4AF37) with dark text". **The Epic is authoritative for story requirements.** This story implements the Epic specification. A UX spec update may be needed to align documentation.

---

## Story

As a **user**,
I want buttons styled according to the design system,
So that actions are visually consistent.

---

## Acceptance Criteria

1. **Given** the design system specification
   **When** I use button components
   **Then** Primary buttons have gold background (#D4AF37) with dark text

2. **And** Secondary buttons have transparent background with gold border

3. **And** Tertiary buttons have no border, text only (underline optional per implementation)

4. **And** Destructive buttons have red text for dangerous actions

5. **And** all buttons have 0px border-radius (Editorial Luxury aesthetic)

6. **And** all buttons have 44x44px minimum touch target (via padding expansion)

7. **And** all buttons have proper keyboard focus states (2px gold outline with 2px offset)

---

## Tasks / Subtasks

- [x] Task 1: Customize shadcn/ui Button base component (AC: #1, #5)
  - [x] 1.1: Locate existing `src/components/ui/button.tsx` from shadcn/ui
  - [x] 1.2: Override `--radius` to 0 for all button variants
  - [x] 1.3: Update base button styles to use Orion design tokens
  - [x] 1.4: Ensure button uses Inter font from design system
  - [x] 1.5: Add base transition: 100ms ease (state change animation)

- [x] Task 2: Implement Primary button variant (AC: #1, #5, #6, #7)
  - [x] 2.1: Set background to `var(--orion-gold)` (#D4AF37)
  - [x] 2.2: Set text color to dark (#1A1A1A) - **always dark text on gold background regardless of theme** to maintain WCAG AA contrast
  - [x] 2.3: Set hover state to slightly darker gold (10% darker)
  - [x] 2.4: Set active/pressed state to 15% darker gold
  - [x] 2.5: Ensure minimum padding for 44px touch target
  - [x] 2.6: Set focus state: 2px gold outline, 2px offset

- [x] Task 3: Implement Secondary button variant (AC: #2, #5, #6, #7)
  - [x] 3.1: Set background to transparent
  - [x] 3.2: Set border to 1px solid `var(--orion-gold)`
  - [x] 3.3: Set text color to `var(--orion-gold)`
  - [x] 3.4: Set hover state: subtle gold background (rgba gold, 0.1 opacity)
  - [x] 3.5: Set active/pressed state: slightly more opaque gold background
  - [x] 3.6: Ensure minimum padding for 44px touch target
  - [x] 3.7: Set focus state: 2px gold outline, 2px offset

- [x] Task 4: Implement Tertiary button variant (AC: #3, #5, #6, #7)
  - [x] 4.1: Set background to transparent
  - [x] 4.2: Set border to none
  - [x] 4.3: Set text color to `var(--orion-fg)`
  - [x] 4.4: Add text-decoration: underline
  - [x] 4.5: Set hover state: underline with gold color
  - [x] 4.6: Set active/pressed state: gold text color
  - [x] 4.7: Ensure minimum padding for 44px touch target
  - [x] 4.8: Set focus state: 2px gold outline, 2px offset

- [x] Task 5: Implement Destructive button variant (AC: #4, #5, #6, #7)
  - [x] 5.1: Set background to transparent
  - [x] 5.2: Set text color to `var(--orion-error)` (red)
  - [x] 5.3: Set border to none (text-only destructive per UX spec)
  - [x] 5.4: Set hover state: darker red text
  - [x] 5.5: Set active/pressed state: even darker red
  - [x] 5.6: Ensure minimum padding for 44px touch target
  - [x] 5.7: Set focus state: 2px red outline, 2px offset

- [x] Task 6: Implement button sizes (AC: #6)
  - [x] 6.1: Define `sm` size: smaller padding, 44px min height
  - [x] 6.2: Define `default` size: standard padding, 44px min height
  - [x] 6.3: Define `lg` size: larger padding, 52px min height
  - [x] 6.4: Define `icon` size: square aspect ratio, 44x44px
  - [x] 6.5: All sizes maintain 44px minimum touch target

- [x] Task 7: Implement disabled and loading states (AC: #1-5)
  - [x] 7.1: Set opacity to 0.5 for all disabled buttons
  - [x] 7.2: Set cursor to not-allowed (via pointer-events-none)
  - [x] 7.3: Remove hover/active effects when disabled (via pointer-events-none)
  - [x] 7.4: Ensure disabled buttons not focusable in tab order
  - [x] 7.5: Implement loading state visual (spinner icon replacing content)
  - [x] 7.6: Add aria-busy="true" when loading
  - [x] 7.7: Disable button interactions while loading (same as disabled visually)

- [x] Task 8: Add dark mode support (AC: #1-5)
  - [x] 8.1: Gold color remains constant (#D4AF37) in dark mode
  - [x] 8.2: Primary button text remains dark (#1A1A1A) in BOTH modes - gold background requires dark text for contrast
  - [x] 8.3: Destructive uses `var(--orion-error)` which adapts in dark mode
  - [x] 8.4: Border colors use CSS variables that adapt

- [x] Task 9: Add accessibility attributes (NFR-5.1, NFR-5.2)
  - [x] 9.1: Ensure all buttons are keyboard accessible
  - [x] 9.2: Focus ring visible on keyboard navigation
  - [x] 9.3: Proper contrast ratios for all variants (WCAG AA)
  - [x] 9.4: Verify loading state has aria-busy="true" (implemented in Task 7)
  - [x] 9.5: Support for icon-only buttons with aria-label

- [x] Task 10: Create button documentation/examples
  - [x] 10.1: Add JSDoc comments to Button component
  - [x] 10.2: Document all variants and their use cases
  - [x] 10.3: Document props and their effects

---

## Dev Notes

### Architecture Compliance

This story customizes the shadcn/ui Button component to match Orion's Editorial Luxury design system. The shadcn/ui base provides Radix primitives with built-in accessibility, which we extend with Orion's visual styling.

**Button Hierarchy (from UX Design Specification):**

| Level | Style | Usage |
|-------|-------|-------|
| Primary | Gold fill (#D4AF37), dark text | Main action (Confirm, Send, Allow) |
| Secondary | Transparent, gold border | Alternative (Cancel, Edit) |
| Tertiary | Text underline only | Low-priority (View, Expand) |
| Destructive | Red text | Deny, Remove (rare) |

**Rules:** One primary per context, always rightmost.

### Design System Tokens to Use

**From Story 1.3 established tokens:**

| Token | Value | Usage |
|-------|-------|-------|
| `--orion-gold` | #D4AF37 | Primary button background, secondary border |
| `--orion-gold-muted` | #C4A052 | Subtle accents, backgrounds |
| `--orion-fg` | #1A1A1A (light) / #FAF8F5 (dark) | Primary button text, tertiary text |
| `--orion-error` | #9B2C2C (light) / #EF4444 (dark) | Destructive button text |
| `--orion-bg` | #FAF8F5 (light) / #121212 (dark) | Button backgrounds (transparent variants) |
| `--radius` | 0rem | All buttons have sharp corners |
| `--orion-anim-state` | 100ms | State change animations |

### Button Component Pattern

```tsx
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - uses Tailwind utilities that map to CSS variables
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-100 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: // Primary - ALWAYS dark text on gold for contrast
          "bg-orion-gold text-[#1A1A1A] hover:bg-orion-gold/90 active:bg-orion-gold/80 focus-visible:ring-orion-gold",
        secondary:
          "border border-orion-gold bg-transparent text-orion-gold hover:bg-orion-gold/10 active:bg-orion-gold/20 focus-visible:ring-orion-gold",
        tertiary:
          "bg-transparent text-orion-fg underline hover:text-orion-gold active:text-orion-gold/80 focus-visible:ring-orion-gold",
        destructive:
          "bg-transparent text-orion-error hover:text-orion-error/80 active:text-orion-error/60 focus-visible:ring-orion-error",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm", // 44px height
        sm: "h-11 px-3 text-sm", // 44px height (touch target)
        lg: "h-13 px-8 text-base", // 52px height
        icon: "h-11 w-11", // 44x44px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Touch Target Specification (from UX Design Specification)

**Important: Clickable Area vs. Visual Size**

The 44px requirement is for the **clickable/tappable area**, not the visible button size. This preserves the compact, magazine-like aesthetic while maintaining accessibility.

**Implementation Technique:**
- Use Tailwind `h-11` class which equals 44px (2.75rem)
- This ensures minimum 44px touch target height
- Use `padding` to expand touch target without increasing visual footprint
- For icon buttons: `h-11 w-11` ensures 44x44px touch target

### Focus State Specification (from UX Design Specification)

| Element | Focus Style |
|---------|-------------|
| Buttons | 2px gold outline, 2px offset |

```css
.button:focus-visible {
  outline: 2px solid var(--orion-gold);
  outline-offset: 2px;
}

/* Destructive variant uses red focus */
.button-destructive:focus-visible {
  outline: 2px solid var(--orion-error);
  outline-offset: 2px;
}
```

### Dark Mode Considerations

**Constant Tokens (Same in Both Modes):**
- `--orion-gold` (#D4AF37) - Gold accent remains constant

**Adaptive Tokens:**
- `--orion-fg` adapts (dark in light mode, light in dark mode)
- `--orion-error` adapts (darker red in light mode, brighter in dark mode)

**Primary Button in Dark Mode:**
- Gold background stays #D4AF37
- Text MUST be dark (#1A1A1A) regardless of theme - gold background requires dark text for WCAG AA contrast
- Contrast ratio: #1A1A1A on #D4AF37 = approximately 7.5:1 (exceeds WCAG AA 4.5:1 requirement)

### Dependency on Story 1.3

This story requires design tokens from Story 1.3:
- `--orion-gold` / `bg-orion-gold`, `text-orion-gold`, `border-orion-gold`
- `--orion-fg` / `text-orion-fg`
- `--orion-error` / `text-orion-error`
- `--orion-anim-state` (100ms)
- `--radius: 0` (for shadcn/ui override)
- Focus ring tokens

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/ui/button.tsx` | Modify - customize shadcn/ui Button |
| `src/app/globals.css` | Modify - add button-specific CSS variables if needed |
| `tailwind.config.ts` | Modify - extend button utilities if needed |

### Testing Considerations

**Visual Tests:**
- Primary button has gold background (#D4AF37)
- Primary button text is dark
- Secondary button has transparent background
- Secondary button has gold border
- Tertiary button has no border
- Tertiary button has underline
- Destructive button has red text
- All buttons have 0px border-radius
- All buttons have proper hover states
- All buttons have proper active states
- Dark mode colors work correctly

**Touch Target Tests:**
- All button sizes have minimum 44px height
- Icon buttons are 44x44px
- Click area extends to full padding

**Accessibility Tests:**
- Buttons are keyboard focusable
- Focus ring visible (2px gold, 2px offset)
- Disabled buttons not in tab order
- Screen reader announces button text
- Contrast ratios meet WCAG AA (4.5:1)

**Interaction Tests:**
- Primary button hover darkens gold
- Secondary button hover adds gold tint
- Tertiary button hover changes text color
- Destructive button hover darkens red
- All buttons respond to click
- Disabled buttons don't respond to click

**Unit Tests:**
- Button renders with correct variant classes
- Button renders with correct size classes
- Button forwards ref correctly
- asChild prop works with Slot
- className prop merges correctly

Test ID Convention: `1.7-UNIT-001`, `1.7-E2E-001`

### References

- [Source: thoughts/planning-artifacts/ux-design-specification.md#Button Hierarchy]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Touch Target Sizes]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Focus States]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: thoughts/planning-artifacts/design-system-adoption.md#Gold Slide Button]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.7: Button Component Hierarchy]
- [Dependency: story-1-3-define-css-design-tokens.md]

---

## Technical Requirements

### Button Variant Specifications

**Primary (default):**

| Property | Value |
|----------|-------|
| Background | #D4AF37 (`bg-orion-gold` / `--orion-gold`) |
| Text color | #1A1A1A (always dark, regardless of theme, for contrast on gold) |
| Border | none |
| Border-radius | 0px |
| Hover | Gold at 90% opacity |
| Active | Gold at 80% opacity |
| Focus | 2px gold outline, 2px offset |

**Secondary:**

| Property | Value |
|----------|-------|
| Background | transparent |
| Text color | #D4AF37 (`text-orion-gold` / `--orion-gold`) |
| Border | 1px solid #D4AF37 (`border-orion-gold` / `--orion-gold`) |
| Border-radius | 0px |
| Hover | Gold background at 10% opacity |
| Active | Gold background at 20% opacity |
| Focus | 2px gold outline, 2px offset |

**Tertiary:**

| Property | Value |
|----------|-------|
| Background | transparent |
| Text color | Adaptive (`text-orion-fg` / `--orion-fg`) |
| Border | none |
| Text decoration | underline |
| Border-radius | 0px |
| Hover | Gold text color |
| Active | Gold text at 80% opacity |
| Focus | 2px gold outline, 2px offset |

**Destructive:**

| Property | Value |
|----------|-------|
| Background | transparent |
| Text color | Adaptive (`text-orion-error` / `--orion-error`): #9B2C2C (light) / #EF4444 (dark) |
| Border | none |
| Border-radius | 0px |
| Hover | Error color at 80% opacity |
| Active | Error color at 60% opacity |
| Focus | 2px red outline, 2px offset |

### Size Specifications

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 44px (h-11) | px-3 | text-sm (14px) |
| default | 44px (h-11) | px-4 py-2 | text-sm (14px) |
| lg | 52px (h-13) | px-8 | text-base (16px) |
| icon | 44x44px (h-11 w-11) | N/A | N/A |

### Animation Specifications

| Trigger | Duration | Easing |
|---------|----------|--------|
| Hover | 100ms | ease |
| Active | 100ms | ease |
| Focus | immediate | N/A |

### Accessibility Specifications

| Requirement | Implementation |
|-------------|----------------|
| Keyboard accessible | Native button element |
| Focus visible | 2px outline with 2px offset |
| Contrast ratio | WCAG AA (4.5:1 minimum) |
| Touch target | 44px minimum height |
| Disabled state | opacity-50, pointer-events-none |
| Loading state | aria-busy="true", spinner icon, disabled interactions |

### Dark Mode Compatibility

- Gold accent remains #D4AF37 in both modes
- Text colors adapt via CSS variables
- Error colors adapt (brighter in dark mode for visibility)
- No hardcoded colors - all via CSS custom properties

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 41 Button unit tests pass (tests/unit/components/ui/button.spec.tsx)
- Full unit test suite passes (520+ tests)
- Build and TypeScript checks pass

### Completion Notes List

1. **Created Button component** (`src/components/ui/button.tsx`) using class-variance-authority for variant management
2. **Implemented all 4 variants:**
   - `default` (Primary): Gold background (#D4AF37) with hardcoded dark text (#1A1A1A) for WCAG AA contrast
   - `secondary`: Transparent background with gold border and text
   - `tertiary`: Text-only with underline, no border
   - `destructive`: Red text (adapts via CSS variable in dark mode), no border
3. **Implemented all 4 sizes:** `sm`, `default`, `lg`, `icon` - all maintain 44px minimum touch target
4. **Added `h-13` (52px)** to Tailwind spacing configuration for large button height
5. **Loading state:** Shows spinner, sets `aria-busy="true"`, disables button
6. **asChild prop:** Works with Radix Slot for rendering links as buttons (Note: loading spinner not shown in asChild mode to satisfy React.Children.only requirement)
7. **Focus states:** 2px outline with 2px offset, gold for most variants, red for destructive
8. **Dark mode:** Handled via CSS variables; primary button text stays dark (#1A1A1A) regardless of theme

### File List

**Created:**
- `src/components/ui/button.tsx` - Button component with all variants and sizes
- `tests/unit/components/ui/button.spec.tsx` - 41 unit tests covering all ACs

**Modified:**
- `design-system/tailwind.config.ts` - Added `13: '52px'` to spacing for h-13 class
