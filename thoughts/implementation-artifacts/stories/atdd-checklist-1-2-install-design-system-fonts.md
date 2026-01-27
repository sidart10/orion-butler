# ATDD Checklist: 1.2-install-design-system-fonts

**Story:** Install Design System Fonts
**Status:** Ready for Development
**Test Architect:** TEA (Master Test Architect)
**Generated:** 2026-01-24

---

## Overview

This checklist covers all test scenarios for Story 1.2, which installs and configures the design system fonts (Playfair Display for headings, Inter for body text) using `next/font` to prevent FOUT (Flash of Unstyled Text).

### Test Coverage Summary

| Category | Planned | Frameworks |
|----------|---------|------------|
| Unit Tests | 18 | Vitest |
| Integration Tests | 4 | Vitest |
| E2E Tests | 6 | Playwright |
| Visual Tests | 3 | Playwright |
| **Total** | **31** | |

### Test ID Convention

```
1.2-{LEVEL}-{SEQ}

Examples:
1.2-UNIT-001  -> Story 1.2, Unit test #1
1.2-INT-001   -> Story 1.2, Integration test #1
1.2-E2E-001   -> Story 1.2, E2E test #1
1.2-VIS-001   -> Story 1.2, Visual regression test #1
```

### Dependencies

- Story 1.1 completed (Tauri + Next.js scaffold exists)
- `src/app/layout.tsx` exists
- `tailwind.config.ts` exists
- `src/app/globals.css` exists

---

## AC1: Playfair Display for Headings

> **Given** the Tauri app is running
> **When** I view any screen
> **Then** display headings use Playfair Display font

### Happy Path Tests

- [ ] **1.2-UNIT-001:** Verify Playfair Display font imported in layout.tsx
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Reading file content
  - **Then:** Contains `import { Playfair_Display }` or `import { ... Playfair_Display ... }` from `'next/font/google'`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-002:** Verify Playfair Display font configuration includes required weights
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Playfair_Display config includes weights: '400', '500', '600', '700', '800', '900'
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-003:** Verify Playfair Display includes italic variant
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Playfair_Display config includes `style: ['normal', 'italic']` or both styles specified
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-004:** Verify Playfair Display CSS variable defined
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Playfair_Display config includes `variable: '--font-playfair'`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-005:** Verify Playfair Display applied to HTML element
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Checking HTML element className
  - **Then:** className includes Playfair font variable (e.g., `${playfair.variable}`)
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-E2E-001:** Verify heading elements render with Playfair Display
  - **Given:** Application is running
  - **When:** Inspecting computed styles of heading elements (h1, h2 with `.serif` class)
  - **Then:** `font-family` computed value contains "Playfair Display"
  - **File:** `tests/e2e/fonts/typography-rendering.spec.ts`

### Edge Cases

- [ ] **1.2-UNIT-006:** Verify Playfair Display subset is 'latin'
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Playfair_Display config includes `subsets: ['latin']`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-E2E-002:** Verify Playfair Display renders special characters correctly
  - **Given:** Application is running with heading containing special chars (e.g., "Resume: Q4 Plan")
  - **When:** Inspecting rendered text
  - **Then:** Colon, numerals, and letters render in Playfair Display
  - **File:** `tests/e2e/fonts/typography-rendering.spec.ts`

### Error Handling

- [ ] **1.2-E2E-003:** Verify fallback font when Playfair fails to load
  - **Given:** Application is running with network request to fonts blocked
  - **When:** Inspecting computed styles of heading elements
  - **Then:** `font-family` computed value falls back to "Georgia" or "serif"
  - **File:** `tests/e2e/fonts/font-fallback.spec.ts`
  - **Note:** Uses Playwright route interception to block font loading

---

## AC2: Inter for Body Text

> **And** body text uses Inter font

### Happy Path Tests

- [ ] **1.2-UNIT-007:** Verify Inter font imported in layout.tsx
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Reading file content
  - **Then:** Contains `import { Inter }` or `import { ... Inter ... }` from `'next/font/google'`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-008:** Verify Inter font configuration includes full weight range
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Inter config includes `subsets: ['latin']` (variable fonts include all weights by default)
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-009:** Verify Inter CSS variable defined
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing font configuration
  - **Then:** Inter config includes `variable: '--font-inter'`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-010:** Verify Inter applied to HTML element
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Checking HTML element className
  - **Then:** className includes Inter font variable (e.g., `${inter.variable}`)
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-UNIT-011:** Verify body default font is Inter
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Checking body element className
  - **Then:** className includes `font-sans` (Tailwind utility for Inter)
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-E2E-004:** Verify body text renders with Inter
  - **Given:** Application is running
  - **When:** Inspecting computed styles of paragraph elements
  - **Then:** `font-family` computed value contains "Inter"
  - **File:** `tests/e2e/fonts/typography-rendering.spec.ts`

### Edge Cases

- [ ] **1.2-E2E-005:** Verify Inter renders numerals correctly (tabular figures)
  - **Given:** Application is running with content containing numbers
  - **When:** Inspecting rendered numeric text
  - **Then:** Numbers render consistently in Inter font
  - **File:** `tests/e2e/fonts/typography-rendering.spec.ts`

### Error Handling

- [ ] **1.2-E2E-006:** Verify fallback font when Inter fails to load
  - **Given:** Application is running with network request to fonts blocked
  - **When:** Inspecting computed styles of body elements
  - **Then:** `font-family` computed value falls back to "system-ui" or "sans-serif"
  - **File:** `tests/e2e/fonts/font-fallback.spec.ts`

---

## AC3: FOUT Prevention via next/font

> **And** fonts load without FOUT (flash of unstyled text) via `next/font`

### Happy Path Tests

- [ ] **1.2-UNIT-012:** Verify font-display is set to 'swap'
  - **Given:** `src/app/layout.tsx` exists
  - **When:** Parsing both font configurations
  - **Then:** Both Inter and Playfair_Display configs include `display: 'swap'`
  - **File:** `tests/unit/fonts/font-configuration.spec.ts`

- [ ] **1.2-INT-001:** Verify fonts are bundled with the application
  - **Given:** Application is built with `npm run build`
  - **When:** Checking build output in `.next/static/media/`
  - **Then:** Font files (.woff2) exist for Inter and Playfair Display
  - **File:** `tests/integration/fonts/font-bundling.spec.ts`

- [ ] **1.2-INT-002:** Verify no external Google Fonts requests in production
  - **Given:** Application is built and running
  - **When:** Inspecting network requests during page load
  - **Then:** No requests to `fonts.googleapis.com` or `fonts.gstatic.com`
  - **File:** `tests/integration/fonts/font-bundling.spec.ts`

- [ ] **1.2-VIS-001:** Verify no FOUT on initial page load
  - **Given:** Application is launched fresh (cold start)
  - **When:** Recording video of first paint to stable state
  - **Then:** No visible font flash or layout shift during text rendering
  - **File:** `tests/e2e/fonts/fout-prevention.spec.ts`
  - **Note:** Uses Playwright video recording and visual comparison

### Edge Cases

- [ ] **1.2-INT-003:** Verify fonts work with static export (output: 'export')
  - **Given:** Application is built with `npm run build` (static export)
  - **When:** Serving built files locally
  - **Then:** Fonts load correctly from local files without external requests
  - **File:** `tests/integration/fonts/font-bundling.spec.ts`

- [ ] **1.2-VIS-002:** Verify no FOUT under slow network conditions
  - **Given:** Application is running
  - **When:** Loading page with Slow 3G network throttling enabled
  - **Then:** Fonts appear on first paint (no flash), graceful loading behavior
  - **File:** `tests/e2e/fonts/fout-prevention.spec.ts`
  - **Note:** Uses Playwright network throttling: `context.route('**/*', route => route.continue({ throttle: 'Slow 3G' }))`

### Boundary Conditions

- [ ] **1.2-VIS-003:** Verify fonts load correctly in production build
  - **Given:** Application built with `npm run build && npm run tauri dev`
  - **When:** Launching production build
  - **Then:** Fonts render correctly, no FOUT, no console errors
  - **File:** `tests/e2e/fonts/fout-prevention.spec.ts`

---

## AC4: Tailwind CSS Integration (Implied from Tasks)

> **And** Tailwind fontFamily utilities work with CSS variables

### Happy Path Tests

- [ ] **1.2-UNIT-013:** Verify Tailwind fontFamily.sans configured with Inter variable
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing theme.extend.fontFamily configuration
  - **Then:** `sans` includes `'var(--font-inter)'` as first font in array
  - **File:** `tests/unit/fonts/tailwind-integration.spec.ts`

- [ ] **1.2-UNIT-014:** Verify Tailwind fontFamily.serif configured with Playfair variable
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing theme.extend.fontFamily configuration
  - **Then:** `serif` includes `'var(--font-playfair)'` as first font in array
  - **File:** `tests/unit/fonts/tailwind-integration.spec.ts`

- [ ] **1.2-UNIT-015:** Verify Tailwind fallback fonts configured
  - **Given:** `tailwind.config.ts` exists
  - **When:** Parsing fontFamily configuration
  - **Then:** `sans` includes 'system-ui', 'sans-serif' as fallbacks; `serif` includes 'Georgia', 'serif' as fallbacks
  - **File:** `tests/unit/fonts/tailwind-integration.spec.ts`

- [ ] **1.2-E2E-007 (DEFERRED):** Verify `font-sans` utility applies Inter
  - **Given:** Application is running
  - **When:** Applying `className="font-sans"` to an element
  - **Then:** Element renders with Inter font family
  - **File:** `tests/e2e/fonts/tailwind-utilities.spec.ts`
  - **Note:** Deferred - tested implicitly by body default styling

- [ ] **1.2-E2E-008 (DEFERRED):** Verify `font-serif` utility applies Playfair Display
  - **Given:** Application is running
  - **When:** Applying `className="font-serif"` to an element
  - **Then:** Element renders with Playfair Display font family
  - **File:** `tests/e2e/fonts/tailwind-utilities.spec.ts`
  - **Note:** Deferred - tested implicitly by heading styling

---

## AC5: Global CSS Typography Styles (Implied from Tasks)

> **And** global CSS includes base typography and .serif utility

### Happy Path Tests

- [ ] **1.2-UNIT-016:** Verify globals.css sets body font-family
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content
  - **Then:** Contains `body { font-family: var(--font-inter)` or equivalent Tailwind @apply
  - **File:** `tests/unit/fonts/global-styles.spec.ts`

- [ ] **1.2-UNIT-017:** Verify globals.css includes font smoothing
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content
  - **Then:** Contains `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`
  - **File:** `tests/unit/fonts/global-styles.spec.ts`

- [ ] **1.2-UNIT-018:** Verify .serif utility class defined
  - **Given:** `src/app/globals.css` exists
  - **When:** Parsing CSS content
  - **Then:** Contains `.serif { font-family: var(--font-playfair)` or Tailwind @apply font-serif
  - **File:** `tests/unit/fonts/global-styles.spec.ts`

### Edge Cases

- [ ] **1.2-INT-004:** Verify .editorial heading styles (if implemented)
  - **Given:** `src/app/globals.css` exists
  - **When:** Checking for editorial context styles
  - **Then:** Contains `.editorial h1, .editorial h2 { font-family: var(--font-playfair)` OR document decision to skip
  - **File:** `tests/integration/fonts/editorial-styles.spec.ts`
  - **Note:** Optional per story notes - verify implementation or explicit skip

---

## Typography Scale Compliance (from UX Design Specification)

> **Verify** typography implementation matches UX Design Specification scale

### Visual Verification Tests

- [ ] **1.2-VIS-004 (MANUAL):** Verify Display heading uses Playfair Display 32px
  - **Given:** Component with Display heading exists
  - **When:** Inspecting computed styles
  - **Then:** font-family contains "Playfair Display", font-size is 32px, font-weight is 400
  - **Note:** Manual verification during code review

- [ ] **1.2-VIS-005 (MANUAL):** Verify H1 uses Playfair Display 24px
  - **Given:** Component with H1 heading exists
  - **When:** Inspecting computed styles
  - **Then:** font-family contains "Playfair Display", font-size is 24px, font-weight is 400
  - **Note:** Manual verification during code review

- [ ] **1.2-VIS-006 (MANUAL):** Verify H2 uses Inter 20px Semibold
  - **Given:** Component with H2 heading exists
  - **When:** Inspecting computed styles
  - **Then:** font-family contains "Inter", font-size is 20px, font-weight is 600
  - **Note:** Manual verification during code review

- [ ] **1.2-VIS-007 (MANUAL):** Verify Body uses Inter 16px Regular
  - **Given:** Body text paragraph exists
  - **When:** Inspecting computed styles
  - **Then:** font-family contains "Inter", font-size is 16px, font-weight is 400
  - **Note:** Manual verification during code review

---

## Test Execution Order

### Phase 1: Static Analysis (No Build Required)
1. Font Configuration Tests (1.2-UNIT-001 through 1.2-UNIT-012)
2. Tailwind Integration Tests (1.2-UNIT-013 through 1.2-UNIT-015)
3. Global Styles Tests (1.2-UNIT-016 through 1.2-UNIT-018)

### Phase 2: Build Verification (Requires Build)
4. Font Bundling Tests (1.2-INT-001 through 1.2-INT-004)

### Phase 3: Runtime Verification (Requires Running App)
5. Typography Rendering Tests (1.2-E2E-001 through 1.2-E2E-006)
6. FOUT Prevention Tests (1.2-VIS-001 through 1.2-VIS-003)

### Phase 4: Manual Verification (Code Review)
7. Typography Scale Compliance (1.2-VIS-004 through 1.2-VIS-007)

---

## Test Commands

```bash
# Run all Story 1.2 unit tests
npm run test:unit -- --grep "1.2"

# Run font configuration tests only
npm run test:unit -- tests/unit/fonts/

# Run integration tests (requires build)
npm run test:integration -- tests/integration/fonts/

# Run E2E tests (requires dev server)
npm run test:e2e -- tests/e2e/fonts/

# Run visual regression tests
npm run test:e2e -- tests/e2e/fonts/fout-prevention.spec.ts
```

---

## Test File Structure

```
tests/
├── unit/
│   └── fonts/
│       ├── font-configuration.spec.ts    # 1.2-UNIT-001 to 1.2-UNIT-012
│       ├── tailwind-integration.spec.ts  # 1.2-UNIT-013 to 1.2-UNIT-015
│       └── global-styles.spec.ts         # 1.2-UNIT-016 to 1.2-UNIT-018
├── integration/
│   └── fonts/
│       ├── font-bundling.spec.ts         # 1.2-INT-001 to 1.2-INT-003
│       └── editorial-styles.spec.ts      # 1.2-INT-004
└── e2e/
    └── fonts/
        ├── typography-rendering.spec.ts  # 1.2-E2E-001 to 1.2-E2E-006
        ├── font-fallback.spec.ts         # Fallback scenarios
        └── fout-prevention.spec.ts       # 1.2-VIS-001 to 1.2-VIS-003
```

---

## Coverage Requirements

Per test-design-system.md:
- **Unit tests:** 80% coverage target
- **Integration tests:** 70% coverage target
- **E2E tests:** Critical paths only

### Story 1.2 Specific Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Font imports in layout.tsx | 100% | Core functionality |
| CSS variable definitions | 100% | Design system compliance |
| Tailwind config integration | 100% | Utility class foundation |
| FOUT prevention | Pass/Fail | Critical UX requirement |
| Fallback behavior | Pass/Fail | Graceful degradation |

---

## Risk-Based Testing Notes

### High Risk (Must Test)

1. **FOUT on cold start** - Critical UX issue, most noticeable by users
2. **Font variable availability** - Breaks entire typography if missing
3. **Tailwind utility mapping** - All styling depends on this working

### Medium Risk (Should Test)

1. **Fallback fonts** - Important for resilience
2. **Font weights availability** - Design consistency
3. **Static export compatibility** - Tauri requirement

### Low Risk (Nice to Test)

1. **Specific typography scale values** - Manual verification acceptable
2. **Editorial context styles** - Optional feature
3. **Special character rendering** - Edge case

---

## Notes for Implementation

1. **TDD Approach:** Write tests marked with "TO CREATE" before implementing font configuration.

2. **Visual Testing:** FOUT tests use Playwright video recording. Ensure CI has video capture enabled.

3. **Network Mocking:** Fallback tests require Playwright route interception to simulate font loading failures.

4. **Static Export:** Font bundling tests must verify fonts work with `output: 'export'` configuration.

5. **Design System Principle:** Per UX spec, "Playfair is the accent, not the default." Tests should verify this hierarchy.

---

## Acceptance Criteria Traceability

| AC | Test IDs | Coverage |
|----|----------|----------|
| AC1: Playfair for headings | 1.2-UNIT-001 to 1.2-UNIT-006, 1.2-E2E-001 to 1.2-E2E-003 | Full |
| AC2: Inter for body | 1.2-UNIT-007 to 1.2-UNIT-011, 1.2-E2E-004 to 1.2-E2E-006 | Full |
| AC3: FOUT prevention | 1.2-UNIT-012, 1.2-INT-001 to 1.2-INT-003, 1.2-VIS-001 to 1.2-VIS-003 | Full |
| Tailwind integration | 1.2-UNIT-013 to 1.2-UNIT-015 (E2E-007, E2E-008 deferred) | Partial |
| Global CSS | 1.2-UNIT-016 to 1.2-UNIT-018, 1.2-INT-004 | Full |

---

*Generated by TEA (Master Test Architect) - Risk-based testing with quality gates backed by data.*
