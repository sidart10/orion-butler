# ATDD Checklist: Story 1.8 - Input Field Component

**Story ID:** 1-8-input-field-component
**Epic:** 1 - Application Shell & Design System Foundation
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Summary

This ATDD checklist covers the Input and Textarea components for the Orion Butler design system. Tests focus on visual styling (0px border-radius, design tokens), interaction states (focus, error, disabled), accessibility (touch targets, aria-invalid), and icon slot functionality.

---

## Test Categories

| Category | Test Count | Coverage Focus |
|----------|------------|----------------|
| Unit Tests | 18 | Component rendering, props, class application |
| Integration Tests | 4 | Tailwind token integration, theme switching |
| E2E Tests | 3 | Visual appearance, user interactions |

---

## Unit Tests (Vitest + Testing Library)

### Input Component - Base Rendering

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-001 | Input renders with placeholder | Input component | Rendered with `placeholder="Enter text..."` | Placeholder text is visible in DOM | High |
| 1.8-UNIT-002 | Input has 0px border-radius | Input component | Rendered with default props | Element has `rounded-none` class | High |
| 1.8-UNIT-003 | Input uses design token background | Input component | Rendered with default props | Element has `bg-orion-surface` class | High |
| 1.8-UNIT-004 | Input uses design token border | Input component | Rendered with default props | Element has `border-orion-border` class | High |

### Input Component - Focus States

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-005 | Focus shows gold outline classes | Input component | Element receives focus | Element has `focus:ring-2 focus:ring-orion-gold focus:ring-offset-2` classes | High |
| 1.8-UNIT-006 | Focus transition timing | Input component | Rendered | Element has `duration-100 ease-linear` transition classes | Medium |

### Input Component - Error States

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-007 | Error border styling | Input component | Rendered with `error={true}` | Element has `border-orion-error` class | High |
| 1.8-UNIT-008 | Error focus ring color | Input component | Rendered with `error={true}` | Element has `focus:ring-orion-error` class | High |
| 1.8-UNIT-009 | aria-invalid on error | Input component | Rendered with `error={true}` and `aria-invalid={true}` | Element has `aria-invalid="true"` attribute | High |

### Input Component - Disabled State

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-010 | Disabled state opacity | Input component | Rendered with `disabled={true}` | Element has `disabled:opacity-50` class | High |
| 1.8-UNIT-011 | Disabled cursor style | Input component | Rendered with `disabled={true}` | Element has `disabled:cursor-not-allowed` class | High |
| 1.8-UNIT-012 | Disabled attribute set | Input component | Rendered with `disabled={true}` | Input element is disabled (`toBeDisabled()`) | High |

### Input Component - Icon Slots

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-013 | Left icon renders | Input component | Rendered with `leftIcon={<span data-testid="left-icon">L</span>}` | Left icon element is in DOM | High |
| 1.8-UNIT-014 | Right icon renders | Input component | Rendered with `rightIcon={<span data-testid="right-icon">R</span>}` | Right icon element is in DOM | High |
| 1.8-UNIT-015 | Left icon padding adjustment | Input component | Rendered with `leftIcon` | Input element has `pl-12` class | Medium |
| 1.8-UNIT-016 | Right icon padding adjustment | Input component | Rendered with `rightIcon` | Input element has `pr-12` class | Medium |

### Textarea Component - Base Rendering

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-017 | Textarea renders with placeholder | Textarea component | Rendered with `placeholder="Enter message..."` | Placeholder text is visible | High |
| 1.8-UNIT-018 | Textarea has 0px border-radius | Textarea component | Rendered with default props | Element has `rounded-none` class | High |
| 1.8-UNIT-019 | Textarea minimum height | Textarea component | Rendered with default props | Element has `min-h-[88px]` class | High |
| 1.8-UNIT-020 | Textarea line height | Textarea component | Rendered with default props | Element has `leading-relaxed` class | Medium |

### Textarea Component - Error States

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-021 | Textarea error border | Textarea component | Rendered with `error={true}` | Element has `border-orion-error` class | High |
| 1.8-UNIT-022 | Textarea error focus ring | Textarea component | Rendered with `error={true}` | Element has `focus:ring-orion-error` class | High |
| 1.8-UNIT-023 | Textarea aria-invalid | Textarea component | Rendered with `error={true}` and `aria-invalid={true}` | Element has `aria-invalid="true"` attribute | High |

### Textarea Component - Auto-Resize

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-024 | Auto-resize mode disables manual resize | Textarea component | Rendered with `autoResize={true}` | Element has `resize-none` class | High |
| 1.8-UNIT-025 | Manual resize enabled by default | Textarea component | Rendered with default props | Element has `resize-y` class | Medium |
| 1.8-UNIT-026 | Auto-resize adjusts height on input | Textarea component | Rendered with `autoResize={true}` and text entered | Textarea height increases with content | High |

### Touch Target Compliance

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-UNIT-027 | Input 44px minimum height | Input component | Rendered with default props | Element has `h-11` class (44px) | High |
| 1.8-UNIT-028 | Textarea meets minimum height | Textarea component | Rendered with default props | Min-height of 88px provides adequate touch target | Medium |

---

## Integration Tests (Vitest)

### Tailwind Token Integration

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-INT-001 | Orion color tokens defined in Tailwind | Tailwind config | Config loaded | `orion.surface`, `orion.border`, `orion.fg`, `orion.fg-muted`, `orion.gold`, `orion.error` tokens exist | High |
| 1.8-INT-002 | CSS variables applied to input | Input rendered in DOM | Computed styles checked | Background uses `var(--orion-surface)` value | High |

### Theme Switching

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-INT-003 | Light mode colors applied | Input in light mode | Computed styles checked | Border color matches `#E5E5E5` | High |
| 1.8-INT-004 | Dark mode colors applied | Input in dark mode (`.dark` class on root) | Computed styles checked | Background matches `#1A1A1A`, border matches `#2D2D2D` | High |

---

## E2E Tests (Playwright)

### Visual Appearance

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-E2E-001 | Input focus visual verification | Page with Input component | Input clicked/focused | Gold outline (2px) visible around input with 2px offset | High |
| 1.8-E2E-002 | Error state visual verification | Page with Input in error state | Visual inspection | Red border visible, focus shows red outline | High |

### User Interactions

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-E2E-003 | Keyboard navigation | Page with multiple inputs | Tab key pressed | Focus moves between inputs with visible focus indicators | High |

---

## Accessibility Tests

### WCAG Compliance

| Test ID | Scenario | Given | When | Then | Priority |
|---------|----------|-------|------|------|----------|
| 1.8-ACC-001 | Focus visible on keyboard navigation | Input component | Focused via keyboard (Tab) | 2px gold outline clearly visible (WCAG 2.4.7) | High |
| 1.8-ACC-002 | Error state communicated to screen readers | Input with error | aria-invalid set | Screen readers announce invalid state (WCAG 3.3.1) | High |
| 1.8-ACC-003 | Color contrast for placeholder | Input with placeholder | Contrast ratio calculated | Muted color meets 4.5:1 ratio against surface (WCAG 1.4.3) | High |
| 1.8-ACC-004 | Touch target size | Input component | Touch target measured | Minimum 44x44px touch area (WCAG 2.5.5) | High |

---

## Test Data Requirements

### Component Fixtures

```typescript
// tests/fixtures/input-fixtures.ts
export const inputFixtures = {
  defaultInput: {},
  withPlaceholder: { placeholder: 'Enter text...' },
  withError: { error: true, 'aria-invalid': true },
  disabled: { disabled: true },
  withLeftIcon: { leftIcon: <SearchIcon data-testid="left-icon" /> },
  withRightIcon: { rightIcon: <SendIcon data-testid="right-icon" /> },
  withBothIcons: {
    leftIcon: <SearchIcon data-testid="left-icon" />,
    rightIcon: <SendIcon data-testid="right-icon" />
  },
  fullWidth: { fullWidth: true },
};

export const textareaFixtures = {
  defaultTextarea: {},
  withPlaceholder: { placeholder: 'Enter message...' },
  withError: { error: true, 'aria-invalid': true },
  autoResize: { autoResize: true },
  fullWidth: { fullWidth: true },
};
```

---

## Test File Locations

| Test Type | File Path |
|-----------|-----------|
| Unit Tests | `tests/unit/components/ui/input.test.tsx` |
| Integration Tests | `tests/integration/components/input-tokens.test.tsx` |
| E2E Tests | `tests/e2e/design-system/input-visual.spec.ts` |

---

## Definition of Done Verification

| DoD Item | Test ID(s) | Verification Method |
|----------|------------|---------------------|
| Input renders with design system styling | 1.8-UNIT-001 to 004 | Class assertions |
| Textarea renders with design system styling | 1.8-UNIT-017 to 020 | Class assertions |
| Focus shows 2px gold outline with 2px offset | 1.8-UNIT-005, 1.8-E2E-001 | Class + visual verification |
| 0px border-radius on all variants | 1.8-UNIT-002, 1.8-UNIT-018 | `rounded-none` class present |
| Placeholder uses `--orion-fg-muted` | 1.8-INT-002 | Computed style check |
| Error state shows red border and focus ring | 1.8-UNIT-007, 008, 021, 022 | Class assertions |
| Disabled state has 50% opacity | 1.8-UNIT-010, 011 | Class assertions |
| Touch targets are 44px minimum | 1.8-UNIT-027, 028 | Height class assertions |
| Left and right icon slots work | 1.8-UNIT-013 to 016 | DOM presence + class check |
| Textarea auto-resize works | 1.8-UNIT-024 to 026 | Class + behavior test |
| Dark mode colors apply correctly | 1.8-INT-004 | Computed style in dark mode |
| All unit tests pass | All 1.8-UNIT-* | CI green |
| Components exported from index.ts | Manual | Export verification |

---

## Risk-Based Test Prioritization

| Risk Area | Impact | Tests | Notes |
|-----------|--------|-------|-------|
| Accessibility (focus visibility) | High | 1.8-UNIT-005, 1.8-E2E-001, 1.8-ACC-001 | Keyboard users rely on visible focus |
| Error state communication | High | 1.8-UNIT-007-009, 1.8-ACC-002 | Form validation UX critical |
| Touch target compliance | High | 1.8-UNIT-027, 1.8-ACC-004 | Mobile usability requirement |
| Auto-resize behavior | Medium | 1.8-UNIT-024-026 | Chat input usability |
| Icon slot alignment | Medium | 1.8-UNIT-013-016 | Visual polish |
| Dark mode theming | Medium | 1.8-INT-004 | Design consistency |

---

## CI Gate Configuration

```yaml
# Minimum passing tests for Story 1.8 to be marked done
story-1.8-gate:
  unit:
    required:
      - 1.8-UNIT-001 through 1.8-UNIT-028
    coverage: 80%
  integration:
    required:
      - 1.8-INT-001 through 1.8-INT-004
  e2e:
    required:
      - 1.8-E2E-001
      - 1.8-E2E-003
```

---

## Notes

### Design Token Dependencies

Tests assume Story 1.3 (Design Tokens) has been completed and the following CSS variables are defined:
- `--orion-surface`
- `--orion-border`
- `--orion-fg`
- `--orion-fg-muted`
- `--orion-gold`
- `--orion-error`

### Test Implementation Notes

1. **Focus state testing**: Testing Library cannot easily verify computed CSS like `outline-offset`. Use class presence (`focus:ring-offset-2`) for unit tests; E2E tests verify visual appearance.

2. **Auto-resize testing**: Requires simulating user input events and measuring DOM `scrollHeight` changes.

3. **Dark mode testing**: Use `document.documentElement.classList.add('dark')` before computing styles.

4. **Touch target testing**: The 44px requirement is achieved via Tailwind's `h-11` class (44px in default spacing scale).

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
