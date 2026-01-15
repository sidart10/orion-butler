/**
 * Test Fixtures Index
 *
 * Central export point for all test fixtures and utilities.
 * Pattern: Pure function → fixture → compose via mergeTests
 */

// Re-export browser client
export { AgentBrowserClient, createBrowser, withBrowser, type BrowserSnapshot, type ElementRef, type AgentBrowserOptions } from '../browser-agent/client';

// Re-export E2E test DSL
export { describe, it, test, beforeAll, afterAll, beforeEach, afterEach, expect, runTests, type TestCase, type TestSuite, type TestResult } from '../browser-agent/e2e-runner';

// Re-export helpers
export * from '../helpers/assertions';
export * from '../helpers/wait';
