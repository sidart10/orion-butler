# ATDD Checklist: Story 1.5 - Main Chat Column

**Story:** 1.5 - Main Chat Column
**Status:** Ready for Implementation
**Generated:** 2026-01-24
**Author:** TEA (Master Test Architect)

---

## Test Summary

| Level | Count | Priority |
|-------|-------|----------|
| Unit Tests | 11 | P0/P1 |
| Component Tests | 8 | P0/P1 |
| Integration Tests | 3 | P1 |
| E2E Tests | 4 | P0 |
| Accessibility Tests | 5 | P0 |
| **Total** | **31** | |

---

## 1. Unit Tests (Vitest)

### 1.5-UNIT-001: ChatColumn renders with correct flex layout classes
**Priority:** P0
**AC Coverage:** #1, #4

```typescript
// tests/unit/components/chat/ChatColumn.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatColumn } from '@/components/chat/ChatColumn';

describe('ChatColumn', () => {
  it('should render with flex-1 for flexible width', () => {
    render(<ChatColumn />);
    const chatColumn = screen.getByRole('region', { name: 'Chat' });
    expect(chatColumn).toHaveClass('flex-1');
  });

  it('should have min-width of 400px', () => {
    render(<ChatColumn />);
    const chatColumn = screen.getByRole('region', { name: 'Chat' });
    expect(chatColumn).toHaveClass('min-w-[400px]');
  });

  it('should render as main semantic element', () => {
    render(<ChatColumn />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});
```

**Test Data:** None required (pure UI component)
**Mocks:** None
**Pass Criteria:** All assertions pass

---

### 1.5-UNIT-002: ChatColumn applies flex column layout for internal structure
**Priority:** P1
**AC Coverage:** #1

```typescript
// tests/unit/components/chat/ChatColumn.test.tsx
it('should have flex column layout for children', () => {
  render(<ChatColumn />);
  const chatColumn = screen.getByRole('region', { name: 'Chat' });
  expect(chatColumn).toHaveClass('flex', 'flex-col');
});

it('should fill container height', () => {
  render(<ChatColumn />);
  const chatColumn = screen.getByRole('region', { name: 'Chat' });
  expect(chatColumn).toHaveClass('h-full');
});
```

**Pass Criteria:** Flex column classes present

---

### 1.5-UNIT-003: MessageArea renders with correct scroll configuration
**Priority:** P0
**AC Coverage:** #2

```typescript
// tests/unit/components/chat/MessageArea.test.tsx
import { render, screen } from '@testing-library/react';
import { MessageArea } from '@/components/chat/MessageArea';

describe('MessageArea', () => {
  it('should render with flex-1 for flexible height', () => {
    render(<MessageArea />);
    const messageArea = screen.getByTestId('message-area');
    expect(messageArea).toHaveClass('flex-1');
  });

  it('should enable vertical scrolling', () => {
    render(<MessageArea />);
    const messageArea = screen.getByTestId('message-area');
    expect(messageArea).toHaveClass('overflow-y-auto');
  });

  it('should render aria-live region for screen readers', () => {
    render(<MessageArea />);
    const messageArea = screen.getByTestId('message-area');
    expect(messageArea).toHaveAttribute('aria-live', 'polite');
  });
});
```

**Pass Criteria:** Scroll and ARIA attributes present

---

### 1.5-UNIT-004: MessageArea renders empty state placeholder
**Priority:** P1
**AC Coverage:** #2

```typescript
// tests/unit/components/chat/MessageArea.test.tsx
it('should display empty state placeholder', () => {
  render(<MessageArea />);
  expect(screen.getByText('Start a conversation...')).toBeVisible();
});

it('should center empty state vertically', () => {
  render(<MessageArea />);
  const emptyState = screen.getByText('Start a conversation...').closest('div');
  expect(emptyState).toHaveClass('flex', 'items-center', 'justify-center');
});

it('should use muted text color for placeholder', () => {
  render(<MessageArea />);
  const placeholder = screen.getByText('Start a conversation...');
  expect(placeholder).toHaveClass('text-orion-fg-muted');
});
```

**Pass Criteria:** Empty state renders with correct styling

---

### 1.5-UNIT-005: ChatInput renders with fixed bottom positioning
**Priority:** P0
**AC Coverage:** #3

```typescript
// tests/unit/components/chat/ChatInput.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatInput } from '@/components/chat/ChatInput';

describe('ChatInput', () => {
  it('should render with flex-shrink-0 to prevent compression', () => {
    render(<ChatInput />);
    const inputContainer = screen.getByTestId('chat-input-container');
    expect(inputContainer).toHaveClass('flex-shrink-0');
  });

  it('should render input with placeholder text', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Ask Orion...');
    expect(input).toBeInTheDocument();
  });

  it('should have top border', () => {
    render(<ChatInput />);
    const inputContainer = screen.getByTestId('chat-input-container');
    expect(inputContainer).toHaveClass('border-t', 'border-orion-border');
  });
});
```

**Pass Criteria:** Fixed positioning classes and placeholder present

---

### 1.5-UNIT-006: ChatInput applies Editorial Luxury styling
**Priority:** P1
**AC Coverage:** #3

```typescript
// tests/unit/components/chat/ChatInput.test.tsx
it('should have 0px border-radius (Editorial Luxury)', () => {
  render(<ChatInput />);
  const input = screen.getByRole('textbox', { name: 'Chat input' });
  expect(input).toHaveClass('rounded-none');
});

it('should use surface background color', () => {
  render(<ChatInput />);
  const input = screen.getByRole('textbox', { name: 'Chat input' });
  expect(input).toHaveClass('bg-orion-surface');
});

it('should use muted color for placeholder text', () => {
  render(<ChatInput />);
  const input = screen.getByRole('textbox', { name: 'Chat input' });
  expect(input).toHaveClass('placeholder:text-orion-fg-muted');
});
```

**Pass Criteria:** Editorial Luxury styling applied

---

### 1.5-UNIT-007: ChatInput has visible focus state
**Priority:** P0
**AC Coverage:** #3, NFR-5.1

```typescript
// tests/unit/components/chat/ChatInput.test.tsx
it('should have gold outline on focus', () => {
  render(<ChatInput />);
  const input = screen.getByRole('textbox', { name: 'Chat input' });
  expect(input).toHaveClass('focus-visible:outline-2', 'focus-visible:outline-orion-gold');
});

it('should have 2px outline offset on focus', () => {
  render(<ChatInput />);
  const input = screen.getByRole('textbox', { name: 'Chat input' });
  expect(input).toHaveClass('focus-visible:outline-offset-2');
});
```

**Pass Criteria:** Focus state classes present

---

### 1.5-UNIT-008: Barrel exports are complete
**Priority:** P1
**AC Coverage:** #1

```typescript
// tests/unit/components/chat/index.test.ts
import { ChatColumn, MessageArea, ChatInput } from '@/components/chat';

describe('Chat module exports', () => {
  it('should export ChatColumn', () => {
    expect(ChatColumn).toBeDefined();
  });

  it('should export MessageArea', () => {
    expect(MessageArea).toBeDefined();
  });

  it('should export ChatInput', () => {
    expect(ChatInput).toBeDefined();
  });
});
```

**Pass Criteria:** All exports available

---

### 1.5-UNIT-009: Design token CSS variables are applied
**Priority:** P1
**AC Coverage:** #1, #2, #3

```typescript
// tests/unit/components/chat/ChatColumn.test.tsx
it('should use orion-bg background color', () => {
  render(<ChatColumn />);
  const chatColumn = screen.getByRole('region', { name: 'Chat' });
  expect(chatColumn).toHaveClass('bg-orion-bg');
});
```

**Pass Criteria:** CSS variable classes used (not hardcoded colors)

---

## 1.5 Error Handling Tests (Added per Review)

### 1.5-UNIT-010: ChatInput handles paste of oversized text
**Priority:** P1
**AC Coverage:** #3 (resilience)

```typescript
// tests/unit/components/chat/ChatInput.test.tsx
describe('ChatInput Error Handling', () => {
  it('should truncate pasted text exceeding maxLength', async () => {
    const user = userEvent.setup();
    render(<ChatInput maxLength={1000} />);
    const input = screen.getByRole('textbox', { name: 'Chat input' });

    const oversizedText = 'a'.repeat(1500);
    await user.click(input);
    await user.paste(oversizedText);

    expect(input).toHaveValue('a'.repeat(1000));
  });

  it('should not crash on empty paste', async () => {
    const user = userEvent.setup();
    render(<ChatInput />);
    const input = screen.getByRole('textbox', { name: 'Chat input' });

    await user.click(input);
    await user.paste('');

    expect(input).toHaveValue('');
  });
});
```

**Pass Criteria:** Graceful handling of edge case inputs

---

### 1.5-UNIT-011: MessageArea handles scroll edge cases
**Priority:** P1
**AC Coverage:** #2 (resilience)

```typescript
// tests/unit/components/chat/MessageArea.test.tsx
describe('MessageArea Error Handling', () => {
  it('should not throw on rapid scroll position changes', () => {
    const { rerender } = render(<MessageArea />);

    // Simulate rapid re-renders that might cause scroll race conditions
    for (let i = 0; i < 10; i++) {
      rerender(<MessageArea key={i} />);
    }

    // No error thrown = pass
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
  });

  it('should fallback gracefully when scrollHeight is 0', () => {
    render(<MessageArea />);
    const messageArea = screen.getByTestId('message-area');

    // Mock scrollHeight of 0 (empty/collapsed state)
    Object.defineProperty(messageArea, 'scrollHeight', { value: 0 });

    // Component should still render without error
    expect(messageArea).toBeInTheDocument();
  });
});
```

**Pass Criteria:** No crashes on scroll edge cases

---

### 1.5-COMP-007: MessageArea shows scrollbar when content overflows
**Priority:** P1
**AC Coverage:** #2

```typescript
// tests/component/chat/MessageArea.spec.tsx
test('should show vertical scrollbar when content exceeds container', async ({ mount }) => {
  const ManyMessages = () => (
    <MessageArea>
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{ height: '50px' }}>Message {i}</div>
      ))}
    </MessageArea>
  );

  const component = await mount(<ManyMessages />);
  const messageArea = component.getByTestId('message-area');

  const scrollHeight = await messageArea.evaluate(el => el.scrollHeight);
  const clientHeight = await messageArea.evaluate(el => el.clientHeight);

  // Content should overflow
  expect(scrollHeight).toBeGreaterThan(clientHeight);

  // Scrollbar should be visible (overflow-y: auto means scrollbar when needed)
  await expect(messageArea).toHaveCSS('overflow-y', 'auto');
});

test('should auto-scroll to bottom on new message', async ({ mount }) => {
  const component = await mount(<MessageArea autoScroll />);
  const messageArea = component.getByTestId('message-area');

  // Add content that triggers scroll
  await component.evaluate(() => {
    const area = document.querySelector('[data-testid="message-area"]');
    if (area) {
      for (let i = 0; i < 20; i++) {
        const div = document.createElement('div');
        div.textContent = `Message ${i}`;
        div.style.height = '50px';
        area.appendChild(div);
      }
    }
  });

  // Verify scroll position is at bottom
  const { scrollTop, scrollHeight, clientHeight } = await messageArea.evaluate(el => ({
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  }));

  // scrollTop should be approximately scrollHeight - clientHeight (at bottom)
  expect(scrollTop).toBeCloseTo(scrollHeight - clientHeight, -1);
});
```

**Pass Criteria:** Scrollbar appears when needed, auto-scroll works

---

## 2. Component Tests (Playwright CT)

### 1.5-COMP-001: ChatColumn internal layout composition
**Priority:** P0
**AC Coverage:** #1, #2, #3

```typescript
// tests/component/chat/ChatColumn.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { ChatColumn } from '@/components/chat/ChatColumn';

test.describe('ChatColumn Component', () => {
  test('should render MessageArea and ChatInput children', async ({ mount }) => {
    const component = await mount(<ChatColumn />);

    await expect(component.getByTestId('message-area')).toBeVisible();
    await expect(component.getByRole('textbox', { name: 'Chat input' })).toBeVisible();
  });

  test('should position input below message area', async ({ mount }) => {
    const component = await mount(<ChatColumn />);

    const messageArea = component.getByTestId('message-area');
    const inputContainer = component.getByTestId('chat-input-container');

    const messageBox = await messageArea.boundingBox();
    const inputBox = await inputContainer.boundingBox();

    expect(inputBox!.y).toBeGreaterThan(messageBox!.y);
  });
});
```

**Pass Criteria:** Children render in correct order

---

### 1.5-COMP-002: ChatInput keyboard interaction
**Priority:** P0
**AC Coverage:** NFR-5.1

```typescript
// tests/component/chat/ChatInput.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { ChatInput } from '@/components/chat/ChatInput';

test.describe('ChatInput Keyboard Interaction', () => {
  test('should receive focus on tab', async ({ mount, page }) => {
    const component = await mount(<ChatInput />);

    await page.keyboard.press('Tab');

    const input = component.getByRole('textbox', { name: 'Chat input' });
    await expect(input).toBeFocused();
  });

  test('should accept text input', async ({ mount }) => {
    const component = await mount(<ChatInput />);

    const input = component.getByRole('textbox', { name: 'Chat input' });
    await input.fill('Hello Orion');

    await expect(input).toHaveValue('Hello Orion');
  });

  test('should show visible focus ring', async ({ mount }) => {
    const component = await mount(<ChatInput />);

    const input = component.getByRole('textbox', { name: 'Chat input' });
    await input.focus();

    // Visual focus state should be visible
    await expect(input).toHaveCSS('outline-width', '2px');
  });
});
```

**Pass Criteria:** Focus and input work correctly

---

### 1.5-COMP-003: MessageArea scrolling behavior
**Priority:** P1
**AC Coverage:** #2

```typescript
// tests/component/chat/MessageArea.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { MessageArea } from '@/components/chat/MessageArea';

test.describe('MessageArea Scrolling', () => {
  test('should not show scrollbar when content fits', async ({ mount }) => {
    const component = await mount(<MessageArea />);

    const messageArea = component.getByTestId('message-area');
    const scrollHeight = await messageArea.evaluate(el => el.scrollHeight);
    const clientHeight = await messageArea.evaluate(el => el.clientHeight);

    expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
  });
});
```

**Pass Criteria:** Scroll behavior correct

---

### 1.5-COMP-004: ChatColumn flex-1 expansion behavior
**Priority:** P0
**AC Coverage:** #1

```typescript
// tests/component/chat/ChatColumn.spec.tsx
test('should expand to fill available space', async ({ mount }) => {
  const component = await mount(
    <div className="flex h-[600px] w-[1000px]">
      <div className="w-[280px] flex-shrink-0">Sidebar</div>
      <ChatColumn />
    </div>
  );

  const chatColumn = component.getByRole('region', { name: 'Chat' });
  const chatBox = await chatColumn.boundingBox();

  // Should take remaining width: 1000 - 280 = 720px
  expect(chatBox!.width).toBe(720);
});
```

**Pass Criteria:** Flex-1 fills remaining space

---

### 1.5-COMP-005: ChatColumn minimum width enforcement
**Priority:** P0
**AC Coverage:** #4

```typescript
// tests/component/chat/ChatColumn.spec.tsx
test('should maintain 400px minimum width', async ({ mount }) => {
  const component = await mount(
    <div className="flex h-[600px] w-[600px]">
      <div className="w-[280px] flex-shrink-0">Sidebar</div>
      <ChatColumn />
      <div className="w-[480px] flex-shrink-0">Canvas</div>
    </div>
  );

  const chatColumn = component.getByRole('region', { name: 'Chat' });
  const chatBox = await chatColumn.boundingBox();

  // Should not shrink below 400px
  expect(chatBox!.width).toBeGreaterThanOrEqual(400);
});
```

**Pass Criteria:** Min-width enforced

---

### 1.5-COMP-006: Empty state visual appearance
**Priority:** P1
**AC Coverage:** #2

```typescript
// tests/component/chat/MessageArea.spec.tsx
test('should display centered empty state placeholder', async ({ mount }) => {
  const component = await mount(<MessageArea />);

  const placeholder = component.getByText('Start a conversation...');
  await expect(placeholder).toBeVisible();

  // Screenshot for visual regression
  await expect(component).toHaveScreenshot('message-area-empty-state.png');
});
```

**Pass Criteria:** Empty state matches design

---

## 3. Integration Tests (Vitest)

### 1.5-INT-001: ChatColumn integrates with AppShell layout
**Priority:** P0
**AC Coverage:** #1

```typescript
// tests/integration/layout/app-shell-chat.test.tsx
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';

describe('AppShell with ChatColumn Integration', () => {
  it('should render ChatColumn as sibling to Sidebar', () => {
    render(<AppShell />);

    // Sidebar exists (from Story 1.4)
    expect(screen.getByRole('complementary')).toBeInTheDocument();

    // ChatColumn exists as main content
    expect(screen.getByRole('region', { name: 'Chat' })).toBeInTheDocument();
  });

  it('should position ChatColumn after Sidebar in flex container', () => {
    render(<AppShell />);

    const sidebar = screen.getByRole('complementary');
    const chatColumn = screen.getByRole('region', { name: 'Chat' });

    // Both should be siblings within same flex container
    expect(sidebar.parentElement).toBe(chatColumn.parentElement);
  });
});
```

**Pass Criteria:** ChatColumn integrated with AppShell

---

### 1.5-INT-002: Design token integration for light mode
**Priority:** P1
**AC Coverage:** #1, #2, #3

```typescript
// tests/integration/theming/chat-light-mode.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatColumn } from '@/components/chat/ChatColumn';

describe('ChatColumn Light Mode', () => {
  it('should use cream background in light mode', () => {
    render(<ChatColumn />);

    const chatColumn = screen.getByRole('region', { name: 'Chat' });
    const computedStyle = window.getComputedStyle(chatColumn);

    // --orion-bg in light mode should be #FAF8F5
    expect(computedStyle.backgroundColor).toBe('rgb(250, 248, 245)');
  });
});
```

**Pass Criteria:** Light mode colors correct

---

### 1.5-INT-003: Design token integration for dark mode
**Priority:** P1
**AC Coverage:** #1, #2, #3

```typescript
// tests/integration/theming/chat-dark-mode.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatColumn } from '@/components/chat/ChatColumn';

describe('ChatColumn Dark Mode', () => {
  beforeEach(() => {
    document.documentElement.classList.add('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should use dark background in dark mode', () => {
    render(<ChatColumn />);

    const chatColumn = screen.getByRole('region', { name: 'Chat' });
    const computedStyle = window.getComputedStyle(chatColumn);

    // --orion-bg in dark mode should be #121212
    expect(computedStyle.backgroundColor).toBe('rgb(18, 18, 18)');
  });
});
```

**Pass Criteria:** Dark mode colors correct

---

## 4. E2E Tests (Playwright)

### 1.5-E2E-001: Chat layout renders on app launch
**Priority:** P0
**AC Coverage:** #1

```typescript
// tests/e2e/chat/layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Layout E2E', () => {
  test('should display chat column on app launch', async ({ page }) => {
    await page.goto('/');

    // ChatColumn visible
    const chatRegion = page.getByRole('region', { name: 'Chat' });
    await expect(chatRegion).toBeVisible();

    // Input visible at bottom
    const chatInput = page.getByRole('textbox', { name: 'Chat input' });
    await expect(chatInput).toBeVisible();

    // Empty state visible
    await expect(page.getByText('Start a conversation...')).toBeVisible();
  });

  test('should fill remaining space after sidebar', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.getByRole('complementary');
    const chatRegion = page.getByRole('region', { name: 'Chat' });

    const sidebarBox = await sidebar.boundingBox();
    const chatBox = await chatRegion.boundingBox();

    // Chat should start where sidebar ends
    expect(chatBox!.x).toBeCloseTo(sidebarBox!.x + sidebarBox!.width, 1);

    // Chat should fill to edge
    const viewport = page.viewportSize();
    expect(chatBox!.x + chatBox!.width).toBeCloseTo(viewport!.width, 1);
  });
});
```

**Selectors:** `role=region[name="Chat"]`, `role=textbox[name="Chat input"]`
**Pass Criteria:** Layout renders correctly on launch

---

### 1.5-E2E-002: Input receives focus and accepts text
**Priority:** P0
**AC Coverage:** #3, NFR-5.1

```typescript
// tests/e2e/chat/input.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Input E2E', () => {
  test('should focus input and type message', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.getByRole('textbox', { name: 'Chat input' });

    // Focus via click
    await chatInput.click();
    await expect(chatInput).toBeFocused();

    // Type message
    await chatInput.fill('Hello, Orion!');
    await expect(chatInput).toHaveValue('Hello, Orion!');
  });

  test('should focus input via tab navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through elements until input focused
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // May need to adjust tab count based on focusable elements

    const chatInput = page.getByRole('textbox', { name: 'Chat input' });
    await expect(chatInput).toBeFocused();
  });

  test('should show visible focus ring', async ({ page }) => {
    await page.goto('/');

    const chatInput = page.getByRole('textbox', { name: 'Chat input' });
    await chatInput.focus();

    // Screenshot to verify focus state
    await expect(chatInput).toHaveScreenshot('chat-input-focused.png');
  });
});
```

**Pass Criteria:** Input works via click and keyboard

---

### 1.5-E2E-003: Responsive behavior with minimum width
**Priority:** P1
**AC Coverage:** #4

```typescript
// tests/e2e/chat/responsive.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Responsive E2E', () => {
  test('should maintain 400px minimum width on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/');

    const chatRegion = page.getByRole('region', { name: 'Chat' });
    const chatBox = await chatRegion.boundingBox();

    expect(chatBox!.width).toBeGreaterThanOrEqual(400);
  });

  test('should expand on wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const chatRegion = page.getByRole('region', { name: 'Chat' });
    const chatBox = await chatRegion.boundingBox();

    // On 1920px viewport with 280px sidebar, chat should be ~1640px
    expect(chatBox!.width).toBeGreaterThan(1000);
  });
});
```

**Pass Criteria:** Min-width enforced, flex-1 expands

---

### 1.5-E2E-004: Visual regression - complete chat layout
**Priority:** P1
**AC Coverage:** #1, #2, #3

```typescript
// tests/e2e/chat/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Visual Regression', () => {
  test('should match light mode snapshot', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'light' });

    const chatRegion = page.getByRole('region', { name: 'Chat' });
    await expect(chatRegion).toHaveScreenshot('chat-column-light.png');
  });

  test('should match dark mode snapshot', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });

    const chatRegion = page.getByRole('region', { name: 'Chat' });
    await expect(chatRegion).toHaveScreenshot('chat-column-dark.png');
  });
});
```

**Pass Criteria:** Screenshots match baseline

---

## 5. Accessibility Tests

### 1.5-A11Y-001: Semantic HTML structure
**Priority:** P0
**AC Coverage:** NFR-5.1, NFR-5.2

```typescript
// tests/e2e/chat/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Chat Accessibility', () => {
  test('should use main element for chat area', async ({ page }) => {
    await page.goto('/');

    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();

    // Main element should have region role with Chat label
    await expect(mainElement).toHaveAttribute('role', 'region');
    await expect(mainElement).toHaveAttribute('aria-label', 'Chat');
  });

  test('should have no axe-core violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[aria-label="Chat"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

**Pass Criteria:** Semantic HTML, no axe violations

---

### 1.5-A11Y-002: ARIA attributes present
**Priority:** P0
**AC Coverage:** NFR-5.1, NFR-5.2

```typescript
// tests/e2e/chat/accessibility.spec.ts
test('should have proper ARIA attributes', async ({ page }) => {
  await page.goto('/');

  // ChatColumn has region role
  const chatRegion = page.getByRole('region', { name: 'Chat' });
  await expect(chatRegion).toBeVisible();

  // MessageArea has aria-live for updates
  const messageArea = page.getByTestId('message-area');
  await expect(messageArea).toHaveAttribute('aria-live', 'polite');

  // ChatInput has accessible label
  const chatInput = page.getByRole('textbox', { name: 'Chat input' });
  await expect(chatInput).toBeVisible();
});
```

**Pass Criteria:** All ARIA attributes present

---

### 1.5-A11Y-003: Keyboard navigation flow
**Priority:** P0
**AC Coverage:** NFR-5.1

```typescript
// tests/e2e/chat/accessibility.spec.ts
test('should support full keyboard navigation', async ({ page }) => {
  await page.goto('/');

  // Tab to input
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  const chatInput = page.getByRole('textbox', { name: 'Chat input' });
  await expect(chatInput).toBeFocused();

  // Type message
  await page.keyboard.type('Test message');
  await expect(chatInput).toHaveValue('Test message');
});
```

**Pass Criteria:** Can navigate and type via keyboard only

---

### 1.5-A11Y-004: Focus visible indicators
**Priority:** P0
**AC Coverage:** NFR-5.1

```typescript
// tests/e2e/chat/accessibility.spec.ts
test('should have visible focus indicators', async ({ page }) => {
  await page.goto('/');

  const chatInput = page.getByRole('textbox', { name: 'Chat input' });
  await chatInput.focus();

  // Check focus ring is visible (2px gold outline, 2px offset)
  await expect(chatInput).toHaveCSS('outline-width', '2px');
  await expect(chatInput).toHaveCSS('outline-offset', '2px');
  // Note: outline-color check depends on CSS variable resolution
});
```

**Pass Criteria:** 2px gold outline visible on focus

---

### 1.5-A11Y-005: Screen reader landmark navigation
**Priority:** P1
**AC Coverage:** NFR-5.1, NFR-5.2

```typescript
// tests/e2e/chat/accessibility.spec.ts
test('should be discoverable via screen reader landmarks', async ({ page }) => {
  await page.goto('/');

  // Main landmark present
  const mainLandmark = page.getByRole('main');
  await expect(mainLandmark).toBeVisible();

  // Main has accessible name
  await expect(mainLandmark).toHaveAccessibleName('Chat');
});
```

**Pass Criteria:** Landmarks discoverable

---

## Test Data Requirements

| Test Category | Data Needed | Source |
|---------------|-------------|--------|
| Unit Tests | None | Pure components |
| Component Tests | Mock container dimensions | Playwright CT |
| Integration Tests | Theme CSS variables | Story 1.3 tokens |
| E2E Tests | None | App default state |
| A11Y Tests | None | App default state |

---

## Test Environment Setup

### Prerequisites
- Vitest configured with Testing Library
- Playwright Component Testing configured
- Playwright E2E configured
- axe-core/playwright installed

### Required Test Utilities
```typescript
// tests/utils/render-with-theme.tsx
export function renderWithTheme(ui: React.ReactElement, theme: 'light' | 'dark' = 'light') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return render(ui);
}
```

---

## Priority Execution Order

### P0 (Must Pass Before Merge)
1. 1.5-UNIT-001 (flex layout)
2. 1.5-UNIT-003 (scroll config)
3. 1.5-UNIT-005 (input positioning)
4. 1.5-UNIT-007 (focus state)
5. 1.5-COMP-001 (internal layout)
6. 1.5-COMP-002 (keyboard interaction)
7. 1.5-COMP-004 (flex-1 expansion)
8. 1.5-COMP-005 (min-width)
9. 1.5-INT-001 (AppShell integration)
10. 1.5-E2E-001 (layout on launch)
11. 1.5-E2E-002 (input focus)
12. 1.5-A11Y-001 (semantic HTML)
13. 1.5-A11Y-002 (ARIA attributes)
14. 1.5-A11Y-003 (keyboard nav)
15. 1.5-A11Y-004 (focus visible)

### P1 (Should Pass Before Merge)
1. 1.5-UNIT-002 (flex column)
2. 1.5-UNIT-004 (empty state)
3. 1.5-UNIT-006 (Editorial Luxury)
4. 1.5-UNIT-008 (barrel exports)
5. 1.5-UNIT-009 (design tokens)
6. 1.5-COMP-003 (scroll behavior)
7. 1.5-COMP-006 (empty state visual)
8. 1.5-INT-002 (light mode)
9. 1.5-INT-003 (dark mode)
10. 1.5-E2E-003 (responsive)
11. 1.5-E2E-004 (visual regression)
12. 1.5-A11Y-005 (landmarks)

---

## Selector Strategy

Following selector-resilience best practices:

| Element | Primary Selector | Fallback |
|---------|------------------|----------|
| ChatColumn | `role="region"[name="Chat"]` | `data-testid="chat-column"` |
| MessageArea | `data-testid="message-area"` | `.message-area` |
| ChatInput container | `data-testid="chat-input-container"` | - |
| ChatInput field | `role="textbox"[name="Chat input"]` | `placeholder="Ask Orion..."` |
| Empty state | `text="Start a conversation..."` | - |

---

## Risk Assessment

| Test | Risk if Skipped | Mitigation |
|------|-----------------|------------|
| 1.5-E2E-001 | Layout broken on launch | P0 priority |
| 1.5-A11Y-002 | Accessibility compliance | P0 priority |
| 1.5-COMP-005 | Canvas overlap | P0 priority |
| 1.5-E2E-004 | Visual regression | Snapshot baselines |

---

*Generated by TEA (Master Test Architect) - Strong opinions, weakly held.*
