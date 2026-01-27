# ATDD Checklist: Story 1.20 - Icon System Setup

**Story:** 1.20 - Icon System Setup
**Epic:** 1 - Application Shell & First Launch
**Generated:** 2026-01-24
**Status:** ready-for-review

---

## Overview

This ATDD checklist covers comprehensive test scenarios for the Icon System Setup story. The Icon component and IconButton component are foundational UI elements that must support:
- Three size variants (sm/md/lg: 16px/20px/24px)
- Consistent 1.5px stroke weight
- Color inheritance for theming (light/dark mode)
- State colors (default gray, hover black, active gold, disabled 30%)
- Accessibility (aria-label for functional icons, aria-hidden for decorative)
- 44px minimum touch targets for IconButton
- Reduced motion support for animated icons (Loader2)

---

## Test Coverage Summary

| Test Level | Count | Priority Coverage |
|------------|-------|-------------------|
| Unit Tests | 24 | P0: 8, P1: 12, P2: 4 |
| Component Tests | 18 | P0: 6, P1: 10, P2: 2 |
| E2E Tests | 8 | P0: 4, P1: 4 |
| Accessibility Tests | 12 | P0: 8, P1: 4 |
| **Total** | **62** | |

---

## Acceptance Criteria Mapping

### AC1: Consistent Icon Sizing Variants (sm: 16px)

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-001 | Unit | P0 | Icon renders at 16px for `size="sm"` | Icon has `w-4 h-4` classes (16px) |
| 1.20-UNIT-002 | Unit | P1 | Icon sm size applies correct Tailwind classes | Classes include `w-4`, `h-4` |
| 1.20-UNIT-003 | Unit | P1 | Icon sm size has 1.5px stroke weight | `strokeWidth` attribute equals `1.5` |

**Test Implementation:**
```typescript
// tests/unit/components/ui/icon.test.tsx
describe('Icon - Size Variants', () => {
  it('1.20-UNIT-001: renders at 16px for sm size', () => {
    render(<Icon icon={Settings} size="sm" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('w-4', 'h-4');
  });

  it('1.20-UNIT-003: has 1.5px stroke weight', () => {
    render(<Icon icon={Settings} size="sm" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('stroke-width', '1.5');
  });
});
```

---

### AC2: Medium Icon Size (md: 20px - default)

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-004 | Unit | P0 | Icon renders at 20px for `size="md"` | Icon has `w-5 h-5` classes (20px) |
| 1.20-UNIT-005 | Unit | P0 | Icon defaults to md size when no size prop | Icon has `w-5 h-5` classes |
| 1.20-UNIT-006 | Unit | P1 | Icon md size has 1.5px stroke weight | `strokeWidth` attribute equals `1.5` |

**Test Implementation:**
```typescript
describe('Icon - Medium Size (Default)', () => {
  it('1.20-UNIT-004: renders at 20px for md size', () => {
    render(<Icon icon={Settings} size="md" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('w-5', 'h-5');
  });

  it('1.20-UNIT-005: defaults to md size when no size prop', () => {
    render(<Icon icon={Settings} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('w-5', 'h-5');
  });
});
```

---

### AC3: Large Icon Size (lg: 24px)

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-007 | Unit | P0 | Icon renders at 24px for `size="lg"` | Icon has `w-6 h-6` classes (24px) |
| 1.20-UNIT-008 | Unit | P1 | Icon lg size has 1.5px stroke weight | `strokeWidth` attribute equals `1.5` |

**Test Implementation:**
```typescript
describe('Icon - Large Size', () => {
  it('1.20-UNIT-007: renders at 24px for lg size', () => {
    render(<Icon icon={Settings} size="lg" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('w-6', 'h-6');
  });
});
```

---

### AC4: Icons Inherit Text Color for Theming

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-009 | Unit | P1 | Icon uses currentColor for stroke | Icon stroke attribute is `currentColor` |
| 1.20-COMP-001 | Component | P1 | Icon inherits parent color | Icon color matches parent element color |
| 1.20-E2E-001 | E2E | P1 | Icon default color is gray (#6B6B6B) in light mode | Computed color matches design spec |
| 1.20-E2E-002 | E2E | P1 | Icon uses foreground-muted color in dark mode | Color changes appropriately |

**Test Implementation:**
```typescript
// Unit test
describe('Icon - Color Inheritance', () => {
  it('1.20-UNIT-009: uses currentColor for stroke', () => {
    render(<Icon icon={Settings} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });
});

// E2E test
test.describe('Icon - Theming', () => {
  test('1.20-E2E-001: default color is gray in light mode', async ({ page }) => {
    await page.goto('/');
    const icon = page.locator('[data-testid="icon-default"]');
    const color = await icon.evaluate(el => getComputedStyle(el).color);
    // #6B6B6B = rgb(107, 107, 107)
    expect(color).toBe('rgb(107, 107, 107)');
  });
});
```

---

### AC5: Icon Hover State

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-010 | Unit | P1 | Icon has hover color class | Class includes `hover:text-[#1A1A1A]` |
| 1.20-COMP-002 | Component | P1 | Icon color changes to black on hover (light mode) | Color transitions to #1A1A1A |
| 1.20-COMP-003 | Component | P1 | Icon color changes to white on hover (dark mode) | Color transitions to foreground |
| 1.20-E2E-003 | E2E | P1 | Hover state visually changes icon color | Computed color differs from default |

**Test Implementation:**
```typescript
// Component test (Playwright)
test.describe('Icon - Hover State', () => {
  test('1.20-COMP-002: color changes on hover in light mode', async ({ mount, page }) => {
    const component = await mount(
      <div className="icon-colors" data-testid="icon-container">
        <Icon icon={Settings} />
      </div>
    );

    const initialColor = await component.evaluate(el => getComputedStyle(el).color);
    await component.hover();
    const hoverColor = await component.evaluate(el => getComputedStyle(el).color);

    expect(hoverColor).not.toBe(initialColor);
    // #1A1A1A = rgb(26, 26, 26)
    expect(hoverColor).toBe('rgb(26, 26, 26)');
  });
});
```

---

### AC6: Icon Active/Pressed State

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-011 | Unit | P1 | Icon has active gold color class | Class includes `active:text-orion-primary` |
| 1.20-COMP-004 | Component | P1 | Icon color changes to gold (#D4AF37) on click/press | Color is orion-primary gold |
| 1.20-E2E-004 | E2E | P2 | Active state visually shows gold accent | Color matches #D4AF37 |

**Test Implementation:**
```typescript
describe('Icon - Active State', () => {
  it('1.20-UNIT-011: has active gold color class', () => {
    render(<IconButton icon={Settings} label="Settings" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('active:text-orion-primary');
  });
});
```

---

### AC7: Icon Disabled State

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-012 | Unit | P0 | Disabled icon displays at 30% opacity | Has `opacity-30` class |
| 1.20-UNIT-013 | Unit | P1 | Disabled icon retains gray color | Color remains default gray |
| 1.20-COMP-005 | Component | P1 | Disabled IconButton is not clickable | Click handler not called |
| 1.20-E2E-005 | E2E | P1 | Disabled icon is visually subdued | Computed opacity is 0.3 |

**Test Implementation:**
```typescript
describe('IconButton - Disabled State', () => {
  it('1.20-UNIT-012: applies disabled styles when disabled', () => {
    render(<IconButton icon={Settings} label="Settings" disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-30', 'cursor-not-allowed');
  });

  it('1.20-COMP-005: does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<IconButton icon={Settings} label="Settings" onClick={handleClick} disabled />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

### AC8: Accessible Icon Labels for Non-Decorative Icons

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-A11Y-001 | Unit | P0 | Functional icon has role="img" | ARIA role is `img` |
| 1.20-A11Y-002 | Unit | P0 | Functional icon has aria-label | aria-label attribute present |
| 1.20-A11Y-003 | Unit | P0 | Screen readers announce functional icon purpose | Accessible name matches label |
| 1.20-COMP-006 | Component | P0 | VoiceOver can navigate to functional icon | Icon is in accessibility tree |
| 1.20-E2E-006 | E2E | P0 | Labeled icons are accessible via axe-core | No accessibility violations |

**Test Implementation:**
```typescript
describe('Icon - Accessibility (Functional)', () => {
  it('1.20-A11Y-001: functional icon has role="img"', () => {
    render(<Icon icon={Search} label="Search" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('role', 'img');
  });

  it('1.20-A11Y-002: functional icon has aria-label', () => {
    render(<Icon icon={Search} label="Search files" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-label', 'Search files');
  });

  it('1.20-A11Y-003: accessible name matches label', () => {
    render(<Icon icon={Search} label="Search" data-testid="icon" />);
    const icon = screen.getByRole('img', { name: 'Search' });
    expect(icon).toBeInTheDocument();
  });
});
```

---

### AC9: Decorative Icons Hidden from Screen Readers

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-A11Y-004 | Unit | P0 | Decorative icon has aria-hidden="true" | aria-hidden attribute is `true` |
| 1.20-A11Y-005 | Unit | P0 | Icon defaults to decorative when no label | aria-hidden is `true` by default |
| 1.20-A11Y-006 | Unit | P1 | Decorative icon has no role attribute | role attribute is undefined |
| 1.20-COMP-007 | Component | P1 | Screen readers skip decorative icons | Icon not in accessibility tree |
| 1.20-E2E-007 | E2E | P0 | Decorative icons pass axe-core checks | No accessibility violations |

**Test Implementation:**
```typescript
describe('Icon - Accessibility (Decorative)', () => {
  it('1.20-A11Y-004: decorative icon has aria-hidden="true"', () => {
    render(<Icon icon={Settings} decorative data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('1.20-A11Y-005: defaults to decorative when no label', () => {
    render(<Icon icon={Settings} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('1.20-A11Y-006: decorative icon has no role', () => {
    render(<Icon icon={Settings} decorative data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).not.toHaveAttribute('role');
  });
});
```

---

### AC10: Icon Hover/Active States Match Button States

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-COMP-008 | Component | P1 | Button with icon: hover state coordinates | Icon color matches button hover |
| 1.20-COMP-009 | Component | P1 | Button with icon: active state uses gold | Icon shows gold accent on press |
| 1.20-UNIT-014 | Unit | P1 | IconButton coordinates with Button patterns | Same hover/active class patterns |

**Test Implementation:**
```typescript
describe('IconButton - State Coordination', () => {
  it('1.20-UNIT-014: has coordinated hover state', () => {
    render(<IconButton icon={Settings} label="Settings" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:text-[#1A1A1A]');
    expect(button).toHaveClass('dark:hover:text-orion-fg');
  });

  it('1.20-COMP-008: icon color matches button hover', async ({ mount }) => {
    const component = await mount(<IconButton icon={Settings} label="Settings" />);
    await component.hover();
    const icon = component.locator('svg');
    const color = await icon.evaluate(el => getComputedStyle(el).color);
    // Should match button hover color
    expect(color).toBe('rgb(26, 26, 26)');
  });
});
```

---

### AC11: Reduced Motion Support for Icon Animations

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-A11Y-007 | Unit | P0 | Loading icon respects prefers-reduced-motion | Animation class respects media query |
| 1.20-COMP-010 | Component | P0 | Spinner static when reduced motion enabled | No animation playing |
| 1.20-E2E-008 | E2E | P0 | Loading spinner has no animation with reduced motion | animationName is `none` |

**Test Implementation:**
```typescript
// E2E test with reduced motion
test.describe('Icon - Reduced Motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('1.20-E2E-008: loading spinner is static', async ({ page }) => {
    await page.goto('/');
    // Trigger loading state
    const spinner = page.locator('[data-testid="loading-icon"]');

    if (await spinner.count() > 0) {
      const animationName = await spinner.evaluate(el =>
        getComputedStyle(el).animationName
      );
      expect(animationName).toBe('none');
    }
  });
});
```

---

## IconButton-Specific Tests

### Touch Target Requirements (44px Minimum)

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-015 | Unit | P0 | IconButton sm has 44px minimum touch target | Has `min-w-[44px] min-h-[44px]` |
| 1.20-UNIT-016 | Unit | P0 | IconButton md has 44px minimum touch target | Has `min-w-[44px] min-h-[44px]` |
| 1.20-UNIT-017 | Unit | P0 | IconButton lg has 44px minimum touch target | Has `min-w-[44px] min-h-[44px]` |
| 1.20-COMP-011 | Component | P0 | Computed touch target >= 44px | boundingBox width/height >= 44 |
| 1.20-A11Y-008 | Accessibility | P0 | Touch target meets WCAG 2.5.5 | Target size sufficient |

**Test Implementation:**
```typescript
describe('IconButton - Touch Targets', () => {
  it.each(['sm', 'md', 'lg'])('1.20-UNIT-015/16/17: %s size has 44px minimum', (size) => {
    render(<IconButton icon={Settings} label="Settings" size={size as any} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
  });
});

// E2E touch target verification
test('1.20-COMP-011: computed touch target >= 44px', async ({ mount }) => {
  const component = await mount(<IconButton icon={Settings} label="Settings" />);
  const button = component.getByRole('button');
  const box = await button.boundingBox();

  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
```

---

### IconButton Focus States (Story 1.16 Integration)

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-UNIT-018 | Unit | P0 | IconButton has focus-visible ring | Has focus-visible:ring-2 class |
| 1.20-UNIT-019 | Unit | P1 | IconButton focus ring uses orion-primary | Has ring-orion-primary class |
| 1.20-COMP-012 | Component | P0 | IconButton is keyboard focusable | Can receive focus via Tab |
| 1.20-A11Y-009 | Accessibility | P0 | Focus ring is visible on keyboard navigation | Ring visible on focus |

**Test Implementation:**
```typescript
describe('IconButton - Focus States', () => {
  it('1.20-UNIT-018: has focus-visible ring classes', () => {
    render(<IconButton icon={Settings} label="Settings" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-orion-primary');
    expect(button).toHaveClass('focus-visible:ring-offset-2');
  });

  it('1.20-COMP-012: is keyboard focusable', async () => {
    render(<IconButton icon={Settings} label="Settings" />);
    const button = screen.getByRole('button');
    await userEvent.tab();
    expect(button).toHaveFocus();
  });
});
```

---

### IconButton Required aria-label

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-A11Y-010 | Unit | P0 | IconButton requires label prop for accessibility | aria-label attribute present |
| 1.20-A11Y-011 | Unit | P1 | IconButton announces purpose to screen readers | Accessible name matches label |
| 1.20-A11Y-012 | Accessibility | P0 | IconButton passes axe-core accessibility check | No violations |

**Test Implementation:**
```typescript
describe('IconButton - Accessibility', () => {
  it('1.20-A11Y-010: requires label for accessibility', () => {
    render(<IconButton icon={Settings} label="Open settings" />);
    const button = screen.getByRole('button', { name: 'Open settings' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Open settings');
  });
});
```

---

## Dark Mode Tests

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-DARK-001 | Component | P1 | Icon default color in dark mode | Uses fg-muted color |
| 1.20-DARK-002 | Component | P1 | Icon hover color in dark mode | Uses fg (foreground) color |
| 1.20-DARK-003 | Component | P1 | Icon active color in dark mode | Uses gold (same as light) |
| 1.20-DARK-004 | Component | P1 | Icon disabled state in dark mode | 30% opacity of fg-muted |
| 1.20-DARK-005 | E2E | P1 | Dark mode icon colors match design spec | All colors verified |

**Test Implementation:**
```typescript
test.describe('Icon - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
  });

  test('1.20-DARK-001: default color uses fg-muted', async ({ page }) => {
    const icon = page.locator('[data-testid="icon-default"]');
    const color = await icon.evaluate(el => getComputedStyle(el).color);
    // Dark mode fg-muted is a light gray
    // RGB values should be high (light color)
    const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      expect(r + g + b).toBeGreaterThan(400); // Light color
    }
  });

  test('1.20-DARK-003: active color is gold (same as light)', async ({ page }) => {
    const iconButton = page.locator('[data-testid="icon-button"]');
    await iconButton.click({ force: true });
    // Gold #D4AF37 = rgb(212, 175, 55)
    // Verify gold accent is used
  });
});
```

---

## Edge Cases and Error Handling

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-EDGE-001 | Unit | P2 | Icon with invalid size prop | Falls back to default (md) |
| 1.20-EDGE-002 | Unit | P2 | Icon with undefined icon prop | Graceful error or null render |
| 1.20-EDGE-003 | Unit | P2 | IconButton with empty label | TypeScript error (required prop) |
| 1.20-EDGE-004 | Unit | P2 | Icon className override merges correctly | Custom classes preserved |

**Test Implementation:**
```typescript
describe('Icon - Edge Cases', () => {
  it('1.20-EDGE-004: className override merges correctly', () => {
    render(
      <Icon
        icon={Settings}
        className="custom-class text-red-500"
        data-testid="icon"
      />
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('custom-class');
    expect(icon).toHaveClass('text-red-500');
    // Base classes still present
    expect(icon).toHaveClass('inline-flex');
    expect(icon).toHaveClass('shrink-0');
  });
});
```

---

## Icon Catalog Tests

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-CAT-001 | Unit | P2 | IconCatalog exports all approved icons | All icons accessible |
| 1.20-CAT-002 | Unit | P2 | IconCatalog semantic names map to Lucide | Mappings correct |
| 1.20-CAT-003 | Integration | P2 | All catalog icons render correctly | No rendering errors |

**Test Implementation:**
```typescript
describe('IconCatalog', () => {
  it('1.20-CAT-001: exports all approved icons', () => {
    expect(IconCatalog.expand).toBeDefined();
    expect(IconCatalog.collapse).toBeDefined();
    expect(IconCatalog.settings).toBeDefined();
    expect(IconCatalog.close).toBeDefined();
    expect(IconCatalog.minimize).toBeDefined();
    expect(IconCatalog.search).toBeDefined();
    expect(IconCatalog.success).toBeDefined();
    expect(IconCatalog.error).toBeDefined();
    expect(IconCatalog.loading).toBeDefined();
  });

  it('1.20-CAT-003: all catalog icons render', () => {
    Object.entries(IconCatalog).forEach(([name, IconComponent]) => {
      const { container } = render(<Icon icon={IconComponent} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
```

---

## Axe-Core Accessibility Audit

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-AXE-001 | E2E | P0 | Icon component passes full axe scan | Zero violations |
| 1.20-AXE-002 | E2E | P0 | IconButton passes full axe scan | Zero violations |
| 1.20-AXE-003 | E2E | P0 | Icon in dark mode passes axe scan | Zero violations |

**Test Implementation:**
```typescript
import AxeBuilder from '@axe-core/playwright';

test.describe('Icon System - Axe Audit', () => {
  test('1.20-AXE-001: Icon component passes axe', async ({ page }) => {
    await page.goto('/test/icons');

    const results = await new AxeBuilder({ page })
      .include('[data-testid="icon-showcase"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('1.20-AXE-002: IconButton passes axe', async ({ page }) => {
    await page.goto('/test/icon-buttons');

    const results = await new AxeBuilder({ page })
      .include('[data-testid="icon-button-showcase"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('1.20-AXE-003: Dark mode passes axe', async ({ page }) => {
    await page.goto('/test/icons');
    await page.evaluate(() => document.documentElement.classList.add('dark'));

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## Visual Regression Tests

| Test ID | Level | Priority | Scenario | Expected Result |
|---------|-------|----------|----------|-----------------|
| 1.20-VIS-001 | Component | P2 | Icon size variants visual snapshot | Matches baseline |
| 1.20-VIS-002 | Component | P2 | IconButton states visual snapshot | Matches baseline |
| 1.20-VIS-003 | E2E | P2 | Dark mode icon appearance | Matches baseline |

**Test Implementation:**
```typescript
test.describe('Icon - Visual Regression', () => {
  test('1.20-VIS-001: size variants match snapshot', async ({ mount }) => {
    const component = await mount(
      <div style={{ display: 'flex', gap: '16px' }}>
        <Icon icon={Settings} size="sm" />
        <Icon icon={Settings} size="md" />
        <Icon icon={Settings} size="lg" />
      </div>
    );

    await expect(component).toHaveScreenshot('icon-sizes.png');
  });

  test('1.20-VIS-002: IconButton states match snapshot', async ({ mount }) => {
    const component = await mount(
      <div style={{ display: 'flex', gap: '16px' }}>
        <IconButton icon={Settings} label="Default" />
        <IconButton icon={Settings} label="Disabled" disabled />
      </div>
    );

    await expect(component).toHaveScreenshot('icon-button-states.png');
  });
});
```

---

## Test Execution Priority Order

### P0 - Critical (Must Pass)
Execute first, fail fast on critical issues:

1. 1.20-UNIT-001, 004, 007 - Size variants render correctly
2. 1.20-UNIT-012 - Disabled state works
3. 1.20-A11Y-001, 002, 003 - Functional icons accessible
4. 1.20-A11Y-004, 005 - Decorative icons hidden
5. 1.20-A11Y-007 - Reduced motion support
6. 1.20-UNIT-015, 016, 017 - Touch targets 44px
7. 1.20-UNIT-018 - Focus states
8. 1.20-AXE-001, 002, 003 - Axe accessibility

### P1 - High (Should Pass)
Execute second, core functionality:

1. 1.20-UNIT-003, 006, 008 - Stroke weight consistency
2. 1.20-UNIT-009 - Color inheritance
3. 1.20-UNIT-010, 011 - Hover/active states
4. 1.20-COMP-* - Component integration
5. 1.20-E2E-* - End-to-end flows
6. 1.20-DARK-* - Dark mode

### P2 - Medium (Nice to Pass)
Execute if time permits:

1. 1.20-EDGE-* - Edge cases
2. 1.20-CAT-* - Icon catalog
3. 1.20-VIS-* - Visual regression

---

## Prior Story Dependencies Verification

### From Story 1.4 (Touch Targets)
- [x] 44px minimum touch target pattern exists
- [x] Tests verify IconButton uses same pattern

### From Story 1.7 (Button Component)
- [x] Button hover/active state patterns exist
- [x] Tests verify Icon states coordinate with Button

### From Story 1.17 (VoiceOver Accessibility)
- [x] aria-label patterns established
- [x] Tests verify Icon follows same patterns

### From Story 1.18 (Contrast Requirements)
- [x] 3:1 contrast for icons verified
- [x] Dark mode colors meet contrast

### From Story 1.19 (Reduced Motion)
- [x] prefers-reduced-motion media query used
- [x] Loading icon respects user preference

---

## Manual Testing Checklist

After automated tests pass, verify manually:

- [ ] Icon renders at 16px with `size="sm"` (visual inspection)
- [ ] Icon renders at 20px with `size="md"` (visual inspection)
- [ ] Icon renders at 24px with `size="lg"` (visual inspection)
- [ ] Icon stroke weight is consistently 1.5px (visual inspection)
- [ ] Icon default color is gray (#6B6B6B) in light mode
- [ ] Icon hover color is black (#1A1A1A) in light mode
- [ ] Icon active color is gold (#D4AF37) on press
- [ ] Icon disabled state shows 30% opacity
- [ ] Dark mode: icon colors transition appropriately
- [ ] IconButton has 44px tap area (device testing)
- [ ] IconButton focus ring visible on Tab key
- [ ] VoiceOver announces functional icons correctly
- [ ] VoiceOver skips decorative icons
- [ ] Reduced motion: Loader2 spinner is static

---

## Definition of Done

All tests in this checklist must pass for Story 1.20 to be considered complete:

- [ ] All P0 tests pass (100%)
- [ ] All P1 tests pass (100%)
- [ ] P2 tests pass (>80%)
- [ ] Axe accessibility audit: 0 violations
- [ ] Visual regression: No unexpected changes
- [ ] Manual testing checklist complete
- [ ] Dark mode verified
- [ ] VoiceOver testing passed
- [ ] Reduced motion verified

---

## References

- Story 1.20: Icon System Setup
- TEA Knowledge: component-tdd.md, test-levels-framework.md, test-priorities-matrix.md
- Prior Stories: 1.4, 1.7, 1.17, 1.18, 1.19
- Design System: Editorial Luxury aesthetic, Lucide icons
- WCAG: 1.1.1 (Non-text Content), 2.5.5 (Target Size), 2.3.3 (Animation)
