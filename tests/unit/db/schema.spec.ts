import { describe, it, expect } from 'vitest';
import {
  conversations,
  messages,
  sessionIndex,
  generateId,
  validateId,
  getIdPrefix,
  ID_PREFIXES,
} from '@/db/schema';

describe('Schema Definitions', () => {
  describe('conversations table', () => {
    it('has correct columns', () => {
      const columns = Object.keys(conversations);
      expect(columns).toContain('id');
      expect(columns).toContain('title');
      expect(columns).toContain('sdkSessionId');
      expect(columns).toContain('type');
      expect(columns).toContain('projectId');
      expect(columns).toContain('startedAt');
      expect(columns).toContain('lastMessageAt');
      expect(columns).toContain('messageCount');
      expect(columns).toContain('contextSummary');
    });

    it('has 9 columns as per Story 3.3', () => {
      const columns = Object.keys(conversations);
      expect(columns).toHaveLength(9);
    });
  });

  describe('messages table', () => {
    it('has correct columns', () => {
      const columns = Object.keys(messages);
      expect(columns).toContain('id');
      expect(columns).toContain('conversationId');
      expect(columns).toContain('role');
      expect(columns).toContain('content');
      expect(columns).toContain('toolCalls');
      expect(columns).toContain('toolResults');
      expect(columns).toContain('createdAt');
    });

    it('has 7 columns as per Story 3.4', () => {
      const columns = Object.keys(messages);
      expect(columns).toHaveLength(7);
    });

    it('has foreign key to conversations', () => {
      // Verify the conversationId column exists and is a valid Drizzle column
      // The FK constraint is verified in integration tests with actual SQLite
      expect(messages.conversationId).toBeDefined();
      expect(messages.conversationId.name).toBe('conversation_id');
    });
  });

  describe('sessionIndex table', () => {
    it('has correct columns', () => {
      const columns = Object.keys(sessionIndex);
      expect(columns).toContain('id');
      expect(columns).toContain('conversationId');
      expect(columns).toContain('type');
      expect(columns).toContain('displayName');
      expect(columns).toContain('lastActive');
      expect(columns).toContain('isActive');
    });

    it('has 6 columns as per Story 3.5', () => {
      const columns = Object.keys(sessionIndex);
      expect(columns).toHaveLength(6);
    });
  });
});

describe('ID Generation', () => {
  describe('generateId', () => {
    it('generates conversation ID with correct prefix', () => {
      const id = generateId('conversation');
      expect(id).toMatch(/^conv_[a-z0-9]{12}$/);
    });

    it('generates message ID with correct prefix', () => {
      const id = generateId('message');
      expect(id).toMatch(/^msg_[a-z0-9]{12}$/);
    });

    it('generates session ID with correct prefix', () => {
      const id = generateId('session');
      expect(id).toMatch(/^sess_[a-z0-9]{12}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId('conversation'));
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('validateId', () => {
    it('validates correct conversation IDs', () => {
      expect(validateId('conv_a1b2c3d4e5f6', 'conversation')).toBe(true);
      expect(validateId('conv_000000000000', 'conversation')).toBe(true);
      expect(validateId('conv_zzzzzzzzzzzz', 'conversation')).toBe(true);
    });

    it('rejects IDs with wrong prefix', () => {
      expect(validateId('msg_a1b2c3d4e5f6', 'conversation')).toBe(false);
      expect(validateId('sess_a1b2c3d4e5f6', 'conversation')).toBe(false);
    });

    it('rejects IDs with wrong length', () => {
      expect(validateId('conv_a1b2c3d4e5f', 'conversation')).toBe(false); // too short
      expect(validateId('conv_a1b2c3d4e5f6g', 'conversation')).toBe(false); // too long
    });

    it('rejects invalid formats', () => {
      expect(validateId('invalid', 'conversation')).toBe(false);
      expect(validateId('', 'conversation')).toBe(false);
      expect(validateId('conv-a1b2c3d4e5f6', 'conversation')).toBe(false); // wrong separator
    });

    it('validates message IDs', () => {
      expect(validateId('msg_a1b2c3d4e5f6', 'message')).toBe(true);
      expect(validateId('conv_a1b2c3d4e5f6', 'message')).toBe(false);
    });

    it('validates session IDs', () => {
      expect(validateId('sess_a1b2c3d4e5f6', 'session')).toBe(true);
      expect(validateId('conv_a1b2c3d4e5f6', 'session')).toBe(false);
    });
  });

  describe('getIdPrefix', () => {
    it('extracts prefix from valid IDs', () => {
      expect(getIdPrefix('conv_a1b2c3d4e5f6')).toBe('conv');
      expect(getIdPrefix('msg_a1b2c3d4e5f6')).toBe('msg');
      expect(getIdPrefix('sess_a1b2c3d4e5f6')).toBe('sess');
    });

    it('returns null for invalid formats', () => {
      expect(getIdPrefix('invalid')).toBe(null);
      expect(getIdPrefix('123_abc')).toBe(null); // must start with letter
      expect(getIdPrefix('')).toBe(null);
    });
  });

  describe('ID_PREFIXES', () => {
    it('has all required prefixes', () => {
      expect(ID_PREFIXES.conversation).toBe('conv');
      expect(ID_PREFIXES.message).toBe('msg');
      expect(ID_PREFIXES.session).toBe('sess');
    });
  });
});
