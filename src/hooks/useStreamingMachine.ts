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
  subscribeToChatEvents,
  type ChatQueryOptions,
} from '@/lib/ipc/chat'

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
  /** Whether budget warning has been triggered */
  budgetWarning: boolean
  /** Current thinking content */
  currentThinking: string
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

  // State values extracted from machine
  const [stateValue, setStateValue] = useState<string>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [toolUses, setToolUses] = useState<ToolUse[]>([])
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [budgetWarning, setBudgetWarning] = useState<boolean>(false)
  const [currentThinking, setCurrentThinking] = useState<string>('')

  // Start the actor and subscribe to events on mount
  useEffect(() => {
    const actor = actorRef.current

    const subscription = actor.subscribe((snapshot) => {
      console.log('[useStreamingMachine] State transition:', snapshot.value, 'messages:', snapshot.context.messages.length)
      setStateValue(snapshot.value as string)
      setMessages(snapshot.context.messages)
      setError(snapshot.context.error)
      setToolUses(snapshot.context.toolUses)
      setSession(snapshot.context.session)
      setBudgetWarning(snapshot.context.budgetWarning)
      setCurrentThinking(snapshot.context.currentThinking)
    })

    actor.start()

    // Subscribe to Tauri events if in Tauri environment
    let cleanup: (() => void) | null = null

    if (isTauri()) {
      subscribeToChatEvents({
        onMessageStart: (event) => {
          actor.send({
            type: 'STREAM_START',
            requestId: event.requestId,
            messageId: event.messageId,
          })
        },
        onMessageChunk: (event) => {
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
          actor.send({
            type: 'TOOL_START',
            toolId: event.toolId,
            name: event.name,
            input: event.input,
          })
        },
        onToolComplete: (event) => {
          actor.send({
            type: 'TOOL_COMPLETE',
            toolId: event.toolId,
            result: event.result,
            durationMs: event.durationMs,
          })
        },
        onSessionComplete: (event) => {
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
        // Send via Tauri IPC
        console.log('[useStreamingMachine] Calling chatSend via Tauri IPC...')
        const requestId = await chatSend(prompt, options)
        console.log('[useStreamingMachine] Got requestId:', requestId)
        currentRequestIdRef.current = requestId
        // Events will come through the Tauri event listeners
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
    actorRef.current.send({ type: 'RESET' })
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
    send,
    cancel,
    retry,
    reset,
  }
}
