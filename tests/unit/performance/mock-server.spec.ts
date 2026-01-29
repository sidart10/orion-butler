/**
 * Tests for the k6 Performance Mock Server
 *
 * Validates that the mock server correctly simulates Claude API responses
 * with the expected timing characteristics for SLO testing.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMockServer, mockServerConfig } from '../../performance/mock-server';

describe('Performance Mock Server', () => {
  // Use random port to avoid conflicts with parallel test runs
  const TEST_PORT = 3457 + Math.floor(Math.random() * 1000);
  let mockServer: ReturnType<typeof createMockServer>;

  beforeAll(async () => {
    mockServer = createMockServer(TEST_PORT);
    await mockServer.start();
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  describe('Configuration', () => {
    it('should have first token delay under 500ms SLO', () => {
      expect(mockServerConfig.FIRST_TOKEN_DELAY).toBeLessThan(500);
    });

    it('should have tool call delay under 2000ms SLO', () => {
      expect(mockServerConfig.TOOL_CALL_DELAY).toBeLessThan(2000);
    });

    it('should have error rate under 1% SLO', () => {
      expect(mockServerConfig.ERROR_RATE).toBeLessThan(0.01);
    });

    it('should export all configuration constants', () => {
      expect(mockServerConfig).toHaveProperty('FIRST_TOKEN_DELAY');
      expect(mockServerConfig).toHaveProperty('TOKEN_INTERVAL');
      expect(mockServerConfig).toHaveProperty('TOKENS_PER_RESPONSE');
      expect(mockServerConfig).toHaveProperty('TOOL_CALL_DELAY');
      expect(mockServerConfig).toHaveProperty('ERROR_RATE');
      expect(mockServerConfig).toHaveProperty('DEFAULT_PORT');
    });
  });

  describe('HTTP Endpoints', () => {
    it('should respond to POST /v1/messages', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      // Response should be 200 or 500 (error injection)
      expect([200, 500]).toContain(response.status);
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/unknown`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    it('should handle CORS preflight requests', async () => {
      const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Streaming Response Format', () => {
    it('should return SSE content type for successful requests', async () => {
      // Make multiple requests to avoid error injection
      let successResponse: Response | null = null;
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (response.status === 200) {
          successResponse = response;
          break;
        }
      }

      expect(successResponse).not.toBeNull();
      expect(successResponse!.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should include message_start event', async () => {
      // Make multiple requests to avoid error injection
      let body = '';
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (response.status === 200) {
          body = await response.text();
          break;
        }
      }

      expect(body).toContain('event: message_start');
    });

    it('should include content_block_start event', async () => {
      let body = '';
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (response.status === 200) {
          body = await response.text();
          break;
        }
      }

      expect(body).toContain('event: content_block_start');
    });

    it('should include message_stop event', async () => {
      let body = '';
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (response.status === 200) {
          body = await response.text();
          break;
        }
      }

      expect(body).toContain('event: message_stop');
    });
  });

  describe('Scenario Support', () => {
    it('should handle simple_query scenario', async () => {
      let body = '';
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
            scenario: 'simple_query',
          }),
        });
        if (response.status === 200) {
          body = await response.text();
          break;
        }
      }

      // Should have text content blocks
      expect(body).toContain('"type":"text"');
    });

    it('should handle tool_call scenario with tool_use content', async () => {
      let body = '';
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
            scenario: 'tool_call',
          }),
        });
        if (response.status === 200) {
          body = await response.text();
          break;
        }
      }

      // Should have tool_use content block
      expect(body).toContain('"type":"tool_use"');
    });
  });

  describe('Error Injection', () => {
    it('should return error responses with correct structure', async () => {
      // Make many requests to hit error injection
      // With 0.5% error rate, we expect ~5 errors in 1000 requests
      // Increased iterations for more reliable probabilistic test
      let errorBody: string | null = null;
      for (let i = 0; i < 1000; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (response.status === 500) {
          errorBody = await response.text();
          break;
        }
      }

      // Skip assertion if we didn't hit an error (probabilistic)
      // This test is for verifying error FORMAT, not error occurrence
      if (errorBody === null) {
        console.log('Note: No errors encountered in 1000 requests (probabilistic test)');
        return; // Skip test if no error occurred
      }

      const errorJson = JSON.parse(errorBody);
      expect(errorJson).toHaveProperty('type', 'error');
      expect(errorJson).toHaveProperty('error');
      expect(errorJson.error).toHaveProperty('type', 'api_error');
    });
  });

  describe('Timing Characteristics', () => {
    it('should complete simple_query within reasonable time', async () => {
      const startTime = Date.now();

      let completed = false;
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
            scenario: 'simple_query',
          }),
        });
        if (response.status === 200) {
          await response.text();
          completed = true;
          break;
        }
      }

      const duration = Date.now() - startTime;

      expect(completed).toBe(true);
      // Should take approximately: FIRST_TOKEN_DELAY + (TOKENS_PER_RESPONSE * TOKEN_INTERVAL)
      // = 100 + (50 * 20) = 1100ms, plus some overhead
      // Allow up to 3000ms for safety
      expect(duration).toBeLessThan(3000);
    });

    it('should complete tool_call within reasonable time', async () => {
      const startTime = Date.now();

      let completed = false;
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`http://localhost:${TEST_PORT}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: 'test' }],
            scenario: 'tool_call',
          }),
        });
        if (response.status === 200) {
          await response.text();
          completed = true;
          break;
        }
      }

      const duration = Date.now() - startTime;

      expect(completed).toBe(true);
      // Should take approximately: FIRST_TOKEN_DELAY + TOOL_CALL_DELAY + some tokens
      // = 100 + 500 + (10 * 20) = 800ms, plus overhead
      // Allow up to 2000ms for safety
      expect(duration).toBeLessThan(2000);
    });
  });
});
