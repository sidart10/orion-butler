/**
 * Agent-Browser E2E Test Runner
 *
 * CLI-based E2E test execution using agent-browser.
 * Designed for AI-agent workflow: snapshot → parse → act → observe
 *
 * Usage:
 *   npx tsx tests/support/browser-agent/e2e-runner.ts tests/e2e/*.test.ts
 */

import { AgentBrowserClient, createBrowser, withBrowser } from './client';
import { glob } from 'glob';
import path from 'path';

// ============================================================
// Test Definition Types
// ============================================================

export interface TestCase {
  name: string;
  fn: (browser: AgentBrowserClient) => Promise<void>;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeAll?: (browser: AgentBrowserClient) => Promise<void>;
  afterAll?: (browser: AgentBrowserClient) => Promise<void>;
  beforeEach?: (browser: AgentBrowserClient) => Promise<void>;
  afterEach?: (browser: AgentBrowserClient) => Promise<void>;
}

export interface TestResult {
  suite: string;
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

// ============================================================
// Test Registry & DSL
// ============================================================

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(name: string, fn: () => void): void {
  const suite: TestSuite = { name, tests: [] };
  currentSuite = suite;
  fn();
  suites.push(suite);
  currentSuite = null;
}

export function it(name: string, fn: (browser: AgentBrowserClient) => Promise<void>, options?: { timeout?: number }): void {
  if (!currentSuite) throw new Error('it() must be called inside describe()');
  currentSuite.tests.push({ name, fn, timeout: options?.timeout });
}

export function test(name: string, fn: (browser: AgentBrowserClient) => Promise<void>, options?: { timeout?: number }): void {
  it(name, fn, options);
}

export function beforeAll(fn: (browser: AgentBrowserClient) => Promise<void>): void {
  if (!currentSuite) throw new Error('beforeAll() must be called inside describe()');
  currentSuite.beforeAll = fn;
}

export function afterAll(fn: (browser: AgentBrowserClient) => Promise<void>): void {
  if (!currentSuite) throw new Error('afterAll() must be called inside describe()');
  currentSuite.afterAll = fn;
}

export function beforeEach(fn: (browser: AgentBrowserClient) => Promise<void>): void {
  if (!currentSuite) throw new Error('beforeEach() must be called inside describe()');
  currentSuite.beforeEach = fn;
}

export function afterEach(fn: (browser: AgentBrowserClient) => Promise<void>): void {
  if (!currentSuite) throw new Error('afterEach() must be called inside describe()');
  currentSuite.afterEach = fn;
}

// ============================================================
// Assertions
// ============================================================

export const expect = {
  toBe<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
  },

  toContain(actual: string, expected: string, message?: string): void {
    if (!actual.includes(expected)) {
      throw new Error(message || `Expected "${actual}" to contain "${expected}"`);
    }
  },

  toMatch(actual: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(actual)) {
      throw new Error(message || `Expected "${actual}" to match ${pattern}`);
    }
  },

  toBeTruthy(actual: unknown, message?: string): void {
    if (!actual) {
      throw new Error(message || `Expected ${actual} to be truthy`);
    }
  },

  toBeFalsy(actual: unknown, message?: string): void {
    if (actual) {
      throw new Error(message || `Expected ${actual} to be falsy`);
    }
  },

  toThrow(fn: () => unknown, message?: string): void {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (e) {
      // Expected
    }
  },
};

// ============================================================
// Test Runner
// ============================================================

export async function runTests(options: { bail?: boolean; filter?: string } = {}): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let shouldBail = false;

  for (const suite of suites) {
    if (shouldBail) break;

    // Filter tests if pattern provided
    const testsToRun = options.filter
      ? suite.tests.filter((t) => t.name.includes(options.filter!) || suite.name.includes(options.filter!))
      : suite.tests;

    if (testsToRun.length === 0) continue;

    console.log(`\n📦 ${suite.name}`);

    await withBrowser(async (browser) => {
      // Suite setup
      if (suite.beforeAll) {
        try {
          await suite.beforeAll(browser);
        } catch (e: any) {
          console.error(`  ❌ beforeAll failed: ${e.message}`);
          return;
        }
      }

      for (const test of testsToRun) {
        if (shouldBail) break;
        if (test.skip) {
          results.push({ suite: suite.name, test: test.name, status: 'skipped', duration: 0 });
          console.log(`  ⏭️  ${test.name} (skipped)`);
          continue;
        }

        const startTime = Date.now();

        // Test setup
        if (suite.beforeEach) {
          try {
            await suite.beforeEach(browser);
          } catch (e: any) {
            console.error(`  ❌ beforeEach failed: ${e.message}`);
            continue;
          }
        }

        try {
          await Promise.race([
            test.fn(browser),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Test timeout')), test.timeout || 30000)
            ),
          ]);

          const duration = Date.now() - startTime;
          results.push({ suite: suite.name, test: test.name, status: 'passed', duration });
          console.log(`  ✅ ${test.name} (${duration}ms)`);
        } catch (e: any) {
          const duration = Date.now() - startTime;
          results.push({
            suite: suite.name,
            test: test.name,
            status: 'failed',
            duration,
            error: e.message,
          });
          console.log(`  ❌ ${test.name} (${duration}ms)`);
          console.error(`     Error: ${e.message}`);

          if (options.bail) {
            shouldBail = true;
          }
        }

        // Test teardown
        if (suite.afterEach) {
          try {
            await suite.afterEach(browser);
          } catch (e: any) {
            console.error(`  ⚠️  afterEach failed: ${e.message}`);
          }
        }
      }

      // Suite teardown
      if (suite.afterAll) {
        try {
          await suite.afterAll(browser);
        } catch (e: any) {
          console.error(`  ⚠️  afterAll failed: ${e.message}`);
        }
      }
    });
  }

  return results;
}

// ============================================================
// CLI Entry Point
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const testPatterns = args.filter((a) => !a.startsWith('--'));
  const bail = args.includes('--bail');
  const filter = args.find((a) => a.startsWith('--filter='))?.split('=')[1];

  // Find test files
  const patterns = testPatterns.length > 0 ? testPatterns : ['tests/e2e/**/*.test.ts'];
  const testFiles: string[] = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern);
    testFiles.push(...matches);
  }

  if (testFiles.length === 0) {
    console.log('No test files found');
    process.exit(0);
  }

  console.log(`\n🧪 Running ${testFiles.length} test file(s)...\n`);

  // Load test files
  for (const file of testFiles) {
    const fullPath = path.resolve(file);
    await import(fullPath);
  }

  // Run tests
  const results = await runTests({ bail, filter });

  // Summary
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
}
