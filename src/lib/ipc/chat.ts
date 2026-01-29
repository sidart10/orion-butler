/**
 * Chat IPC Functions
 * Story 2.4: Tauri IPC Integration
 *
 * Frontend functions for communicating with Tauri backend
 * for chat functionality.
 *
 * Event naming follows orion:// namespace per architecture.md
 *
 * TIGER Fix: Added event buffering to solve race condition where
 * events are emitted before listeners are registered.
 */

import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { ChatEventBuffer } from './event-buffer'

// =============================================================================
// Event Types (orion:// namespace)
// =============================================================================

export interface MessageStartEvent {
  requestId: string
  messageId: string
}

export interface MessageChunkEvent {
  requestId: string
  type: 'text' | 'thinking'
  content: string
  isPartial: boolean
}

export interface ToolStartEvent {
  requestId: string
  toolId: string
  name: string
  input: unknown
}

export interface ToolCompleteEvent {
  requestId: string
  toolId: string
  result: unknown
  isError: boolean
}

export interface SessionCompleteEvent {
  requestId: string
  sessionId: string
  costUsd: number
  tokenCount: number
  durationMs: number
}

export interface SessionErrorEvent {
  requestId: string
  code: string
  message: string
  recoverable: boolean
  retryAfterMs?: number
}

// =============================================================================
// Query Options
// =============================================================================

export interface ChatQueryOptions {
  /** Session ID for resuming conversation */
  sessionId?: string
  /** Model to use */
  model?: string
  /** Maximum conversation turns */
  maxTurns?: number
  /** Maximum budget in USD */
  maxBudgetUsd?: number
  /** Permission mode: default, plan, or acceptEdits */
  permissionMode?: 'default' | 'plan' | 'acceptEdits'
  /** Client-generated request ID (prevents race condition with early events) */
  requestId?: string
}

// =============================================================================
// Event Handlers
// =============================================================================

export interface ChatEventHandlers {
  onMessageStart?: (event: MessageStartEvent) => void
  onMessageChunk?: (event: MessageChunkEvent) => void
  onToolStart?: (event: ToolStartEvent) => void
  onToolComplete?: (event: ToolCompleteEvent) => void
  onSessionComplete?: (event: SessionCompleteEvent) => void
  onError?: (event: SessionErrorEvent) => void
}

// =============================================================================
// IPC Commands
// =============================================================================

/**
 * Send a chat message via Tauri IPC
 *
 * @param prompt - The user's message
 * @param options - Query options
 * @returns The request ID for this message
 */
export async function chatSend(
  prompt: string,
  options?: ChatQueryOptions
): Promise<string> {
  try {
    // DEBUG: Log what we're sending to Rust
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSend] Options received:', JSON.stringify(options))
      console.log('[chatSend] request_id being sent:', options?.requestId)
    }

    // CRITICAL: Tauri v2 IPC converts Rust snake_case to JavaScript camelCase
    // So Rust `request_id: Option<String>` expects JS `requestId` (camelCase)!
    const invokePayload = {
      requestId: options?.requestId,
      prompt,
      sessionId: options?.sessionId,
      model: options?.model,
      maxTurns: options?.maxTurns,
      maxBudgetUsd: options?.maxBudgetUsd,
      permissionMode: options?.permissionMode,
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSend] Full invoke payload:', JSON.stringify(invokePayload))
    }

    const requestId = await invoke<string>('chat_send', invokePayload)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSend] Rust returned requestId:', requestId)
    }
    return requestId
  } catch (error) {
    throw new Error(`Failed to send chat message: ${error}`)
  }
}

/**
 * Cancel an ongoing chat request
 *
 * @param requestId - The request ID to cancel
 */
export async function chatCancel(requestId: string): Promise<void> {
  try {
    // CRITICAL: Tauri v2 IPC converts Rust snake_case to JavaScript camelCase
    await invoke('chat_cancel', { requestId })
  } catch (error) {
    throw new Error(`Failed to cancel chat request: ${error}`)
  }
}

/**
 * Check if the chat backend (sidecar) is ready
 *
 * @returns true if the sidecar is running and responsive
 */
export async function chatReady(): Promise<boolean> {
  try {
    const ready = await invoke<boolean>('chat_ready')
    return ready
  } catch {
    return false
  }
}

// =============================================================================
// Event Buffer (Singleton)
// TIGER Fix: Buffer events until listeners are ready
// =============================================================================

let eventBuffer: ChatEventBuffer | null = null

/**
 * Get or create the singleton event buffer
 */
export function getEventBuffer(handlers: ChatEventHandlers): ChatEventBuffer {
  if (!eventBuffer) {
    eventBuffer = new ChatEventBuffer(handlers)
  }
  return eventBuffer
}

/**
 * Reset the event buffer (call during cleanup)
 */
export function resetEventBuffer(): void {
  if (eventBuffer) {
    eventBuffer.reset()
    eventBuffer = null
  }
}

// =============================================================================
// Event Subscription (Singleton)
// =============================================================================

// Singleton subscription state - survives React Strict Mode remounts
let globalSubscriptionPromise: Promise<() => void> | null = null
let globalUnsubscribe: (() => void) | null = null
let subscriptionRefCount = 0

/**
 * Get current subscription ref count (for testing)
 * @returns Current ref count
 */
export function getSubscriptionRefCount(): number {
  return subscriptionRefCount
}

/**
 * Subscribe to chat events from Tauri backend
 * Uses orion:// namespace per architecture.md
 *
 * SINGLETON PATTERN: React Strict Mode causes useEffect to run twice.
 * This function uses a singleton to ensure Tauri listeners are only
 * registered ONCE, preventing duplicate events.
 *
 * TIGER Fix: Events are routed through ChatEventBuffer to handle
 * the race condition where events arrive before handlers are ready.
 *
 * @param handlers - Event handlers for different event types
 * @returns Cleanup function to unsubscribe
 */
export async function subscribeToChatEvents(
  handlers: ChatEventHandlers
): Promise<() => void> {
  // Increment ref count
  subscriptionRefCount++
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[chat.ts] subscribeToChatEvents called, refCount: ${subscriptionRefCount}`)
  }

  // If already subscribed, just update the buffer handlers and return
  if (globalSubscriptionPromise) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chat.ts] Reusing existing subscription (React Strict Mode)')
    }
    // Update the buffer with new handlers (in case they changed)
    const buffer = getEventBuffer(handlers)
    buffer.updateHandlers(handlers)
    buffer.setReady()

    // Return a cleanup that decrements ref count
    return () => {
      // FIX: Bounds check prevents refCount going negative (memory leak if cleanup called twice)
      subscriptionRefCount = Math.max(0, subscriptionRefCount - 1)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[chat.ts] Cleanup called, refCount: ${subscriptionRefCount}`)
      }
      // Only actually cleanup when ref count hits 0
      if (subscriptionRefCount <= 0 && globalUnsubscribe) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[chat.ts] Actually cleaning up Tauri listeners (refCount is 0)')
        }
        globalUnsubscribe()
        globalUnsubscribe = null
        globalSubscriptionPromise = null
        subscriptionRefCount = 0
        resetEventBuffer()
      }
    }
  }

  // First subscription - actually set up Tauri listeners
  if (process.env.NODE_ENV !== 'production') {
    console.log('[chat.ts] First subscription - setting up Tauri listeners')
  }

  globalSubscriptionPromise = (async () => {
    const unlisteners: UnlistenFn[] = []

    // Get or create buffer with handlers
    const buffer = getEventBuffer(handlers)

    // Event names to subscribe to
    const events = [
      'orion://message/start',
      'orion://message/chunk',
      'orion://tool/start',
      'orion://tool/complete',
      'orion://session/complete',
      'orion://session/error',
    ]

    // Register all listeners in parallel for speed
    const promises = events.map(async (name) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[chat.ts] Setting up ${name} listener`)
      }
      const unlisten = await listen(name, (event) => {
        const payload = (event as { payload: unknown }).payload
        // Route through buffer instead of directly to handler
        buffer.push(name, payload)
      })
      return unlisten
    })

    const unlistenFns = await Promise.all(promises)
    unlisteners.push(...unlistenFns)

    // NOW mark as ready and flush any buffered events
    buffer.setReady()

    if (process.env.NODE_ENV !== 'production') {
      console.log('[chat.ts] All event listeners ready, buffer flushed')
    }

    // Store the actual cleanup function
    globalUnsubscribe = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[chat.ts] Executing actual Tauri unsubscribe')
      }
      unlisteners.forEach((unlisten) => unlisten())
    }

    return globalUnsubscribe
  })()

  await globalSubscriptionPromise

  // Return cleanup that uses ref counting
  return () => {
    // FIX: Bounds check prevents refCount going negative (memory leak if cleanup called twice)
    subscriptionRefCount = Math.max(0, subscriptionRefCount - 1)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[chat.ts] Cleanup called, refCount: ${subscriptionRefCount}`)
    }
    // Only actually cleanup when ref count hits 0
    if (subscriptionRefCount <= 0 && globalUnsubscribe) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[chat.ts] Actually cleaning up Tauri listeners (refCount is 0)')
      }
      globalUnsubscribe()
      globalUnsubscribe = null
      globalSubscriptionPromise = null
      subscriptionRefCount = 0
      resetEventBuffer()
    }
  }
}

// =============================================================================
// HMR Cleanup (TIGER-7 Fix)
// =============================================================================

// Reset module state on HMR to prevent stale handlers during development
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chat.ts] HMR dispose - cleaning up module state')
    }

    // Clean up Tauri listeners
    if (globalUnsubscribe) {
      globalUnsubscribe()
    }

    // Reset all module-level state
    globalSubscriptionPromise = null
    globalUnsubscribe = null
    subscriptionRefCount = 0
    resetEventBuffer()
  })
}
