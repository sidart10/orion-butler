/**
 * Tauri IPC Helper Unit Tests
 *
 * Tests for the Tauri IPC streaming event helpers.
 * These helpers enable deterministic testing of streaming UI behavior.
 *
 * @see Story 0.2: Tauri IPC Streaming Test Helpers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TauriIPCHelper,
  StreamEventType,
  createTauriIPCHelper,
} from '../fixtures/helpers/tauri-ipc';

describe('TauriIPCHelper', () => {
  let helper: TauriIPCHelper;
  let mockPage: {
    evaluate: ReturnType<typeof vi.fn>;
    waitForFunction: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPage = {
      evaluate: vi.fn(),
      waitForFunction: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
    helper = createTauriIPCHelper(mockPage as unknown as Parameters<typeof createTauriIPCHelper>[0]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('StreamEventType constants', () => {
    it('should export text_block event type', () => {
      expect(StreamEventType.TEXT_BLOCK).toBe('text_block');
    });

    it('should export thinking_block event type', () => {
      expect(StreamEventType.THINKING_BLOCK).toBe('thinking_block');
    });

    it('should export tool_use_block event type', () => {
      expect(StreamEventType.TOOL_USE_BLOCK).toBe('tool_use_block');
    });

    it('should export tool_result_block event type', () => {
      expect(StreamEventType.TOOL_RESULT_BLOCK).toBe('tool_result_block');
    });

    it('should export stream_start event type', () => {
      expect(StreamEventType.STREAM_START).toBe('stream_start');
    });

    it('should export stream_end event type', () => {
      expect(StreamEventType.STREAM_END).toBe('stream_end');
    });

    it('should export first_token event type', () => {
      expect(StreamEventType.FIRST_TOKEN).toBe('first_token');
    });
  });

  describe('waitForStreamEvent', () => {
    it('should wait for specific stream event without timing-based waits (AC: #1)', async () => {
      const eventData = { type: 'text_block', content: 'Hello' };
      mockPage.waitForFunction.mockResolvedValueOnce({ jsonValue: () => Promise.resolve(eventData) });

      const result = await helper.waitForStreamEvent(StreamEventType.TEXT_BLOCK);

      expect(mockPage.waitForFunction).toHaveBeenCalled();
      expect(result).toEqual(eventData);
    });

    it('should resolve when event matches expected type', async () => {
      const eventData = { type: 'thinking_block', content: 'Processing...' };
      mockPage.waitForFunction.mockResolvedValueOnce({ jsonValue: () => Promise.resolve(eventData) });

      const result = await helper.waitForStreamEvent(StreamEventType.THINKING_BLOCK);

      expect(result.type).toBe('thinking_block');
    });

    it('should support optional timeout parameter', async () => {
      const eventData = { type: 'text_block', content: 'Test' };
      mockPage.waitForFunction.mockResolvedValueOnce({ jsonValue: () => Promise.resolve(eventData) });

      await helper.waitForStreamEvent(StreamEventType.TEXT_BLOCK, { timeout: 5000 });

      // Playwright API: waitForFunction(fn, args, options)
      expect(mockPage.waitForFunction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ eventType: 'text_block' }),
        expect.objectContaining({ timeout: 5000 })
      );
    });

    it('should throw on timeout if event never arrives', async () => {
      mockPage.waitForFunction.mockRejectedValueOnce(new Error('Timeout'));

      await expect(
        helper.waitForStreamEvent(StreamEventType.TEXT_BLOCK, { timeout: 100 })
      ).rejects.toThrow('Timeout');
    });
  });

  describe('measureFirstTokenLatency', () => {
    it('should measure first token latency accurately (AC: #2)', async () => {
      const startTime = Date.now();
      const tokenTime = startTime + 250; // 250ms latency

      // Mock stream start and first token events
      mockPage.evaluate
        .mockResolvedValueOnce(startTime) // getStreamStartTime
        .mockResolvedValueOnce(tokenTime); // getFirstTokenTime

      const latency = await helper.measureFirstTokenLatency();

      expect(latency).toBe(250);
    });

    it('should return latency in milliseconds', async () => {
      const startTime = Date.now();
      const tokenTime = startTime + 456;

      mockPage.evaluate
        .mockResolvedValueOnce(startTime)
        .mockResolvedValueOnce(tokenTime);

      const latency = await helper.measureFirstTokenLatency();

      expect(typeof latency).toBe('number');
      expect(latency).toBe(456);
    });

    it('should throw if no stream has started', async () => {
      mockPage.evaluate.mockResolvedValueOnce(null);

      await expect(helper.measureFirstTokenLatency()).rejects.toThrow(
        'TauriIPCHelper: No streaming session active'
      );
    });

    it('should throw if first token has not arrived', async () => {
      mockPage.evaluate
        .mockResolvedValueOnce(Date.now())
        .mockResolvedValueOnce(null);

      await expect(helper.measureFirstTokenLatency()).rejects.toThrow(
        'TauriIPCHelper: First token not yet received'
      );
    });
  });

  describe('validateLatencySLO', () => {
    it('should validate against NFR-1.1 threshold (<500ms p95)', async () => {
      const startTime = Date.now();
      mockPage.evaluate
        .mockResolvedValueOnce(startTime)
        .mockResolvedValueOnce(startTime + 400); // 400ms < 500ms

      const result = await helper.validateLatencySLO(500);

      expect(result.passed).toBe(true);
      expect(result.latencyMs).toBe(400);
      expect(result.thresholdMs).toBe(500);
    });

    it('should fail when latency exceeds threshold', async () => {
      const startTime = Date.now();
      mockPage.evaluate
        .mockResolvedValueOnce(startTime)
        .mockResolvedValueOnce(startTime + 600); // 600ms > 500ms

      const result = await helper.validateLatencySLO(500);

      expect(result.passed).toBe(false);
      expect(result.latencyMs).toBe(600);
    });
  });

  describe('installStreamingHooks', () => {
    it('should inject timing instrumentation into page', async () => {
      mockPage.evaluate.mockResolvedValueOnce(undefined);

      await helper.installStreamingHooks();

      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('collectStreamEvents', () => {
    it('should collect all events until stream end', async () => {
      const events = [
        { type: 'stream_start', timestamp: 1000 },
        { type: 'text_block', content: 'Hello', timestamp: 1100 },
        { type: 'text_block', content: ' World', timestamp: 1200 },
        { type: 'stream_end', timestamp: 1300 },
      ];

      mockPage.evaluate.mockResolvedValueOnce(events);

      const collected = await helper.collectStreamEvents();

      expect(collected).toHaveLength(4);
      expect(collected[0].type).toBe('stream_start');
      expect(collected[3].type).toBe('stream_end');
    });
  });

  describe('reset', () => {
    it('should clear all captured events and timing state', async () => {
      mockPage.evaluate.mockResolvedValueOnce(undefined);

      await helper.reset();

      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should allow new events to be captured after reset', async () => {
      // First reset
      mockPage.evaluate.mockResolvedValueOnce(undefined);
      await helper.reset();

      // Then capture new events
      const newEvents = [{ type: 'stream_start', timestamp: 2000 }];
      mockPage.evaluate.mockResolvedValueOnce(newEvents);

      const collected = await helper.collectStreamEvents();
      expect(collected).toEqual(newEvents);
    });
  });
});

describe('StreamEventType additional constants', () => {
  it('should export stream_error event type', () => {
    expect(StreamEventType.STREAM_ERROR).toBe('stream_error');
  });

  it('should export content_delta event type', () => {
    expect(StreamEventType.CONTENT_DELTA).toBe('content_delta');
  });
});

describe('Integration: Tauri Protocol Interception', () => {
  it('should be designed for tauri:// protocol event interception', () => {
    // This test documents the expected integration pattern
    // The helper intercepts events from Tauri's webview bridge
    expect(StreamEventType.TEXT_BLOCK).toBeDefined();
  });
});
