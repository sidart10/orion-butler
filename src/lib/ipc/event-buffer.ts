/**
 * Event Buffering System
 * TIGER Race Condition Fix: Buffers events until listeners are ready
 *
 * This buffer solves the race condition where Tauri events are emitted
 * BEFORE frontend listeners are registered. Events are buffered until
 * setReady() is called, then flushed in order.
 *
 * Key features:
 * - TIGER-1: Request ID filtering to prevent stale event leaks
 * - TIGER-6: Destroyed state to reject events during cleanup race
 * - Bounded buffer to prevent memory issues
 */

import type {
  MessageStartEvent,
  MessageChunkEvent,
  ToolStartEvent,
  ToolCompleteEvent,
  SessionCompleteEvent,
  SessionErrorEvent,
  ChatEventHandlers,
} from './chat'

// =============================================================================
// Types
// =============================================================================

/**
 * An event buffered for later delivery
 */
export interface BufferedEvent {
  eventType: string
  payload: unknown
  timestamp: number
  requestId: string
}

// =============================================================================
// ChatEventBuffer
// =============================================================================

/**
 * Buffer for chat events that may arrive before listeners are ready.
 *
 * Usage:
 * 1. Create buffer with handlers: new ChatEventBuffer(handlers)
 * 2. Set current request ID: buffer.setCurrentRequest(requestId)
 * 3. Push events as they arrive: buffer.push(eventType, payload)
 * 4. When ready to receive: buffer.setReady() - flushes buffered events
 * 5. On cleanup: buffer.reset() - stops accepting events
 */
export class ChatEventBuffer {
  /** Maximum buffer size to prevent unbounded growth */
  static readonly MAX_BUFFER_SIZE = 1000

  private buffer: BufferedEvent[] = []
  private handlers: ChatEventHandlers
  private _isReady = false
  private _isDestroyed = false
  private currentRequestId: string | null = null

  constructor(handlers: ChatEventHandlers) {
    this.handlers = handlers
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Set the current request ID.
   * TIGER-1: Clears stale events from previous requests.
   * TIGER-6: Resurrects buffer if it was destroyed.
   */
  setCurrentRequest(requestId: string): void {
    // TIGER-6: Resurrect buffer for new request
    if (this._isDestroyed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[ChatEventBuffer] Resurrecting buffer for new request ${requestId}`)
      }
      this._isDestroyed = false
      this._isReady = false
    }

    const previousRequestId = this.currentRequestId
    this.currentRequestId = requestId

    // TIGER-1: Clear any buffered events from previous requests
    if (previousRequestId && previousRequestId !== requestId) {
      const staleCount = this.buffer.length
      this.buffer = this.buffer.filter((e) => e.requestId === requestId)
      if (process.env.NODE_ENV !== 'production' && staleCount > this.buffer.length) {
        console.log(
          `[ChatEventBuffer] Cleared ${staleCount - this.buffer.length} stale events from previous request`
        )
      }
    }
  }

  /**
   * Get the current request ID
   */
  getCurrentRequestId(): string | null {
    return this.currentRequestId
  }

  /**
   * Update handlers (used when React Strict Mode remounts)
   * This allows the singleton buffer to work with the new actor.
   */
  updateHandlers(handlers: ChatEventHandlers): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ChatEventBuffer] Updating handlers (React Strict Mode remount)')
    }
    this.handlers = handlers

    // TIGER-6: Resurrect buffer if it was destroyed
    if (this._isDestroyed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ChatEventBuffer] Resurrecting buffer during handler update')
      }
      this._isDestroyed = false
    }
  }

  /**
   * Push an event to the buffer or deliver immediately if ready.
   */
  push(eventType: string, payload: unknown): void {
    // TIGER-6: Reject events after buffer was destroyed
    if (this._isDestroyed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[ChatEventBuffer] Ignoring event ${eventType} - buffer destroyed`)
      }
      return
    }

    // Extract requestId from payload
    const requestId = (payload as { requestId?: string })?.requestId || 'unknown'

    // TIGER-1: Ignore events from non-current requests
    if (this.currentRequestId && requestId !== this.currentRequestId) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[ChatEventBuffer] Dropping event ${eventType} - requestId mismatch (got ${requestId}, expected ${this.currentRequestId})`
        )
      }
      return
    }

    if (this._isReady) {
      // Deliver immediately if ready
      this.deliver(eventType, payload)
    } else {
      // Buffer for later
      // Prevent unbounded buffer growth
      if (this.buffer.length >= ChatEventBuffer.MAX_BUFFER_SIZE) {
        console.warn(`[ChatEventBuffer] Buffer full, dropping oldest event`)
        this.buffer.shift()
      }

      this.buffer.push({
        eventType,
        payload,
        timestamp: performance.now(),
        requestId,
      })
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[ChatEventBuffer] Buffered ${eventType}, queue size: ${this.buffer.length}`)
      }
    }
  }

  /**
   * Mark as ready and flush buffer.
   */
  setReady(): void {
    // Don't allow setReady when destroyed
    if (this._isDestroyed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ChatEventBuffer] Cannot setReady - buffer destroyed')
      }
      return
    }

    this._isReady = true
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ChatEventBuffer] Ready, flushing ${this.buffer.length} buffered events`)
    }

    // TIGER-1: Only flush events matching current request
    const eventsToFlush = this.currentRequestId
      ? this.buffer.filter((e) => e.requestId === this.currentRequestId)
      : this.buffer

    // Flush buffer in FIFO order
    for (const event of eventsToFlush) {
      this.deliver(event.eventType, event.payload)
    }

    this.buffer = []
  }

  /**
   * Reset the buffer (call on cleanup).
   * TIGER-6: Sets destroyed flag to reject any in-flight events.
   */
  reset(): void {
    // TIGER-6: Set destroyed flag FIRST to reject any in-flight events
    this._isDestroyed = true
    this.buffer = []
    this._isReady = false
    this.currentRequestId = null
    if (process.env.NODE_ENV !== 'production') {
      console.log('[ChatEventBuffer] Buffer reset and destroyed')
    }
  }

  // ===========================================================================
  // State Getters
  // ===========================================================================

  /**
   * Check if buffer is ready (delivering immediately)
   */
  isReady(): boolean {
    return this._isReady
  }

  /**
   * Check if buffer is destroyed (rejecting events)
   */
  isDestroyed(): boolean {
    return this._isDestroyed
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length
  }

  /**
   * Get buffered events (for testing/debugging)
   */
  getBufferedEvents(): BufferedEvent[] {
    return [...this.buffer]
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Deliver an event to the appropriate handler
   */
  private deliver(eventType: string, payload: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ChatEventBuffer] Delivering ${eventType} to handler`)
    }
    switch (eventType) {
      case 'orion://message/start':
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ChatEventBuffer] Calling onMessageStart handler, exists: ${!!this.handlers.onMessageStart}`)
        }
        this.handlers.onMessageStart?.(payload as MessageStartEvent)
        break
      case 'orion://message/chunk':
        this.handlers.onMessageChunk?.(payload as MessageChunkEvent)
        break
      case 'orion://tool/start':
        this.handlers.onToolStart?.(payload as ToolStartEvent)
        break
      case 'orion://tool/complete':
        this.handlers.onToolComplete?.(payload as ToolCompleteEvent)
        break
      case 'orion://session/complete':
        this.handlers.onSessionComplete?.(payload as SessionCompleteEvent)
        break
      case 'orion://session/error':
        this.handlers.onError?.(payload as SessionErrorEvent)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ChatEventBuffer] Unknown event type: ${eventType}`)
        }
    }
  }
}
