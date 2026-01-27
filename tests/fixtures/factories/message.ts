/**
 * Message Factory for Orion Butler Tests
 *
 * Creates test Message entities with support for different roles and content types.
 * REQUIRED for SessionFactory.createWithMessages() relationship helper.
 *
 * @see AC#2: MessageFactory is required for createWithMessages
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 */
import type { Message, MessageRole, ContentBlock } from './types';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Counter for generating unique session references
 */
let sessionCounter = 0;

/**
 * Factory for creating Message entities
 */
export const MessageFactory = {
  /**
   * Create a single Message entity with defaults
   *
   * @param overrides - Partial Message to override defaults
   * @returns A valid Message entity
   *
   * @example
   * ```typescript
   * const message = MessageFactory.create({ role: 'assistant' });
   * expect(message.role).toBe('assistant');
   * ```
   */
  create(overrides: Partial<Message> = {}): Message {
    return {
      id: generateUUID(),
      sessionId: overrides.sessionId ?? `session-${++sessionCounter}`,
      role: 'user' as MessageRole,
      content: 'Test message content',
      createdAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Create multiple Message entities
   *
   * @param count - Number of messages to create
   * @param overrides - Partial Message to apply to all created messages
   * @returns Array of Message entities
   *
   * @example
   * ```typescript
   * const messages = MessageFactory.createMany(5, { sessionId: 'my-session' });
   * expect(messages).toHaveLength(5);
   * messages.forEach(m => expect(m.sessionId).toBe('my-session'));
   * ```
   */
  createMany(count: number, overrides: Partial<Message> = {}): Message[] {
    const messages: Message[] = [];
    for (let i = 0; i < count; i++) {
      messages.push(this.create(overrides));
    }
    return messages;
  },

  /**
   * Create a user message with text content
   *
   * @param content - Text content for the message
   * @param overrides - Additional overrides
   * @returns A user role Message
   */
  createUserMessage(content: string, overrides: Partial<Message> = {}): Message {
    return this.create({
      role: 'user',
      content,
      ...overrides,
    });
  },

  /**
   * Create an assistant message with text content
   *
   * @param content - Text content for the message
   * @param overrides - Additional overrides
   * @returns An assistant role Message
   */
  createAssistantMessage(content: string, overrides: Partial<Message> = {}): Message {
    return this.create({
      role: 'assistant',
      content,
      ...overrides,
    });
  },

  /**
   * Create a message with tool_use content block
   *
   * @param toolName - Name of the tool (e.g., 'GMAIL_SEND_EMAIL')
   * @param input - Tool input parameters
   * @param overrides - Additional overrides
   * @returns A Message with tool_use content block
   */
  createToolUseMessage(
    toolName: string,
    input: Record<string, unknown>,
    overrides: Partial<Message> = {}
  ): Message {
    const toolUseBlock: ContentBlock = {
      type: 'tool_use',
      id: `tool-${generateUUID()}`,
      name: toolName,
      input,
    };

    return this.create({
      role: 'assistant',
      content: [toolUseBlock],
      ...overrides,
    });
  },

  /**
   * Create a message with tool_result content block
   *
   * @param toolUseId - ID of the tool_use this is responding to
   * @param result - Result content (string or blocks)
   * @param overrides - Additional overrides
   * @returns A Message with tool_result content block
   */
  createToolResultMessage(
    toolUseId: string,
    result: string,
    overrides: Partial<Message> = {}
  ): Message {
    const toolResultBlock: ContentBlock = {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: result,
    };

    return this.create({
      role: 'user',
      content: [toolResultBlock],
      ...overrides,
    });
  },

  /**
   * Reset the counter (useful for test isolation)
   */
  resetCounter(): void {
    sessionCounter = 0;
  },
};
