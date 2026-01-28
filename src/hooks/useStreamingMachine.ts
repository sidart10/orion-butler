/**
 * useStreamingMachine Hook
 * Story 2.5/2.6: Chat State Management with IPC Integration
 *
 * React hook for using the streaming state machine with Tauri IPC.
 * Subscribes to Tauri events and translates them to XState events.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createActor } from 'xstate'
import {
  streamingMachine,
  ChatMessage,
  ToolUse,
  SessionInfo,
} from '@/machines/streamingMachine'
import {
  chatSend,
  chatCancel,
  chatReady,
  subscribeToChatEvents,
  type ChatQueryOptions,
} from '@/lib/ipc/chat'
import {
  saveConversationTurn,
  getOrCreateConversation,
  formatTimestamp,
} from '@/lib/ipc/conversation'

// =============================================================================
// Return Type
// =============================================================================

interface UseStreamingMachineReturn {
  /** Current state value (idle, sending, streaming, complete, error) */
  stateValue: string
  /** All messages in the conversation */
  messages: ChatMessage[]
  /** Whether the machine is currently streaming */
  isStreaming: boolean
  /** Whether the machine is sending a message */
  isSending: boolean
  /** Current error, if any */
  error: Error | null
  /** Active tool uses */
  toolUses: ToolUse[]
  /** Session info (after complete) */
  session: SessionInfo | null
  /** Save error, if conversation persistence failed (Issue #7) */
  saveError: string | null
  /** Clear the save error state */
  clearSaveError: () => void
  /** Whether budget warning has been triggered */
  budgetWarning: boolean
  /** Current thinking content */
  currentThinking: string
  /** Current retry attempt (0-based) */
  retryAttempt: number
  /** Send a new message */
  send: (prompt: string, options?: ChatQueryOptions) => Promise<void>
  /** Cancel the current request */
  cancel: () => Promise<void>
  /** Retry after an error */
  retry: () => void
  /** Reset the conversation */
  reset: () => void
}

// =============================================================================
// Environment Detection
// =============================================================================

/**
 * Check if running in Tauri environment
 */
function isTauri(): boolean {
  const result = typeof window !== 'undefined' && '__TAURI__' in window
  // Debug logging - remove after verification
  if (typeof window !== 'undefined') {
    console.log('[useStreamingMachine] isTauri check:', result)
  }
  return result
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing chat state with XState and Tauri IPC
 */
export function useStreamingMachine(): UseStreamingMachineReturn {
  // Use ref to hold the actor (doesn't change)
  const actorRef = useRef(createActor(streamingMachine))

  // Track current request ID for cancellation
  const currentRequestIdRef = useRef<string | null>(null)

  // Track conversation ID for persistence (Story 3.7)
  const conversationIdRef = useRef<string | null>(null)

  // Guard against duplicate getOrCreateConversation calls (race condition fix)
  const conversationIdPromiseRef = useRef<Promise<string> | null>(null)

  // State values extracted from machine
  const [stateValue, setStateValue] = useState<string>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [toolUses, setToolUses] = useState<ToolUse[]>([])
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [budgetWarning, setBudgetWarning] = useState<boolean>(false)
  const [currentThinking, setCurrentThinking] = useState<string>('')
  const [saveError, setSaveError] = useState<string | null>(null) // Issue #7: Track save failures
  const [retryAttempt, setRetryAttempt] = useState<number>(0)

  // Initialize conversation on mount (Story 3.7)
  useEffect(() => {
    if (isTauri()) {
      // Use the promise guard pattern for consistent behavior
      if (!conversationIdPromiseRef.current) {
        conversationIdPromiseRef.current = getOrCreateConversation('adhoc')
          .then((id) => {
            conversationIdRef.current = id
            conversationIdPromiseRef.current = null
            actorRef.current.send({ type: 'SET_CONVERSATION_ID', conversationId: id })
            console.log('[useStreamingMachine] Conversation initialized:', id)
            return id
          })
          .catch((err) => {
            conversationIdPromiseRef.current = null
            // Log but don't fail - conversation will be created on first save
            console.warn('[useStreamingMachine] Failed to init conversation:', err)
            throw err
          })
      }
    }
  }, [])

  // Save conversation turn on complete (Story 3.7/3.8)
  const saveConversationAsync = useCallback(
    async (
      userMessage: ChatMessage,
      assistantMessage: ChatMessage,
      sessionId: string | undefined
    ) => {
      if (!isTauri()) return

      // Ensure we have a conversation ID (with race condition protection)
      let convId = conversationIdRef.current
      if (!convId) {
        try {
          // Use promise guard to prevent duplicate API calls on rapid sends
          if (!conversationIdPromiseRef.current) {
            conversationIdPromiseRef.current = getOrCreateConversation(
              'adhoc',
              sessionId
            ).then((id) => {
              conversationIdRef.current = id
              conversationIdPromiseRef.current = null
              return id
            })
          }
          convId = await conversationIdPromiseRef.current
        } catch (err) {
          conversationIdPromiseRef.current = null
          console.error('[useStreamingMachine] Failed to create conversation:', err)
          return
        }
      }

      try {
        // Clear any previous save error before attempting
        setSaveError(null)

        await saveConversationTurn({
          conversationId: convId,
          userMessage: {
            id: userMessage.id,
            role: 'user',
            content: userMessage.content,
            createdAt: formatTimestamp(userMessage.timestamp),
          },
          assistantMessage: {
            id: assistantMessage.id,
            role: 'assistant',
            content: assistantMessage.content,
            createdAt: formatTimestamp(assistantMessage.timestamp),
            // Include tool data if present
            toolCalls: assistantMessage.toolUses
              ? JSON.stringify(
                  assistantMessage.toolUses.map((tu) => ({
                    id: tu.id,
                    name: tu.name,
                    input: tu.input,
                  }))
                )
              : undefined,
            toolResults: assistantMessage.toolUses
              ? JSON.stringify(
                  assistantMessage.toolUses
                    .filter((tu) => tu.result !== undefined)
                    .map((tu) => ({
                      toolId: tu.id,
                      result: tu.result,
                      isError: tu.isError,
                    }))
                )
              : undefined,
          },
          sessionId,
        })
        console.log('[useStreamingMachine] Conversation turn saved')
      } catch (err) {
        // Issue #7: Surface save failures to UI (don't break UI, but inform user)
        const errorMessage = err instanceof Error ? err.message : 'Failed to save conversation'
        console.error('[useStreamingMachine] Failed to save conversation:', err)
        setSaveError(errorMessage)
      }
    },
    []
  )

  // Start the actor and subscribe to events on mount
  useEffect(() => {
    const actor = actorRef.current
    let previousState = 'idle'

    const subscription = actor.subscribe((snapshot) => {
      const currentState = snapshot.value as string
      console.log('[useStreamingMachine] State transition:', currentState, 'messages:', snapshot.context.messages.length)

      // Trigger save when transitioning TO complete state (Story 3.7)
      if (currentState === 'complete' && previousState !== 'complete') {
        const pendingUserMessage = snapshot.context.pendingUserMessage
        const assistantMessages = snapshot.context.messages.filter(
          (m) => m.role === 'assistant'
        )
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]

        if (pendingUserMessage && lastAssistantMessage) {
          saveConversationAsync(
            pendingUserMessage,
            lastAssistantMessage,
            snapshot.context.session?.id
          )
        }
      }
      previousState = currentState

      setStateValue(currentState)
      setMessages(snapshot.context.messages)
      setError(snapshot.context.error)
      setToolUses(snapshot.context.toolUses)
      setSession(snapshot.context.session)
      setBudgetWarning(snapshot.context.budgetWarning)
      setCurrentThinking(snapshot.context.currentThinking)
      setRetryAttempt(snapshot.context.retryAttempt)
    })

    actor.start()

    // Subscribe to Tauri events if in Tauri environment
    let cleanup: (() => void) | null = null

    if (isTauri()) {
      subscribeToChatEvents({
        onMessageStart: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          actor.send({
            type: 'STREAM_START',
            requestId: event.requestId,
            messageId: event.messageId,
          })
        },
        onMessageChunk: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          if (event.type === 'thinking') {
            actor.send({
              type: 'THINKING',
              text: event.content,
            })
          } else {
            actor.send({
              type: 'CHUNK',
              text: event.content,
            })
          }
        },
        onToolStart: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          actor.send({
            type: 'TOOL_START',
            toolId: event.toolId,
            name: event.name,
            input: event.input,
          })
        },
        onToolComplete: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          actor.send({
            type: 'TOOL_COMPLETE',
            toolId: event.toolId,
            result: event.result,
            isError: event.isError,
          })
        },
        onSessionComplete: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          currentRequestIdRef.current = null
          actor.send({
            type: 'COMPLETE',
            stopReason: 'end_turn',
            sessionId: event.sessionId,
            costUsd: event.costUsd,
            tokenCount: event.tokenCount,
            durationMs: event.durationMs,
          })
        },
        onError: (event) => {
          // Filter by requestId to prevent concurrent query interference
          if (event.requestId !== currentRequestIdRef.current) return

          currentRequestIdRef.current = null
          actor.send({
            type: 'ERROR',
            error: new Error(`[${event.code}] ${event.message}`),
          })
        },
      }).then((unsubscribe) => {
        cleanup = unsubscribe
      })
    }

    return () => {
      subscription.unsubscribe()
      actor.stop()
      cleanup?.()
    }
  }, [])

  // Send a message
  const send = useCallback(async (prompt: string, options?: ChatQueryOptions) => {
    console.log('[useStreamingMachine] send() called with prompt:', prompt)
    const actor = actorRef.current
    actor.send({ type: 'SEND', prompt })

    const tauriMode = isTauri()
    console.log('[useStreamingMachine] Tauri mode:', tauriMode)

    if (tauriMode) {
      try {
        // Verify sidecar is ready before sending
        const ready = await chatReady()
        if (!ready) {
          actor.send({
            type: 'ERROR',
            error: new Error('Claude backend is starting up. Please try again.'),
          })
          return
        }

        // Generate requestId BEFORE IPC call to prevent race condition
        // Events may arrive before chatSend() returns, so we set the ref first
        const requestId = `req_${crypto.randomUUID()}`
        currentRequestIdRef.current = requestId

        // Get session ID from current state for conversation continuity (Bug 1 fix)
        const snapshot = actorRef.current.getSnapshot()
        const existingSessionId = snapshot.context.session?.id

        // Send via Tauri IPC with our pre-generated requestId
        console.log('[useStreamingMachine] Calling chatSend via Tauri IPC with requestId:', requestId, 'sessionId:', existingSessionId || 'new')
        await chatSend(prompt, {
          ...options,
          requestId,
          // Pass session ID if resuming a conversation (existing takes precedence over options)
          sessionId: existingSessionId || options?.sessionId,
        })
        // Events will come through the Tauri event listeners and match our requestId
      } catch (err) {
        console.error('[useStreamingMachine] Error from chatSend:', err)
        actor.send({
          type: 'ERROR',
          error: err instanceof Error ? err : new Error(String(err)),
        })
      }
    } else {
      // Fallback for web development (no Tauri)
      console.log('[useStreamingMachine] Using web fallback mode')
      const messageId = `msg_${Date.now()}`
      const requestId = `req_${Date.now()}`

      // Simulate streaming for development
      actor.send({
        type: 'STREAM_START',
        requestId,
        messageId,
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      actor.send({
        type: 'CHUNK',
        text: `Processing: "${prompt}" `,
      })

      await new Promise((resolve) => setTimeout(resolve, 200))

      actor.send({
        type: 'CHUNK',
        text: '[Running in web mode - connect Tauri for full functionality]',
      })

      actor.send({
        type: 'COMPLETE',
        stopReason: 'end_turn',
        sessionId: `orion-adhoc-${Date.now()}`,
        costUsd: 0,
        tokenCount: 0,
        durationMs: 300,
      })
    }
  }, [])

  // Cancel the current request
  const cancel = useCallback(async () => {
    if (isTauri() && currentRequestIdRef.current) {
      try {
        await chatCancel(currentRequestIdRef.current)
        currentRequestIdRef.current = null
      } catch (err) {
        console.error('Failed to cancel request:', err)
      }
    }
    // Send CANCEL instead of RESET to show cancelled state
    actorRef.current.send({ type: 'CANCEL' })
  }, [])

  // Retry after an error
  const retry = useCallback(() => {
    actorRef.current.send({ type: 'RETRY' })
  }, [])

  // Reset the conversation
  const reset = useCallback(() => {
    currentRequestIdRef.current = null
    actorRef.current.send({ type: 'RESET' })
  }, [])

  // Clear save error (Issue #7)
  const clearSaveError = useCallback(() => {
    setSaveError(null)
  }, [])

  return {
    stateValue,
    messages,
    isStreaming: stateValue === 'streaming',
    isSending: stateValue === 'sending',
    error,
    toolUses,
    session,
    budgetWarning,
    currentThinking,
    retryAttempt,
    saveError, // Issue #7: Expose save errors to UI
    send,
    cancel,
    retry,
    reset,
    clearSaveError, // Issue #7: Allow dismissing save errors
  }
}
