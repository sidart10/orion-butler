/**
 * useStreamingMachine Hook
 * Story 2.6: Chat State Management
 *
 * React hook for using the streaming state machine.
 * Provides a simple interface for chat functionality.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { interpret } from 'xstate'
import {
  streamingMachine,
  ChatMessage,
} from '@/machines/streamingMachine'
import { sendQuery, StreamEvent } from '@/lib/agent/sdk-wrapper'

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
  /** Send a new message */
  send: (prompt: string) => void
  /** Retry after an error */
  retry: () => void
  /** Reset the conversation */
  reset: () => void
}

/**
 * Hook for managing chat state with XState
 */
export function useStreamingMachine(): UseStreamingMachineReturn {
  // Use ref to hold the service (doesn't change)
  const serviceRef = useRef(interpret(streamingMachine))

  // State values extracted from machine
  const [stateValue, setStateValue] = useState<string>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<Error | null>(null)

  // Start the service on mount
  useEffect(() => {
    const service = serviceRef.current

    service.onTransition((newState) => {
      setStateValue(newState.value as string)
      setMessages(newState.context.messages)
      setError(newState.context.error)
    })

    service.start()

    return () => {
      service.stop()
    }
  }, [])

  // Send a message
  const send = useCallback((prompt: string) => {
    const service = serviceRef.current
    service.send({ type: 'SEND', prompt })

    // Use SDK wrapper to send the message
    sendQuery(
      prompt,
      {},
      {
        onEvent: (event: StreamEvent) => {
          switch (event.type) {
            case 'message_start':
              service.send({
                type: 'STREAM_START',
                requestId: `req_${Date.now()}`,
                messageId: event.messageId,
              })
              break
            case 'text_delta':
              service.send({ type: 'CHUNK', text: event.text })
              break
            case 'message_end':
              service.send({ type: 'COMPLETE', stopReason: event.stopReason })
              break
            case 'error':
              service.send({ type: 'ERROR', error: event.error })
              break
          }
        },
        onComplete: () => {
          // Message complete - state machine handles this via COMPLETE event
        },
        onError: (err) => {
          service.send({ type: 'ERROR', error: err })
        },
      }
    )
  }, [])

  // Retry after an error
  const retry = useCallback(() => {
    serviceRef.current.send({ type: 'RETRY' })
  }, [])

  // Reset the conversation
  const reset = useCallback(() => {
    serviceRef.current.send({ type: 'RESET' })
  }, [])

  return {
    stateValue,
    messages,
    isStreaming: stateValue === 'streaming',
    isSending: stateValue === 'sending',
    error,
    send,
    retry,
    reset,
  }
}
