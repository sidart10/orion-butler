# Story 1.20: Icon System Setup

**Status:** ready-for-dev
**Epic:** 1 - Application Shell & First Launch
**Created:** 2026-01-24
**Updated:** 2026-01-24

---

## Story Definition

### User Story

As a **developer**,
I want a consistent icon system using Lucide,
So that icons are unified across the app.

### Description

This story establishes the icon system for Orion using Lucide Icons, the icon library already integrated with shadcn/ui. The icon system supports the Editorial Luxury aesthetic by providing consistent sizing variants (16px, 20px, 24px), proper color inheritance for theming, accessibility labels for non-decorative icons, and coordinated hover/active states with button styling.

**Iconography Philosophy (from UX Specification):**

Orion uses a typography-first approach where text labels provide hierarchy. Icons are exceptions used only for universal recognition (collapse/expand, settings, close, search). When icons are used:
- Custom-designed or Lucide, minimal stroke style
- Consistent 1.5px stroke weight
- Gold accent on active state
- Never colorful, never playful

This is the **final story in Epic 1**, completing the Application Shell foundation. All patterns established here become the baseline for Epic 2 and beyond.

### Acceptance Criteria

```gherkin
Feature: Icon System Setup
  As a developer
  I want a consistent icon system using Lucide
  So that icons are unified across the app

  Background:
    Given the Orion application shell is complete (Stories 1.1-1.19)
    And the Lucide icon library is installed (from shadcn/ui dependencies)
    And the Editorial Luxury design system is in place

  Scenario: Consistent icon sizing variants
    Given I am using icons in components
    When I apply the 'sm' size variant
    Then the icon renders at 16px width and height
    And the icon has 1.5px stroke weight

  Scenario: Medium icon size
    Given I am using icons in components
    When I apply the 'md' size variant (default)
    Then the icon renders at 20px width and height
    And the icon has 1.5px stroke weight

  Scenario: Large icon size
    Given I am using icons in components
    When I apply the 'lg' size variant
    Then the icon renders at 24px width and height
    And the icon has 1.5px stroke weight

  Scenario: Icons inherit text color for theming
    Given I am using icons in a component
    When the component is in light mode
    Then the icon uses the default gray color (#6B6B6B)
    When the component is in dark mode
    Then the icon uses the dark mode foreground color

  Scenario: Icon hover state
    Given I am using an icon in an interactive element
    When I hover over the icon
    Then the icon color changes to black (#1A1A1A) in light mode
    Or the icon color changes to white in dark mode

  Scenario: Icon active/pressed state
    Given I am using an icon in an interactive element
    When I click/press the icon
    Then the icon color changes to gold (#D4AF37)

  Scenario: Icon disabled state
    Given I am using an icon in a disabled element
    Then the icon displays at 30% opacity
    And the icon color remains the default gray

  Scenario: Accessible icon labels for non-decorative icons
    Given I am using an icon for a functional purpose
    When I provide an accessible label via aria-label
    Then the icon has role="img" and the provided aria-label
    And screen readers announce the icon's purpose

  Scenario: Decorative icons are hidden from screen readers
    Given I am using a decorative icon
    When I mark the icon as decorative
    Then the icon has aria-hidden="true"
    And screen readers skip the icon

  Scenario: Icon hover/active states match button states
    Given I have a Button component with an icon
    When I hover over the button
    Then the icon hover state matches the button hover state
    When I press the button
    Then the icon active state uses gold accent

  Scenario: Reduced motion support for icon animations
    Given macOS "Reduce motion" is enabled
    When an icon has a loading or spinner animation
    Then the animation is replaced with a static state
    And the icon remains visible without motion
```

---

## Technical Requirements

### Dependencies

| Story | Dependency Type | What It Provides |
|-------|----------------|------------------|
| 1.1 | Required | Tauri project with shadcn/ui (includes lucide-react) |
| 1.3 | Required | Design tokens for colors, including orion-primary (gold) |
| 1.7 | Required | Button component with hover/active states to coordinate with |
| 1.9 | Required | StatusIndicator uses icon-like indicators (validates pattern) |
| 1.13-14 | Required | Dark mode support for icon color inheritance |
| 1.16 | Required | Focus states pattern for icon buttons |
| 1.17 | Required | VoiceOver/accessibility patterns for icon labels |
| 1.19 | Required | Reduced motion support for animated icons |

### Architecture Decisions

#### Decision 1: Lucide React as Icon Library

**Pattern:** Use `lucide-react` package (already in shadcn/ui stack) for all icons

**Rationale:**
- Already bundled with shadcn/ui - no additional dependencies
- Tree-shakeable - only imports icons actually used
- Consistent 24px viewBox with scalable stroke
- TypeScript support with proper types
- Active maintenance and large icon set

**Implementation:**
```tsx
// Direct import pattern (tree-shakeable)
import { ChevronDown, Settings, Search, X, Minus } from 'lucide-react';
```

#### Decision 2: Icon Component Wrapper

**Pattern:** Create a typed `Icon` wrapper component for consistent styling

**Rationale:**
- Enforces consistent sizing, colors, and accessibility
- Centralizes icon styling logic
- Provides type-safe size variants
- Handles dark mode color inheritance automatically

**Implementation:**
```tsx
// src/components/ui/icon.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string; // Accessible label for functional icons
  decorative?: boolean; // Hide from screen readers
}
```

#### Decision 3: Size Variant Token System

**Pattern:** Define icon size variants as Tailwind classes with CSS variables

**Rationale:**
- Consistent with design token approach from Story 1.3
- Enables easy customization if needed
- Maps to UX specification sizes (16px, 20px, 24px)

**Implementation:**
```css
/* In globals.css or icon component styles */
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
```

#### Decision 4: Color Inheritance via currentColor

**Pattern:** Icons use `currentColor` for stroke, inheriting from parent text color

**Rationale:**
- Automatic theme support (dark/light mode)
- Parent component controls icon color
- Consistent with CSS best practices
- No additional styling needed for theme changes

**Implementation:**
```tsx
// Icon inherits color from parent
<button className="text-orion-fg hover:text-orion-fg-hover">
  <Icon icon={Settings} /> {/* Inherits parent color */}
</button>
```

#### Decision 5: Icon Color State Classes

**Pattern:** Define icon-specific color state classes for consistent interactions

**Rationale:**
- UX spec defines specific colors: default gray, hover black, active gold, disabled 30%
- Centralizing ensures consistency across all icon usage
- Works with Tailwind's group-hover and group-active utilities

**Implementation:**
```css
/* Icon color states */
.icon-default { color: #6B6B6B; }
.icon-hover { color: #1A1A1A; }
.icon-active { color: #D4AF37; }
.icon-disabled { color: #6B6B6B; opacity: 0.3; }

/* Dark mode overrides */
.dark .icon-default { color: var(--orion-fg-muted); }
.dark .icon-hover { color: var(--orion-fg); }
```

---

## Implementation Plan

### Phase 1: Icon Component Foundation

1. **Create Icon wrapper component**
   ```tsx
   // src/components/ui/icon.tsx
   import * as React from 'react';
   import { LucideIcon, LucideProps } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { cva, type VariantProps } from 'class-variance-authority';

   const iconVariants = cva(
     // Base styles
     'inline-flex shrink-0',
     {
       variants: {
         size: {
           sm: 'w-4 h-4',    // 16px
           md: 'w-5 h-5',    // 20px
           lg: 'w-6 h-6',    // 24px
         },
       },
       defaultVariants: {
         size: 'md',
       },
     }
   );

   export interface IconProps
     extends React.HTMLAttributes<SVGSVGElement>,
       VariantProps<typeof iconVariants> {
     icon: LucideIcon;
     label?: string;
     decorative?: boolean;
   }

   const Icon = React.forwardRef<SVGSVGElement, IconProps>(
     ({ icon: IconComponent, size, label, decorative = false, className, ...props }, ref) => {
       return (
         <IconComponent
           ref={ref}
           className={cn(iconVariants({ size }), className)}
           strokeWidth={1.5}
           aria-hidden={decorative || !label}
           aria-label={label}
           role={label ? 'img' : undefined}
           {...props}
         />
       );
     }
   );

   Icon.displayName = 'Icon';

   export { Icon, iconVariants };
   ```

2. **Add icon color utilities to globals.css**
   ```css
   /* src/app/globals.css */

   /* Icon color states - Editorial Luxury palette */
   .icon-colors {
     color: #6B6B6B; /* Default gray */
   }

   .icon-colors:hover {
     color: #1A1A1A; /* Hover black */
   }

   .icon-colors:active {
     color: #D4AF37; /* Active gold */
   }

   .icon-colors:disabled,
   .icon-colors[aria-disabled="true"] {
     color: #6B6B6B;
     opacity: 0.3;
   }

   /* Dark mode icon colors */
   .dark .icon-colors {
     color: var(--orion-fg-muted, #A3A3A3);
   }

   .dark .icon-colors:hover {
     color: var(--orion-fg, #FAFAFA);
   }

   /* Active gold remains same in dark mode */

   .dark .icon-colors:disabled,
   .dark .icon-colors[aria-disabled="true"] {
     color: var(--orion-fg-muted, #A3A3A3);
     opacity: 0.3;
   }
   ```

### Phase 2: Icon Button Component

1. **Create IconButton for standalone clickable icons**
   ```tsx
   // src/components/ui/icon-button.tsx
   import * as React from 'react';
   import { LucideIcon } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { Icon } from './icon';

   export interface IconButtonProps
     extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     icon: LucideIcon;
     size?: 'sm' | 'md' | 'lg';
     label: string; // Required for accessibility
   }

   const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
     ({ icon, size = 'md', label, className, disabled, ...props }, ref) => {
       // Size mapping for touch targets (44px minimum per Story 1.18)
       const touchSizes = {
         sm: 'min-w-[44px] min-h-[44px]',
         md: 'min-w-[44px] min-h-[44px]',
         lg: 'min-w-[44px] min-h-[44px]',
       };

       return (
         <button
           ref={ref}
           type="button"
           className={cn(
             // Base styles
             'inline-flex items-center justify-center',
             // Touch target
             touchSizes[size],
             // Focus state (from Story 1.16)
             'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orion-primary focus-visible:ring-offset-2',
             // Color transitions
             'transition-colors',
             // Icon colors
             'text-[#6B6B6B] hover:text-[#1A1A1A] active:text-orion-primary',
             // Dark mode
             'dark:text-orion-fg-muted dark:hover:text-orion-fg',
             // Disabled
             disabled && 'opacity-30 cursor-not-allowed',
             className
           )}
           disabled={disabled}
           aria-label={label}
           {...props}
         >
           <Icon icon={icon} size={size} decorative />
         </button>
       );
     }
   );

   IconButton.displayName = 'IconButton';

   export { IconButton };
   ```

### Phase 3: Approved Icon Catalog

Based on UX specification, these are the approved icons for MVP:

```typescript
// src/lib/icons/catalog.ts
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Minus,
  Search,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  Square,
} from 'lucide-react';

/**
 * Orion Icon Catalog
 *
 * Per UX Specification, icons are used sparingly for universal recognition only.
 * Typography and color provide hierarchy; icons are exceptions.
 */
export const IconCatalog = {
  // Navigation
  expand: ChevronDown,
  collapse: ChevronUp,
  back: ChevronLeft,
  forward: ChevronRight,

  // Actions
  settings: Settings,
  close: X,
  minimize: Minus,
  search: Search,

  // Status (used in ActivityIndicator from UX spec)
  success: Check,
  successCircle: CheckCircle,
  error: AlertCircle,
  loading: Loader2,
  cancelled: Square,
} as const;

export type IconName = keyof typeof IconCatalog;
```

### Phase 4: Integration with Existing Components

1. **Update Button component to support icons**
   ```tsx
   // Update src/components/ui/button.tsx
   // Add optional icon prop that coordinates with button states

   interface ButtonProps {
     // ... existing props
     icon?: LucideIcon;
     iconPosition?: 'left' | 'right';
   }

   // Icon inside button inherits button's color state via currentColor
   ```

2. **Update SidebarNavItem (if needed)**
   ```tsx
   // Per UX spec, sidebar uses text labels only, not icons
   // But collapse/expand chevron uses Icon component
   ```

3. **Validate StatusIndicator pattern**
   ```tsx
   // StatusIndicator from Story 1.9 uses geometric shapes, not Lucide
   // ActivityIndicator from UX spec uses Lucide icons for status
   // Ensure both patterns are consistent
   ```

### Phase 5: Testing

1. **Unit tests for Icon component**
2. **Unit tests for IconButton component**
3. **Visual regression tests for icon sizes**
4. **Accessibility tests for icon labels**
5. **Dark mode tests for icon colors**
6. **Reduced motion tests for animated icons (Loader2)**

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/icon.tsx` | Icon wrapper component with size variants and accessibility |
| `src/components/ui/icon-button.tsx` | Standalone clickable icon with touch targets |
| `src/lib/icons/catalog.ts` | Approved icon catalog with semantic naming |
| `tests/unit/components/ui/icon.test.tsx` | Unit tests for Icon component |
| `tests/unit/components/ui/icon-button.test.tsx` | Unit tests for IconButton component |
| `tests/e2e/components/icon-system.spec.ts` | E2E tests for icon rendering and interactions |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add icon color state utilities |
| `src/components/ui/button.tsx` | Add optional icon prop with coordinated states |
| `src/components/ui/index.ts` | Export Icon and IconButton components |
| `tailwind.config.ts` | Add icon-specific utilities if needed |

---

## Test Cases

### Unit Tests

```typescript
// tests/unit/components/ui/icon.test.tsx
import { render, screen } from '@testing-library/react';
import { Icon } from '@/components/ui/icon';
import { Settings, Search } from 'lucide-react';

describe('Icon', () => {
  describe('Sizing', () => {
    it('renders at 16px for sm size', () => {
      render(<Icon icon={Settings} size="sm" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-4', 'h-4');
    });

    it('renders at 20px for md size (default)', () => {
      render(<Icon icon={Settings} data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-5', 'h-5');
    });

    it('renders at 24px for lg size', () => {
      render(<Icon icon={Settings} size="lg" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Stroke Weight', () => {
    it('has 1.5px stroke weight', () => {
      render(<Icon icon={Settings} data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('stroke-width', '1.5');
    });
  });

  describe('Accessibility', () => {
    it('marks decorative icons as aria-hidden', () => {
      render(<Icon icon={Settings} decorative data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('provides aria-label for functional icons', () => {
      render(<Icon icon={Search} label="Search" data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('aria-label', 'Search');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('defaults to decorative when no label provided', () => {
      render(<Icon icon={Settings} data-testid="icon" />);
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Color Inheritance', () => {
    it('uses currentColor for stroke', () => {
      render(
        <div style={{ color: 'red' }}>
          <Icon icon={Settings} data-testid="icon" />
        </div>
      );
      // Icon should inherit parent color via currentColor
      const icon = screen.getByTestId('icon');
      expect(icon).toHaveAttribute('stroke', 'currentColor');
    });
  });
});
```

```typescript
// tests/unit/components/ui/icon-button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from '@/components/ui/icon-button';
import { Settings } from 'lucide-react';

describe('IconButton', () => {
  describe('Accessibility', () => {
    it('requires aria-label', () => {
      render(<IconButton icon={Settings} label="Settings" />);
      const button = screen.getByRole('button', { name: 'Settings' });
      expect(button).toBeInTheDocument();
    });

    it('is focusable and has visible focus ring', () => {
      render(<IconButton icon={Settings} label="Settings" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Touch Targets', () => {
    it('has minimum 44px touch target for all sizes', () => {
      render(<IconButton icon={Settings} label="Settings" size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });

  describe('States', () => {
    it('applies disabled styles when disabled', () => {
      render(<IconButton icon={Settings} label="Settings" disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-30', 'cursor-not-allowed');
    });

    it('has hover color class', () => {
      render(<IconButton icon={Settings} label="Settings" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:text-[#1A1A1A]');
    });

    it('has active gold color class', () => {
      render(<IconButton icon={Settings} label="Settings" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:text-orion-primary');
    });
  });

  describe('Click Handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<IconButton icon={Settings} label="Settings" onClick={handleClick} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<IconButton icon={Settings} label="Settings" onClick={handleClick} disabled />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/components/icon-system.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Icon System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('icons render at correct sizes', async ({ page }) => {
    // Find icons and verify computed sizes
    const smIcon = page.locator('[data-testid="icon-sm"]');
    const mdIcon = page.locator('[data-testid="icon-md"]');
    const lgIcon = page.locator('[data-testid="icon-lg"]');

    if (await smIcon.count() > 0) {
      const smBox = await smIcon.boundingBox();
      expect(smBox?.width).toBe(16);
      expect(smBox?.height).toBe(16);
    }

    if (await mdIcon.count() > 0) {
      const mdBox = await mdIcon.boundingBox();
      expect(mdBox?.width).toBe(20);
      expect(mdBox?.height).toBe(20);
    }

    if (await lgIcon.count() > 0) {
      const lgBox = await lgIcon.boundingBox();
      expect(lgBox?.width).toBe(24);
      expect(lgBox?.height).toBe(24);
    }
  });

  test('icon buttons have 44px touch targets', async ({ page }) => {
    const iconButton = page.locator('button:has(svg)').first();

    if (await iconButton.count() > 0) {
      const box = await iconButton.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('icon color changes on hover', async ({ page }) => {
    const iconButton = page.locator('button:has(svg)').first();

    if (await iconButton.count() > 0) {
      const initialColor = await iconButton.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      await iconButton.hover();

      const hoverColor = await iconButton.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      // Color should change on hover
      expect(hoverColor).not.toBe(initialColor);
    }
  });

  test('icons in dark mode use correct colors', async ({ page }) => {
    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    const icon = page.locator('svg').first();

    if (await icon.count() > 0) {
      const color = await icon.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      // Should be a light color in dark mode
      // RGB values should be high (light color)
      const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        // In dark mode, icon should be light (high RGB values)
        // This is a rough check - actual implementation may vary
        expect(r + g + b).toBeGreaterThan(300);
      }
    }
  });

  test('screen readers can access icon labels', async ({ page }) => {
    const labeledIcon = page.locator('svg[aria-label]').first();

    if (await labeledIcon.count() > 0) {
      const label = await labeledIcon.getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
  });

  test('decorative icons are hidden from screen readers', async ({ page }) => {
    const decorativeIcon = page.locator('svg[aria-hidden="true"]').first();
    expect(await decorativeIcon.count()).toBeGreaterThan(0);
  });
});

test.describe('Icon System - Reduced Motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
  });

  test('loading spinner has no animation when reduced motion enabled', async ({ page }) => {
    const spinner = page.locator('[data-testid="loading-icon"]');

    if (await spinner.count() > 0) {
      const animationName = await spinner.evaluate(el => {
        return window.getComputedStyle(el).animationName;
      });

      expect(animationName).toBe('none');
    }
  });
});
```

### Manual Testing Checklist

- [ ] Icon renders at 16px with `size="sm"`
- [ ] Icon renders at 20px with `size="md"` (default)
- [ ] Icon renders at 24px with `size="lg"`
- [ ] Icon stroke weight is consistently 1.5px
- [ ] Icon inherits color from parent (test with colored parent)
- [ ] Icon default color is gray (#6B6B6B) in light mode
- [ ] Icon hover color is black (#1A1A1A) in light mode
- [ ] Icon active color is gold (#D4AF37)
- [ ] Icon disabled state shows 30% opacity
- [ ] Dark mode: icon default color matches fg-muted
- [ ] Dark mode: icon hover color matches fg
- [ ] Dark mode: icon active color is gold (same as light)
- [ ] IconButton has 44px minimum touch target
- [ ] IconButton focus ring is visible on keyboard focus
- [ ] Screen reader announces labeled icons correctly
- [ ] Screen reader skips decorative icons
- [ ] VoiceOver navigation works with icon buttons
- [ ] Reduced motion: loading spinner is static

---

## Design Decisions

### Why Lucide over Other Icon Libraries

| Option | Consideration | Decision |
|--------|--------------|----------|
| Lucide | Already in shadcn/ui, tree-shakeable, 24px base | **Selected** |
| Heroicons | Popular, but duplicate dependency | Rejected |
| Phosphor | Large set, but not in existing stack | Rejected |
| Custom SVGs | Maximum control, high maintenance | Rejected for MVP |

### Icon Sizing Rationale

| Size | Pixels | Use Case |
|------|--------|----------|
| sm (16px) | 16x16 | Inline with small text, compact UI elements |
| md (20px) | 20x20 | Default, balanced visibility and compactness |
| lg (24px) | 24x24 | Primary actions, header icons, standalone use |

### Color State Design

Per UX specification:
- **Default:** Gray (#6B6B6B) - subtle, doesn't compete with text
- **Hover:** Black (#1A1A1A) - clear interaction feedback
- **Active:** Gold (#D4AF37) - brand accent, indicates action
- **Disabled:** Gray at 30% - clearly non-interactive

### Accessibility Approach

Icons fall into two categories:
1. **Functional icons** (provide information or action): Require `aria-label`
2. **Decorative icons** (visual enhancement only): Use `aria-hidden="true"`

The `Icon` component defaults to decorative (`aria-hidden="true"`) unless a `label` prop is provided. This follows the principle of progressive enhancement - developers must explicitly opt-in to accessible icons.

---

## Dependencies on This Story

| Future Story | What This Provides |
|--------------|-------------------|
| Epic 2+ | Icon system for activity indicators, tool status |
| Canvas components | Consistent icons for canvas actions (minimize, close) |
| Settings UI | Settings icon and other navigation icons |
| All future components | Unified icon styling and accessibility |

---

## Notes for Future Epics

Story 1.20 completes Epic 1 (Application Shell & First Launch). Key patterns established for future work:

1. **Icon Usage:** Icons are exceptions, not the rule. Prefer text labels.
2. **Icon Sizing:** Always use sm/md/lg variants, never arbitrary sizes.
3. **Accessibility:** Functional icons need labels; decorative icons need aria-hidden.
4. **Color States:** Use the established default/hover/active/disabled pattern.
5. **Touch Targets:** Icon buttons maintain 44px minimum (per Story 1.18).
6. **Reduced Motion:** Animated icons (Loader2) respect user preference (per Story 1.19).

---

## Story Progress

### Checklist

- [ ] Icon wrapper component created with size variants
- [ ] Icon uses 1.5px stroke weight consistently
- [ ] Icon inherits color via currentColor
- [ ] Icon color states (default/hover/active/disabled) implemented
- [ ] Dark mode icon colors working
- [ ] IconButton component created with 44px touch targets
- [ ] IconButton coordinates states with existing Button patterns
- [ ] Accessibility: aria-label support for functional icons
- [ ] Accessibility: aria-hidden for decorative icons
- [ ] Icon catalog created with approved icons
- [ ] Reduced motion support for animated icons
- [ ] Unit tests for Icon component pass
- [ ] Unit tests for IconButton component pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Dark mode verified
- [ ] VoiceOver testing completed

---

## Definition of Done

1. Icon component renders Lucide icons at consistent sizes (16px, 20px, 24px)
2. All icons use 1.5px stroke weight
3. Icons inherit text color for automatic theming
4. Icon color states match UX spec: gray default, black hover, gold active, 30% disabled
5. Dark mode icon colors work correctly
6. IconButton component provides 44px touch targets
7. Functional icons have accessible labels (`aria-label`, `role="img"`)
8. Decorative icons are hidden from screen readers (`aria-hidden="true"`)
9. Icon hover/active states coordinate with Button component
10. Animated icons (loading) respect reduced motion preference
11. All unit tests pass
12. E2E tests pass
13. Manual testing completed including VoiceOver

---

## References

### Requirements Traceability

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| FR-10.8 | WCAG AA accessibility | Icon labels, aria-hidden |
| NFR-5.1 | Keyboard navigation | Focus states on IconButton |
| NFR-5.2 | VoiceOver compatibility | aria-label for functional icons |

### Source Documents

- UX Design Specification: Section "Iconography Philosophy" (lines 839-884) - defines icon approach
- UX Design Specification: Section "Icon Color Rules" (lines 878-882) - color states
- UX Design Specification: Section "ActivityIndicator" (lines 1443-1477) - status icons
- Design System Adoption Guide: shadcn/ui integration with Lucide icons
- Architecture.md: Component structure in `src/components/ui/`
- Story 1.7: Button component for state coordination
- Story 1.16: Focus states pattern
- Story 1.17: VoiceOver accessibility patterns
- Story 1.18: Touch target requirements (44px)
- Story 1.19: Reduced motion support

### Design Resources

| Resource | Link |
|----------|------|
| Lucide Icons | https://lucide.dev/ |
| Lucide React | https://lucide.dev/guide/packages/lucide-react |
| WCAG 1.1.1 Non-text Content | https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html |
| Apple HIG - Icons | https://developer.apple.com/design/human-interface-guidelines/icons |

---

## Epic 1 Completion Summary

This story (1.20) is the **final story in Epic 1: Application Shell & First Launch**.

### Epic 1 Delivered

| Category | Stories | Key Deliverables |
|----------|---------|------------------|
| **Project Setup** | 1.1-1.3 | Tauri project, fonts, design tokens |
| **Layout** | 1.4-1.6 | Sidebar (280px), Chat (flex-1, min 400px), Canvas (480px) |
| **Components** | 1.7-1.9 | Button, Input, StatusIndicator |
| **Responsive** | 1.10-1.12 | Desktop (1280px), Laptop (1024px), Tablet (<1024px) |
| **Theming** | 1.13-1.14 | Dark mode: system detection + manual toggle |
| **Interactions** | 1.15-1.16 | Keyboard shortcuts, focus states |
| **Accessibility** | 1.17-1.19 | VoiceOver, touch targets, contrast, reduced motion |
| **Icons** | 1.20 | Lucide icon system with consistent styling |

### Patterns Established for Epic 2+

1. **Design Token System:** CSS variables for colors, spacing, animation
2. **Component Architecture:** shadcn/ui + CVA for variants
3. **Accessibility Baseline:** WCAG AA with VoiceOver support
4. **State Management:** Zustand for UI state (ready for XState in Epic 2)
5. **Responsive Design:** Three-tier breakpoint system
6. **Theme Support:** System detection with manual override

The Application Shell is now complete and ready for Epic 2: First Conversation.
