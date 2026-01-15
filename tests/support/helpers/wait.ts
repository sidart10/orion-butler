/**
 * Wait Utilities for E2E Tests
 *
 * Deterministic waiting patterns to avoid flaky tests
 */

import { AgentBrowserClient, BrowserSnapshot } from '../browser-agent/client';

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  fn: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number; message?: string } = {}
): Promise<void> {
  const { timeout = 10000, interval = 100, message = 'Condition not met' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await fn()) return;
    await sleep(interval);
  }

  throw new Error(`Timeout: ${message}`);
}

/**
 * Wait for snapshot to contain element with role
 */
export async function waitForRole(
  browser: AgentBrowserClient,
  role: string,
  options: { timeout?: number; name?: string } = {}
): Promise<BrowserSnapshot> {
  const { timeout = 10000, name } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const snapshot = await browser.snapshot();
    const elements = Object.values(snapshot.refs).filter((el) => el.role === role);

    if (elements.length > 0) {
      if (!name || elements.some((el) => el.name?.includes(name))) {
        return snapshot;
      }
    }

    await sleep(500);
  }

  throw new Error(`Timeout waiting for element with role "${role}"${name ? ` and name "${name}"` : ''}`);
}

/**
 * Wait for text to appear in snapshot
 */
export async function waitForText(
  browser: AgentBrowserClient,
  text: string,
  options: { timeout?: number } = {}
): Promise<BrowserSnapshot> {
  const { timeout = 10000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const snapshot = await browser.snapshot();
    const hasText = Object.values(snapshot.refs).some(
      (el) => el.text?.includes(text) || el.name?.includes(text)
    );

    if (hasText) return snapshot;
    await sleep(500);
  }

  throw new Error(`Timeout waiting for text "${text}"`);
}

/**
 * Wait for URL to match pattern
 */
export async function waitForUrl(
  browser: AgentBrowserClient,
  pattern: string | RegExp,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 10000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const url = await browser.url();

    if (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)) {
      return;
    }

    await sleep(500);
  }

  throw new Error(`Timeout waiting for URL to match ${pattern}`);
}

/**
 * Wait for navigation to settle (no pending requests)
 */
export async function waitForNetworkIdle(
  browser: AgentBrowserClient,
  options: { timeout?: number; idleTime?: number } = {}
): Promise<void> {
  const { timeout = 10000, idleTime = 500 } = options;

  await browser.waitForNavigation({ timeout });
  await sleep(idleTime); // Extra buffer for XHR/fetch to settle
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or times out
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 1.5 } = options;
  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      if (i < retries - 1) {
        await sleep(currentDelay);
        currentDelay *= backoff;
      }
    }
  }

  throw lastError;
}
