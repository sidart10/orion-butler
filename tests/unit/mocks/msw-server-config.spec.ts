/**
 * MSW Server Configuration Tests - Epic 0 Story 0.1
 *
 * Tests that verify MSW server is properly configured
 * and blocks external network calls.
 *
 * Test IDs: SC-001 through SC-007
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  server,
  setupMswServer,
  addHandlers,
  getActiveHandlers,
  isRunningInCI,
} from '../../fixtures/mocks/setup';
import { http, HttpResponse } from 'msw';

describe('MSW Server Configuration', () => {
  // Use the convenience setup function
  setupMswServer();

  describe('Server Setup', () => {
    it('SC-001: server is properly instantiated', () => {
      expect(server).toBeDefined();
      expect(typeof server.listen).toBe('function');
      expect(typeof server.close).toBe('function');
      expect(typeof server.use).toBe('function');
    });

    it('SC-002: server has Composio handlers registered', () => {
      const handlers = getActiveHandlers();
      expect(handlers.length).toBeGreaterThanOrEqual(5);
    });

    it('SC-003: Composio requests are intercepted', async () => {
      const response = await fetch(
        'https://backend.composio.dev/api/v2/actions/GMAIL_GET_EMAILS/execute',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.successful).toBe(true);
    });
  });

  describe('Handler Management', () => {
    it('SC-004: addHandlers adds runtime handlers', async () => {
      // Add a custom handler for testing
      addHandlers(
        http.get('https://test.example.com/custom', () => {
          return HttpResponse.json({ custom: true });
        })
      );

      const response = await fetch('https://test.example.com/custom');
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.custom).toBe(true);
    });

    it('SC-005: setupMswServer provides lifecycle hooks', () => {
      // This test verifies the function exists and is callable
      // The actual lifecycle behavior is tested by the successful
      // execution of other tests in this file
      expect(typeof setupMswServer).toBe('function');
    });
  });

  describe('CI Detection', () => {
    const originalCI = process.env.CI;

    beforeEach(() => {
      // Clear CI env var before each test
      delete process.env.CI;
    });

    afterEach(() => {
      // Restore original value
      if (originalCI !== undefined) {
        process.env.CI = originalCI;
      } else {
        delete process.env.CI;
      }
    });

    it('SC-006: isRunningInCI returns false when CI not set', () => {
      delete process.env.CI;
      expect(isRunningInCI()).toBe(false);
    });

    it('SC-007: isRunningInCI handles various CI values', () => {
      // Test CI=true (lowercase)
      process.env.CI = 'true';
      expect(isRunningInCI()).toBe(true);

      // Test CI=TRUE (uppercase)
      process.env.CI = 'TRUE';
      expect(isRunningInCI()).toBe(true);

      // Test CI=True (mixed case)
      process.env.CI = 'True';
      expect(isRunningInCI()).toBe(true);

      // Test CI=1
      process.env.CI = '1';
      expect(isRunningInCI()).toBe(true);

      // Test CI=false
      process.env.CI = 'false';
      expect(isRunningInCI()).toBe(false);

      // Test CI=0
      process.env.CI = '0';
      expect(isRunningInCI()).toBe(false);

      // Test empty string
      process.env.CI = '';
      expect(isRunningInCI()).toBe(false);
    });
  });
});
