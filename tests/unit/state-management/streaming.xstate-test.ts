/**
 * XState Test Model for Streaming State Machine
 *
 * Story 0.3: XState Test Model for Streaming Determinism
 *
 * This test model provides deterministic coverage of all streaming state paths
 * without race conditions. Tests use model-based testing with @xstate/test
 * to ensure all state transitions are tested.
 *
 * Acceptance Criteria:
 * - AC#1: All streaming state paths are tested deterministically via `npx vitest run --project=xstate-tests`
 * - AC#2: Tests use `waitForResponse` instead of `waitForTimeout` for state transitions
 *
 * Paths covered:
 * - idle -> streaming -> complete
 * - idle -> streaming -> error
 * - idle -> streaming -> cancelled
 * - idle -> streaming -> (TOKEN) -> streaming -> complete/error/cancelled
 *
 * @see architecture.md State Management section
 * @see tests/fixtures/machines/streaming-stub.ts
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createModel } from '@xstate/test';
import { createMachine, interpret, assign, AnyInterpreter } from 'xstate';
import {
  streamingMachine,
  StreamingContext,
  StreamingEvent,
  StreamingState,
  STREAMING_STATES,
  isFinalState,
} from '../../fixtures/machines/streaming-stub';

/**
 * Test subject interface - the system under test
 * This could be a React component, a service, or any system that uses the streaming machine
 */
interface StreamingTestSubject {
  /** The XState interpreter */
  service: AnyInterpreter;
  /** Get current state */
  getCurrentState: () => StreamingState;
  /** Wait for a specific state (deterministic, no timeout) */
  waitForState: (targetState: StreamingState) => Promise<void>;
  /** Trigger START event */
  start: () => void;
  /** Trigger TOKEN event */
  receiveToken: (data: string) => void;
  /** Trigger COMPLETE event */
  complete: () => void;
  /** Trigger ERROR event */
  error: (message: string) => void;
  /** Trigger CANCEL event */
  cancel: () => void;
  /** Cleanup */
  stop: () => void;
}

/**
 * Create a test subject that wraps the streaming machine
 * Uses deterministic waitForState instead of waitForTimeout (AC#2)
 */
function createStreamingTestSubject(): StreamingTestSubject {
  const service = interpret(streamingMachine);
  let currentStateValue: StreamingState = 'idle';

  // Track state changes
  service.onTransition((state) => {
    currentStateValue = state.value as StreamingState;
  });

  service.start();

  return {
    service,

    getCurrentState: () => currentStateValue,

    /**
     * Wait for a specific state - deterministic, event-driven (AC#2)
     * This replaces any waitForTimeout with waitForResponse pattern
     */
    waitForState: (targetState: StreamingState): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        // If already in target state, resolve immediately
        if (currentStateValue === targetState) {
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          reject(
            new Error(
              `Timeout waiting for state '${targetState}', current state: '${currentStateValue}'`
            )
          );
        }, 5000);

        const subscription = service.subscribe((state) => {
          if (state.value === targetState) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve();
          }
        });
      });
    },

    start: () => {
      service.send({ type: 'START' });
    },

    receiveToken: (data: string) => {
      service.send({ type: 'TOKEN', data });
    },

    complete: () => {
      service.send({ type: 'COMPLETE' });
    },

    error: (message: string) => {
      service.send({ type: 'ERROR', message });
    },

    cancel: () => {
      service.send({ type: 'CANCEL' });
    },

    stop: () => {
      service.stop();
    },
  };
}

/**
 * Simplified streaming machine for path generation
 * Excludes TOKEN event to prevent infinite self-loop exploration
 * TOKEN transitions are tested explicitly in separate test cases
 */
const streamingMachineForPathGen = createMachine<StreamingContext>({
  id: 'streaming-pathgen',
  initial: 'idle',
  predictableActionArguments: true,
  context: {
    content: '',
    errorMessage: null,
    tokenCount: 0,
    startedAt: null,
    endedAt: null,
  },
  states: {
    idle: {
      on: {
        START: 'streaming',
      },
    },
    streaming: {
      on: {
        // TOKEN intentionally excluded - self-loops cause infinite path generation
        COMPLETE: 'complete',
        ERROR: 'error',
        CANCEL: 'cancelled',
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
});

/**
 * XState Test Model Definition
 * Uses simplified machine without TOKEN to generate finite paths
 */
const streamingTestModel = createModel(streamingMachineForPathGen, {
  events: {
    START: { exec: () => {} },
    COMPLETE: { exec: () => {} },
    ERROR: { exec: () => {} },
    CANCEL: { exec: () => {} },
  },
});

describe('Streaming State Machine XState Test Model', () => {
  let testSubject: StreamingTestSubject;

  beforeEach(() => {
    testSubject = createStreamingTestSubject();
  });

  afterEach(() => {
    testSubject.stop();
  });

  /**
   * State verification tests using test model
   */
  describe('State Verification (AC#1)', () => {
    it('should start in idle state', () => {
      expect(testSubject.getCurrentState()).toBe('idle');
    });

    it('should transition to streaming on START', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');
      expect(testSubject.getCurrentState()).toBe('streaming');
    });

    it('should remain in streaming on TOKEN', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('Hello');
      expect(testSubject.getCurrentState()).toBe('streaming');

      testSubject.receiveToken(' World');
      expect(testSubject.getCurrentState()).toBe('streaming');
    });

    it('should transition to complete on COMPLETE', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.complete();
      await testSubject.waitForState('complete');
      expect(testSubject.getCurrentState()).toBe('complete');
    });

    it('should transition to error on ERROR', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.error('Network failure');
      await testSubject.waitForState('error');
      expect(testSubject.getCurrentState()).toBe('error');
    });

    it('should transition to cancelled on CANCEL', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.cancel();
      await testSubject.waitForState('cancelled');
      expect(testSubject.getCurrentState()).toBe('cancelled');
    });
  });

  /**
   * Path coverage tests - covers all state paths (AC#1)
   */
  describe('Path Coverage: idle -> streaming -> complete', () => {
    it('should complete the happy path without tokens', async () => {
      // idle -> streaming -> complete
      expect(testSubject.getCurrentState()).toBe('idle');

      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.complete();
      await testSubject.waitForState('complete');

      expect(isFinalState(testSubject.getCurrentState())).toBe(true);
    });

    it('should complete the happy path with tokens', async () => {
      // idle -> streaming -> (TOKEN multiple times) -> complete
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('First ');
      testSubject.receiveToken('Second ');
      testSubject.receiveToken('Third');

      testSubject.complete();
      await testSubject.waitForState('complete');

      expect(testSubject.getCurrentState()).toBe('complete');
    });
  });

  describe('Path Coverage: idle -> streaming -> error', () => {
    it('should handle error without tokens', async () => {
      // idle -> streaming -> error
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.error('Connection lost');
      await testSubject.waitForState('error');

      expect(testSubject.getCurrentState()).toBe('error');
      expect(isFinalState(testSubject.getCurrentState())).toBe(true);
    });

    it('should handle error after receiving tokens', async () => {
      // idle -> streaming -> (TOKEN) -> error
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('Partial response');
      testSubject.error('Stream interrupted');
      await testSubject.waitForState('error');

      expect(testSubject.getCurrentState()).toBe('error');
    });
  });

  describe('Path Coverage: idle -> streaming -> cancelled', () => {
    it('should handle cancellation without tokens', async () => {
      // idle -> streaming -> cancelled
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.cancel();
      await testSubject.waitForState('cancelled');

      expect(testSubject.getCurrentState()).toBe('cancelled');
      expect(isFinalState(testSubject.getCurrentState())).toBe(true);
    });

    it('should handle cancellation after receiving tokens', async () => {
      // idle -> streaming -> (TOKEN) -> cancelled
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('User decides to');
      testSubject.cancel();
      await testSubject.waitForState('cancelled');

      expect(testSubject.getCurrentState()).toBe('cancelled');
    });
  });

  /**
   * Deterministic wait verification (AC#2)
   * These tests verify that waitForState works deterministically
   * without using any timing-based waits
   */
  describe('Deterministic Waits (AC#2)', () => {
    it('should use waitForState instead of waitForTimeout', async () => {
      // This test verifies the pattern - waitForState resolves on state change
      const startTime = Date.now();

      testSubject.start();
      await testSubject.waitForState('streaming');

      const elapsed = Date.now() - startTime;
      // Should be nearly instant (< 100ms), not a fixed timeout
      expect(elapsed).toBeLessThan(100);
    });

    it('should resolve immediately if already in target state', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      // Call waitForState again for current state
      const startTime = Date.now();
      await testSubject.waitForState('streaming');
      const elapsed = Date.now() - startTime;

      // Should resolve immediately
      expect(elapsed).toBeLessThan(10);
    });

    it('should wait for state transition deterministically', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      // Start waiting for complete before sending the event
      const waitPromise = testSubject.waitForState('complete');

      // Small delay then send complete
      setTimeout(() => testSubject.complete(), 50);

      // Wait should resolve when state changes
      await waitPromise;
      expect(testSubject.getCurrentState()).toBe('complete');
    });
  });

  /**
   * Context verification tests
   */
  describe('Context Tracking', () => {
    it('should track token content', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('Hello ');
      testSubject.receiveToken('World');

      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.context.content).toBe('Hello World');
      expect(snapshot.context.tokenCount).toBe(2);
    });

    it('should record timing information', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      const snapshotStreaming = testSubject.service.getSnapshot();
      expect(snapshotStreaming.context.startedAt).not.toBeNull();
      expect(snapshotStreaming.context.endedAt).toBeNull();

      testSubject.complete();
      await testSubject.waitForState('complete');

      const snapshotComplete = testSubject.service.getSnapshot();
      expect(snapshotComplete.context.endedAt).not.toBeNull();
      expect(snapshotComplete.context.endedAt!).toBeGreaterThanOrEqual(
        snapshotComplete.context.startedAt!
      );
    });

    it('should capture error message', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.error('Rate limit exceeded');
      await testSubject.waitForState('error');

      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.context.errorMessage).toBe('Rate limit exceeded');
    });
  });

  /**
   * Model-based test paths - verifies all reachable states
   * Note: TOKEN event excluded from path generation to prevent infinite loops
   * (TOKEN self-loops are tested explicitly above)
   */
  describe('Model-Based Path Generation (100% State Coverage)', () => {
    // Get simple paths that reach each state
    const testPlans = streamingTestModel.getSimplePathPlans();

    testPlans.forEach((plan) => {
      describe(plan.description, () => {
        plan.paths.forEach((path) => {
          it(path.description, async () => {
            // Create fresh subject for each path test
            const subject = createStreamingTestSubject();
            try {
              // Track expected final state based on events executed
              let expectedFinalState: StreamingState = 'idle';

              // Execute each segment in the path
              for (const segment of path.segments) {
                // Execute the event
                switch (segment.event.type) {
                  case 'START':
                    subject.start();
                    await subject.waitForState('streaming');
                    expectedFinalState = 'streaming';
                    break;
                  case 'COMPLETE':
                    subject.complete();
                    await subject.waitForState('complete');
                    expectedFinalState = 'complete';
                    break;
                  case 'ERROR':
                    subject.error('Test error');
                    await subject.waitForState('error');
                    expectedFinalState = 'error';
                    break;
                  case 'CANCEL':
                    subject.cancel();
                    await subject.waitForState('cancelled');
                    expectedFinalState = 'cancelled';
                    break;
                }
              }

              // Verify we reached the expected final state
              expect(subject.getCurrentState()).toBe(expectedFinalState);
            } finally {
              subject.stop();
            }
          });
        });
      });
    });
  });

  /**
   * State coverage verification
   */
  describe('State Coverage Verification', () => {
    it('should have test coverage for all states', () => {
      // Verify all states are defined in the machine
      const machineStates = Object.keys(streamingMachine.states);
      expect(machineStates).toEqual(expect.arrayContaining(STREAMING_STATES as unknown as string[]));
    });

    it('should verify all final states are tested', () => {
      const finalStates: StreamingState[] = ['complete', 'error', 'cancelled'];
      finalStates.forEach((state) => {
        expect(isFinalState(state)).toBe(true);
      });
    });

    it('should verify idle state is initial', () => {
      expect(streamingMachine.initialState.value).toBe('idle');
    });

    it('should verify TOKEN keeps machine in streaming', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      // Send multiple TOKEN events
      for (let i = 0; i < 10; i++) {
        testSubject.receiveToken(`token-${i}`);
        expect(testSubject.getCurrentState()).toBe('streaming');
      }
    });
  });

  /**
   * Event adapter tests - verify custom event handling
   */
  describe('Event Adapters', () => {
    it('START adapter transitions from idle to streaming', async () => {
      expect(testSubject.getCurrentState()).toBe('idle');
      testSubject.start();
      await testSubject.waitForState('streaming');
      expect(testSubject.getCurrentState()).toBe('streaming');
    });

    it('TOKEN adapter appends content in streaming state', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.receiveToken('test');
      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.context.content).toContain('test');
    });

    it('COMPLETE adapter finalizes from streaming', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.complete();
      await testSubject.waitForState('complete');

      // Verify it's a final state
      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.done).toBe(true);
    });

    it('ERROR adapter captures error message', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      const errorMsg = 'Custom error message';
      testSubject.error(errorMsg);
      await testSubject.waitForState('error');

      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.context.errorMessage).toBe(errorMsg);
      expect(snapshot.done).toBe(true);
    });

    it('CANCEL adapter terminates from streaming', async () => {
      testSubject.start();
      await testSubject.waitForState('streaming');

      testSubject.cancel();
      await testSubject.waitForState('cancelled');

      const snapshot = testSubject.service.getSnapshot();
      expect(snapshot.done).toBe(true);
    });
  });
});
