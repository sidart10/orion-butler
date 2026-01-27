# Story 1.3: Define CSS Design Tokens

Status: done

---

## Story

As a **developer**,
I want all design tokens defined as CSS variables,
So that the design system is consistent and maintainable.

---

## Acceptance Criteria

1. **Given** the design-system.md specification
   **When** I inspect the CSS
   **Then** color tokens exist: `--gold-accent: #D4AF37`, `--bg-primary`, `--text-primary`, etc.

2. **And** spacing tokens exist: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)

3. **And** border-radius is 0px throughout

4. **And** animation tokens exist: 200ms entrance, 150ms exit, 100ms state change

---

## Tasks / Subtasks

- [x] Task 1: Define color tokens in globals.css (AC: #1)
  - [x] 1.1: Add primary gold accent color `--orion-gold: #D4AF37`
  - [x] 1.2: Add gold muted variant `--orion-gold-muted: #C4A052`
  - [x] 1.3: Add background token `--orion-bg: #FAF8F5` (cream)
  - [x] 1.4: Add surface tokens `--orion-surface: #FFFFFF`, `--orion-surface-elevated: #FFFFFF`
  - [x] 1.5: Add foreground tokens `--orion-fg: #1A1A1A`, `--orion-fg-muted: #6B6B6B`
  - [x] 1.6: Add border token `--orion-border: #E5E5E5`
  - [x] 1.7: Add status colors `--orion-blue: #3B82F6`, `--orion-success: #059669`, `--orion-error: #9B2C2C`
  - [x] 1.8: Add scrollbar color `--orion-scrollbar: #CCCCCC`

- [x] Task 2: Define dark mode color tokens (AC: #1)
  - [x] 2.1: Add dark mode media query `@media (prefers-color-scheme: dark)`
  - [x] 2.2: Override background `--orion-bg: #121212`
  - [x] 2.3: Override surface tokens `--orion-surface: #1A1A1A`, `--orion-surface-elevated: #242424`
  - [x] 2.4: Override foreground tokens `--orion-fg: #FAF8F5`, `--orion-fg-muted: #9CA3AF`
  - [x] 2.5: Override border `--orion-border: #2D2D2D`
  - [x] 2.6: Override status colors for visibility `--orion-success: #10B981`, `--orion-error: #EF4444`
  - [x] 2.7: Override scrollbar `--orion-scrollbar: #333333`
  - [x] 2.8: Add `.dark` class override for manual toggle

- [x] Task 3: Define spacing tokens in globals.css (AC: #2)
  - [x] 3.1: Add base spacing unit comment `/* Base unit: 4px */`
  - [x] 3.2: Add spacing tokens: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`
  - [x] 3.3: Add spacing tokens: `--space-4: 16px`, `--space-6: 24px`
  - [x] 3.4: Add spacing tokens: `--space-8: 32px`, `--space-12: 48px`, `--space-16: 64px`

- [x] Task 4: Define layout dimension tokens (AC: #2)
  - [x] 4.1: Add header height `--orion-header-height: 80px`
  - [x] 4.2: Add sidebar width `--orion-sidebar-width: 280px`
  - [x] 4.3: Add sidebar collapsed width `--orion-sidebar-collapsed: 72px`
  - [x] 4.4: Add rail width `--orion-rail-width: 64px`
  - [x] 4.5: Add content max width `--orion-content-max-width: 850px`
  - [x] 4.6: Add canvas panel width `--orion-canvas-width: 480px`
  - [x] 4.7: Add context sidebar width `--orion-context-width: 320px`

- [x] Task 5: Define border-radius tokens (AC: #3)
  - [x] 5.1: Set global border-radius `--radius: 0px`
  - [x] 5.2: Add to :root for shadcn/ui compatibility `--radius: 0rem`
  - [x] 5.3: Verify no rounded corners in existing components

- [x] Task 6: Define animation tokens in globals.css (AC: #4)
  - [x] 6.1: Add entrance duration `--duration-entrance: 200ms`
  - [x] 6.2: Add exit duration `--duration-exit: 150ms`
  - [x] 6.3: Add state change duration `--duration-state: 100ms`
  - [x] 6.4: Add canvas animation duration `--duration-canvas: 300ms`
  - [x] 6.5: Add pulse duration `--duration-pulse: 1500ms`
  - [x] 6.6: Add spinner duration `--duration-spinner: 1000ms`
  - [x] 6.7: Add luxury easing curve `--easing-luxury: cubic-bezier(0.4, 0, 0.2, 1)`
  - [x] 6.8: Add standard easing curves `--easing-in: ease-in`, `--easing-out: ease-out`

- [x] Task 7: Define typography tokens (AC: #1)
  - [x] 7.1: Add typography scale sizes (32px display, 24px h1, 20px h2, 16px h3/body, 14px small, 12px tiny)
  - [x] 7.2: Add tracking token `--tracking-luxury: 0.15em`
  - [x] 7.3: Add tracking token `--tracking-widest: 0.1em`

- [x] Task 8: Configure Tailwind with token extensions (AC: #1, #2, #3, #4)
  - [x] 8.1: Extend colors with `orion-*` naming (primary, bg, fg, etc.)
  - [x] 8.2: Extend spacing with token values
  - [x] 8.3: Confirm borderRadius is 0 by default
  - [x] 8.4: Add animation keyframes (reveal, fade-in)
  - [x] 8.5: Add animation utilities (animate-reveal, animate-fade-in)
  - [x] 8.6: Add layout utilities (h-header, w-sidebar, max-w-content)

- [x] Task 9: Configure shadcn/ui CSS variable overrides (AC: #1, #3)
  - [x] 9.1: Override `--background` to Orion cream HSL value
  - [x] 9.2: Override `--foreground` to Orion black HSL value
  - [x] 9.3: Override `--primary` to Orion gold HSL value
  - [x] 9.4: Override `--radius` to 0rem

- [x] Task 10: Verify token integration (AC: #1, #2, #3, #4)
  - [x] 10.1: Test that Tailwind utilities use tokens correctly
  - [x] 10.2: Verify dark mode switches colors properly
  - [x] 10.3: Verify spacing utilities work (space-1 through space-16)
  - [x] 10.4: Verify animation classes work (animate-reveal, animate-fade-in)

---

## Dev Notes

### Architecture Compliance

This story implements the design tokens from the UX Design Specification and Design System Adoption Guide.

**Color Palette (from ux-design-specification.md):**

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | #D4AF37 | Primary accent, success, active states |
| Gold Muted | #C4A052 | Backgrounds, borders, subtle accents |
| Cream | #FAF8F5 | Main background |
| Black | #1A1A1A | Primary text |
| Gray | #6B6B6B | Secondary text, disabled states |
| Waiting Blue | #3B82F6 | Waiting/blocked states |
| Attention Red | #9B2C2C | Error text only (no backgrounds) |

**Dark Mode Token Mapping (from ux-design-specification.md):**

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--orion-bg` | #FAF8F5 | #121212 |
| `--orion-surface` | #FFFFFF | #1A1A1A |
| `--orion-surface-elevated` | #FFFFFF | #242424 |
| `--orion-fg` | #1A1A1A | #FAF8F5 |
| `--orion-fg-muted` | #6B6B6B | #9CA3AF |
| `--orion-border` | #E5E5E5 | #2D2D2D |

**Constant tokens (same in both modes):**
- `--orion-gold: #D4AF37`
- `--orion-gold-muted: #C4A052`
- `--orion-blue: #3B82F6`

**Spacing Scale (from ux-design-specification.md):**

| Token | Value |
|-------|-------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |
| space-16 | 64px |

**Animation Timing (from ux-design-specification.md):**

| Type | Duration | Easing |
|------|----------|--------|
| Entrance | 200ms | ease-out |
| Exit | 150ms | ease-in |
| State change | 100ms | ease |
| Pulse (loop) | 1500ms | ease-in-out |
| Canvas open/close | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Spinner rotation | 1000ms | linear (infinite) |

### CSS Variable Implementation Pattern

```css
/* src/app/globals.css */

:root {
  /* Colors - Light Mode */
  --orion-gold: #D4AF37;
  --orion-gold-muted: #C4A052;
  --orion-bg: #FAF8F5;
  --orion-surface: #FFFFFF;
  --orion-surface-elevated: #FFFFFF;
  --orion-fg: #1A1A1A;
  --orion-fg-muted: #6B6B6B;
  --orion-border: #E5E5E5;
  --orion-scrollbar: #CCCCCC;
  --orion-blue: #3B82F6;
  --orion-success: #059669;
  --orion-error: #9B2C2C;

  /* Spacing - 4px base unit */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Layout dimensions */
  --orion-header-height: 80px;
  --orion-sidebar-width: 280px;
  --orion-sidebar-collapsed: 72px;
  --orion-rail-width: 64px;
  --orion-content-max-width: 850px;
  --orion-canvas-width: 480px;
  --orion-context-width: 320px;

  /* Border radius - Editorial Luxury = sharp corners */
  --radius: 0rem;

  /* Animation timing */
  --duration-entrance: 200ms;
  --duration-exit: 150ms;
  --duration-state: 100ms;
  --duration-canvas: 300ms;
  --duration-pulse: 1500ms;
  --duration-spinner: 1000ms;
  --easing-luxury: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: ease-in;
  --easing-out: ease-out;

  /* Typography */
  --tracking-luxury: 0.15em;
  --tracking-widest: 0.1em;

  /* shadcn/ui overrides */
  --background: 38 33% 97%;
  --foreground: 0 0% 10%;
  --primary: 43 65% 52%;
  --primary-foreground: 0 0% 100%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --orion-bg: #121212;
    --orion-surface: #1A1A1A;
    --orion-surface-elevated: #242424;
    --orion-fg: #FAF8F5;
    --orion-fg-muted: #9CA3AF;
    --orion-border: #2D2D2D;
    --orion-scrollbar: #333333;
    --orion-success: #10B981;
    --orion-error: #EF4444;

    /* shadcn/ui dark overrides */
    --background: 0 0% 7%;
    --foreground: 38 33% 97%;
  }
}

/* Manual dark mode toggle */
.dark {
  --orion-bg: #121212;
  --orion-surface: #1A1A1A;
  --orion-surface-elevated: #242424;
  --orion-fg: #FAF8F5;
  --orion-fg-muted: #9CA3AF;
  --orion-border: #2D2D2D;
  --orion-scrollbar: #333333;
  --orion-success: #10B981;
  --orion-error: #EF4444;
}
```

### Tailwind Configuration Pattern

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        orion: {
          gold: 'var(--orion-gold)',
          'gold-muted': 'var(--orion-gold-muted)',
          bg: 'var(--orion-bg)',
          surface: 'var(--orion-surface)',
          'surface-elevated': 'var(--orion-surface-elevated)',
          fg: 'var(--orion-fg)',
          'fg-muted': 'var(--orion-fg-muted)',
          border: 'var(--orion-border)',
          blue: 'var(--orion-blue)',
          success: 'var(--orion-success)',
          error: 'var(--orion-error)',
        },
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-6': 'var(--space-6)',
        'space-8': 'var(--space-8)',
        'space-12': 'var(--space-12)',
        'space-16': 'var(--space-16)',
        'header': 'var(--orion-header-height)',
        'sidebar': 'var(--orion-sidebar-width)',
        'sidebar-collapsed': 'var(--orion-sidebar-collapsed)',
        'content': 'var(--orion-content-max-width)',
        'canvas': 'var(--orion-canvas-width)',
        'context': 'var(--orion-context-width)',
      },
      borderRadius: {
        DEFAULT: '0',
      },
      letterSpacing: {
        luxury: 'var(--tracking-luxury)',
      },
      transitionDuration: {
        'entrance': 'var(--duration-entrance)',
        'exit': 'var(--duration-exit)',
        'state': 'var(--duration-state)',
        'canvas': 'var(--duration-canvas)',
      },
      transitionTimingFunction: {
        'luxury': 'var(--easing-luxury)',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'reveal': 'reveal var(--duration-entrance) var(--easing-out) forwards',
        'fade-in': 'fade-in var(--duration-entrance) var(--easing-out) forwards',
        'pulse': 'pulse var(--duration-pulse) ease-in-out infinite',
      },
    },
  },
};

export default config;
```

### Animation Keyframe Definitions

```css
/* Add to globals.css */

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Utility classes */
.animate-reveal {
  animation: reveal var(--duration-entrance) var(--easing-out) forwards;
}

.animate-fade-in {
  animation: fade-in var(--duration-entrance) var(--easing-out) forwards;
}

.animate-pulse {
  animation: pulse var(--duration-pulse) ease-in-out infinite;
}

/* Stagger delays */
.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }
```

### Design System Principle: Editorial Luxury

From ux-design-specification.md:

> **0px border radius throughout** - Sharp corners are distinctive and memorable
> **Gold is the only accent** - Success, active, focus all use gold
> **Premium = swift + smooth** - No slow "luxury" animations, 200ms is premium

### Dependency on Story 1.2

This story builds on Story 1.2 (Install Design System Fonts):
- Font CSS variables `--font-playfair` and `--font-inter` must already exist
- `globals.css` must be initialized
- `tailwind.config.ts` must have font family configuration

### Story 1.2 Established Patterns

Per story-chain.md, Story 1.2 established:
- CSS Variable naming: `--font-{name}` format
- Tailwind integration via CSS variables
- Typography hierarchy with Playfair accent, Inter body

This story extends those patterns to colors, spacing, and animations.

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add all CSS variable token definitions |
| `tailwind.config.ts` | Extend theme with Orion tokens |

### Testing Considerations

**Visual Tests:**
- Verify gold accent color renders correctly
- Verify dark mode switches properly
- Verify spacing utilities produce correct values
- Verify border-radius is 0 throughout

**Unit Tests:**
- CSS variables are present in DOM
- Computed styles match expected values
- Dark mode media query applies correctly

Test ID Convention: `1.3-UNIT-001`, `1.3-E2E-001`

### References

- [Source: thoughts/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Dark Mode Support]
- [Source: thoughts/planning-artifacts/design-system-adoption.md#Colors]
- [Source: thoughts/planning-artifacts/design-system-adoption.md#Animations]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.3: Define CSS Design Tokens]

---

## Technical Requirements

### Color Token Specifications

**Primary Colors:**
- Gold: `#D4AF37` (HSL: 43 65% 52%)
- Gold Muted: `#C4A052`

**Background Colors:**
- Cream (light): `#FAF8F5` (HSL: 38 33% 97%)
- Dark bg: `#121212`
- Surface (light): `#FFFFFF`
- Surface (dark): `#1A1A1A`
- Surface elevated (dark): `#242424`

**Text Colors:**
- Primary (light): `#1A1A1A`
- Primary (dark): `#FAF8F5`
- Muted (light): `#6B6B6B`
- Muted (dark): `#9CA3AF`

**Status Colors:**
- Blue (waiting): `#3B82F6`
- Success (light): `#059669`
- Success (dark): `#10B981`
- Error (light): `#9B2C2C`
- Error (dark): `#EF4444`

### Spacing Token Specifications

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing, icon gaps |
| space-2 | 8px | Default small spacing |
| space-3 | 12px | Component internal padding |
| space-4 | 16px | Standard padding |
| space-6 | 24px | Section spacing |
| space-8 | 32px | Large section spacing |
| space-12 | 48px | Page section breaks |
| space-16 | 64px | Major layout divisions |

### Layout Token Specifications

| Token | Value | Usage |
|-------|-------|-------|
| header-height | 80px | App header/title bar |
| sidebar-width | 280px | GTD sidebar |
| sidebar-collapsed | 72px | Icon-only sidebar |
| rail-width | 64px | Action rail |
| content-max-width | 850px | Main content area |
| canvas-width | 480px | Canvas panel |
| context-width | 320px | Context sidebar |

### Animation Token Specifications

| Token | Value | Usage |
|-------|-------|-------|
| duration-entrance | 200ms | Elements appearing |
| duration-exit | 150ms | Elements disappearing |
| duration-state | 100ms | Hover, focus changes |
| duration-canvas | 300ms | Canvas open/close |
| duration-pulse | 1500ms | Working indicator pulse |
| duration-spinner | 1000ms | Loading spinner rotation |
| easing-luxury | cubic-bezier(0.4, 0, 0.2, 1) | Premium smooth transitions |

### Performance Metrics

- All tokens load synchronously with CSS
- No runtime JavaScript needed for token values
- Dark mode switches via CSS media query (no JS flicker)
- Token values accessible in both CSS and Tailwind

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All tests executed via `npm run test:unit -- --run tests/unit/tokens/`
- TypeScript validation via `npx tsc --noEmit`
- ESLint validation via `npm run lint`

### Completion Notes List

**Implementation Summary (2026-01-24):**

1. **Color Tokens (AC#1):** Implemented all color tokens per UX specification
   - Primary: `--orion-gold: #D4AF37`, `--orion-gold-muted: #C4A052`
   - Background: `--orion-bg: #FAF8F5` (cream), `--orion-surface: #FFFFFF`
   - Foreground: `--orion-fg: #1A1A1A`, `--orion-fg-muted: #6B6B6B`
   - Status: `--orion-blue: #3B82F6`, `--orion-success: #059669`, `--orion-error: #9B2C2C`

2. **Dark Mode (AC#1):** Full dark mode support
   - Media query `@media (prefers-color-scheme: dark)` with all overrides
   - `.dark` class for manual toggle support
   - shadcn/ui variables also overridden for dark mode

3. **Spacing Tokens (AC#2):** 4px base unit with full scale
   - `--space-1` through `--space-16` (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
   - Layout dimensions: header (80px), sidebar (280px), canvas (480px), etc.

4. **Border Radius (AC#3):** Editorial Luxury - sharp corners
   - `--radius: 0rem` for shadcn/ui compatibility
   - Global `border-radius: 0 !important` rule enforcing sharp corners

5. **Animation Tokens (AC#4):** Timing per spec
   - `--duration-entrance: 200ms`, `--duration-exit: 150ms`, `--duration-state: 100ms`
   - `--easing-luxury: cubic-bezier(0.4, 0, 0.2, 1)`
   - Keyframes: reveal, fade-in, pulse, spin

6. **shadcn/ui Overrides (AC#1, AC#3):**
   - `--background: 38 33% 97%` (cream HSL)
   - `--foreground: 0 0% 10%` (black HSL)
   - `--primary: 43 65% 52%` (gold HSL)

7. **Tailwind Integration:**
   - Colors extended with `orion` namespace using CSS variables
   - Spacing extended with token references
   - Animation utilities configured

**Tests Created:** 85 unit tests across 7 test files - ALL PASSING

### File List

**Files Modified:**
- `/Users/sid/Desktop/orion-butler/design-system/styles/globals.css` - All CSS variable token definitions (643 lines)
- `/Users/sid/Desktop/orion-butler/design-system/tailwind.config.ts` - Tailwind preset with token extensions (381 lines)

**Files Created (Tests):**
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/color-tokens.spec.ts` - 20 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/spacing-tokens.spec.ts` - 16 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/border-radius-tokens.spec.ts` - 4 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/animation-tokens.spec.ts` - 16 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/typography-tokens.spec.ts` - 6 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/shadcn-overrides.spec.ts` - 8 tests
- `/Users/sid/Desktop/orion-butler/tests/unit/tokens/tailwind-integration.spec.ts` - 15 tests
