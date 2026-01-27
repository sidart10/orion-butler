# ATDD Checklist: 1.3-define-css-design-tokens

**Story:** Define CSS Design Tokens
**Status:** Ready for Development
**Test Architect:** TEA (Master Test Architect)
**Generated:** 2026-01-24

---

## Overview

This checklist covers all test scenarios for Story 1.3, which defines all design tokens (colors, spacing, border-radius, animations) as CSS variables in globals.css and integrates them with Tailwind and shadcn/ui.

### Test Coverage Summary

| Category | Planned | Frameworks |
|----------|---------|------------|
| Unit Tests | 32 | Vitest |
| Integration Tests | 6 | Vitest |
| E2E Tests | 8 | Playwright |
| **Total** | **46** | |

### Test ID Convention

```
1.3-{LEVEL}-{SEQ}

Examples:
1.3-UNIT-001  -> Story 1.3, Unit test #1
1.3-INT-001   -> Story 1.3, Integration test #1
1.3-E2E-001   -> Story 1.3, E2E test #1
```

### Dependencies

- Story 1.1 completed (Tauri + Next.js scaffold exists)
- Story 1.2 completed (Font CSS variables `--font-playfair` and `--font-inter` exist)
- `src/app/globals.css` exists and is initialized
- `tailwind.config.ts` exists with font family configuration

---

## AC1: Color Tokens Exist

> **Given** the design-system.md specification
> **When** I inspect the CSS
> **Then** color tokens exist: `--gold-accent: #D4AF37`, `--bg-primary`, `--text-primary`, etc.

### Happy Path Tests

- [ ] **1.3-UNIT-001:** Verify gold accent color token defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-gold: #D4AF37`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-002:** Verify gold muted variant token defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-gold-muted: #C4A052`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-003:** Verify background token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-bg: #FAF8F5`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-004:** Verify surface token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-surface: #FFFFFF`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-005:** Verify surface elevated token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-surface-elevated: #FFFFFF`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-006:** Verify foreground token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-fg: #1A1A1A`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-007:** Verify foreground muted token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-fg-muted: #6B6B6B`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-008:** Verify border token defined (light mode)
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-border: #E5E5E5`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-009:** Verify status color tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-blue: #3B82F6`, `--orion-success: #059669`, `--orion-error: #9B2C2C`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-010:** Verify scrollbar token defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--orion-scrollbar: #CCCCCC`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-E2E-001:** Verify gold accent renders correctly in browser
  - **Given:** Application is running
  - **When:** Inspecting computed CSS variable value
  - **Then:** `getComputedStyle(document.documentElement).getPropertyValue('--orion-gold')` returns '#D4AF37' or 'rgb(212, 175, 55)'
  - **File:** `tests/e2e/tokens/color-rendering.spec.ts`

### Dark Mode Tests

- [ ] **1.3-UNIT-011:** Verify dark mode background token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing `@media (prefers-color-scheme: dark)` block
  - **Then:** Contains `--orion-bg: #121212`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-012:** Verify dark mode surface token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-surface: #1A1A1A`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-013:** Verify dark mode surface elevated token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-surface-elevated: #242424`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-014:** Verify dark mode foreground token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-fg: #FAF8F5`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-015:** Verify dark mode foreground muted token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-fg-muted: #9CA3AF`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-016:** Verify dark mode border token override
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-border: #2D2D2D`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-017:** Verify dark mode status color overrides for visibility
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing dark mode media query
  - **Then:** Contains `--orion-success: #10B981`, `--orion-error: #EF4444`
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-018:** Verify .dark class manual toggle exists
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content for `.dark` selector
  - **Then:** Contains `.dark { --orion-bg: #121212` (same overrides as media query)
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-E2E-002:** Verify dark mode switches colors via media query
  - **Given:** Application is running
  - **When:** Emulating dark color scheme via Playwright `emulateMedia({ colorScheme: 'dark' })`
  - **Then:** `--orion-bg` computed value changes to '#121212' or 'rgb(18, 18, 18)'
  - **File:** `tests/e2e/tokens/dark-mode.spec.ts`

- [ ] **1.3-E2E-003:** Verify dark mode switches colors via .dark class
  - **Given:** Application is running
  - **When:** Adding `dark` class to document element
  - **Then:** `--orion-bg` computed value changes to '#121212' or 'rgb(18, 18, 18)'
  - **File:** `tests/e2e/tokens/dark-mode.spec.ts`

### Edge Cases

- [ ] **1.3-UNIT-019:** Verify gold tokens are constant (same in light and dark)
  - **Given:** `src/app/globals.css` exists
  - **When:** Checking dark mode media query
  - **Then:** `--orion-gold` and `--orion-gold-muted` are NOT overridden (remain constant)
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

- [ ] **1.3-UNIT-020:** Verify blue token is constant (same in light and dark)
  - **Given:** `src/app/globals.css` exists
  - **When:** Checking dark mode media query
  - **Then:** `--orion-blue` is NOT overridden (remains constant at #3B82F6)
  - **File:** `tests/unit/tokens/color-tokens.spec.ts`

---

## AC2: Spacing Tokens Exist

> **And** spacing tokens exist: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)

### Happy Path Tests

- [ ] **1.3-UNIT-021:** Verify spacing scale tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains all spacing tokens:
    - `--space-1: 4px`
    - `--space-2: 8px`
    - `--space-3: 12px`
    - `--space-4: 16px`
    - `--space-6: 24px`
    - `--space-8: 32px`
    - `--space-12: 48px`
    - `--space-16: 64px`
  - **File:** `tests/unit/tokens/spacing-tokens.spec.ts`

- [ ] **1.3-UNIT-022:** Verify layout dimension tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains layout tokens:
    - `--orion-header-height: 80px`
    - `--orion-sidebar-width: 280px`
    - `--orion-sidebar-collapsed: 72px`
    - `--orion-rail-width: 64px`
    - `--orion-content-max-width: 850px`
    - `--orion-canvas-width: 480px`
    - `--orion-context-width: 320px`
  - **File:** `tests/unit/tokens/spacing-tokens.spec.ts`

- [ ] **1.3-E2E-004:** Verify spacing tokens have correct computed values
  - **Given:** Application is running
  - **When:** Reading computed style for `--space-4`
  - **Then:** Returns '16px'
  - **File:** `tests/e2e/tokens/spacing-rendering.spec.ts`

### Boundary Conditions

- [ ] **1.3-INT-001:** Verify Tailwind spacing utilities use token values
  - **Given:** Application is built
  - **When:** Applying `p-space-4` class to an element
  - **Then:** Element has `padding: 16px` or `padding: var(--space-4)`
  - **File:** `tests/integration/tokens/tailwind-spacing.spec.ts`

---

## AC3: Border Radius is 0px Throughout

> **And** border-radius is 0px throughout

### Happy Path Tests

- [ ] **1.3-UNIT-023:** Verify global border-radius token is 0
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--radius: 0rem` or `--radius: 0px` or `--radius: 0`
  - **File:** `tests/unit/tokens/border-radius-tokens.spec.ts`

- [ ] **1.3-UNIT-024:** Verify Tailwind borderRadius default is 0
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing borderRadius configuration
  - **Then:** `borderRadius.DEFAULT` is '0' or references `--radius`
  - **File:** `tests/unit/tokens/border-radius-tokens.spec.ts`

- [ ] **1.3-E2E-005:** Verify no rounded corners in rendered UI
  - **Given:** Application is running
  - **When:** Inspecting computed border-radius of buttons, cards, inputs
  - **Then:** All elements have `border-radius: 0px`
  - **File:** `tests/e2e/tokens/border-radius-rendering.spec.ts`

### Edge Cases

- [ ] **1.3-INT-002:** Verify shadcn/ui components use 0 radius
  - **Given:** shadcn/ui Button component exists
  - **When:** Rendering Button component
  - **Then:** Computed border-radius is 0px (sharp corners)
  - **File:** `tests/integration/tokens/shadcn-radius.spec.ts`

---

## AC4: Animation Tokens Exist

> **And** animation tokens exist: 200ms entrance, 150ms exit, 100ms state change

### Happy Path Tests

- [ ] **1.3-UNIT-025:** Verify animation duration tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains:
    - `--duration-entrance: 200ms`
    - `--duration-exit: 150ms`
    - `--duration-state: 100ms`
    - `--duration-canvas: 300ms`
    - `--duration-pulse: 1500ms`
    - `--duration-spinner: 1000ms`
  - **File:** `tests/unit/tokens/animation-tokens.spec.ts`

- [ ] **1.3-UNIT-026:** Verify easing function tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains:
    - `--easing-luxury: cubic-bezier(0.4, 0, 0.2, 1)`
    - `--easing-in: ease-in`
    - `--easing-out: ease-out`
  - **File:** `tests/unit/tokens/animation-tokens.spec.ts`

- [ ] **1.3-UNIT-027:** Verify animation keyframes defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content for @keyframes
  - **Then:** Contains keyframes: `reveal`, `fade-in`, `pulse`, `spin`
  - **File:** `tests/unit/tokens/animation-tokens.spec.ts`

- [ ] **1.3-UNIT-028:** Verify animation utility classes defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content
  - **Then:** Contains `.animate-reveal`, `.animate-fade-in`, `.animate-pulse`
  - **File:** `tests/unit/tokens/animation-tokens.spec.ts`

- [ ] **1.3-E2E-006:** Verify animation plays with correct timing
  - **Given:** Application is running with element using `.animate-reveal`
  - **When:** Measuring animation duration
  - **Then:** Animation completes in approximately 200ms
  - **File:** `tests/e2e/tokens/animation-rendering.spec.ts`

### Boundary Conditions

- [ ] **1.3-UNIT-029:** Verify stagger delay classes defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content
  - **Then:** Contains `.delay-1`, `.delay-2`, `.delay-3` with animation-delay values
  - **File:** `tests/unit/tokens/animation-tokens.spec.ts`

---

## shadcn/ui Integration

> **And** shadcn/ui CSS variables are overridden to use Orion tokens

### Happy Path Tests

- [ ] **1.3-UNIT-030:** Verify shadcn/ui --background overridden
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--background: 38 33% 97%` (HSL for cream)
  - **File:** `tests/unit/tokens/shadcn-overrides.spec.ts`

- [ ] **1.3-UNIT-031:** Verify shadcn/ui --foreground overridden
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--foreground: 0 0% 10%` (HSL for black)
  - **File:** `tests/unit/tokens/shadcn-overrides.spec.ts`

- [ ] **1.3-UNIT-032:** Verify shadcn/ui --primary overridden to gold
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--primary: 43 65% 52%` (HSL for gold)
  - **File:** `tests/unit/tokens/shadcn-overrides.spec.ts`

- [ ] **1.3-INT-003:** Verify shadcn/ui Button uses gold primary color
  - **Given:** shadcn/ui Button component with variant="default" exists
  - **When:** Rendering Button
  - **Then:** Background color is gold (#D4AF37 or hsl(43, 65%, 52%))
  - **File:** `tests/integration/tokens/shadcn-components.spec.ts`

---

## Tailwind Configuration Integration

> **And** Tailwind extends theme with Orion tokens

### Happy Path Tests

- [ ] **1.3-INT-004:** Verify Tailwind colors extend with orion namespace
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing theme.extend.colors configuration
  - **Then:** Contains `orion: { gold: 'var(--orion-gold)', bg: 'var(--orion-bg)', ... }`
  - **File:** `tests/integration/tokens/tailwind-config.spec.ts`

- [ ] **1.3-INT-005:** Verify Tailwind transitionDuration extends with tokens
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing theme.extend.transitionDuration configuration
  - **Then:** Contains `entrance: 'var(--duration-entrance)'`, `exit: 'var(--duration-exit)'`
  - **File:** `tests/integration/tokens/tailwind-config.spec.ts`

- [ ] **1.3-INT-006:** Verify Tailwind animation extends with keyframes
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing theme.extend.animation configuration
  - **Then:** Contains `reveal`, `fade-in`, `pulse` animations
  - **File:** `tests/integration/tokens/tailwind-config.spec.ts`

- [ ] **1.3-E2E-007:** Verify `bg-orion-gold` utility works
  - **Given:** Application is running
  - **When:** Applying `className="bg-orion-gold"` to element
  - **Then:** Element background is gold (#D4AF37)
  - **File:** `tests/e2e/tokens/tailwind-utilities.spec.ts`

- [ ] **1.3-E2E-008:** Verify `text-orion-fg` utility works in dark mode
  - **Given:** Application is running in dark mode
  - **When:** Applying `className="text-orion-fg"` to element
  - **Then:** Element text color is cream (#FAF8F5)
  - **File:** `tests/e2e/tokens/tailwind-utilities.spec.ts`

---

## Typography Token Integration (from Task 7)

### Happy Path Tests (supplements AC1)

- [ ] **1.3-UNIT-033 (DEFERRED):** Verify tracking tokens defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content in :root
  - **Then:** Contains `--tracking-luxury: 0.15em`, `--tracking-widest: 0.1em`
  - **File:** `tests/unit/tokens/typography-tokens.spec.ts`
  - **Note:** Deferred - typography scale may be implemented in Story 1.2 extension or later story

---

## Test Execution Order

### Phase 1: Static Analysis (No Build Required)
1. Color Token Tests (1.3-UNIT-001 through 1.3-UNIT-020)
2. Spacing Token Tests (1.3-UNIT-021 through 1.3-UNIT-022)
3. Border Radius Tests (1.3-UNIT-023 through 1.3-UNIT-024)
4. Animation Token Tests (1.3-UNIT-025 through 1.3-UNIT-029)
5. shadcn/ui Override Tests (1.3-UNIT-030 through 1.3-UNIT-032)

### Phase 2: Build Verification (Requires Build)
6. Tailwind Integration Tests (1.3-INT-001 through 1.3-INT-006)

### Phase 3: Runtime Verification (Requires Running App)
7. Color Rendering Tests (1.3-E2E-001 through 1.3-E2E-003)
8. Spacing Rendering Tests (1.3-E2E-004)
9. Border Radius Rendering Tests (1.3-E2E-005)
10. Animation Rendering Tests (1.3-E2E-006)
11. Tailwind Utility Tests (1.3-E2E-007 through 1.3-E2E-008)

---

## Test Commands

```bash
# Run all Story 1.3 unit tests
npm run test:unit -- --grep "1.3"

# Run token validation tests only
npm run test:unit -- tests/unit/tokens/

# Run integration tests (requires build)
npm run test:integration -- tests/integration/tokens/

# Run E2E tests (requires dev server)
npm run test:e2e -- tests/e2e/tokens/

# Run dark mode tests specifically
npm run test:e2e -- tests/e2e/tokens/dark-mode.spec.ts
```

---

## Test File Structure

```
tests/
+-- unit/
|   +-- tokens/
|       +-- color-tokens.spec.ts           # 1.3-UNIT-001 to 1.3-UNIT-020
|       +-- spacing-tokens.spec.ts         # 1.3-UNIT-021 to 1.3-UNIT-022
|       +-- border-radius-tokens.spec.ts   # 1.3-UNIT-023 to 1.3-UNIT-024
|       +-- animation-tokens.spec.ts       # 1.3-UNIT-025 to 1.3-UNIT-029
|       +-- shadcn-overrides.spec.ts       # 1.3-UNIT-030 to 1.3-UNIT-032
+-- integration/
|   +-- tokens/
|       +-- tailwind-spacing.spec.ts       # 1.3-INT-001
|       +-- shadcn-radius.spec.ts          # 1.3-INT-002
|       +-- shadcn-components.spec.ts      # 1.3-INT-003
|       +-- tailwind-config.spec.ts        # 1.3-INT-004 to 1.3-INT-006
+-- e2e/
    +-- tokens/
        +-- color-rendering.spec.ts        # 1.3-E2E-001
        +-- dark-mode.spec.ts              # 1.3-E2E-002 to 1.3-E2E-003
        +-- spacing-rendering.spec.ts      # 1.3-E2E-004
        +-- border-radius-rendering.spec.ts # 1.3-E2E-005
        +-- animation-rendering.spec.ts    # 1.3-E2E-006
        +-- tailwind-utilities.spec.ts     # 1.3-E2E-007 to 1.3-E2E-008
```

---

## Coverage Requirements

Per test-design-system.md:
- **Unit tests:** 80% coverage target
- **Integration tests:** 70% coverage target
- **E2E tests:** Critical paths only

### Story 1.3 Specific Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Color tokens in :root | 100% | Design system compliance |
| Dark mode overrides | 100% | Theme switching critical |
| Spacing tokens | 100% | Layout consistency |
| Border-radius enforcement | 100% | Editorial luxury principle |
| Animation tokens | 100% | UX motion design |
| shadcn/ui overrides | 100% | Component library integration |
| Tailwind config integration | 100% | Utility class foundation |

---

## Risk-Based Testing Notes

### High Risk (Must Test)

1. **Dark mode token switching** - Critical UX feature, must work via media query AND .dark class
2. **Border-radius = 0 enforcement** - Core design principle, any deviation breaks aesthetic
3. **Gold accent color accuracy** - Brand identity, must be exact #D4AF37
4. **shadcn/ui --primary override** - All buttons/interactive elements depend on this

### Medium Risk (Should Test)

1. **Animation timing accuracy** - Important for premium feel, but slight variance acceptable
2. **Spacing token scale** - Layout consistency, but manual testing can supplement
3. **Tailwind utility generation** - Should work if config is correct

### Low Risk (Nice to Test)

1. **Scrollbar color token** - Minor visual detail
2. **Typography tracking tokens** - May be deferred to later story
3. **Stagger delay classes** - Enhancement, not core functionality

---

## Notes for Implementation

1. **TDD Approach:** Write tests before implementing token definitions in globals.css.

2. **CSS Parsing Strategy:** Unit tests use regex/string matching on raw CSS file content. Do not attempt to parse CSS as AST unless necessary.

3. **Dark Mode Testing:** E2E tests use Playwright's `emulateMedia({ colorScheme: 'dark' })` for media query testing and direct class manipulation for .dark class testing.

4. **Color Value Formats:** Tests should accept both hex (#D4AF37) and rgb (rgb(212, 175, 55)) formats since browsers may convert values.

5. **Design System Principle:** Per UX spec, "0px border radius throughout" and "Gold is the only accent." Tests enforce these constraints.

6. **Tailwind v4 Note:** If using Tailwind v4, CSS variable syntax may differ. Tests should accommodate both v3 and v4 patterns.

---

## Acceptance Criteria Traceability

| AC | Test IDs | Coverage |
|----|----------|----------|
| AC1: Color tokens | 1.3-UNIT-001 to 1.3-UNIT-020, 1.3-E2E-001 to 1.3-E2E-003 | Full |
| AC2: Spacing tokens | 1.3-UNIT-021 to 1.3-UNIT-022, 1.3-E2E-004, 1.3-INT-001 | Full |
| AC3: Border-radius 0px | 1.3-UNIT-023 to 1.3-UNIT-024, 1.3-E2E-005, 1.3-INT-002 | Full |
| AC4: Animation tokens | 1.3-UNIT-025 to 1.3-UNIT-029, 1.3-E2E-006 | Full |
| shadcn/ui integration | 1.3-UNIT-030 to 1.3-UNIT-032, 1.3-INT-003 | Full |
| Tailwind integration | 1.3-INT-004 to 1.3-INT-006, 1.3-E2E-007 to 1.3-E2E-008 | Full |

---

## Token Value Reference (for Test Assertions)

### Light Mode Colors
| Token | Value |
|-------|-------|
| `--orion-gold` | #D4AF37 |
| `--orion-gold-muted` | #C4A052 |
| `--orion-bg` | #FAF8F5 |
| `--orion-surface` | #FFFFFF |
| `--orion-surface-elevated` | #FFFFFF |
| `--orion-fg` | #1A1A1A |
| `--orion-fg-muted` | #6B6B6B |
| `--orion-border` | #E5E5E5 |
| `--orion-blue` | #3B82F6 |
| `--orion-success` | #059669 |
| `--orion-error` | #9B2C2C |
| `--orion-scrollbar` | #CCCCCC |

### Dark Mode Overrides
| Token | Value |
|-------|-------|
| `--orion-bg` | #121212 |
| `--orion-surface` | #1A1A1A |
| `--orion-surface-elevated` | #242424 |
| `--orion-fg` | #FAF8F5 |
| `--orion-fg-muted` | #9CA3AF |
| `--orion-border` | #2D2D2D |
| `--orion-scrollbar` | #333333 |
| `--orion-success` | #10B981 |
| `--orion-error` | #EF4444 |

### Spacing Scale
| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### Animation Timing
| Token | Value |
|-------|-------|
| `--duration-entrance` | 200ms |
| `--duration-exit` | 150ms |
| `--duration-state` | 100ms |
| `--duration-canvas` | 300ms |
| `--duration-pulse` | 1500ms |
| `--duration-spinner` | 1000ms |

---

*Generated by TEA (Master Test Architect) - Risk-based testing with quality gates backed by data.*
