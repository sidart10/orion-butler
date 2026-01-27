/**
 * Stub Streaming State Machine
 *
 * This stub machine defines the interface for the streaming state machine
 * that will be implemented in Epic 2 Story 2.6 (src/lib/state/streaming.ts).
 *
 * The test model is written against this stub, ensuring that when the
 * production machine is implemented, it will satisfy all the test requirements.
 *
 * States: idle, streaming, complete, error, cancelled
 * Events: START, TOKEN, COMPLETE, ERROR, CANCEL
 *
 * @see architecture.md State Management section
 * @see Story 0.3: XState Test Model for Streaming Determinism
 */
import { createMachine, assign } from 'xstate';

/**
 * Context for the streaming state machine
 */
export interface StreamingContext {
  /** Accumulated content tokens */
  content: string;
  /** Error message if in error state */
  errorMessage: string | null;
  /** Count of tokens received */
  tokenCount: number;
  /** Timestamp when streaming started */
  startedAt: number | null;
  /** Timestamp when streaming completed/ended */
  endedAt: number | null;
}

/**
 * Events for the streaming state machine
 */
export type StreamingEvent =
  | { type: 'START' }
  | { type: 'TOKEN'; data: string }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; message: string }
  | { type: 'CANCEL' };

/**
 * State schema for the streaming state machine
 */
export interface StreamingStateSchema {
  states: {
    idle: Record<string, never>;
    streaming: Record<string, never>;
    complete: Record<string, never>;
    error: Record<string, never>;
    cancelled: Record<string, never>;
  };
}

/**
 * Initial context for the streaming machine
 */
const initialContext: StreamingContext = {
  content: '',
  errorMessage: null,
  tokenCount: 0,
  startedAt: null,
  endedAt: null,
};

/**
 * Stub streaming state machine for testing
 *
 * This machine defines 5 states and transitions between them:
 * - idle: Initial state, waiting for START event
 * - streaming: Receiving tokens, can transition to complete/error/cancelled
 * - complete: Final state, stream completed successfully
 * - error: Final state, stream failed with error
 * - cancelled: Final state, stream was cancelled by user
 *
 * Production implementation in Epic 2 must match this interface.
 */
export const streamingMachine = createMachine<StreamingContext, StreamingEvent>(
  {
    id: 'streaming',
    initial: 'idle',
    predictableActionArguments: true,
    context: initialContext,
    states: {
      idle: {
        on: {
          START: {
            target: 'streaming',
            actions: 'recordStartTime',
          },
        },
      },
      streaming: {
        on: {
          TOKEN: {
            target: 'streaming',
            actions: 'appendToken',
          },
          COMPLETE: {
            target: 'complete',
            actions: 'recordEndTime',
          },
          ERROR: {
            target: 'error',
            actions: ['setErrorMessage', 'recordEndTime'],
          },
          CANCEL: {
            target: 'cancelled',
            actions: 'recordEndTime',
          },
        },
      },
      complete: {
        type: 'final',
      },
      error: {
        type: 'final',
      },
      cancelled: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      recordStartTime: assign({
        startedAt: () => Date.now(),
      }),
      recordEndTime: assign({
        endedAt: () => Date.now(),
      }),
      appendToken: assign({
        content: (context, event) =>
          event.type === 'TOKEN'
            ? context.content + event.data
            : context.content,
        tokenCount: (context) => context.tokenCount + 1,
      }),
      setErrorMessage: assign({
        errorMessage: (_, event) =>
          event.type === 'ERROR' ? event.message : null,
      }),
    },
  }
);

/**
 * Type exports for test model and production use
 */
export type StreamingMachine = typeof streamingMachine;
export type StreamingState = 'idle' | 'streaming' | 'complete' | 'error' | 'cancelled';

/**
 * Helper to check if machine is in a final state
 */
export function isFinalState(state: StreamingState): boolean {
  return state === 'complete' || state === 'error' || state === 'cancelled';
}

/**
 * Helper to get all possible state values
 */
export const STREAMING_STATES: readonly StreamingState[] = [
  'idle',
  'streaming',
  'complete',
  'error',
  'cancelled',
] as const;

/**
 * Helper to get all possible event types
 */
export const STREAMING_EVENTS = ['START', 'TOKEN', 'COMPLETE', 'ERROR', 'CANCEL'] as const;
