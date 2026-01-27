/**
 * ChatInput Test Helpers Factory for Orion Butler Tests
 *
 * Creates test props, mocks, and helpers for ChatInput component testing.
 * Used by Story 2.11 ATDD tests for verifying input enable/disable behavior.
 *
 * @see Story 2.11: Display ResultMessage Completion
 * @see src/components/chat/ChatInput.tsx (to be created)
 */

/**
 * Streaming machine state type
 */
export type StreamingState = 'idle' | 'sending' | 'streaming' | 'complete' | 'error';

/**
 * Streaming context type for mocking
 */
export interface MockStreamingContext {
  text: string;
  thinking: string[];
  tools: Map<string, unknown>;
  error: Error | null;
  costUsd: number;
  durationMs: number;
  totalTokens: number;
}

/**
 * Mock streaming machine return value
 */
export interface MockStreamingMachine {
  state: StreamingState;
  context: MockStreamingContext;
  send: (event: unknown) => void;
  reset: () => void;
  isLoading: boolean;
  isError: boolean;
  isComplete: boolean;
}

/**
 * ChatInput component props
 */
export interface ChatInputProps {
  onSend?: (message: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Create ChatInput component props with defaults
 *
 * @param overrides - Partial props to override defaults
 * @returns Valid ChatInputProps
 *
 * @example
 * ```typescript
 * const props = createChatInputProps({ disabled: true });
 * expect(props.disabled).toBe(true);
 * ```
 */
export function createChatInputProps(overrides: Partial<ChatInputProps> = {}): ChatInputProps {
  return {
    onSend: () => {},
    className: '',
    placeholder: 'Type a message...',
    disabled: false,
    ...overrides,
  };
}

/**
 * Create a mock streaming context
 */
export function createMockStreamingContext(
  overrides: Partial<MockStreamingContext> = {}
): MockStreamingContext {
  return {
    text: '',
    thinking: [],
    tools: new Map(),
    error: null,
    costUsd: 0,
    durationMs: 0,
    totalTokens: 0,
    ...overrides,
  };
}

/**
 * Create a mock streaming machine in a specific state
 *
 * @param state - The state to set the machine to
 * @param contextOverrides - Optional context overrides
 * @returns MockStreamingMachine configured for the given state
 *
 * @example
 * ```typescript
 * // Create machine in streaming state (input should be disabled)
 * const machine = createMockStreamingMachine('streaming');
 * expect(machine.isLoading).toBe(true);
 *
 * // Create machine in complete state (input should be enabled)
 * const completeMachine = createMockStreamingMachine('complete', {
 *   text: 'Response text',
 *   costUsd: 0.003,
 * });
 * expect(completeMachine.isComplete).toBe(true);
 * ```
 */
export function createMockStreamingMachine(
  state: StreamingState,
  contextOverrides: Partial<MockStreamingContext> = {}
): MockStreamingMachine {
  const context = createMockStreamingContext(contextOverrides);

  return {
    state,
    context,
    send: () => {},
    reset: () => {},
    isLoading: state === 'sending' || state === 'streaming',
    isError: state === 'error',
    isComplete: state === 'complete',
  };
}

/**
 * Create a mock streaming machine with a custom send spy
 *
 * @param state - The state to set the machine to
 * @param sendSpy - Custom send function (usually a vi.fn())
 * @returns MockStreamingMachine with custom send
 */
export function createMockStreamingMachineWithSpy(
  state: StreamingState,
  sendSpy: (event: unknown) => void
): MockStreamingMachine {
  const machine = createMockStreamingMachine(state);
  return {
    ...machine,
    send: sendSpy,
  };
}

/**
 * Simulate user typing in the input
 *
 * @param value - The text to type
 * @returns Object with value and events for testing
 */
export function simulateUserTyping(value: string): {
  value: string;
  events: Array<{ type: string; key?: string; value?: string }>;
} {
  const events: Array<{ type: string; key?: string; value?: string }> = [];

  for (const char of value) {
    events.push({ type: 'keydown', key: char });
    events.push({ type: 'input', value: events.length > 0 ? value.slice(0, events.length / 2) : char });
  }

  return { value, events };
}

/**
 * Simulate Cmd+Enter keyboard event
 */
export function simulateCmdEnter(): { key: string; metaKey: boolean; ctrlKey: boolean } {
  return {
    key: 'Enter',
    metaKey: true,
    ctrlKey: false,
  };
}

/**
 * Simulate Ctrl+Enter keyboard event (Windows/Linux)
 */
export function simulateCtrlEnter(): { key: string; metaKey: boolean; ctrlKey: boolean } {
  return {
    key: 'Enter',
    metaKey: false,
    ctrlKey: true,
  };
}

/**
 * Create test scenarios for ChatInput disabled states
 *
 * @returns Array of test scenarios
 */
export function createDisabledStateScenarios(): Array<{
  state: StreamingState;
  expectedDisabled: boolean;
  description: string;
}> {
  return [
    { state: 'idle', expectedDisabled: false, description: 'Input enabled in idle state' },
    { state: 'sending', expectedDisabled: true, description: 'Input disabled while sending' },
    { state: 'streaming', expectedDisabled: true, description: 'Input disabled while streaming' },
    { state: 'complete', expectedDisabled: false, description: 'Input enabled after completion' },
    { state: 'error', expectedDisabled: false, description: 'Input enabled after error' },
  ];
}

/**
 * Create placeholder text scenarios
 */
export function createPlaceholderScenarios(): Array<{
  state: StreamingState;
  expectedPlaceholder: string;
  description: string;
}> {
  return [
    { state: 'idle', expectedPlaceholder: 'Type a message...', description: 'Default placeholder' },
    {
      state: 'sending',
      expectedPlaceholder: 'Claude is responding...',
      description: 'Sending placeholder',
    },
    {
      state: 'streaming',
      expectedPlaceholder: 'Claude is responding...',
      description: 'Streaming placeholder',
    },
    {
      state: 'complete',
      expectedPlaceholder: 'Type a message...',
      description: 'Complete placeholder',
    },
    { state: 'error', expectedPlaceholder: 'Type a message...', description: 'Error placeholder' },
  ];
}

/**
 * Create a mock focus manager for testing focus behavior
 */
export function createMockFocusManager(): {
  focusCalled: boolean;
  focusCount: number;
  focus: () => void;
  reset: () => void;
} {
  let focusCalled = false;
  let focusCount = 0;

  return {
    get focusCalled() {
      return focusCalled;
    },
    get focusCount() {
      return focusCount;
    },
    focus: () => {
      focusCalled = true;
      focusCount++;
    },
    reset: () => {
      focusCalled = false;
      focusCount = 0;
    },
  };
}
