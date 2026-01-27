/**
 * Cold Start Performance Tests - Epic 1 Story 1.1
 *
 * Tests that verify NFR-1.2 (cold start < 3 seconds).
 * These tests should FAIL until the scaffold is created and running.
 *
 * Test IDs: CS-001 through CS-003
 *
 * Prerequisites:
 * - Dev server must be running: npm run dev
 * - Application must have data-testid="app-ready" element
 */
import { test, expect } from '@playwright/test';

test.describe('Cold Start Performance (NFR-1.2)', () => {
  test('CS-001: should cold start in under 3 seconds', async ({ page }) => {
    const NFR_1_2_TARGET = 3000; // 3 seconds in ms

    const startTime = Date.now();

    // Navigate to the app (dev server must be running)
    await page.goto('/');

    // Wait for the app to be interactive (look for a known element)
    await page.waitForSelector('[data-testid="app-ready"]', {
      timeout: NFR_1_2_TARGET,
      state: 'visible',
    });

    const loadTime = Date.now() - startTime;

    console.log(`Cold start time: ${loadTime}ms (target: <${NFR_1_2_TARGET}ms)`);
    expect(loadTime).toBeLessThan(NFR_1_2_TARGET);
  });

  test('CS-002: should render main window', async ({ page }) => {
    await page.goto('/');

    // Verify basic structure is rendered
    await expect(page.locator('body')).toBeVisible();

    // Should have either sidebar or main content area
    const hasMainUI = await page.locator('[data-testid="sidebar"], [data-testid="main-content"], main').count();
    expect(hasMainUI).toBeGreaterThan(0);
  });

  test('CS-003: should show content quickly', async ({ page }) => {
    const FIRST_PAINT_TARGET = 1000; // 1 second for first meaningful paint

    const startTime = Date.now();
    await page.goto('/');

    // Wait for main content to be visible (first meaningful paint)
    await page.waitForSelector('[data-testid="main-content"], main', {
      timeout: FIRST_PAINT_TARGET,
      state: 'visible',
    });

    const firstPaintTime = Date.now() - startTime;
    console.log(`First paint time: ${firstPaintTime}ms (target: <${FIRST_PAINT_TARGET}ms)`);
    expect(firstPaintTime).toBeLessThan(FIRST_PAINT_TARGET);
  });
});
