/**
 * Custom Fixtures for Orion Butler
 *
 * Project-specific fixtures for testing the Claude Agent SDK harness.
 *
 * @see TEA knowledge: fixture-architecture.md
 */
import { test as base } from '@playwright/test';
import { SessionFactory } from './factories/session-factory';
import { TaskFactory } from './factories/task-factory';

// Simple log utility for test steps
const createLogger = (testInfo: { title: string }) => ({
  step: async (message: string) => {
    console.log(`[${testInfo.title}] ${message}`);
  },
});

// Poll utility for async operations
type PollOptions = { timeout?: number; interval?: number };
const createRecurse = () => {
  return async <T>(
    fn: () => Promise<T>,
    predicate: (result: T) => boolean,
    options: PollOptions = {},
  ): Promise<T> => {
    const { timeout = 30000, interval = 1000 } = options;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const result = await fn();
      if (predicate(result)) {
        return result;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Polling timed out after ${timeout}ms`);
  };
};

type OrionFixtures = {
  sessionFactory: SessionFactory;
  taskFactory: TaskFactory;
  testEnv: {
    baseUrl: string;
    apiUrl: string;
  };
  log: { step: (message: string) => Promise<void> };
  recurse: ReturnType<typeof createRecurse>;
};

export const test = base.extend<OrionFixtures>({
  // Session factory for creating test sessions
  sessionFactory: async ({}, use) => {
    const factory = new SessionFactory();
    await use(factory);
    await factory.cleanup();
  },

  // Task factory for creating test tasks/inbox items
  taskFactory: async ({}, use) => {
    const factory = new TaskFactory();
    await use(factory);
    await factory.cleanup();
  },

  // Environment configuration
  testEnv: async ({}, use) => {
    await use({
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    });
  },

  // Simple logging utility
  log: async ({}, use, testInfo) => {
    await use(createLogger(testInfo));
  },

  // Polling utility for async operations
  recurse: async ({}, use) => {
    await use(createRecurse());
  },
});
