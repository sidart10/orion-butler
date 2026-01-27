/**
 * Unit tests for SessionFactory
 *
 * Tests AC#1: create() method with default values
 * Tests AC#2: createWithMessages() relationship helper
 */
import { describe, it, expect } from 'vitest';
import { SessionFactory } from '../../fixtures/factories/session';
import type { Session, SessionType } from '../../fixtures/factories/types';

describe('SessionFactory', () => {
  describe('create()', () => {
    it('should create a valid Session entity with default values (AC#1)', () => {
      const session = SessionFactory.create();

      expect(session.id).toBeDefined();
      expect(typeof session.id).toBe('string');
      expect(session.userId).toBeDefined();
      expect(session.type).toBeDefined();
      expect(session.name).toBeDefined();
      expect(session.metadata).toEqual({});
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should create a Session with custom overrides', () => {
      const customDate = new Date('2026-01-15');
      const session = SessionFactory.create({
        id: 'custom-session-id',
        userId: 'custom-user-id',
        type: 'Project',
        name: 'Custom Project Session',
        metadata: { project: 'orion' },
        createdAt: customDate,
        lastAccessedAt: customDate,
      });

      expect(session.id).toBe('custom-session-id');
      expect(session.userId).toBe('custom-user-id');
      expect(session.type).toBe('Project');
      expect(session.name).toBe('Custom Project Session');
      expect(session.metadata).toEqual({ project: 'orion' });
    });

    it('should generate unique IDs for each session', () => {
      const session1 = SessionFactory.create();
      const session2 = SessionFactory.create();

      expect(session1.id).not.toBe(session2.id);
    });

    it('should generate valid UUID format for ID', () => {
      const session = SessionFactory.create();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(session.id).toMatch(uuidRegex);
    });
  });

  describe('createMany()', () => {
    it('should create multiple sessions with default values', () => {
      const sessions = SessionFactory.createMany(3);

      expect(sessions).toHaveLength(3);
      sessions.forEach((session) => {
        expect(session.id).toBeDefined();
        expect(session.userId).toBeDefined();
      });
    });

    it('should generate unique IDs for all sessions', () => {
      const sessions = SessionFactory.createMany(5);
      const ids = sessions.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('session types', () => {
    const sessionTypes: SessionType[] = ['Daily', 'Project', 'Inbox', 'Ad-hoc'];

    sessionTypes.forEach((type) => {
      it(`should support ${type} session type`, () => {
        const session = SessionFactory.create({ type });

        expect(session.type).toBe(type);
      });
    });
  });

  describe('createWithMessages() (AC#2)', () => {
    it('should create a session with 5 related messages', () => {
      const result = SessionFactory.createWithMessages(5);

      expect(result.session).toBeDefined();
      expect(result.messages).toHaveLength(5);
    });

    it('should link all messages to the session', () => {
      const result = SessionFactory.createWithMessages(3);

      result.messages.forEach((message) => {
        expect(message.sessionId).toBe(result.session.id);
      });
    });

    it('should create session with custom overrides', () => {
      const result = SessionFactory.createWithMessages(2, { type: 'Project', name: 'Test Project' });

      expect(result.session.type).toBe('Project');
      expect(result.session.name).toBe('Test Project');
      expect(result.messages).toHaveLength(2);
    });

    it('should create unique message IDs', () => {
      const result = SessionFactory.createWithMessages(5);
      const messageIds = result.messages.map((m) => m.id);
      const uniqueIds = new Set(messageIds);

      expect(uniqueIds.size).toBe(5);
    });

    it('should handle count of 0', () => {
      const result = SessionFactory.createWithMessages(0);

      expect(result.session).toBeDefined();
      expect(result.messages).toHaveLength(0);
    });
  });
});
