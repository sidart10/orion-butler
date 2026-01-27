/**
 * Tauri IPC Streaming Test Helpers
 *
 * Playwright helpers to intercept Tauri IPC streaming events for deterministic testing.
 * Enables testing first-token latency and streaming UI behavior without timing-based waits.
 *
 * @see Story 0.2: Tauri IPC Streaming Test Helpers
 * @see NFR-1.1: First token latency <500ms (p95)
 * @see TC-2: Tauri IPC streaming intercept - CRITICAL
 */

import type { Page } from '@playwright/test';

/**
 * Stream event types for Claude SDK streaming responses.
 * These map to the event types emitted via Tauri IPC during streaming.
 */
export const StreamEventType = {
  /** Text content block */
  TEXT_BLOCK: 'text_block',
  /** Extended thinking block */
  THINKING_BLOCK: 'thinking_block',
  /** Tool use request block */
  TOOL_USE_BLOCK: 'tool_use_block',
  /** Tool execution result block */
  TOOL_RESULT_BLOCK: 'tool_result_block',
  /** Stream session started */
  STREAM_START: 'stream_start',
  /** Stream session ended */
  STREAM_END: 'stream_end',
  /** First token received (for latency measurement) */
  FIRST_TOKEN: 'first_token',
  /** Error occurred during streaming */
  STREAM_ERROR: 'stream_error',
  /** Delta content update */
  CONTENT_DELTA: 'content_delta',
} as const;

export type StreamEventTypeValue =
  (typeof StreamEventType)[keyof typeof StreamEventType];

/**
 * Stream event data structure.
 */
export interface StreamEvent {
  /** Event type from StreamEventType */
  type: StreamEventTypeValue;
  /** Event timestamp (ms since epoch) */
  timestamp: number;
  /** Optional content payload */
  content?: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Options for waiting on stream events.
 */
export interface WaitForStreamEventOptions {
  /** Timeout in milliseconds (default: DEFAULT_TIMEOUT_MS) */
  timeout?: number;
}

/** Default timeout for waiting on stream events (30 seconds) */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * SLO validation result.
 */
export interface SLOValidationResult {
  /** Whether the SLO passed */
  passed: boolean;
  /** Measured latency in milliseconds */
  latencyMs: number;
  /** Threshold value in milliseconds */
  thresholdMs: number;
}

/**
 * Tauri IPC Helper for testing streaming events.
 *
 * Provides deterministic event waiting and latency measurement
 * without relying on timing-based waits (waitForTimeout).
 */
export interface TauriIPCHelper {
  /**
   * Wait for a specific stream event type.
   *
   * @param eventType - The event type to wait for (from StreamEventType)
   * @param options - Optional configuration (timeout, etc.)
   * @returns The stream event data when received
   *
   * @example
   * ```typescript
   * // Wait for first text block without timing-based waits
   * const event = await tauriHelper.waitForStreamEvent('text_block');
   * expect(event.content).toBeDefined();
   * ```
   */
  waitForStreamEvent(
    eventType: StreamEventTypeValue,
    options?: WaitForStreamEventOptions
  ): Promise<StreamEvent>;

  /**
   * Measure first-token latency for the current streaming session.
   *
   * @returns Latency in milliseconds from stream start to first token
   * @throws Error if no streaming session is active or first token not received
   *
   * @example
   * ```typescript
   * // Measure latency for NFR-1.1 validation
   * const latency = await tauriHelper.measureFirstTokenLatency();
   * expect(latency).toBeLessThan(500); // NFR-1.1: <500ms p95
   * ```
   */
  measureFirstTokenLatency(): Promise<number>;

  /**
   * Validate latency against an SLO threshold.
   *
   * @param thresholdMs - Maximum acceptable latency in milliseconds
   * @returns Validation result with pass/fail and actual latency
   */
  validateLatencySLO(thresholdMs: number): Promise<SLOValidationResult>;

  /**
   * Install streaming hooks into the page for event capture.
   *
   * Must be called before starting a streaming session to enable event capture.
   * This injects the necessary instrumentation into the Tauri webview.
   */
  installStreamingHooks(): Promise<void>;

  /**
   * Collect all stream events from the current session.
   *
   * @returns Array of all captured stream events
   */
  collectStreamEvents(): Promise<StreamEvent[]>;

  /**
   * Clear captured events and reset timing state.
   */
  reset(): Promise<void>;
}

/**
 * Internal state stored in the page context.
 * This interface mirrors the window.__tauriStreamingState object
 * injected by installStreamingHooks().
 */
interface TauriStreamingState {
  events: StreamEvent[];
  streamStartTime: number | null;
  firstTokenTime: number | null;
  isStreaming: boolean;
}

/**
 * Window type augmentation for accessing Tauri streaming state.
 */
interface WindowWithTauriState {
  __tauriStreamingState: TauriStreamingState;
}

/**
 * Helper to get typed access to window streaming state.
 */
function getStreamingState(win: Window): TauriStreamingState | undefined {
  return (win as unknown as WindowWithTauriState).__tauriStreamingState;
}

/**
 * Initialize streaming state and hooks in the page context.
 * This function is executed directly via page.evaluate() to avoid eval().
 */
function initializeStreamingHooks(): void {
  const win = window as unknown as {
    __tauriStreamingState: TauriStreamingState;
    __TAURI__?: {
      event: {
        listen: (event: string, handler: (data: unknown) => void) => Promise<unknown>;
      };
    };
  };

  win.__tauriStreamingState = win.__tauriStreamingState || {
    events: [],
    streamStartTime: null,
    firstTokenTime: null,
    isStreaming: false,
  };

  // Hook into Tauri event system if available
  if (win.__TAURI__) {
    const originalListen = win.__TAURI__.event.listen;
    win.__TAURI__.event.listen = async function (
      event: string,
      handler: (data: unknown) => void
    ) {
      const wrappedHandler = (eventData: unknown) => {
        const state = win.__tauriStreamingState;
        const timestamp = Date.now();

        // Cast to expected shape for processing
        const typedEventData = eventData as { payload?: { type?: string; content?: string } } | null;

        // Track streaming events
        if (event.startsWith('stream:') || event.includes('ipc:')) {
          const streamEvent: StreamEvent = {
            type: (typedEventData?.payload?.type || event.replace('stream:', '')) as StreamEventTypeValue,
            timestamp,
            content: typedEventData?.payload?.content,
            metadata: typedEventData?.payload as Record<string, unknown>,
          };
          state.events.push(streamEvent);

          // Track timing milestones
          if (streamEvent.type === 'stream_start') {
            state.streamStartTime = timestamp;
            state.isStreaming = true;
          } else if (
            streamEvent.type === 'first_token' ||
            (streamEvent.type === 'text_block' && state.firstTokenTime === null)
          ) {
            state.firstTokenTime = timestamp;
          } else if (streamEvent.type === 'stream_end') {
            state.isStreaming = false;
          }
        }

        return handler(eventData);
      };

      return originalListen.call(this, event, wrappedHandler);
    };
  }

  // Fallback: Hook into custom event dispatch for non-Tauri testing
  const originalDispatch = window.dispatchEvent.bind(window);
  window.dispatchEvent = function (event: Event) {
    const customEvent = event as CustomEvent<{ type?: string; content?: string }>;
    if (event.type && event.type.startsWith('tauri:stream:')) {
      const state = win.__tauriStreamingState;
      const timestamp = Date.now();
      const streamEvent: StreamEvent = {
        type: (customEvent.detail?.type || event.type.replace('tauri:stream:', '')) as StreamEventTypeValue,
        timestamp,
        content: customEvent.detail?.content,
        metadata: customEvent.detail as unknown as Record<string, unknown>,
      };
      state.events.push(streamEvent);

      if (streamEvent.type === 'stream_start') {
        state.streamStartTime = timestamp;
        state.isStreaming = true;
      } else if (
        streamEvent.type === 'first_token' ||
        (streamEvent.type === 'text_block' && state.firstTokenTime === null)
      ) {
        state.firstTokenTime = timestamp;
      } else if (streamEvent.type === 'stream_end') {
        state.isStreaming = false;
      }
    }
    return originalDispatch(event);
  };
}

/**
 * Create a Tauri IPC helper for the given page.
 *
 * @param page - Playwright Page instance
 * @returns TauriIPCHelper instance
 *
 * @example
 * ```typescript
 * import { createTauriIPCHelper, StreamEventType } from '../fixtures/helpers/tauri-ipc';
 *
 * test('streaming UI test', async ({ page }) => {
 *   const tauriHelper = createTauriIPCHelper(page);
 *   await tauriHelper.installStreamingHooks();
 *
 *   // Trigger streaming action...
 *
 *   // Wait deterministically for event (no waitForTimeout!)
 *   const event = await tauriHelper.waitForStreamEvent(StreamEventType.TEXT_BLOCK);
 *   expect(event.content).toBeDefined();
 *
 *   // Validate NFR-1.1
 *   const latency = await tauriHelper.measureFirstTokenLatency();
 *   expect(latency).toBeLessThan(500);
 * });
 * ```
 */
export function createTauriIPCHelper(page: Page): TauriIPCHelper {
  return {
    async waitForStreamEvent(
      eventType: StreamEventTypeValue,
      options: WaitForStreamEventOptions = {}
    ): Promise<StreamEvent> {
      const { timeout = DEFAULT_TIMEOUT_MS } = options;

      const result = await page.waitForFunction(
        (args: { eventType: string }) => {
          const state = (window as unknown as WindowWithTauriState).__tauriStreamingState;
          if (!state) return null;

          const matchingEvent = state.events.find(
            (e: { type: string }) => e.type === args.eventType
          );
          return matchingEvent || null;
        },
        { eventType },
        { timeout }
      );

      const eventData = await result.jsonValue();
      if (!eventData) {
        throw new Error(`TauriIPCHelper: Stream event '${eventType}' not received within timeout`);
      }
      return eventData as StreamEvent;
    },

    async measureFirstTokenLatency(): Promise<number> {
      const streamStartTime = await page.evaluate(() => {
        const state = (window as unknown as WindowWithTauriState).__tauriStreamingState;
        return state?.streamStartTime ?? null;
      });

      if (streamStartTime === null) {
        throw new Error('TauriIPCHelper: No streaming session active (stream_start event not received)');
      }

      const firstTokenTime = await page.evaluate(() => {
        const state = (window as unknown as WindowWithTauriState).__tauriStreamingState;
        return state?.firstTokenTime ?? null;
      });

      if (firstTokenTime === null) {
        throw new Error('TauriIPCHelper: First token not yet received (first_token or text_block event missing)');
      }

      return firstTokenTime - streamStartTime;
    },

    async validateLatencySLO(thresholdMs: number): Promise<SLOValidationResult> {
      const latencyMs = await this.measureFirstTokenLatency();
      return {
        passed: latencyMs <= thresholdMs,
        latencyMs,
        thresholdMs,
      };
    },

    async installStreamingHooks(): Promise<void> {
      // Execute hooks directly without eval() for security
      await page.evaluate(initializeStreamingHooks);
    },

    async collectStreamEvents(): Promise<StreamEvent[]> {
      return await page.evaluate(() => {
        const state = (window as unknown as WindowWithTauriState).__tauriStreamingState;
        return state?.events ?? [];
      });
    },

    async reset(): Promise<void> {
      await page.evaluate(() => {
        const state = (window as unknown as WindowWithTauriState).__tauriStreamingState;
        if (state) {
          state.events = [];
          state.streamStartTime = null;
          state.firstTokenTime = null;
          state.isStreaming = false;
        }
      });
    },
  };
}

/**
 * Default export for convenience.
 */
export default {
  createTauriIPCHelper,
  StreamEventType,
};
