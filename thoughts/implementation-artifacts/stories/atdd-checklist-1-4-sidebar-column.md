# ATDD Checklist: Story 1.4 - Sidebar Column

**Story:** Story 1.4 - Sidebar Column
**Status:** Ready for Development
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Story Reference

**User Story:**
> As a **user**, I want to see a 280px left sidebar, so that I can navigate between GTD views.

**Acceptance Criteria:**
1. Given the app is launched, when I view the main screen at desktop width, then the left sidebar is exactly 280px wide
2. And it has proper background color from design tokens (`--orion-surface`)
3. And it uses border token (`--orion-border`) for the right edge divider
4. And it is keyboard navigable (NFR-5.1)

**NFR References:**
- NFR-5.1: 100% of actions keyboard-accessible
- NFR-5.2: Compatible with macOS VoiceOver
- NFR-5.3: WCAG AA contrast ratios

---

## Test Categories

### 1. Unit Tests (Vitest + Testing Library)

#### Component Rendering Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-UNIT-001 | Sidebar renders without crashing | Import and render Sidebar component | No errors, component mounts | P0 |
| 1.4-UNIT-002 | Sidebar has correct semantic structure | Verify aside > nav hierarchy | `<aside>` contains `<nav>` element | P0 |
| 1.4-UNIT-003 | Sidebar has navigation role | Check ARIA role on nav element | `role="navigation"` present | P0 |
| 1.4-UNIT-004 | Sidebar has aria-label | Verify accessible name | `aria-label="GTD Navigation"` | P0 |
| 1.4-UNIT-005 | Sidebar contains header section | Check for header area | Header div with h-[72px] exists | P1 |
| 1.4-UNIT-006 | Sidebar contains footer section | Check for footer area | Footer div with h-[56px] exists | P1 |
| 1.4-UNIT-007 | Sidebar navigation area is scrollable | Check overflow-y-auto class | Navigation area has overflow-y-auto | P1 |

#### SidebarNavItem Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-UNIT-010 | NavItem renders with label | Pass label prop | Label text visible | P0 |
| 1.4-UNIT-011 | NavItem renders button element | Check element type | `<button type="button">` rendered | P0 |
| 1.4-UNIT-012 | NavItem shows count badge when count > 0 | Pass count={5} | Badge shows "5" | P1 |
| 1.4-UNIT-013 | NavItem hides count badge when count is 0 | Pass count={0} | No badge visible | P1 |
| 1.4-UNIT-014 | NavItem hides count badge when count undefined | Omit count prop | No badge visible | P1 |
| 1.4-UNIT-015 | NavItem shows active state styling | Pass isActive={true} | Has border-l-4 and gold border | P1 |
| 1.4-UNIT-016 | NavItem has aria-current when active | Pass isActive={true} | `aria-current="true"` present | P0 |
| 1.4-UNIT-017 | NavItem omits aria-current when inactive | Pass isActive={false} | `aria-current` not present | P0 |
| 1.4-UNIT-018 | NavItem fires onClick callback | Click item | onClick handler called once | P0 |
| 1.4-UNIT-019 | NavItem is full-width clickable | Check button width | Button has `w-full` class | P1 |

#### AppShell Layout Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-UNIT-020 | AppShell renders Sidebar | Mount AppShell | Sidebar component present | P0 |
| 1.4-UNIT-021 | AppShell renders main content area | Pass children | Children rendered in main area | P0 |
| 1.4-UNIT-022 | AppShell uses flex layout | Check container classes | Has `flex` class | P0 |
| 1.4-UNIT-023 | AppShell fills viewport height | Check height class | Has `h-screen` or equivalent | P0 |
| 1.4-UNIT-024 | AppShell main area is flex-1 | Check main area classes | Main has `flex-1` class | P1 |

---

### 2. Integration Tests (Vitest + Testing Library)

#### Layout Integration Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-INT-001 | Sidebar width is 280px | Measure computed width | Width equals 280px | P0 |
| 1.4-INT-002 | Sidebar does not shrink on flex | Apply flex container pressure | Sidebar maintains 280px | P1 |
| 1.4-INT-003 | Sidebar fills viewport height | Measure computed height | Height equals viewport height | P0 |
| 1.4-INT-004 | Sidebar has right border | Check border-right style | 1px border present | P1 |
| 1.4-INT-005 | Main content fills remaining space | Resize viewport | Main area = viewport - 280px | P1 |

#### Design Token Integration Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-INT-010 | Sidebar uses --orion-surface background | Check computed background | Matches token value | P0 |
| 1.4-INT-011 | Sidebar border uses --orion-border | Check computed border-color | Matches token value | P0 |
| 1.4-INT-012 | NavItem text uses --orion-fg | Check computed color | Matches token value | P1 |
| 1.4-INT-013 | NavItem count uses --orion-fg-muted | Check count badge color | Matches token value | P1 |
| 1.4-INT-014 | Active state uses --orion-gold | Check active border color | Matches gold token | P1 |

#### Dark Mode Integration Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-INT-020 | Sidebar background switches in dark mode | Toggle dark class | Background = #1A1A1A | P0 |
| 1.4-INT-021 | Sidebar border switches in dark mode | Toggle dark class | Border = #2D2D2D | P0 |
| 1.4-INT-022 | NavItem text switches in dark mode | Toggle dark class | Text color = #FAF8F5 | P1 |
| 1.4-INT-023 | No hardcoded colors in sidebar | Audit computed styles | All colors via CSS variables | P1 |

---

### 3. Accessibility Tests (Vitest + axe-core)

#### ARIA & Semantics Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-A11Y-001 | Sidebar passes axe-core audit | Run axe on Sidebar | No violations | P0 |
| 1.4-A11Y-002 | Sidebar has navigation landmark | Check landmark detection | Navigation landmark announced | P0 |
| 1.4-A11Y-003 | NavItems are in interactive list | Check list semantics | Items navigable as list | P1 |
| 1.4-A11Y-004 | Active item announced correctly | Check aria-current | "current" status announced | P0 |
| 1.4-A11Y-005 | Count badges have accessible name | Check badge a11y | Count announced with item | P1 |

#### Keyboard Navigation Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-A11Y-010 | Tab navigates to sidebar | Press Tab from outside | Focus enters sidebar | P0 |
| 1.4-A11Y-011 | Tab navigates through NavItems | Press Tab repeatedly | All items receive focus | P0 |
| 1.4-A11Y-012 | ArrowDown moves to next item | Press ArrowDown on item | Focus moves to next item | P0 |
| 1.4-A11Y-013 | ArrowUp moves to previous item | Press ArrowUp on item | Focus moves to previous item | P0 |
| 1.4-A11Y-014 | ArrowDown wraps at bottom | Press at last item | Focus wraps to first item | P2 |
| 1.4-A11Y-015 | ArrowUp wraps at top | Press at first item | Focus wraps to last item | P2 |
| 1.4-A11Y-016 | Enter activates item | Press Enter on item | onClick triggered | P0 |
| 1.4-A11Y-017 | Space activates item | Press Space on item | onClick triggered | P0 |
| 1.4-A11Y-018 | Home moves to first item | Press Home key | Focus moves to first item | P2 |
| 1.4-A11Y-019 | End moves to last item | Press End key | Focus moves to last item | P2 |

#### Focus State Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-A11Y-020 | Focus visible on keyboard focus | Tab to item | 2px gold outline visible | P0 |
| 1.4-A11Y-021 | Focus has 2px offset | Inspect focus style | outline-offset: 2px | P0 |
| 1.4-A11Y-022 | Focus not visible on mouse click | Click item | No focus outline shown | P1 |
| 1.4-A11Y-023 | Focus color is --orion-gold | Check outline color | Matches #D4AF37 | P0 |

#### Touch Target Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-A11Y-030 | NavItem has 44px minimum height | Measure clickable area | Height >= 44px | P0 |
| 1.4-A11Y-031 | NavItem spans full sidebar width | Measure clickable width | Width = sidebar width - padding | P0 |
| 1.4-A11Y-032 | Divider does not reduce touch targets | Check divider spacing | Adjacent items still 44px | P1 |

---

### 4. Visual Regression Tests (Playwright Component)

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-VIS-001 | Sidebar default state screenshot | Capture sidebar | Matches baseline | P1 |
| 1.4-VIS-002 | Sidebar with active item screenshot | Activate "Inbox" | Gold border visible | P1 |
| 1.4-VIS-003 | Sidebar hover state screenshot | Hover on item | Cream highlight visible | P2 |
| 1.4-VIS-004 | Sidebar focus state screenshot | Focus on item | Gold outline visible | P1 |
| 1.4-VIS-005 | Sidebar dark mode screenshot | Toggle dark mode | Dark colors applied | P1 |
| 1.4-VIS-006 | Sidebar with counts screenshot | Items with counts | Badges right-aligned | P2 |

---

### 5. E2E Tests (Playwright)

#### Layout E2E Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-E2E-001 | Sidebar visible on app launch | Launch app | Sidebar visible at 280px | P0 |
| 1.4-E2E-002 | Sidebar maintains width on resize | Resize window | Sidebar stays 280px | P1 |
| 1.4-E2E-003 | Sidebar shows all GTD items | Check nav items | Inbox, Next, Waiting, Someday, Projects visible | P0 |
| 1.4-E2E-004 | Sidebar divider separates sections | Check visual | Divider between Someday and Projects | P2 |

#### Navigation E2E Tests

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-E2E-010 | Click Inbox navigates | Click Inbox item | Inbox view loaded | P0 |
| 1.4-E2E-011 | Keyboard navigate and activate | Tab + Enter on Next | Next view loaded | P0 |
| 1.4-E2E-012 | Arrow keys navigate sidebar | ArrowDown through items | Focus moves correctly | P0 |
| 1.4-E2E-013 | Active item persists on navigation | Navigate to Projects | Projects shows active state | P1 |

#### Screen Reader E2E Tests (VoiceOver)

| Test ID | Test Name | Description | Expected Result | Priority |
|---------|-----------|-------------|-----------------|----------|
| 1.4-E2E-020 | VoiceOver announces navigation | Enter sidebar | "GTD Navigation, navigation" announced | P1 |
| 1.4-E2E-021 | VoiceOver announces item names | Navigate to Inbox | "Inbox, button" announced | P1 |
| 1.4-E2E-022 | VoiceOver announces active item | Navigate to active | "current" state announced | P1 |
| 1.4-E2E-023 | VoiceOver announces item counts | Navigate to item with count | "Inbox, 5 items" or similar | P2 |

---

## Test Implementation Notes

### Test Utilities Required

```typescript
// tests/fixtures/sidebar.ts
export const sidebarTestIds = {
  sidebar: 'sidebar',
  navItem: (label: string) => `nav-item-${label.toLowerCase()}`,
  countBadge: (label: string) => `count-badge-${label.toLowerCase()}`,
  divider: 'sidebar-divider',
  header: 'sidebar-header',
  footer: 'sidebar-footer',
};

export const gtdItems = ['Inbox', 'Next', 'Waiting', 'Someday', 'Projects'];
```

### Mock Data Factory

```typescript
// tests/fixtures/factories.ts
export const createSidebarNavItem = (overrides = {}) => ({
  label: 'Inbox',
  count: 0,
  isActive: false,
  onClick: vi.fn(),
  ...overrides,
});
```

### Keyboard Navigation Test Helper

```typescript
// tests/helpers/keyboard.ts
export async function navigateSidebarWithKeys(
  container: HTMLElement,
  direction: 'up' | 'down',
  steps: number = 1
) {
  const key = direction === 'down' ? '{ArrowDown}' : '{ArrowUp}';
  for (let i = 0; i < steps; i++) {
    await userEvent.keyboard(key);
  }
}
```

### Dark Mode Test Helper

```typescript
// tests/helpers/theme.ts
export function toggleDarkMode(enable: boolean) {
  if (enable) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```

---

## Coverage Requirements

| Category | Target | Rationale |
|----------|--------|-----------|
| Unit Tests | 80%+ | Core component logic |
| Integration Tests | 70%+ | Token and layout integration |
| A11Y Tests | 100% of WCAG AA | NFR-5.1, NFR-5.2, NFR-5.3 |
| E2E Tests | Critical paths | Navigation and screen reader |

---

## Test Execution Order

1. **Unit Tests First** - Validate component contracts
2. **Integration Tests** - Validate design token integration
3. **A11Y Tests** - Validate accessibility requirements
4. **Visual Tests** - Capture baselines (after a11y passes)
5. **E2E Tests** - Validate user journeys

---

## Acceptance Criteria Mapping

| AC | Test Coverage |
|----|---------------|
| AC-1: 280px width | 1.4-INT-001, 1.4-INT-002, 1.4-E2E-001, 1.4-E2E-002 |
| AC-2: --orion-surface background | 1.4-INT-010, 1.4-INT-020 |
| AC-3: --orion-border divider | 1.4-INT-011, 1.4-INT-021 |
| AC-4: Keyboard navigable (NFR-5.1) | 1.4-A11Y-010 through 1.4-A11Y-019, 1.4-E2E-011, 1.4-E2E-012 |

---

## NFR Coverage

| NFR | Test Coverage |
|-----|---------------|
| NFR-5.1 (Keyboard) | 1.4-A11Y-010 through 1.4-A11Y-019 |
| NFR-5.2 (VoiceOver) | 1.4-E2E-020 through 1.4-E2E-023 |
| NFR-5.3 (WCAG AA) | 1.4-A11Y-001 (axe-core audit) |

---

## Sign-Off Checklist

- [ ] All P0 tests passing
- [ ] All P1 tests passing
- [ ] No a11y violations from axe-core
- [ ] Visual regression baselines captured
- [ ] VoiceOver manual verification (at least 1.4-E2E-020)
- [ ] Dark mode verified
- [ ] Touch target sizes verified (44x44px)

---

*Generated by TEA (Master Test Architect) - Risk-based testing, depth scales with impact.*
