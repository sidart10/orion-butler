/**
 * Chat IPC Functions
 * Story 2.4: Tauri IPC Integration
 *
 * Frontend functions for communicating with Tauri backend
 * for chat functionality.
 *
 * Event naming follows orion:// namespace per architecture.md
 */

import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

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
  durationMs: number
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
    const requestId = await invoke<string>('chat_send', {
      prompt,
      sessionId: options?.sessionId,
      model: options?.model,
      maxTurns: options?.maxTurns,
      maxBudgetUsd: options?.maxBudgetUsd,
      permissionMode: options?.permissionMode,
    })
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
// Event Subscription
// =============================================================================

/**
 * Subscribe to chat events from Tauri backend
 * Uses orion:// namespace per architecture.md
 *
 * @param handlers - Event handlers for different event types
 * @returns Cleanup function to unsubscribe
 */
export async function subscribeToChatEvents(
  handlers: ChatEventHandlers
): Promise<() => void> {
  const unlisteners: UnlistenFn[] = []

  if (handlers.onMessageStart) {
    const unlisten = await listen<MessageStartEvent>(
      'orion://message/start',
      (event) => handlers.onMessageStart?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onMessageChunk) {
    const unlisten = await listen<MessageChunkEvent>(
      'orion://message/chunk',
      (event) => handlers.onMessageChunk?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onToolStart) {
    const unlisten = await listen<ToolStartEvent>(
      'orion://tool/start',
      (event) => handlers.onToolStart?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onToolComplete) {
    const unlisten = await listen<ToolCompleteEvent>(
      'orion://tool/complete',
      (event) => handlers.onToolComplete?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onSessionComplete) {
    const unlisten = await listen<SessionCompleteEvent>(
      'orion://session/complete',
      (event) => handlers.onSessionComplete?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onError) {
    const unlisten = await listen<SessionErrorEvent>(
      'orion://session/error',
      (event) => handlers.onError?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  // Return cleanup function
  return () => {
    unlisteners.forEach((unlisten) => unlisten())
  }
}
