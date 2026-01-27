/**
 * Unit tests for MessageFactory
 *
 * Tests AC#2: MessageFactory is REQUIRED for createWithMessages
 * Tests support for message roles and content types
 */
import { describe, it, expect } from 'vitest';
import { MessageFactory } from '../../fixtures/factories/message';
import type { Message, MessageRole, ContentBlock } from '../../fixtures/factories/types';

describe('MessageFactory', () => {
  describe('create()', () => {
    it('should create a valid Message entity with default values', () => {
      const message = MessageFactory.create();

      expect(message.id).toBeDefined();
      expect(typeof message.id).toBe('string');
      expect(message.sessionId).toBeDefined();
      expect(message.role).toBeDefined();
      expect(message.content).toBeDefined();
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should create a Message with custom overrides', () => {
      const customDate = new Date('2026-01-15');
      const message = MessageFactory.create({
        id: 'custom-message-id',
        sessionId: 'custom-session-id',
        role: 'assistant',
        content: 'Custom content',
        createdAt: customDate,
      });

      expect(message.id).toBe('custom-message-id');
      expect(message.sessionId).toBe('custom-session-id');
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Custom content');
      expect(message.createdAt).toEqual(customDate);
    });

    it('should generate unique IDs for each message', () => {
      const message1 = MessageFactory.create();
      const message2 = MessageFactory.create();

      expect(message1.id).not.toBe(message2.id);
    });

    it('should generate valid UUID format for ID', () => {
      const message = MessageFactory.create();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(message.id).toMatch(uuidRegex);
    });
  });

  describe('createMany()', () => {
    it('should create multiple messages with default values', () => {
      const messages = MessageFactory.createMany(3);

      expect(messages).toHaveLength(3);
      messages.forEach((message) => {
        expect(message.id).toBeDefined();
        expect(message.sessionId).toBeDefined();
      });
    });

    it('should create messages with shared overrides', () => {
      const sessionId = 'shared-session-id';
      const messages = MessageFactory.createMany(3, { sessionId });

      messages.forEach((message) => {
        expect(message.sessionId).toBe(sessionId);
      });
    });

    it('should generate unique IDs for all messages', () => {
      const messages = MessageFactory.createMany(5);
      const ids = messages.map((m) => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('should return empty array when count is 0', () => {
      const messages = MessageFactory.createMany(0);

      expect(messages).toHaveLength(0);
    });
  });

  describe('message roles', () => {
    const roles: MessageRole[] = ['user', 'assistant'];

    roles.forEach((role) => {
      it(`should support ${role} role`, () => {
        const message = MessageFactory.create({ role });

        expect(message.role).toBe(role);
      });
    });
  });

  describe('content types', () => {
    it('should support text content', () => {
      const message = MessageFactory.create({ content: 'Plain text message' });

      expect(message.content).toBe('Plain text message');
      expect(typeof message.content).toBe('string');
    });

    it('should support structured content blocks (tool_use)', () => {
      const toolUseBlock: ContentBlock = {
        type: 'tool_use',
        id: 'tool-123',
        name: 'GMAIL_SEND_EMAIL',
        input: { to: 'test@example.com', subject: 'Test' },
      };

      const message = MessageFactory.create({ content: [toolUseBlock] });

      expect(Array.isArray(message.content)).toBe(true);
      const content = message.content as ContentBlock[];
      expect(content[0].type).toBe('tool_use');
    });

    it('should support structured content blocks (tool_result)', () => {
      const toolResultBlock: ContentBlock = {
        type: 'tool_result',
        tool_use_id: 'tool-123',
        content: 'Email sent successfully',
      };

      const message = MessageFactory.create({ content: [toolResultBlock] });

      expect(Array.isArray(message.content)).toBe(true);
      const content = message.content as ContentBlock[];
      expect(content[0].type).toBe('tool_result');
    });

    it('should support text content blocks', () => {
      const textBlock: ContentBlock = {
        type: 'text',
        text: 'This is a text block',
      };

      const message = MessageFactory.create({ content: [textBlock] });

      expect(Array.isArray(message.content)).toBe(true);
      const content = message.content as ContentBlock[];
      expect(content[0].type).toBe('text');
    });
  });

  describe('convenience methods', () => {
    it('should create a user message via createUserMessage()', () => {
      const message = MessageFactory.createUserMessage('Hello, Orion!');

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, Orion!');
    });

    it('should create an assistant message via createAssistantMessage()', () => {
      const message = MessageFactory.createAssistantMessage('Hello! How can I help?');

      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Hello! How can I help?');
    });

    it('should create a tool use message via createToolUseMessage()', () => {
      const message = MessageFactory.createToolUseMessage('GMAIL_SEND_EMAIL', {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Hello',
      });

      expect(message.role).toBe('assistant');
      expect(Array.isArray(message.content)).toBe(true);
      const content = message.content as ContentBlock[];
      expect(content[0].type).toBe('tool_use');
      expect((content[0] as { name: string }).name).toBe('GMAIL_SEND_EMAIL');
    });

    it('should create a tool result message via createToolResultMessage()', () => {
      const message = MessageFactory.createToolResultMessage('tool-123', 'Email sent successfully');

      expect(message.role).toBe('user');
      expect(Array.isArray(message.content)).toBe(true);
      const content = message.content as ContentBlock[];
      expect(content[0].type).toBe('tool_result');
    });
  });
});
