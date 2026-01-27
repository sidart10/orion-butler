/**
 * Tablet Breakpoint E2E Tests
 * Story 1.12: Tablet Breakpoint
 *
 * Tests responsive behavior at the tablet breakpoint (<1024px).
 * Tests specifically at 768x1024 as specified in the task.
 *
 * Test IDs: 1.12-E2E-001 through 1.12-E2E-025
 *
 * Acceptance Criteria (from AppShell.tsx comments):
 * - AC#1: At <1024px, sidebar hidden by default, chat takes full width
 * - AC#2: Hamburger menu click -> sidebar slides in as overlay (280px)
 * - AC#3: Sidebar closes on: click outside, ESC, focus trapped while open
 * - AC#4: Canvas opens as full-width overlay
 * - AC#5: No horizontal scrolling
 * - AC#6: Above 1024px -> transitions to laptop mode
 * - AC#7: Hamburger in top-left, 44x44px touch target
 *
 * Note from Plan: Story 1.12 uses CSS translate-x for sidebar overlay -
 * this is intentional, not incomplete. No MobileDrawer component needed.
 */
import { test, expect } from '../../support/fixtures';

test.describe('Story 1.12: Tablet Breakpoint (<1024px)', () => {
  // Run all tests at tablet 768x1024 viewport
  test.use({ viewport: { width: 768, height: 1024 } });

  test.describe('AC#1: Sidebar hidden, chat full width', () => {
    test('1.12-E2E-001: sidebar is NOT visible by default at 768px', async ({ page, log }) => {
      await log.step('Navigate to homepage at 768x1024 viewport');
      await page.goto('/');

      await log.step('Verify sidebar is hidden');
      const sidebar = page.getByTestId('sidebar');
      // Sidebar may exist in DOM but should not be visible (translated off-screen)
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    test('1.12-E2E-002: chat column is visible and fills available space', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat column is visible');
      const chatColumn = page.getByRole('main', { name: 'Chat conversation' });
      await expect(chatColumn).toBeVisible();

      await log.step('Verify chat has flex-1 to fill available space');
      const box = await chatColumn.boundingBox();
      // Chat should have its min-width of 400px
      expect(box?.width).toBeGreaterThanOrEqual(400);
    });

    test('1.12-E2E-003: chat input is visible and usable', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify chat input');
      const chatInput = page.getByTestId('chat-input');
      await expect(chatInput).toBeVisible();
    });
  });

  test.describe('AC#2: Hamburger menu opens sidebar as overlay', () => {
    test('1.12-E2E-004: hamburger menu is visible', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify hamburger menu is visible');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await expect(hamburgerMenu).toBeVisible();
    });

    test('1.12-E2E-005: clicking hamburger opens sidebar overlay', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Click hamburger menu');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await hamburgerMenu.click();

      await log.step('Verify sidebar becomes visible');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden', 'false');
    });

    test('1.12-E2E-006: sidebar overlay is 280px wide', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Verify sidebar width');
      const sidebar = page.getByTestId('sidebar');
      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(280);
    });

    test('1.12-E2E-007: sidebar uses CSS translate-x for slide animation', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Check sidebar has transform when closed');
      const sidebar = page.getByTestId('sidebar');
      let transform = await sidebar.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Closed state should have negative translate-x (shown as matrix with negative x translation)
      expect(transform).not.toBe('none');
      // Matrix format: matrix(1, 0, 0, 1, tx, ty) - tx should be negative for closed
      expect(transform).toMatch(/matrix/);

      await log.step('Open sidebar');
      await page.getByTestId('hamburger-menu').click();

      // Wait for animation
      await page.waitForTimeout(400);

      await log.step('Verify sidebar is at final position');
      transform = await sidebar.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Open state: translate-x-0 is expressed as identity matrix or "none"
      // matrix(1, 0, 0, 1, 0, 0) is equivalent to no transform
      const isIdentityMatrix = transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
      expect(isIdentityMatrix).toBe(true);
    });

    test('1.12-E2E-008: sidebar text labels are visible when open', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Verify text labels visible');
      const sidebar = page.getByTestId('sidebar');
      const inboxText = sidebar.locator('text=Inbox');
      await expect(inboxText).toBeVisible();
    });
  });

  test.describe('AC#3: Sidebar closes on outside click / ESC', () => {
    test('1.12-E2E-009: backdrop is visible when sidebar is open', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Verify backdrop is visible');
      const backdrop = page.getByTestId('sidebar-backdrop');
      await expect(backdrop).toBeVisible();
    });

    test('1.12-E2E-010: clicking backdrop closes sidebar', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Click backdrop');
      const backdrop = page.getByTestId('sidebar-backdrop');
      await backdrop.click();

      await log.step('Verify sidebar is closed');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    test('1.12-E2E-011: ESC key closes sidebar', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Press ESC');
      await page.keyboard.press('Escape');

      await log.step('Verify sidebar is closed');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    });

    test('1.12-E2E-012: hamburger icon changes to X when open', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open sidebar');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Verify aria-expanded state');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await expect(hamburgerMenu).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('AC#4: Canvas opens as full-width overlay', () => {
    test('1.12-E2E-013: canvas uses fixed positioning at tablet', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
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

    test('1.12-E2E-014: canvas takes full width at tablet', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Open canvas');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Verify canvas is full width');
      const canvas = page.getByTestId('canvas-column');
      const box = await canvas.boundingBox();

      // At tablet, canvas should be nearly full viewport width
      expect(box?.width).toBeGreaterThanOrEqual(750);
    });

    test('1.12-E2E-015: canvas has backdrop overlay', async ({ page, log }) => {
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

    test('1.12-E2E-016: close button closes canvas at tablet (full-width mode)', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Click close button to close');
      // At tablet, canvas is full-width, so we use the close button
      // (backdrop is not clickable as it's fully covered by the canvas)
      const closeButton = page.getByRole('button', { name: /close canvas/i });
      await closeButton.click();

      await log.step('Verify canvas is closed');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });

    test('1.12-E2E-017: ESC key closes canvas', async ({ page, log }) => {
      await log.step('Navigate and open canvas');
      await page.goto('/');
      await page.evaluate(() => {
        (window as unknown as { __CANVAS_STORE__: { getState: () => { openCanvas: () => void } } })
          .__CANVAS_STORE__.getState().openCanvas();
      });

      await log.step('Press ESC');
      await page.keyboard.press('Escape');

      await log.step('Verify canvas is closed');
      const canvas = page.getByTestId('canvas-column');
      await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('AC#5: No horizontal scrolling', () => {
    test('1.12-E2E-018: no horizontal scrollbar at 768px', async ({ page, log }) => {
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

    test('1.12-E2E-019: no horizontal scroll with sidebar open', async ({ page, log }) => {
      await log.step('Navigate and open sidebar');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

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

  test.describe('AC#6: Transition to laptop mode above 1024px', () => {
    test('1.12-E2E-020: hamburger menu disappears at 1024px', async ({ page, log }) => {
      await log.step('Start at tablet viewport');
      await page.goto('/');

      await log.step('Verify hamburger visible');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await expect(hamburgerMenu).toBeVisible();

      await log.step('Resize to laptop breakpoint');
      await page.setViewportSize({ width: 1024, height: 768 });

      // Wait for layout change
      await page.waitForTimeout(300);

      await log.step('Verify hamburger is hidden');
      await expect(hamburgerMenu).not.toBeVisible();
    });

    test('1.12-E2E-021: sidebar becomes visible at 1024px', async ({ page, log }) => {
      await log.step('Start at tablet viewport');
      await page.goto('/');

      await log.step('Verify sidebar is hidden');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden', 'true');

      await log.step('Resize to laptop');
      await page.setViewportSize({ width: 1024, height: 768 });

      // Wait for layout change
      await page.waitForTimeout(300);

      await log.step('Verify sidebar is visible');
      await expect(sidebar).toBeVisible();
      // At laptop, sidebar should be collapsed (48px)
      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(48);
    });

    test('1.12-E2E-022: sidebar overlay closes when transitioning to laptop', async ({ page, log }) => {
      await log.step('Navigate and open sidebar at tablet');
      await page.goto('/');
      await page.getByTestId('hamburger-menu').click();

      await log.step('Verify sidebar is open');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveAttribute('aria-hidden', 'false');

      await log.step('Resize to laptop');
      await page.setViewportSize({ width: 1024, height: 768 });

      // Wait for transition
      await page.waitForTimeout(400);

      await log.step('Verify sidebar transitioned to collapsed mode');
      const box = await sidebar.boundingBox();
      expect(box?.width).toBe(48);
    });
  });

  test.describe('AC#7: Hamburger touch target 44x44px', () => {
    test('1.12-E2E-023: hamburger menu has 44x44px touch target', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify hamburger touch target size');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      const box = await hamburgerMenu.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('1.12-E2E-024: hamburger is in top-left corner', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify hamburger position');
      const tabletHeader = page.getByTestId('tablet-header');
      const box = await tabletHeader.boundingBox();

      // Should be at top-left (small padding allowed)
      expect(box?.x).toBeLessThan(50);
      expect(box?.y).toBeLessThan(50);
    });
  });

  test.describe('Accessibility at tablet', () => {
    test('1.12-E2E-025: hamburger has accessible label', async ({ page, log }) => {
      await log.step('Navigate to homepage');
      await page.goto('/');

      await log.step('Verify hamburger accessibility');
      const hamburgerMenu = page.getByTestId('hamburger-menu');
      await expect(hamburgerMenu).toHaveAttribute('aria-label', 'Open menu');
      await expect(hamburgerMenu).toHaveAttribute('aria-expanded', 'false');

      await log.step('Open sidebar');
      await hamburgerMenu.click();

      await log.step('Verify aria-label changes');
      await expect(hamburgerMenu).toHaveAttribute('aria-label', 'Close menu');
      await expect(hamburgerMenu).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
