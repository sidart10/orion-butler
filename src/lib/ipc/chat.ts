/**
 * Chat IPC Functions
 * Story 2.4: Tauri IPC Integration
 *
 * Frontend functions for communicating with Tauri backend
 * for chat functionality.
 */

import { invoke } from '@tauri-apps/api/core'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

// Event types from Tauri backend
export interface MessageStartEvent {
  requestId: string
  messageId: string
}

export interface TextDeltaEvent {
  requestId: string
  text: string
}

export interface MessageEndEvent {
  requestId: string
  stopReason: string
}

export interface ChatEventHandlers {
  onMessageStart?: (event: MessageStartEvent) => void
  onTextDelta?: (event: TextDeltaEvent) => void
  onMessageEnd?: (event: MessageEndEvent) => void
  onError?: (error: Error) => void
}

/**
 * Send a chat message via Tauri IPC
 *
 * @param prompt - The user's message
 * @param conversationId - Optional conversation ID for context
 * @returns The request ID for this message
 */
export async function chatSend(
  prompt: string,
  conversationId?: string
): Promise<string> {
  try {
    const requestId = await invoke<string>('chat_send', {
      prompt,
      conversationId,
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
 * Subscribe to chat events from Tauri backend
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
      'chat:message_start',
      (event) => handlers.onMessageStart?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onTextDelta) {
    const unlisten = await listen<TextDeltaEvent>(
      'chat:text_delta',
      (event) => handlers.onTextDelta?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  if (handlers.onMessageEnd) {
    const unlisten = await listen<MessageEndEvent>(
      'chat:message_end',
      (event) => handlers.onMessageEnd?.(event.payload)
    )
    unlisteners.push(unlisten)
  }

  // Return cleanup function
  return () => {
    unlisteners.forEach((unlisten) => unlisten())
  }
}
