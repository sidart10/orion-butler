/**
 * MSW Setup Tests - Epic 0 Story 0.1
 *
 * Tests that verify MSW is properly installed and configured
 * for mocking Composio MCP protocol calls.
 *
 * Test IDs: MSW-001 through MSW-003
 */
import { describe, it, expect } from 'vitest';

describe('MSW Setup', () => {
  it('MSW-001: msw package should be installed', async () => {
    // This test verifies MSW is installed as a dependency
    const msw = await import('msw');
    expect(msw.http).toBeDefined();
    expect(msw.HttpResponse).toBeDefined();
  });

  it('MSW-002: msw/node should be available for Node.js testing', async () => {
    // This test verifies MSW server is available for Vitest
    const { setupServer } = await import('msw/node');
    expect(setupServer).toBeDefined();
    expect(typeof setupServer).toBe('function');
  });

  it('MSW-003: can create a basic mock handler', async () => {
    const { http, HttpResponse } = await import('msw');
    const { setupServer } = await import('msw/node');

    // Create a simple handler
    const handlers = [
      http.get('https://api.test.com/ping', () => {
        return HttpResponse.json({ status: 'ok' });
      }),
    ];

    const server = setupServer(...handlers);

    // Verify server can be created
    expect(server).toBeDefined();
    expect(typeof server.listen).toBe('function');
    expect(typeof server.close).toBe('function');
  });
});
