/**
 * Streaming State Machine
 * Story 2.5/2.6: Chat State Management with IPC Integration
 *
 * XState v5 machine for managing streaming chat state.
 *
 * States:
 * - idle: Ready to send a message
 * - sending: Message sent, waiting for response to start
 * - streaming: Receiving streamed response chunks
 * - complete: Response finished successfully
 * - error: An error occurred
 *
 * Supports:
 * - Text streaming with partial chunks
 * - Thinking/reasoning display
 * - Tool use tracking
 * - Session/cost tracking
 * - Budget warnings (NFR-5.7)
 */

import { createMachine, assign } from 'xstate'

// =============================================================================
// Message Types
// =============================================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

export interface ToolUse {
  id: string
  name: string
  input: unknown
  result?: unknown
  durationMs?: number
  status: 'pending' | 'running' | 'complete' | 'error'
}

export interface SessionInfo {
  id: string
  costUsd: number
  tokenCount: number
  durationMs: number
}

// =============================================================================
// Context Type
// =============================================================================

export interface StreamingContext {
  /** All messages in the conversation */
  messages: ChatMessage[]
  /** Current message being streamed */
  currentMessage: string
  /** Current thinking content */
  currentThinking: string
  /** Active request ID */
  requestId: string | null
  /** Current error */
  error: Error | null
  /** Active tool uses */
  toolUses: ToolUse[]
  /** Session info (updated on complete) */
  session: SessionInfo | null
  /** Budget warning triggered */
  budgetWarning: boolean
}

// =============================================================================
// Event Types
// =============================================================================

export type StreamingEvent =
  | { type: 'SEND'; prompt: string }
  | { type: 'STREAM_START'; requestId: string; messageId: string }
  | { type: 'CHUNK'; text: string }
  | { type: 'THINKING'; text: string }
  | { type: 'TOOL_START'; toolId: string; name: string; input: unknown }
  | { type: 'TOOL_COMPLETE'; toolId: string; result: unknown; durationMs: number }
  | {
      type: 'COMPLETE'
      stopReason: string
      sessionId: string
      costUsd: number
      tokenCount: number
      durationMs: number
    }
  | { type: 'ERROR'; error: Error }
  | { type: 'BUDGET_WARNING'; currentCostUsd: number; maxBudgetUsd: number }
  | { type: 'RETRY' }
  | { type: 'RESET' }

// =============================================================================
// Initial Context
// =============================================================================

const initialContext: StreamingContext = {
  messages: [],
  currentMessage: '',
  currentThinking: '',
  requestId: null,
  error: null,
  toolUses: [],
  session: null,
  budgetWarning: false,
}

// =============================================================================
// Streaming State Machine
// =============================================================================

/**
 * Streaming State Machine (XState v5)
 */
export const streamingMachine = createMachine(
  {
    id: 'streaming',
    initial: 'idle',
    context: initialContext,
    types: {} as {
      context: StreamingContext
      events: StreamingEvent
    },
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
          THINKING: {
            actions: ['appendThinking'],
          },
          TOOL_START: {
            actions: ['addToolUse'],
          },
          TOOL_COMPLETE: {
            actions: ['completeToolUse'],
          },
          BUDGET_WARNING: {
            actions: ['setBudgetWarning'],
          },
          COMPLETE: {
            target: 'complete',
            actions: ['finalizeMessage', 'setSession'],
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
            actions: ['addUserMessage', 'clearBudgetWarning'],
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
            actions: ['addUserMessage', 'clearError', 'clearBudgetWarning'],
          },
        },
      },
    },
  },
  {
    actions: {
      addUserMessage: assign({
        messages: ({ context, event }) => {
          if (event.type !== 'SEND') return context.messages
          const newMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: event.prompt,
            timestamp: Date.now(),
          }
          return [...context.messages, newMessage]
        },
        // Reset tool uses for new message
        toolUses: () => [],
      }),

      setRequestId: assign({
        requestId: ({ event }) => {
          if (event.type !== 'STREAM_START') return null
          return event.requestId
        },
      }),

      startAssistantMessage: assign({
        messages: ({ context, event }) => {
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
        currentThinking: () => '',
      }),

      appendChunk: assign({
        currentMessage: ({ context, event }) => {
          if (event.type !== 'CHUNK') return context.currentMessage
          return context.currentMessage + event.text
        },
        messages: ({ context, event }) => {
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

      appendThinking: assign({
        currentThinking: ({ context, event }) => {
          if (event.type !== 'THINKING') return context.currentThinking
          return context.currentThinking + event.text
        },
      }),

      addToolUse: assign({
        toolUses: ({ context, event }) => {
          if (event.type !== 'TOOL_START') return context.toolUses
          const toolUse: ToolUse = {
            id: event.toolId,
            name: event.name,
            input: event.input,
            status: 'running',
          }
          return [...context.toolUses, toolUse]
        },
      }),

      completeToolUse: assign({
        toolUses: ({ context, event }) => {
          if (event.type !== 'TOOL_COMPLETE') return context.toolUses
          return context.toolUses.map((tu) =>
            tu.id === event.toolId
              ? {
                  ...tu,
                  result: event.result,
                  durationMs: event.durationMs,
                  status: 'complete' as const,
                }
              : tu
          )
        },
      }),

      setBudgetWarning: assign({
        budgetWarning: () => true,
      }),

      clearBudgetWarning: assign({
        budgetWarning: () => false,
      }),

      finalizeMessage: assign({
        messages: ({ context }) => {
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
        currentThinking: () => '',
        requestId: () => null,
      }),

      setSession: assign({
        session: ({ event }) => {
          if (event.type !== 'COMPLETE') return null
          return {
            id: event.sessionId,
            costUsd: event.costUsd,
            tokenCount: event.tokenCount,
            durationMs: event.durationMs,
          }
        },
      }),

      setError: assign({
        error: ({ event }) => {
          if (event.type !== 'ERROR') return null
          return event.error
        },
      }),

      clearError: assign({
        error: () => null,
      }),

      resetContext: assign(() => initialContext),
    },
  }
)

// =============================================================================
// Type Exports
// =============================================================================

export type StreamingState = typeof streamingMachine extends {
  context: infer C
}
  ? C
  : never
