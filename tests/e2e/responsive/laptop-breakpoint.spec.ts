/**
 * Laptop Breakpoint E2E Tests
 * Story 1.11: Laptop Breakpoint
 *
 * Tests responsive behavior at the laptop breakpoint (1024-1279px).
 *
 * Test IDs: 1.11-E2E-001 through 1.11-E2E-020
 *
 * Acceptance Criteria:
 * - AC#1: Sidebar collapses to 48px icon-only mode
 * - AC#2: Canvas overlays chat area
 * - AC#3: Tooltips appear on sidebar icon hover
 * - AC#4: No horizontal scrolling
 * - AC#5: Transitions to desktop above 1280px
 * - AC#6: Transitions to tablet below 1024px
 */
import { test, expect } from '../../support/fixtures';

test.describe('Story 1.11: Laptop Breakpoint (1024-1279px)', () => {
  // Run all tests at laptop viewport
  test.use({ viewport: { width: 1024, height: 800 } });

  test.describe('AC#1: Sidebar collapses to 48px icon-only', () => {
    test('1.11-E2E-001: sidebar is 48px wide at 1024px', async ({ page, log }) => {
      await log.step('Navigate to homepage at 1024px viewport');
      await page.goto('/');

      await log.step('Verify sidebar width');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(48);
    });

    test('1.11-E2E-002: sidebar only shows icons, no text labels', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify icons are visible');
      const inboxIcon = page.getByTestId('inbox-icon');
      await expect(inboxIcon).toBeVisible();

      await log.step('Verify text labels are NOT visible in sidebar');
      // The "Inbox" text should not be visible as a standalone element
      // (it may exist in tooltip but not in the sidebar layout)
      const sidebar = page.getByTestId('sidebar');
      const sidebarText = sidebar.locator('text=Inbox').first();

      // Text should not be visible at collapsed state
      await expect(sidebarText).not.toBeVisible();
    });

    test('1.11-E2E-003: chat column expands to fill remaining space', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat column fills space');
      const sidebar = page.getByTestId('sidebar');
      // Story 1.17: Updated to use <main> with "Chat conversation" aria-label
      const chatColumn = page.getByRole('main', { name: 'Chat conversation' });

      const sidebarBox = await sidebar.boundingBox();
      const chatBox = await chatColumn.boundingBox();

      // Layout at laptop (1024px):
      // Sidebar: 48px (collapsed), ContextSidebar: 320px, Chat: remaining (flex-1)
      // Chat width: 1024 - 48 - 320 = 656px
      expect(sidebarBox?.width).toBe(48);
      expect(chatBox?.width).toBeGreaterThanOrEqual(600); // flex-1 takes remaining space
      expect(chatBox?.width).toBeLessThanOrEqual(700); // Should be ~656px
    });
  });

  test.describe('AC#2: Canvas overlays chat area', () => {
    test('1.11-E2E-004: canvas uses fixed positioning when open', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas via Zustand store');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas has fixed positioning');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toBeVisible();

      const position = await canvas.evaluate(el =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('fixed');
    });

    test('1.11-E2E-005: canvas is 480px wide', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas width');
      const canvas = page.getByTestId('canvas-column');
      const box = await canvas.boundingBox();
      // Use Math.round to handle floating point precision (e.g., 479.99993896484375)
      expect(Math.round(box?.width ?? 0)).toBe(480);
    });

    test('1.11-E2E-006: canvas has backdrop overlay', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify backdrop is visible');
      const backdrop = page.getByTestId('canvas-backdrop');
      await expect(backdrop).toBeVisible();
    });

    test('1.11-E2E-007: clicking backdrop closes canvas', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Click backdrop to close');
      const backdrop = page.getByTestId('canvas-backdrop');
      await backdrop.click();

      await log.step('Verify canvas is closed');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });

    test('1.11-E2E-008: ESC key closes canvas overlay', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Press ESC to close');
      await page.keyboard.press('Escape');

      await log.step('Verify canvas is closed');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('AC#3: Tooltips on sidebar icons', () => {
    test('1.11-E2E-009: tooltip appears on icon hover', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Hover over Inbox icon');
      const inboxNavItem = page.getByTestId('sidebar-nav-item-inbox');
      await inboxNavItem.hover();

      await log.step('Verify tooltip appears');
      const tooltip = page.locator('role=tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('Inbox');
    });
  });

  test.describe('AC#4: No horizontal scrolling', () => {
    test('1.11-E2E-010: no horizontal scrollbar at 1024px', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify no horizontal scroll');
      const scrollWidth = await page.evaluate(() =>
        document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(() =>
        document.documentElement.clientWidth
      );

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('1.11-E2E-011: no horizontal scrollbar at 1279px', async ({ page, log }) => {
      await log.step('Set viewport to 1279px');
      await page.setViewportSize({ width: 1279, height: 800 });
      await page.goto('/');

      await log.step('Verify no horizontal scroll');
      const scrollWidth = await page.evaluate(() =>
        document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(() =>
        document.documentElement.clientWidth
      );

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });

  test.describe('AC#5: Transition to desktop mode above 1280px', () => {
    test('1.11-E2E-012: sidebar expands to 280px at 1280px', async ({ page, log }) => {
      await log.step('Set viewport to 1280px (desktop)');
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');

      await log.step('Verify sidebar is expanded');
      const sidebar = page.getByTestId('sidebar');
      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(280);
    });

    test('1.11-E2E-013: sidebar text labels visible at desktop', async ({ page, log }) => {
      await log.step('Set viewport to 1400px');
      await page.setViewportSize({ width: 1400, height: 800 });
      await page.goto('/');

      await log.step('Verify text labels are visible');
      const inboxText = page.getByText('Inbox');
      await expect(inboxText).toBeVisible();
    });

    test('1.11-E2E-014: canvas uses in-flow layout at desktop', async ({ page, log }) => {
      await log.step('Set viewport to 1400px');
      await page.setViewportSize({ width: 1400, height: 800 });
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas uses static/relative positioning');
      const canvas = page.getByTestId('canvas-column');
      const position = await canvas.evaluate(el =>
        window.getComputedStyle(el).position
      );
      // At desktop, canvas should NOT be fixed - uses normal flex layout
      expect(position).not.toBe('fixed');
    });
  });

  test.describe('Breakpoint transition animations', () => {
    test('1.11-E2E-015: sidebar animates when viewport changes', async ({ page, log }) => {
      await log.step('Start at desktop');
      await page.setViewportSize({ width: 1400, height: 800 });
      await page.goto('/');

      await log.step('Verify initial sidebar width');
      const sidebar = page.getByTestId('sidebar');
      let box = await sidebar.boundingBox();
      expect(box?.width).toBe(280);

      await log.step('Resize to laptop breakpoint');
      await page.setViewportSize({ width: 1024, height: 800 });

      // Wait for animation (300ms)
      await page.waitForTimeout(400);

      await log.step('Verify sidebar is collapsed');
      box = await sidebar.boundingBox();
      expect(box?.width).toBe(48);
    });

    test('1.11-E2E-016: sidebar has transition styles', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify sidebar has transition property');
      const sidebar = page.getByTestId('sidebar');
      const transition = await sidebar.evaluate(el =>
        window.getComputedStyle(el).transition
      );

      // Transition should include duration (browsers may report as 0.3s or 300ms)
      // and easing function (typically cubic-bezier)
      const hasDuration = transition.includes('0.3s') || transition.includes('300ms');
      expect(hasDuration).toBe(true);
      // Should have an easing function (cubic-bezier or ease-*)
      const hasEasing = transition.includes('cubic-bezier') || transition.includes('ease');
      expect(hasEasing).toBe(true);
    });
  });

  test.describe('Canvas overlay animation', () => {
    test('1.11-E2E-017: canvas slides in from right', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Get initial canvas transform');
      const canvas = page.getByTestId('canvas-column');
      let transform = await canvas.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Closed state should have translate-x-full (or equivalent matrix)
      expect(transform).not.toBe('none');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      // Wait for animation
      await page.waitForTimeout(400);

      await log.step('Verify canvas is at final position');
      transform = await canvas.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Open state should have no transform (translate-x-0)
      // Browsers may report this as 'none' or as identity matrix 'matrix(1, 0, 0, 1, 0, 0)'
      const isIdentityOrNone = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
      expect(isIdentityOrNone).toBe(true);
    });
  });

  test.describe('Accessibility at laptop breakpoint', () => {
    test('1.11-E2E-018: sidebar icons are keyboard navigable', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Tab to first sidebar nav item');
      // Focus on a sidebar nav item specifically
      const inboxNavItem = page.getByTestId('sidebar-nav-item-inbox');
      await inboxNavItem.focus();

      await log.step('Verify nav item can be focused');
      await expect(inboxNavItem).toBeFocused();
    });

    test('1.11-E2E-019: canvas close button is accessible', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify close button has aria-label');
      const closeButton = page.getByRole('button', { name: /close canvas/i });
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toHaveAttribute('aria-label');
    });

    test('1.11-E2E-020: canvas has correct ARIA attributes', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas ARIA attributes');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toHaveAttribute('role', 'complementary');
      // Story 1.17: Updated to use "Canvas panel" aria-label
      await expect(canvas).toHaveAttribute('aria-label', 'Canvas panel');
      await expect(canvas).toHaveAttribute('aria-hidden', 'false');
    });
  });
});
