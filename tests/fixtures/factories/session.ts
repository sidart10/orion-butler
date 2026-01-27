/**
 * Session Factory for Orion Butler Tests
 *
 * Creates test Session entities with support for all session types:
 * Daily, Project, Inbox, Ad-hoc
 *
 * @see AC#1: SessionFactory.create() creates valid Session with defaults
 * @see AC#2: SessionFactory.createWithMessages(n) creates session with related messages
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 */
import type { Session, SessionType, SessionWithMessages, Message } from './types';
import { MessageFactory } from './message';

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
 * Counter for generating unique user references
 */
let userCounter = 0;

/**
 * Factory for creating Session entities
 */
export const SessionFactory = {
  /**
   * Create a single Session entity with defaults
   *
   * @param overrides - Partial Session to override defaults
   * @returns A valid Session entity
   *
   * @example
   * ```typescript
   * const session = SessionFactory.create({ type: 'Daily' });
   * expect(session.type).toBe('Daily');
   * ```
   */
  create(overrides: Partial<Session> = {}): Session {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    return {
      id: generateUUID(),
      userId: overrides.userId ?? `user-${++userCounter}`,
      type: 'Ad-hoc' as SessionType,
      name: `Session ${dateStr}`,
      metadata: {},
      createdAt: now,
      lastAccessedAt: now,
      ...overrides,
    };
  },

  /**
   * Create multiple Session entities
   *
   * @param count - Number of sessions to create
   * @param overrides - Partial Session to apply to all created sessions
   * @returns Array of Session entities
   *
   * @example
   * ```typescript
   * const sessions = SessionFactory.createMany(3, { type: 'Project' });
   * expect(sessions).toHaveLength(3);
   * ```
   */
  createMany(count: number, overrides: Partial<Session> = {}): Session[] {
    const sessions: Session[] = [];
    for (let i = 0; i < count; i++) {
      sessions.push(this.create(overrides));
    }
    return sessions;
  },

  /**
   * Create a Session with related Messages (AC#2)
   *
   * This is the relationship helper that uses MessageFactory to create
   * properly linked session and messages.
   *
   * @param count - Number of messages to create
   * @param sessionOverrides - Partial Session to apply to the session
   * @returns SessionWithMessages containing session and linked messages
   *
   * @example
   * ```typescript
   * const { session, messages } = SessionFactory.createWithMessages(5);
   * expect(messages).toHaveLength(5);
   * expect(messages[0].sessionId).toBe(session.id);
   * ```
   */
  createWithMessages(
    count: number,
    sessionOverrides: Partial<Session> = {}
  ): SessionWithMessages {
    const session = this.create(sessionOverrides);
    const messages: Message[] = MessageFactory.createMany(count, { sessionId: session.id });

    return { session, messages };
  },

  /**
   * Create a Daily session
   *
   * @param overrides - Additional overrides
   * @returns A Daily type Session
   */
  createDaily(overrides: Partial<Session> = {}): Session {
    const dateStr = new Date().toISOString().split('T')[0];
    return this.create({
      type: 'Daily',
      name: `Daily ${dateStr}`,
      ...overrides,
    });
  },

  /**
   * Create a Project session
   *
   * @param projectName - Name of the project
   * @param overrides - Additional overrides
   * @returns A Project type Session
   */
  createProject(projectName: string, overrides: Partial<Session> = {}): Session {
    return this.create({
      type: 'Project',
      name: projectName,
      metadata: { projectName },
      ...overrides,
    });
  },

  /**
   * Create an Inbox session
   *
   * @param overrides - Additional overrides
   * @returns An Inbox type Session
   */
  createInbox(overrides: Partial<Session> = {}): Session {
    const dateStr = new Date().toISOString().split('T')[0];
    return this.create({
      type: 'Inbox',
      name: `Inbox ${dateStr}`,
      ...overrides,
    });
  },

  /**
   * Create an Ad-hoc session
   *
   * @param overrides - Additional overrides
   * @returns An Ad-hoc type Session
   */
  createAdhoc(overrides: Partial<Session> = {}): Session {
    return this.create({
      type: 'Ad-hoc',
      name: `Quick Session ${Date.now()}`,
      ...overrides,
    });
  },

  /**
   * Reset the counter (useful for test isolation)
   */
  resetCounter(): void {
    userCounter = 0;
  },
};
