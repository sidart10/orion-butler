/**
 * Entity Type Definitions for Test Factories
 *
 * These types match the interim entity shapes from architecture.md until Epic 3 schema is implemented.
 * Epic 3 database schema MUST match these interfaces for test compatibility.
 *
 * @see thoughts/planning-artifacts/architecture.md#Database Layer
 * @see thoughts/implementation-artifacts/0-5-test-factories-core-entities.md#Dev Notes
 */

/**
 * User entity - represents an Orion user
 */
export interface User {
  id: string; // UUID
  email: string; // user@example.com
  displayName: string; // "Test User"
  preferences: Record<string, unknown>; // {}
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session types matching FR-2: Named sessions
 */
export type SessionType = 'Daily' | 'Project' | 'Inbox' | 'Ad-hoc';

/**
 * Session entity - represents a conversation session
 */
export interface Session {
  id: string; // UUID
  userId: string; // FK to User
  type: SessionType;
  name: string; // "Daily 2026-01-24"
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
}

/**
 * Message roles matching Claude SDK
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Content block types for structured messages
 */
export interface TextContentBlock {
  type: 'text';
  text: string;
}

export interface ToolUseContentBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContentBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string | ContentBlock[];
  is_error?: boolean;
}

export type ContentBlock = TextContentBlock | ToolUseContentBlock | ToolResultContentBlock;

/**
 * Message entity - represents a conversation message
 */
export interface Message {
  id: string; // UUID
  sessionId: string; // FK to Session
  role: MessageRole;
  content: string | ContentBlock[]; // Text or structured blocks
  createdAt: Date;
}

/**
 * Skill entity - represents a Butler skill
 */
export interface Skill {
  id: string;
  name: string; // "morning-briefing"
  trigger: string; // "/briefing" or keyword
  promptTemplate: string;
  isActive: boolean;
}

/**
 * Hook event types matching Claude SDK - all 12 types
 *
 * @see docs/claude-agent-sdk-reference.md
 */
export type HookEventType =
  | 'SessionStart'
  | 'SessionEnd'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PreMessage'
  | 'PostMessage'
  | 'PreSubagent'
  | 'PostSubagent'
  | 'PreMcp'
  | 'PostMcp'
  | 'OnError'
  | 'OnContextCompaction';

/**
 * Hook entity - represents a lifecycle hook
 */
export interface Hook {
  id: string;
  event: HookEventType; // 'SessionStart' | 'PreToolUse' | etc.
  handler: string; // Path to handler script
  timeout: number; // ms
  isActive: boolean;
}

/**
 * Session with messages - relationship helper result type
 */
export interface SessionWithMessages {
  session: Session;
  messages: Message[];
}
