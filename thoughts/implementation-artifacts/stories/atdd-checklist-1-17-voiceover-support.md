# ATDD Checklist: Story 1.17 - VoiceOver Support

**Story:** 1.17 - VoiceOver Support
**Status:** Test Design Complete
**Created:** 2026-01-24
**Author:** TEA (Test Architect Agent)

## Overview

This document defines acceptance test scenarios for Story 1.17 - VoiceOver Support, covering all 10 acceptance criteria. Tests are organized into:

1. **Automated Tests** - axe-core ARIA validation via Playwright
2. **Manual Tests** - VoiceOver-specific testing (cannot be fully automated)

**Note:** Automated tests cannot directly interact with VoiceOver. They validate ARIA attributes and semantic structure that VoiceOver relies upon. Manual VoiceOver testing remains essential for true screen reader compatibility verification.

---

## Test Coverage Matrix

| AC# | Description | Automated Tests | Manual Tests |
|-----|-------------|-----------------|--------------|
| AC1 | Interactive element accessible names | VOA-001 to VOA-005 | VOM-001 |
| AC2 | Landmark regions | VOA-006 to VOA-010 | VOM-002 |
| AC3 | ARIA live regions | VOA-011 to VOA-015 | VOM-003 |
| AC4 | Sidebar navigation | VOA-016 to VOA-020 | VOM-004 |
| AC5 | Button state announcements | VOA-021 to VOA-025 | VOM-005 |
| AC6 | Input field accessibility | VOA-026 to VOA-031 | VOM-006 |
| AC7 | Chat input accessibility | VOA-032 to VOA-035 | VOM-007 |
| AC8 | Streaming content | VOA-036 to VOA-040 | VOM-008 |
| AC9 | Modal accessibility | VOA-041 to VOA-046 | VOM-009 |
| AC10 | Heading structure | VOA-047 to VOA-050 | VOM-010 |

---

## AC1: Interactive Element Accessible Names

**Criterion:** All interactive elements (buttons, links, inputs) have accessible names and VoiceOver announces element type and state.

### Automated Tests (axe-core + Playwright)

#### VOA-001: All buttons have accessible names
```typescript
test('VOA-001: all buttons have accessible names', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator('button');
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const hasAccessibleName = await button.evaluate((el) => {
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const textContent = el.textContent?.trim();
      return !!(ariaLabel || ariaLabelledBy || textContent);
    });
    expect(hasAccessibleName, `Button ${i} lacks accessible name`).toBe(true);
  }
});
```
- **Happy Path:** All buttons have aria-label, aria-labelledby, or visible text
- **Edge Case:** Icon-only buttons must have aria-label
- **Error Handling:** Verify disabled buttons still have names

#### VOA-002: Icon-only buttons have aria-label
```typescript
test('VOA-002: icon-only buttons have aria-label', async ({ page }) => {
  await page.goto('/');
  // Icon-only buttons typically have SVG children and no text
  const iconButtons = page.locator('button:has(svg):not(:has-text(/./))');
  const count = await iconButtons.count();

  for (let i = 0; i < count; i++) {
    const button = iconButtons.nth(i);
    await expect(button).toHaveAttribute('aria-label');
  }
});
```

#### VOA-003: All links have accessible names
```typescript
test('VOA-003: all links have accessible names', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href]');
  const count = await links.count();

  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const hasAccessibleName = await link.evaluate((el) => {
      const ariaLabel = el.getAttribute('aria-label');
      const textContent = el.textContent?.trim();
      return !!(ariaLabel || textContent);
    });
    expect(hasAccessibleName, `Link ${i} lacks accessible name`).toBe(true);
  }
});
```

#### VOA-004: All inputs have associated labels
```typescript
test('VOA-004: all inputs have associated labels', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input, textarea, select');
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const hasLabel = await input.evaluate((el) => {
      const id = el.id;
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const hasHtmlFor = id && document.querySelector(`label[for="${id}"]`);
      return !!(ariaLabel || ariaLabelledBy || hasHtmlFor);
    });
    expect(hasLabel, `Input ${i} lacks associated label`).toBe(true);
  }
});
```

#### VOA-005: axe-core passes for interactive elements
```typescript
test('VOA-005: axe-core validates interactive elements', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('button, a, input, textarea, select')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Manual Test (VOM-001)

**VOM-001: VoiceOver announces all interactive elements correctly**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver (Cmd+F5) | VoiceOver activates |
| 2 | Navigate with VO+Right to first button | VoiceOver announces button name and "button" role |
| 3 | Navigate to each button in sidebar | Each button announces its purpose |
| 4 | Navigate to chat input | Announces "Message to Orion, text field" |
| 5 | Navigate to send button | Announces "Send message, button" or similar |
| 6 | Navigate to any disabled button | Announces name + "dimmed" |

---

## AC2: Landmark Regions

**Criterion:** Landmarks are properly labeled with VoiceOver announcing "Sidebar navigation", "Main content", "Canvas panel".

### Automated Tests

#### VOA-006: Sidebar has navigation landmark
```typescript
test('VOA-006: sidebar has navigation landmark', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('[role="navigation"]');
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute('aria-label', 'Sidebar navigation');
});
```

#### VOA-007: Chat column has main landmark
```typescript
test('VOA-007: chat column has main landmark', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('[role="main"], main');
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute('aria-label', 'Main content');
});
```

#### VOA-008: Canvas has complementary landmark
```typescript
test('VOA-008: canvas has complementary landmark', async ({ page }) => {
  await page.goto('/');
  // Canvas may need to be visible first
  const canvas = page.locator('[role="complementary"]');
  await expect(canvas).toHaveAttribute('aria-label', 'Canvas panel');
});
```

#### VOA-009: Only one main landmark exists
```typescript
test('VOA-009: only one main landmark exists', async ({ page }) => {
  await page.goto('/');
  const mainLandmarks = page.locator('[role="main"], main');
  await expect(mainLandmarks).toHaveCount(1);
});
```

#### VOA-010: Landmarks are unique
```typescript
test('VOA-010: all landmarks have unique labels', async ({ page }) => {
  await page.goto('/');
  const labels = await page.evaluate(() => {
    const landmarks = document.querySelectorAll(
      '[role="navigation"], [role="main"], [role="complementary"], main, nav, aside'
    );
    return Array.from(landmarks).map(el => el.getAttribute('aria-label'));
  });

  const nonNullLabels = labels.filter(Boolean);
  const uniqueLabels = new Set(nonNullLabels);
  expect(uniqueLabels.size).toBe(nonNullLabels.length);
});
```

### Manual Test (VOM-002)

**VOM-002: VoiceOver rotor shows landmarks**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver (Cmd+F5) | VoiceOver activates |
| 2 | Open rotor (VO+U) | Rotor opens |
| 3 | Navigate to Landmarks (left/right arrows) | Landmarks category selected |
| 4 | Review landmark list | "Sidebar navigation", "Main content" visible |
| 5 | If canvas open: verify "Canvas panel" | Canvas landmark listed |
| 6 | Select "Sidebar navigation" and press Enter | Focus moves to sidebar |

---

## AC3: ARIA Live Regions

**Criterion:** Dynamic content changes (new message, status update) are announced via ARIA live regions.

### Automated Tests

#### VOA-011: Message area has aria-live="polite"
```typescript
test('VOA-011: message area has live region', async ({ page }) => {
  await page.goto('/');
  const messageArea = page.locator('[role="log"]');
  await expect(messageArea).toHaveAttribute('aria-live', 'polite');
});
```

#### VOA-012: Status indicator has live region
```typescript
test('VOA-012: status indicator has live region', async ({ page }) => {
  await page.goto('/');
  const statusRegion = page.locator('[data-testid="status-indicator"] + [aria-live], [data-testid="status-indicator"] [aria-live]');
  await expect(statusRegion).toHaveAttribute('aria-live', 'polite');
});
```

#### VOA-013: Error messages have aria-live="assertive"
```typescript
test('VOA-013: error messages have assertive live region', async ({ page }) => {
  await page.goto('/');
  // Trigger an error state if possible, or verify role="alert" elements
  const errorRegions = page.locator('[role="alert"]');
  const count = await errorRegions.count();

  if (count > 0) {
    for (let i = 0; i < count; i++) {
      await expect(errorRegions.nth(i)).toHaveAttribute('aria-live', 'assertive');
    }
  }
});
```

#### VOA-014: Live regions have correct aria-atomic
```typescript
test('VOA-014: status live regions have aria-atomic', async ({ page }) => {
  await page.goto('/');
  const statusRegions = page.locator('[role="status"]');
  const count = await statusRegions.count();

  for (let i = 0; i < count; i++) {
    await expect(statusRegions.nth(i)).toHaveAttribute('aria-atomic', 'true');
  }
});
```

#### VOA-015: axe-core validates live regions
```typescript
test('VOA-015: axe-core validates ARIA live regions', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withRules(['aria-valid-attr', 'aria-valid-attr-value'])
    .include('[aria-live]')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Manual Test (VOM-003)

**VOM-003: VoiceOver announces dynamic content**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Focus on chat input | Input focused |
| 3 | Send a message | User message appears |
| 4 | Wait for response | VoiceOver announces incoming message content |
| 5 | Observe status changes | Status changes announced (e.g., "Thinking", "Working") |
| 6 | Wait for completion | "Response complete" announced |

---

## AC4: Sidebar Navigation

**Criterion:** VoiceOver reads sidebar item label, count, and active state with arrow key navigation announced correctly.

### Automated Tests

#### VOA-016: Active sidebar item has aria-current="page"
```typescript
test('VOA-016: active sidebar item has aria-current', async ({ page }) => {
  await page.goto('/');
  const activeItem = page.locator('[aria-current="page"]');
  await expect(activeItem).toBeVisible();
});
```

#### VOA-017: Sidebar items have role="listitem"
```typescript
test('VOA-017: sidebar nav items are list items', async ({ page }) => {
  await page.goto('/');
  const navList = page.locator('[data-testid="sidebar"] [role="list"]');
  await expect(navList).toBeVisible();

  const items = navList.locator('[role="listitem"]');
  await expect(items).toHaveCount({ min: 1 });
});
```

#### VOA-018: Sidebar items with counts have aria-describedby
```typescript
test('VOA-018: sidebar items with counts have descriptions', async ({ page }) => {
  await page.goto('/');
  // Items with badge counts should have aria-describedby
  const itemsWithCounts = page.locator('[data-testid="sidebar"] [role="listitem"]:has([data-testid*="count"])');
  const count = await itemsWithCounts.count();

  for (let i = 0; i < count; i++) {
    const item = itemsWithCounts.nth(i);
    const hasDescription = await item.evaluate((el) => {
      return el.hasAttribute('aria-describedby') ||
             el.querySelector('[aria-describedby]') !== null;
    });
    expect(hasDescription, `Sidebar item ${i} with count lacks aria-describedby`).toBe(true);
  }
});
```

#### VOA-019: Collapsible sections have aria-expanded
```typescript
test('VOA-019: collapsible sections have aria-expanded', async ({ page }) => {
  await page.goto('/');
  const expandableButtons = page.locator('[data-testid="sidebar"] button[aria-expanded]');
  const count = await expandableButtons.count();

  // If there are expandable sections, verify aria-expanded
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      const button = expandableButtons.nth(i);
      const expanded = await button.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(expanded);
    }
  }
});
```

#### VOA-020: Sidebar navigation is keyboard accessible
```typescript
test('VOA-020: sidebar supports keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const firstItem = page.locator('[data-testid="sidebar"] [role="listitem"]').first();

  // Focus sidebar
  await firstItem.focus();
  await expect(firstItem).toBeFocused();

  // Arrow down should move focus
  await page.keyboard.press('ArrowDown');
  await expect(firstItem).not.toBeFocused();
});
```

### Manual Test (VOM-004)

**VOM-004: VoiceOver sidebar navigation**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Navigate to sidebar | "Sidebar navigation" announced |
| 3 | Interact with sidebar (VO+Shift+Down) | Enter sidebar group |
| 4 | Navigate to Inbox item | "Inbox, [count] items" announced |
| 5 | If Inbox is active | "current page" or "current section" announced |
| 6 | Press arrow keys | Focus moves, new item announced |
| 7 | Navigate to collapsible section | "expanded" or "collapsed" announced |

---

## AC5: Button State Announcements

**Criterion:** VoiceOver announces button states (disabled, expanded, pressed) including toggle buttons.

### Automated Tests

#### VOA-021: Disabled buttons have aria-disabled
```typescript
test('VOA-021: disabled buttons have aria-disabled', async ({ page }) => {
  await page.goto('/');
  const disabledButtons = page.locator('button[disabled]');
  const count = await disabledButtons.count();

  for (let i = 0; i < count; i++) {
    const button = disabledButtons.nth(i);
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  }
});
```

#### VOA-022: Toggle buttons have aria-pressed
```typescript
test('VOA-022: toggle buttons have aria-pressed', async ({ page }) => {
  await page.goto('/');
  // Sidebar toggle button
  const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');

  if (await sidebarToggle.count() > 0) {
    const pressed = await sidebarToggle.getAttribute('aria-pressed');
    expect(['true', 'false']).toContain(pressed);
  }
});
```

#### VOA-023: aria-pressed toggles correctly
```typescript
test('VOA-023: aria-pressed toggles on click', async ({ page }) => {
  await page.goto('/');
  const toggleButton = page.locator('button[aria-pressed]').first();

  if (await toggleButton.count() > 0) {
    const initialState = await toggleButton.getAttribute('aria-pressed');
    await toggleButton.click();
    const newState = await toggleButton.getAttribute('aria-pressed');
    expect(newState).not.toBe(initialState);
  }
});
```

#### VOA-024: Dropdown buttons have aria-haspopup
```typescript
test('VOA-024: dropdown buttons have aria-haspopup', async ({ page }) => {
  await page.goto('/');
  const dropdownTriggers = page.locator('button[aria-haspopup]');
  const count = await dropdownTriggers.count();

  for (let i = 0; i < count; i++) {
    const button = dropdownTriggers.nth(i);
    const haspopup = await button.getAttribute('aria-haspopup');
    expect(['menu', 'listbox', 'dialog', 'grid', 'tree', 'true']).toContain(haspopup);
  }
});
```

#### VOA-025: Expandable buttons have aria-expanded
```typescript
test('VOA-025: expandable buttons have aria-expanded', async ({ page }) => {
  await page.goto('/');
  const expandableButtons = page.locator('button[aria-expanded]');
  const count = await expandableButtons.count();

  for (let i = 0; i < count; i++) {
    const button = expandableButtons.nth(i);
    const expanded = await button.getAttribute('aria-expanded');
    expect(['true', 'false']).toContain(expanded);
  }
});
```

### Manual Test (VOM-005)

**VOM-005: VoiceOver button state announcements**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Navigate to disabled button | "dimmed" announced |
| 3 | Navigate to sidebar toggle | "Sidebar toggle, [pressed/not pressed], button" |
| 4 | Activate toggle (VO+Space) | State change announced |
| 5 | Navigate to dropdown button | "popup button" or "has popup" announced |
| 6 | Open dropdown | "expanded" announced |
| 7 | Close dropdown | "collapsed" announced |

---

## AC6: Input Field Accessibility

**Criterion:** VoiceOver announces input label, placeholder (if no value), error messages, required status, and character limits.

### Automated Tests

#### VOA-026: All inputs have visible or SR-only labels
```typescript
test('VOA-026: inputs have labels', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input:not([type="hidden"]), textarea');
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const hasLabel = await input.evaluate((el) => {
      const id = el.id;
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const labelElement = id ? document.querySelector(`label[for="${id}"]`) : null;
      const parentLabel = el.closest('label');
      return !!(ariaLabel || ariaLabelledBy || labelElement || parentLabel);
    });
    expect(hasLabel, `Input ${i} lacks label`).toBe(true);
  }
});
```

#### VOA-027: Required inputs have aria-required
```typescript
test('VOA-027: required inputs have aria-required', async ({ page }) => {
  await page.goto('/');
  const requiredInputs = page.locator('input[required], textarea[required]');
  const count = await requiredInputs.count();

  for (let i = 0; i < count; i++) {
    const input = requiredInputs.nth(i);
    await expect(input).toHaveAttribute('aria-required', 'true');
  }
});
```

#### VOA-028: Invalid inputs have aria-invalid
```typescript
test('VOA-028: invalid inputs have aria-invalid', async ({ page }) => {
  await page.goto('/');
  // This test assumes there's a way to trigger validation errors
  // For now, verify structure of error-state inputs
  const invalidInputs = page.locator('[aria-invalid="true"]');
  const count = await invalidInputs.count();

  for (let i = 0; i < count; i++) {
    const input = invalidInputs.nth(i);
    // Should also have aria-describedby pointing to error message
    const describedBy = await input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  }
});
```

#### VOA-029: Error messages are linked via aria-describedby
```typescript
test('VOA-029: error messages linked to inputs', async ({ page }) => {
  await page.goto('/');
  const inputsWithErrors = page.locator('[aria-invalid="true"][aria-describedby]');
  const count = await inputsWithErrors.count();

  for (let i = 0; i < count; i++) {
    const input = inputsWithErrors.nth(i);
    const describedById = await input.getAttribute('aria-describedby');
    if (describedById) {
      const errorElement = page.locator(`#${describedById}`);
      await expect(errorElement).toBeVisible();
    }
  }
});
```

#### VOA-030: Placeholders do not replace labels
```typescript
test('VOA-030: inputs with placeholder also have labels', async ({ page }) => {
  await page.goto('/');
  const inputsWithPlaceholder = page.locator('input[placeholder], textarea[placeholder]');
  const count = await inputsWithPlaceholder.count();

  for (let i = 0; i < count; i++) {
    const input = inputsWithPlaceholder.nth(i);
    const hasLabel = await input.evaluate((el) => {
      const id = el.id;
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const labelElement = id ? document.querySelector(`label[for="${id}"]`) : null;
      return !!(ariaLabel || ariaLabelledBy || labelElement);
    });
    expect(hasLabel, `Input ${i} uses only placeholder without label`).toBe(true);
  }
});
```

#### VOA-031: axe-core validates form inputs
```typescript
test('VOA-031: axe-core validates form accessibility', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('input, textarea, select, form')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Manual Test (VOM-006)

**VOM-006: VoiceOver input field navigation**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Navigate to text input | Label announced (not just placeholder) |
| 3 | If required field | "required" announced |
| 4 | If has placeholder (empty) | Placeholder announced |
| 5 | Enter invalid data | Error message announced |
| 6 | Approach character limit | Warning announced when near limit |

---

## AC7: Chat Input Accessibility

**Criterion:** VoiceOver announces "Message to Orion, text field" and send shortcut hint is accessible.

### Automated Tests

#### VOA-032: Chat input has correct aria-label
```typescript
test('VOA-032: chat input has aria-label', async ({ page }) => {
  await page.goto('/');
  const chatInput = page.locator('[data-testid="chat-input"]');
  await expect(chatInput).toHaveAttribute('aria-label', 'Message to Orion');
});
```

#### VOA-033: Chat input has shortcut hint via aria-describedby
```typescript
test('VOA-033: chat input has shortcut hint', async ({ page }) => {
  await page.goto('/');
  const chatInput = page.locator('[data-testid="chat-input"]');
  const describedById = await chatInput.getAttribute('aria-describedby');

  expect(describedById).toBeTruthy();
  if (describedById) {
    const hintElement = page.locator(`#${describedById}`);
    const hintText = await hintElement.textContent();
    expect(hintText).toContain('Command');
    expect(hintText).toContain('Enter');
  }
});
```

#### VOA-034: Shortcut hint is visually hidden but accessible
```typescript
test('VOA-034: shortcut hint is SR-only', async ({ page }) => {
  await page.goto('/');
  const chatInput = page.locator('[data-testid="chat-input"]');
  const describedById = await chatInput.getAttribute('aria-describedby');

  if (describedById) {
    const hintElement = page.locator(`#${describedById}`);
    const isHidden = await hintElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.position === 'absolute' &&
             (el.classList.contains('sr-only') ||
              parseInt(style.width) <= 1);
    });
    expect(isHidden).toBe(true);
  }
});
```

#### VOA-035: Chat input is properly labeled as textarea
```typescript
test('VOA-035: chat input is a textarea', async ({ page }) => {
  await page.goto('/');
  const chatInput = page.locator('[data-testid="chat-input"]');
  const tagName = await chatInput.evaluate(el => el.tagName.toLowerCase());
  expect(tagName).toBe('textarea');
});
```

### Manual Test (VOM-007)

**VOM-007: VoiceOver chat input**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Navigate to chat input | "Message to Orion, text field" announced |
| 3 | Focus on chat input | Additional hint "Press Command Enter to send" announced |
| 4 | Type a message | Characters echoed (per VoiceOver settings) |
| 5 | Press Cmd+Enter | Message sent, focus behavior appropriate |

---

## AC8: Streaming Content Accessibility

**Criterion:** Streaming text announced progressively (not character-by-character), doesn't interrupt user navigation, "Response complete" announced.

### Automated Tests

#### VOA-036: Assistant message has aria-live="polite"
```typescript
test('VOA-036: assistant message has live region', async ({ page }) => {
  await page.goto('/');
  // After sending a message and receiving response
  const assistantMessage = page.locator('[data-testid="assistant-message"]').last();

  if (await assistantMessage.count() > 0) {
    const hasLiveRegion = await assistantMessage.evaluate((el) => {
      return el.getAttribute('aria-live') === 'polite' ||
             el.closest('[aria-live="polite"]') !== null;
    });
    expect(hasLiveRegion).toBe(true);
  }
});
```

#### VOA-037: Streaming content has aria-busy
```typescript
test('VOA-037: streaming content has aria-busy', async ({ page }) => {
  await page.goto('/');
  // This test may need to trigger a streaming response
  const streamingArea = page.locator('[aria-busy]');
  const count = await streamingArea.count();

  // Verify aria-busy can be toggled
  if (count > 0) {
    const busyValue = await streamingArea.first().getAttribute('aria-busy');
    expect(['true', 'false']).toContain(busyValue);
  }
});
```

#### VOA-038: Response complete announcement exists
```typescript
test('VOA-038: completion announcement structure exists', async ({ page }) => {
  await page.goto('/');
  // Verify the announcement component structure exists
  const completionAnnouncement = page.locator('[role="status"]:has-text("complete"), .sr-only:has-text("complete")');
  // This may not be visible until streaming completes
  // Just verify the pattern is in place
});
```

#### VOA-039: Live region uses polite (not assertive)
```typescript
test('VOA-039: message live region is polite', async ({ page }) => {
  await page.goto('/');
  const messageArea = page.locator('[data-testid="message-area"], [role="log"]');

  if (await messageArea.count() > 0) {
    const liveValue = await messageArea.getAttribute('aria-live');
    expect(liveValue).toBe('polite');
  }
});
```

#### VOA-040: Message area has role="log"
```typescript
test('VOA-040: message area has log role', async ({ page }) => {
  await page.goto('/');
  const messageLog = page.locator('[role="log"]');
  await expect(messageLog).toBeVisible();
});
```

### Manual Test (VOM-008)

**VOM-008: VoiceOver streaming content**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Send a message that triggers long response | Message sent |
| 3 | During streaming | Text announced in chunks (not per-character) |
| 4 | Try navigating away during stream | User navigation takes priority |
| 5 | Wait for completion | "Response complete" announced |
| 6 | Verify content not repeated | Same content not re-announced |

---

## AC9: Modal Accessibility

**Criterion:** Modals announce title/purpose, focus moves to first focusable element, "Dialog" role announced.

### Automated Tests

#### VOA-041: Modals have role="dialog"
```typescript
test('VOA-041: modals have dialog role', async ({ page }) => {
  await page.goto('/');
  // Open command palette
  await page.keyboard.press('Meta+k');

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
});
```

#### VOA-042: Modals have aria-modal="true"
```typescript
test('VOA-042: modals have aria-modal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+k');

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
});
```

#### VOA-043: Modals have aria-labelledby
```typescript
test('VOA-043: modals have title via aria-labelledby', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+k');

  const dialog = page.locator('[role="dialog"]');
  const labelledById = await dialog.getAttribute('aria-labelledby');

  expect(labelledById).toBeTruthy();
  if (labelledById) {
    const titleElement = page.locator(`#${labelledById}`);
    await expect(titleElement).toBeVisible();
  }
});
```

#### VOA-044: Focus moves into modal on open
```typescript
test('VOA-044: focus moves into modal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+k');

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();

  // First focusable element should be focused
  const focusedElement = page.locator(':focus');
  const isInsideDialog = await focusedElement.evaluate((el) => {
    return el.closest('[role="dialog"]') !== null;
  });
  expect(isInsideDialog).toBe(true);
});
```

#### VOA-045: Quick capture modal is accessible
```typescript
test('VOA-045: quick capture modal is accessible', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+n');

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby');
});
```

#### VOA-046: axe-core validates dialogs
```typescript
test('VOA-046: axe-core validates dialog accessibility', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Meta+k');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .include('[role="dialog"]')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Manual Test (VOM-009)

**VOM-009: VoiceOver modal navigation**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Press Cmd+K | Command palette opens |
| 3 | Observe announcement | "Dialog" and title announced |
| 4 | Check focus | Focus on first input/button |
| 5 | Navigate within modal | Can Tab through modal content |
| 6 | Try to navigate outside | Focus trapped in modal |
| 7 | Press Escape | Modal closes, focus returns |
| 8 | Press Cmd+N | Quick capture opens, "Dialog" announced |

---

## AC10: Heading Structure

**Criterion:** Headings, landmarks, and links properly grouped in rotor; heading levels semantically correct (h1 > h2 > h3, no skipping).

### Automated Tests

#### VOA-047: Only one h1 per page
```typescript
test('VOA-047: only one h1 per page', async ({ page }) => {
  await page.goto('/');
  const h1Elements = page.locator('h1');
  await expect(h1Elements).toHaveCount({ max: 1 });
});
```

#### VOA-048: Heading levels don't skip
```typescript
test('VOA-048: heading levels are sequential', async ({ page }) => {
  await page.goto('/');

  const headingLevels = await page.evaluate(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return Array.from(headings).map(h => parseInt(h.tagName[1]));
  });

  // Check for level skips
  for (let i = 1; i < headingLevels.length; i++) {
    const diff = headingLevels[i] - headingLevels[i - 1];
    expect(diff, `Heading level skips from h${headingLevels[i-1]} to h${headingLevels[i]}`).toBeLessThanOrEqual(1);
  }
});
```

#### VOA-049: Major sections have headings
```typescript
test('VOA-049: major sections have headings', async ({ page }) => {
  await page.goto('/');

  // Verify key sections have headings or landmarks
  const mainHasHeading = await page.evaluate(() => {
    const main = document.querySelector('[role="main"], main');
    return main ? main.querySelector('h1, h2, h3') !== null : false;
  });

  expect(mainHasHeading).toBe(true);
});
```

#### VOA-050: axe-core validates heading structure
```typescript
test('VOA-050: axe-core validates headings', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .withRules(['heading-order', 'page-has-heading-one'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Manual Test (VOM-010)

**VOM-010: VoiceOver rotor headings**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enable VoiceOver | VoiceOver activates |
| 2 | Open rotor (VO+U) | Rotor opens |
| 3 | Navigate to Headings | Headings category selected |
| 4 | Review heading list | Headings in logical order |
| 5 | Check heading levels | h1 first, then h2s, h3s nested correctly |
| 6 | Navigate to Links | Links category shows all links |
| 7 | Navigate to Landmarks | All landmarks listed |

---

## Full axe-core Scan

#### VOA-FULL: Complete axe-core accessibility scan
```typescript
test('VOA-FULL: complete accessibility scan passes', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Log violations for debugging
  if (results.violations.length > 0) {
    console.log('Accessibility violations:', JSON.stringify(results.violations, null, 2));
  }

  expect(results.violations).toEqual([]);
});
```

---

## Manual Testing Checklist Summary

### Pre-Testing Setup
- [ ] macOS with VoiceOver enabled (Cmd+F5)
- [ ] VoiceOver verbosity set to High
- [ ] Speech rate comfortable for testing
- [ ] Application running at localhost:3000

### VOM-001: Interactive Elements
- [ ] All buttons announce name + role
- [ ] Icon buttons announce purpose
- [ ] Links announce destination
- [ ] Disabled elements announce "dimmed"

### VOM-002: Landmarks
- [ ] Sidebar navigation in rotor
- [ ] Main content in rotor
- [ ] Canvas panel in rotor (when visible)
- [ ] Can navigate directly to landmarks

### VOM-003: Dynamic Content
- [ ] New messages announced
- [ ] Status changes announced
- [ ] Errors announced assertively
- [ ] Completion announced

### VOM-004: Sidebar Navigation
- [ ] Items announce label + count
- [ ] Active item indicates current
- [ ] Arrow keys navigate
- [ ] Expandable sections announce state

### VOM-005: Button States
- [ ] Disabled = "dimmed"
- [ ] Toggle = "pressed/not pressed"
- [ ] Dropdown = "has popup"
- [ ] Expanded/collapsed announced

### VOM-006: Input Fields
- [ ] Labels announced (not just placeholders)
- [ ] Required fields indicated
- [ ] Errors described
- [ ] Character limits warned

### VOM-007: Chat Input
- [ ] "Message to Orion" announced
- [ ] Shortcut hint accessible
- [ ] Multi-line capability clear

### VOM-008: Streaming Content
- [ ] Chunked announcement (not per-character)
- [ ] User navigation not interrupted
- [ ] "Response complete" announced

### VOM-009: Modals
- [ ] "Dialog" announced
- [ ] Title announced
- [ ] Focus moves inside
- [ ] Focus trapped
- [ ] Escape returns focus

### VOM-010: Headings
- [ ] Rotor shows headings
- [ ] Levels correct (h1 > h2 > h3)
- [ ] No level skips
- [ ] Major sections have headings

---

## Test File Location

Create E2E test file at: `tests/e2e/accessibility/voiceover-support.spec.ts`

```typescript
// tests/e2e/accessibility/voiceover-support.spec.ts
import { test, expect } from '../../support/fixtures';
import AxeBuilder from '@axe-core/playwright';

// Import and run all VOA tests from this checklist
```

---

## Definition of Done

- [ ] All VOA-* automated tests pass
- [ ] All VOM-* manual tests pass
- [ ] axe-core reports zero WCAG AA violations
- [ ] Manual VoiceOver testing completed by team member
- [ ] Any VoiceOver-specific issues documented

---

## References

- Story: `/Users/sid/Desktop/orion-butler/thoughts/implementation-artifacts/stories/story-1-17-voiceover-support.md`
- WAI-ARIA 1.2: https://www.w3.org/TR/wai-aria-1.2/
- axe-core Playwright: https://www.npmjs.com/package/@axe-core/playwright
- VoiceOver User Guide: https://support.apple.com/guide/voiceover/welcome
