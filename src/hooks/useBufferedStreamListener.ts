/**
 * useBufferedStreamListener Hook
 * Story 2.5: IPC Event Streaming
 *
 * Buffers stream events using requestAnimationFrame to prevent
 * DOM thrashing during fast streaming. Improves rendering performance.
 *
 * Pattern from React docs: batch state updates to avoid excessive re-renders.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';

// =============================================================================
// Types
// =============================================================================

interface BufferedStreamOptions<T> {
  /** Maximum number of items to buffer before forced flush */
  maxBufferSize?: number;
  /** Maximum time in ms to wait before forced flush */
  maxBufferTimeMs?: number;
  /** Process function called with accumulated buffer */
  onFlush: (items: T[]) => void;
  /** Whether buffering is enabled (disable for debugging) */
  enabled?: boolean;
}

interface UseBufferedStreamReturn<T> {
  /** Add an item to the buffer */
  push: (item: T) => void;
  /** Force flush the buffer immediately */
  flush: () => void;
  /** Clear the buffer without processing */
  clear: () => void;
  /** Current buffer length */
  bufferLength: number;
}

// =============================================================================
// Constants
// =============================================================================

/** Default max buffer size */
const DEFAULT_MAX_BUFFER_SIZE = 50;

/** Default max buffer time in ms */
const DEFAULT_MAX_BUFFER_TIME_MS = 16; // ~60fps

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Buffer stream events and flush them using requestAnimationFrame
 *
 * @example
 * ```tsx
 * const { push } = useBufferedStreamListener({
 *   onFlush: (chunks) => {
 *     const text = chunks.join('');
 *     setContent(prev => prev + text);
 *   },
 * });
 *
 * // In event handler:
 * push(event.content);
 * ```
 */
export function useBufferedStreamListener<T>(
  options: BufferedStreamOptions<T>
): UseBufferedStreamReturn<T> {
  const {
    maxBufferSize = DEFAULT_MAX_BUFFER_SIZE,
    maxBufferTimeMs = DEFAULT_MAX_BUFFER_TIME_MS,
    onFlush,
    enabled = true,
  } = options;

  // Buffer storage
  const bufferRef = useRef<T[]>([]);

  // RAF handle for cancellation
  const rafRef = useRef<number | null>(null);

  // Timer handle for forced flush
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timestamp of first item in buffer
  const firstItemTimeRef = useRef<number | null>(null);

  // Stable flush callback
  const flushCallbackRef = useRef(onFlush);
  flushCallbackRef.current = onFlush;

  // Flush the buffer
  const flush = useCallback(() => {
    if (bufferRef.current.length === 0) return;

    const items = bufferRef.current;
    bufferRef.current = [];
    firstItemTimeRef.current = null;

    // Clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Cancel pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Call the flush handler
    flushCallbackRef.current(items);
  }, []);

  // Schedule a flush using RAF
  const scheduleFlush = useCallback(() => {
    if (rafRef.current) return; // Already scheduled

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      flush();
    });
  }, [flush]);

  // Push an item to the buffer
  const push = useCallback(
    (item: T) => {
      // If disabled, flush immediately
      if (!enabled) {
        flushCallbackRef.current([item]);
        return;
      }

      // Record first item time
      if (bufferRef.current.length === 0) {
        firstItemTimeRef.current = performance.now();

        // Set up forced flush timer
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          flush();
        }, maxBufferTimeMs);
      }

      // Add to buffer
      bufferRef.current.push(item);

      // Check if we should force flush due to size
      if (bufferRef.current.length >= maxBufferSize) {
        flush();
        return;
      }

      // Schedule RAF flush
      scheduleFlush();
    },
    [enabled, maxBufferSize, maxBufferTimeMs, flush, scheduleFlush]
  );

  // Clear the buffer without processing
  const clear = useCallback(() => {
    bufferRef.current = [];
    firstItemTimeRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Flush any remaining items on unmount
      if (bufferRef.current.length > 0) {
        flushCallbackRef.current(bufferRef.current);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    push,
    flush,
    clear,
    get bufferLength() {
      return bufferRef.current.length;
    },
  };
}

// =============================================================================
// Specialized Hooks
// =============================================================================

/**
 * Buffer text chunks for streaming text display
 */
export function useBufferedTextStream(
  onUpdate: (text: string) => void,
  options?: Omit<BufferedStreamOptions<string>, 'onFlush'>
) {
  return useBufferedStreamListener<string>({
    ...options,
    onFlush: (chunks) => {
      const combined = chunks.join('');
      onUpdate(combined);
    },
  });
}

/**
 * Buffer events with filtering support
 */
export function useBufferedEventStream<T>(
  onUpdate: (events: T[]) => void,
  filter?: (event: T) => boolean,
  options?: Omit<BufferedStreamOptions<T>, 'onFlush'>
) {
  return useBufferedStreamListener<T>({
    ...options,
    onFlush: (events) => {
      const filtered = filter ? events.filter(filter) : events;
      if (filtered.length > 0) {
        onUpdate(filtered);
      }
    },
  });
}
