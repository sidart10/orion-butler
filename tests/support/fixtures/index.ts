/**
 * Merged Fixtures for Orion Butler Tests
 *
 * Combines playwright-utils fixtures with custom project fixtures.
 * Import { test, expect } from this file in all test files.
 *
 * @see TEA knowledge: fixtures-composition.md
 */
import { mergeTests, test as base } from '@playwright/test';
import { apiRequest } from '@seontechnologies/playwright-utils';
import { test as customFixtures } from './custom-fixtures';

// Define API fixture types
type ApiFixtures = {
  apiRequest: typeof apiRequest;
};

// Extend base test with API utilities
const apiFixtures = base.extend<ApiFixtures>({
  apiRequest: async ({ request }, use) => {
    // Create wrapper that injects request context
    const wrappedApiRequest = async (options: Parameters<typeof apiRequest>[0]) => {
      return apiRequest({
        ...options,
        request,
      });
    };
    await use(wrappedApiRequest as typeof apiRequest);
  },
});

// Merge all fixtures into single test object
export const test = mergeTests(apiFixtures, customFixtures);

export { expect } from '@playwright/test';
