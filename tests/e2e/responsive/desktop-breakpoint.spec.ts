/**
 * Desktop Breakpoint E2E Tests
 * Story 1.10: Desktop Breakpoint
 *
 * Tests responsive behavior at the desktop breakpoint (>=1280px).
 * Tests specifically at 1920x1080 (Full HD) as specified in the task.
 *
 * Test IDs: 1.10-E2E-001 through 1.10-E2E-020
 *
 * Acceptance Criteria (from AppShell.tsx comments):
 * - AC#1: Sidebar is 280px wide with full text labels
 * - AC#2: Chat column fills remaining space (flex-1, min-width 400px)
 * - AC#3: Canvas column is 480px when open
 * - AC#4: Three-column layout displays inline (no overlays)
 * - AC#5: No horizontal scrolling
 */
import { test, expect } from '../../support/fixtures';

test.describe('Story 1.10: Desktop Breakpoint (>=1280px)', () => {
  // Run all tests at desktop 1920x1080 viewport
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.describe('AC#1: Sidebar 280px with full text labels', () => {
    test('1.10-E2E-001: sidebar is 280px wide at 1920x1080', async ({ page, log }) => {
      await log.step('Navigate to homepage at 1920x1080 viewport');
      await page.goto('/');

      await log.step('Verify sidebar width');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(280);
    });

    test('1.10-E2E-002: sidebar text labels are visible', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify text labels are visible in sidebar');
      const sidebar = page.getByTestId('sidebar');
      const inboxText = sidebar.locator('text=Inbox').first();

      await expect(inboxText).toBeVisible();
    });

    test('1.10-E2E-003: sidebar navigation items have icons and labels', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify nav item has both icon and text');
      const inboxIcon = page.getByTestId('inbox-icon');
      await expect(inboxIcon).toBeVisible();

      // Text should also be visible at desktop breakpoint
      const sidebar = page.getByTestId('sidebar');
      const inboxLabel = sidebar.locator('text=Inbox');
      await expect(inboxLabel).toBeVisible();
    });

    test('1.10-E2E-004: sidebar is 280px at minimum desktop width (1280px)', async ({ page, log }) => {
      await log.step('Set viewport to 1280px');
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');

      await log.step('Verify sidebar is expanded');
      const sidebar = page.getByTestId('sidebar');
      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(280);
    });
  });

  test.describe('AC#2: Chat column fills remaining space', () => {
    test('1.10-E2E-005: chat column visible and fills space', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat column is visible');
      // ChatColumn uses <main> with "Chat conversation" aria-label
      const chatColumn = page.getByRole('main', { name: 'Chat conversation' });
      await expect(chatColumn).toBeVisible();
    });

    test('1.10-E2E-006: chat column has minimum 400px width', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat column min-width');
      const chatColumn = page.getByRole('main', { name: 'Chat conversation' });
      const box = await chatColumn.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(400);
    });

    test('1.10-E2E-007: chat input is visible at bottom', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat input is visible');
      const chatInput = page.getByTestId('chat-input');
      await expect(chatInput).toBeVisible();
    });
  });

  test.describe('AC#3: Canvas column 480px when open', () => {
    test('1.10-E2E-008: canvas column is approximately 480px wide when open', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Wait for store to be available');
      await page.waitForFunction(() => {
        return (window as unknown as { __CANVAS_STORE__?: unknown }).__CANVAS_STORE__ !== undefined;
      });

      await log.step('Open canvas via store');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Wait for canvas animation to complete');
      await page.waitForTimeout(350);

      await log.step('Verify canvas width is around 480px (allowing for borders/scrollbars)');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toBeVisible();

      const box = await canvas.boundingBox();
      // Canvas width should be close to 480px (may be slightly less due to borders/scrollbars)
      expect(box?.width).toBeGreaterThanOrEqual(460);
      expect(box?.width).toBeLessThanOrEqual(500);
    });

    test('1.10-E2E-009: canvas is NOT in fixed position at desktop', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas uses static/relative positioning (not overlay)');
      const canvas = page.getByTestId('canvas-column');
      const position = await canvas.evaluate(el =>
        window.getComputedStyle(el).position
      );

      // At desktop, canvas should NOT be fixed - uses normal flex layout
      expect(position).not.toBe('fixed');
    });

    test('1.10-E2E-010: no backdrop overlay at desktop', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify no backdrop at desktop');
      const backdrop = page.getByTestId('canvas-backdrop');
      // Backdrop should not be visible at desktop breakpoint
      await expect(backdrop).not.toBeVisible();
    });
  });

  test.describe('AC#4: Three-column layout inline', () => {
    test('1.10-E2E-011: all three columns visible simultaneously', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify all three columns are visible');
      const sidebar = page.getByTestId('sidebar');
      const chatColumn = page.getByRole('main', { name: 'Chat conversation' });
      const canvas = page.getByTestId('canvas-column');

      await expect(sidebar).toBeVisible();
      await expect(chatColumn).toBeVisible();
      await expect(canvas).toBeVisible();
    });

    test('1.10-E2E-012: columns are horizontally arranged', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify columns are side-by-side');
      const sidebar = page.getByTestId('sidebar');
      const canvas = page.getByTestId('canvas-column');

      const sidebarBox = await sidebar.boundingBox();
      const canvasBox = await canvas.boundingBox();

      // Canvas should be to the right of sidebar
      expect(canvasBox!.x).toBeGreaterThan(sidebarBox!.x + sidebarBox!.width);
    });

    test('1.10-E2E-013: no hamburger menu visible at desktop', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify no hamburger menu');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await expect(hamburgerMenu).not.toBeVisible();
    });

    test('1.10-E2E-014: no tablet header visible at desktop', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify no tablet header');
      const tabletHeader = page.getByTestId('tablet-header');
      await expect(tabletHeader).not.toBeVisible();
    });
  });

  test.describe('AC#5: No horizontal scrolling', () => {
    test('1.10-E2E-015: no horizontal scrollbar at 1920x1080', async ({ page, log }) => {
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

    test('1.10-E2E-016: no horizontal scrollbar at 1280px (min desktop)', async ({ page, log }) => {
      await log.step('Set viewport to 1280px');
      await page.setViewportSize({ width: 1280, height: 800 });
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

    test('1.10-E2E-017: no horizontal scroll with canvas open', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

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

  test.describe('Accessibility at desktop', () => {
    test('1.10-E2E-018: sidebar navigation is keyboard accessible', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Focus on first nav item via keyboard');
      await page.keyboard.press('Tab');

      await log.step('Verify sidebar item can be focused');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('1.10-E2E-019: chat input is keyboard accessible', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Focus chat input');
      const chatInput = page.getByTestId('chat-input');
      await chatInput.focus();

      await log.step('Verify chat input is focused');
      await expect(chatInput).toBeFocused();
    });

    test('1.10-E2E-020: main content area has correct ARIA landmark', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify main landmark');
      const mainContent = page.getByRole('main', { name: 'Chat conversation' });
      await expect(mainContent).toBeVisible();
    });
  });
});
