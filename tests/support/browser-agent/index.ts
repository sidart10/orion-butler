/**
 * Agent-Browser Module Exports
 *
 * Use this module for both:
 * 1. E2E testing of Orion
 * 2. Orion's browser automation capabilities (agent tool)
 */

export { AgentBrowserClient, createBrowser, withBrowser, type BrowserSnapshot, type ElementRef, type AgentBrowserOptions } from './client';

export {
  describe,
  it,
  test,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  expect,
  runTests,
  type TestCase,
  type TestSuite,
  type TestResult,
} from './e2e-runner';
