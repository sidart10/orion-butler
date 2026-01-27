/**
 * Streaming State Machine
 * Story 2.6: Chat State Management
 *
 * XState v4 machine for managing streaming chat state.
 * Uses v4 API (createMachine/interpret) due to @xstate/test compatibility.
 *
 * States:
 * - idle: Ready to send a message
 * - sending: Message sent, waiting for response to start
 * - streaming: Receiving streamed response chunks
 * - complete: Response finished successfully
 * - error: An error occurred
 */

import { createMachine, assign } from 'xstate'

// Message types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

// Context type
export interface StreamingContext {
  messages: ChatMessage[]
  currentMessage: string
  requestId: string | null
  error: Error | null
}

// Event types
export type StreamingEvent =
  | { type: 'SEND'; prompt: string }
  | { type: 'STREAM_START'; requestId: string; messageId: string }
  | { type: 'CHUNK'; text: string }
  | { type: 'COMPLETE'; stopReason: string }
  | { type: 'ERROR'; error: Error }
  | { type: 'RETRY' }
  | { type: 'RESET' }

// Initial context
const initialContext: StreamingContext = {
  messages: [],
  currentMessage: '',
  requestId: null,
  error: null,
}

/**
 * Streaming State Machine (XState v4)
 */
export const streamingMachine = createMachine<StreamingContext, StreamingEvent>(
  {
    id: 'streaming',
    initial: 'idle',
    context: initialContext,
    states: {
      idle: {
        on: {
          SEND: {
            target: 'sending',
            actions: ['addUserMessage'],
          },
        },
      },
      sending: {
        on: {
          STREAM_START: {
            target: 'streaming',
            actions: ['setRequestId', 'startAssistantMessage'],
          },
          ERROR: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      streaming: {
        on: {
          CHUNK: {
            actions: ['appendChunk'],
          },
          COMPLETE: {
            target: 'complete',
            actions: ['finalizeMessage'],
          },
          ERROR: {
            target: 'error',
            actions: ['setError'],
          },
        },
      },
      complete: {
        on: {
          SEND: {
            target: 'sending',
            actions: ['addUserMessage'],
          },
          RESET: {
            target: 'idle',
            actions: ['resetContext'],
          },
        },
      },
      error: {
        on: {
          RETRY: {
            target: 'sending',
          },
          RESET: {
            target: 'idle',
            actions: ['resetContext'],
          },
          SEND: {
            target: 'sending',
            actions: ['addUserMessage', 'clearError'],
          },
        },
      },
    },
  },
  {
    actions: {
      addUserMessage: assign({
        messages: (context, event) => {
          if (event.type !== 'SEND') return context.messages
          const newMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: event.prompt,
            timestamp: Date.now(),
          }
          return [...context.messages, newMessage]
        },
      }),
      setRequestId: assign({
        requestId: (_, event) => {
          if (event.type !== 'STREAM_START') return null
          return event.requestId
        },
      }),
      startAssistantMessage: assign({
        messages: (context, event) => {
          if (event.type !== 'STREAM_START') return context.messages
          const newMessage: ChatMessage = {
            id: event.messageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
          }
          return [...context.messages, newMessage]
        },
        currentMessage: () => '',
      }),
      appendChunk: assign({
        currentMessage: (context, event) => {
          if (event.type !== 'CHUNK') return context.currentMessage
          return context.currentMessage + event.text
        },
        messages: (context, event) => {
          if (event.type !== 'CHUNK') return context.messages
          const messages = [...context.messages]
          const lastMessage = messages[messages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + event.text,
            }
          }
          return messages
        },
      }),
      finalizeMessage: assign({
        messages: (context) => {
          const messages = [...context.messages]
          const lastMessage = messages[messages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              isStreaming: false,
            }
          }
          return messages
        },
        currentMessage: () => '',
        requestId: () => null,
      }),
      setError: assign({
        error: (_, event) => {
          if (event.type !== 'ERROR') return null
          return event.error
        },
      }),
      clearError: assign({
        error: () => null,
      }),
      resetContext: assign(initialContext),
    },
  }
)

export type StreamingState = typeof streamingMachine extends {
  context: infer C
}
  ? C
  : never
