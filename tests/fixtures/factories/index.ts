/**
 * Test Factories for Orion Butler
 *
 * Creates test entities with sensible defaults for seeding test databases
 * with consistent, valid test data.
 *
 * @see Story 0-5: Test Factories for Core Entities
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 *
 * @example
 * ```typescript
 * import { UserFactory, SessionFactory, MessageFactory } from '../fixtures/factories';
 *
 * // Create entities with defaults
 * const user = UserFactory.create({ displayName: 'Test User' });
 * const session = SessionFactory.create({ type: 'Daily' });
 *
 * // Use relationship helper
 * const { session, messages } = SessionFactory.createWithMessages(5);
 * expect(messages[0].sessionId).toBe(session.id);
 *
 * // Create multiple entities
 * const skills = SkillFactory.createMany(3);
 * ```
 */

// Entity factories
export { UserFactory } from './user';
export { SessionFactory } from './session';
export { MessageFactory } from './message';
export { SkillFactory } from './skill';
export { HookFactory, HOOK_EVENT_TYPES } from './hook';

// Type exports
export type {
  User,
  Session,
  SessionType,
  Message,
  MessageRole,
  ContentBlock,
  TextContentBlock,
  ToolUseContentBlock,
  ToolResultContentBlock,
  Skill,
  Hook,
  HookEventType,
  SessionWithMessages,
} from './types';
