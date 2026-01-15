/**
 * Custom Assertions for Orion E2E Tests
 *
 * Agent-browser optimized assertions using snapshot refs
 */

import { AgentBrowserClient, BrowserSnapshot, ElementRef } from '../browser-agent/client';

/**
 * Assert element exists in snapshot by ref
 */
export function assertRefExists(snapshot: BrowserSnapshot, ref: string): ElementRef {
  const element = snapshot.refs[ref];
  if (!element) {
    throw new Error(`Element ${ref} not found in snapshot. Available refs: ${Object.keys(snapshot.refs).join(', ')}`);
  }
  return element;
}

/**
 * Assert element with specific role exists
 */
export function assertRole(snapshot: BrowserSnapshot, role: string, options?: { name?: string }): ElementRef {
  const elements = Object.values(snapshot.refs).filter((el) => el.role === role);

  if (elements.length === 0) {
    throw new Error(`No element with role "${role}" found`);
  }

  if (options?.name) {
    const match = elements.find((el) => el.name?.includes(options.name!));
    if (!match) {
      throw new Error(`No element with role "${role}" and name containing "${options.name}" found`);
    }
    return match;
  }

  return elements[0];
}

/**
 * Assert current URL matches pattern
 */
export async function assertUrl(browser: AgentBrowserClient, pattern: string | RegExp): Promise<void> {
  const url = await browser.url();

  if (typeof pattern === 'string') {
    if (!url.includes(pattern)) {
      throw new Error(`Expected URL to contain "${pattern}", got "${url}"`);
    }
  } else {
    if (!pattern.test(url)) {
      throw new Error(`Expected URL to match ${pattern}, got "${url}"`);
    }
  }
}

/**
 * Assert page title matches
 */
export async function assertTitle(browser: AgentBrowserClient, expected: string | RegExp): Promise<void> {
  const title = await browser.title();

  if (typeof expected === 'string') {
    if (title !== expected) {
      throw new Error(`Expected title "${expected}", got "${title}"`);
    }
  } else {
    if (!expected.test(title)) {
      throw new Error(`Expected title to match ${expected}, got "${title}"`);
    }
  }
}

/**
 * Assert snapshot contains text
 */
export function assertTextExists(snapshot: BrowserSnapshot, text: string): ElementRef {
  const element = Object.values(snapshot.refs).find((el) => el.text?.includes(text) || el.name?.includes(text));

  if (!element) {
    throw new Error(`Text "${text}" not found in snapshot`);
  }

  return element;
}

/**
 * Assert element count matches expected
 */
export function assertElementCount(snapshot: BrowserSnapshot, role: string, expected: number): void {
  const count = Object.values(snapshot.refs).filter((el) => el.role === role).length;

  if (count !== expected) {
    throw new Error(`Expected ${expected} elements with role "${role}", found ${count}`);
  }
}
