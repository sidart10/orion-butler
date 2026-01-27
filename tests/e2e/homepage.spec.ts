/**
 * Homepage E2E Tests
 *
 * Tests for the main Orion Butler interface.
 * Demonstrates fixture usage and selector patterns.
 *
 * @see TEA knowledge: test-quality.md
 */
import { test, expect } from '../support/fixtures';

test.describe('Orion Homepage', () => {
  test('should load the application', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify page title');
    await expect(page).toHaveTitle(/Orion/i);
  });

  test('should display chat interface', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify chat input is visible');
    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();

    await log.step('Verify sidebar is visible');
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should support quick capture with Cmd+N', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Press Cmd+N for quick capture');
    await page.keyboard.press('Meta+n');

    await log.step('Verify quick capture input appears');
    const quickCapture = page.getByTestId('quick-capture-input');
    await expect(quickCapture).toBeVisible();
    await expect(quickCapture).toBeFocused();
  });
});

test.describe('GTD Sidebar', () => {
  test('should display GTD categories', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Verify GTD categories in sidebar');
    await expect(page.getByTestId('gtd-inbox')).toBeVisible();
    await expect(page.getByTestId('gtd-next-actions')).toBeVisible();
    await expect(page.getByTestId('gtd-projects')).toBeVisible();
    await expect(page.getByTestId('gtd-waiting-for')).toBeVisible();
    await expect(page.getByTestId('gtd-someday-maybe')).toBeVisible();
  });

  test('should navigate to inbox when clicked', async ({ page, log }) => {
    await log.step('Navigate to homepage');
    await page.goto('/');

    await log.step('Click on Inbox category');
    await page.getByTestId('gtd-inbox').click();

    await log.step('Verify inbox view is active');
    await expect(page).toHaveURL(/\/inbox/);
  });
});
