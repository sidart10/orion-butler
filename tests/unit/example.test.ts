/**
 * Example Unit Test - Vitest Pattern
 *
 * Demonstrates unit testing patterns for Orion components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Example utility function to test
function formatMessage(text: string, sender: 'user' | 'agent'): { content: string; role: string; timestamp: number } {
  return {
    content: text,
    role: sender,
    timestamp: Date.now(),
  };
}

// Example async function to test
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (e: any) {
      lastError = e;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 100 * (i + 1))); // Exponential backoff
      }
    }
  }

  throw lastError;
}

describe('formatMessage', () => {
  it('should format user message correctly', () => {
    const result = formatMessage('Hello', 'user');

    expect(result.content).toBe('Hello');
    expect(result.role).toBe('user');
    expect(result.timestamp).toBeTypeOf('number');
    expect(result.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('should format agent message correctly', () => {
    const result = formatMessage('Hi there!', 'agent');

    expect(result.content).toBe('Hi there!');
    expect(result.role).toBe('agent');
  });

  it('should handle empty string', () => {
    const result = formatMessage('', 'user');

    expect(result.content).toBe('');
  });

  it('should handle special characters', () => {
    const result = formatMessage('Hello <script>alert("xss")</script>', 'user');

    expect(result.content).toContain('<script>');
  });
});

describe('fetchWithRetry', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return response on successful fetch', async () => {
    const mockResponse = new Response('OK', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetry('https://api.example.com');

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const result = await fetchWithRetry('https://api.example.com', 3);

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(fetchWithRetry('https://api.example.com', 2)).rejects.toThrow('Network error');

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should retry on non-2xx status', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response('Server Error', { status: 500 }))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const result = await fetchWithRetry('https://api.example.com');

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('Type inference examples', () => {
  interface OrionMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    metadata?: Record<string, unknown>;
  }

  it('should correctly type message objects', () => {
    const message: OrionMessage = {
      id: 'msg-123',
      content: 'Hello',
      role: 'user',
    };

    expect(message.id).toMatch(/^msg-/);
    expect(message.metadata).toBeUndefined();
  });

  it('should handle optional metadata', () => {
    const message: OrionMessage = {
      id: 'msg-456',
      content: 'Response',
      role: 'assistant',
      metadata: { model: 'claude-3', tokens: 150 },
    };

    expect(message.metadata?.model).toBe('claude-3');
  });
});
