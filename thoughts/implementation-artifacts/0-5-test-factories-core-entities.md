# Story 0.5: Test Factories for Core Entities

Status: done

## Story

As a **developer**,
I want test factories for User, Session, Message, Skill, and Hook entities,
So that I can seed test databases with consistent, valid test data.

## Acceptance Criteria

1. **Given** I import the factory
   **When** I call `UserFactory.create({ name: 'Test User' })`
   **Then** a valid User entity is created with default values for missing fields

2. **Given** I need multiple related entities
   **When** I call `SessionFactory.createWithMessages(5)`
   **Then** a session with 5 related messages is created

## Tasks / Subtasks

- [x] Create factories directory structure (AC: #1)
  - [x] Create `tests/fixtures/factories/` directory
  - [x] Create `tests/fixtures/factories/index.ts` for exports
- [x] Implement UserFactory (AC: #1)
  - [x] Create `tests/fixtures/factories/user.ts`
  - [x] Implement `create(overrides)` method
  - [x] Implement `createMany(n, overrides)` method
  - [x] Define sensible defaults
- [x] Implement SessionFactory (AC: #1, #2)
  - [x] Create `tests/fixtures/factories/session.ts`
  - [x] Implement `create(overrides)` method
  - [x] Implement `createWithMessages(n)` method (uses MessageFactory)
  - [x] Support session types: Daily, Project, Inbox, Ad-hoc
- [x] Implement MessageFactory (AC: #2) — REQUIRED for createWithMessages
  - [x] Create `tests/fixtures/factories/message.ts`
  - [x] Implement `create(overrides)` method
  - [x] Implement `createMany(n, overrides)` method
  - [x] Support message roles: user, assistant
  - [x] Support content types: text, tool_use, tool_result
- [x] Implement SkillFactory (AC: #1)
  - [x] Create `tests/fixtures/factories/skill.ts`
  - [x] Implement `create(overrides)` method
  - [x] Include valid skill manifest structure
- [x] Implement HookFactory (AC: #1)
  - [x] Create `tests/fixtures/factories/hook.ts`
  - [x] Implement `create(overrides)` method
  - [x] Support all 12 SDK hook event types
- [x] Document factory patterns (AC: #1, #2)
  - [x] Update `tests/README.md` with factory usage

## Dev Notes

### Technical Requirements
- Create `tests/fixtures/factories/` directory
- Implement: `UserFactory`, `SessionFactory`, `MessageFactory`, `SkillFactory`, `HookFactory`
- Support `create()`, `createMany(n)`, and relationship helpers
- Use Drizzle ORM types for type safety (when available in Epic 3)
- Document factory patterns in `tests/README.md`

### Factory Pattern
```typescript
// Example usage
const user = UserFactory.create({ name: 'Test User' });
const session = SessionFactory.createWithMessages(5);
const skills = SkillFactory.createMany(3);
```

### Interim Entity Shapes (Until Epic 3 Schema)

Use these shapes for factory implementation. Epic 3 schema must match these interfaces.

```typescript
// User entity
interface User {
  id: string;                    // UUID
  email: string;                 // user@example.com
  displayName: string;           // "Test User"
  preferences: Record<string, unknown>;  // {}
  createdAt: Date;
  updatedAt: Date;
}

// Session entity
interface Session {
  id: string;                    // UUID
  userId: string;                // FK to User
  type: 'Daily' | 'Project' | 'Inbox' | 'Ad-hoc';
  name: string;                  // "Daily 2026-01-24"
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastAccessedAt: Date;
}

// Message entity
interface Message {
  id: string;                    // UUID
  sessionId: string;             // FK to Session
  role: 'user' | 'assistant';
  content: string | ContentBlock[];  // Text or structured blocks
  createdAt: Date;
}

// Skill entity
interface Skill {
  id: string;
  name: string;                  // "morning-briefing"
  trigger: string;               // "/briefing" or keyword
  promptTemplate: string;
  isActive: boolean;
}

// Hook entity
interface Hook {
  id: string;
  event: HookEventType;          // 'SessionStart' | 'PreToolUse' | etc.
  handler: string;               // Path to handler script
  timeout: number;               // ms
  isActive: boolean;
}

type HookEventType =
  | 'SessionStart' | 'SessionEnd'
  | 'PreToolUse' | 'PostToolUse'
  | 'PreMessage' | 'PostMessage'
  | 'PreSubagent' | 'PostSubagent'
  | 'PreMcp' | 'PostMcp'
  | 'OnError' | 'OnContextCompaction';
```

**Source:** Extracted from `thoughts/planning-artifacts/architecture.md#Database Layer`

### Relationship Helper Pattern

```typescript
// SessionFactory.createWithMessages implementation
SessionFactory.createWithMessages = (count: number, overrides = {}) => {
  const session = SessionFactory.create(overrides);
  const messages = MessageFactory.createMany(count, { sessionId: session.id });
  return { session, messages };
};

// Usage
const { session, messages } = SessionFactory.createWithMessages(5);
expect(messages).toHaveLength(5);
expect(messages[0].sessionId).toBe(session.id);
```

### Project Structure Notes
- Factories in `tests/fixtures/factories/`
- Use Drizzle ORM types when available (Epic 3)
- Start with interim shapes defined above

### References
- [Source: thoughts/planning-artifacts/test-design-system.md#6.1]
- [Source: thoughts/planning-artifacts/architecture.md#Database Layer]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

**Implementation Summary:**
- Created `tests/fixtures/factories/` directory with 7 files
- Implemented 5 entity factories: UserFactory, SessionFactory, MessageFactory, SkillFactory, HookFactory
- All factories follow consistent pattern: `create(overrides)`, `createMany(n, overrides)`, `resetCounter()`
- SessionFactory includes `createWithMessages(n)` relationship helper (AC#2)
- HookFactory supports all 12 SDK hook event types
- SkillFactory includes predefined factories for all 5 Butler skills
- MessageFactory supports text and structured content blocks (tool_use, tool_result)

**Test Coverage:**
- 88 unit tests across 5 test files in `tests/unit/factories/`
- All tests follow red-green-refactor: tests written first (failing), then implementation (passing)
- Tests verify: entity creation, defaults, overrides, UUID generation, relationship linking

**AC Verification:**
- AC#1: `UserFactory.create({ displayName: 'Test User' })` creates valid entity with defaults - VERIFIED
- AC#2: `SessionFactory.createWithMessages(5)` creates session with 5 linked messages - VERIFIED

**Documentation:**
- Updated `tests/README.md` with comprehensive factory documentation
- Documented all factory methods, entity types, and usage patterns

**Pre-existing Issue (Not Regression):**
- `tests/unit/scaffold/config-validation.spec.ts` has 1 failing test (CV-004)
- Test expects `@tauri-apps/api` in devDependencies but it's in dependencies
- This is a pre-existing scaffold issue, not related to factory implementation

### File List
**Created:**
- `tests/fixtures/factories/types.ts` - Entity type definitions
- `tests/fixtures/factories/user.ts` - UserFactory
- `tests/fixtures/factories/session.ts` - SessionFactory with createWithMessages
- `tests/fixtures/factories/message.ts` - MessageFactory with content type support
- `tests/fixtures/factories/skill.ts` - SkillFactory with 5 Butler skill presets
- `tests/fixtures/factories/hook.ts` - HookFactory with 12 SDK event types
- `tests/fixtures/factories/index.ts` - Combined exports
- `tests/unit/factories/user-factory.spec.ts` - 10 tests
- `tests/unit/factories/session-factory.spec.ts` - 15 tests
- `tests/unit/factories/message-factory.spec.ts` - 18 tests
- `tests/unit/factories/skill-factory.spec.ts` - 14 tests
- `tests/unit/factories/hook-factory.spec.ts` - 31 tests

**Modified:**
- `tests/README.md` - Added factory documentation

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-24 | Initial implementation of all 5 entity factories with 88 unit tests | Claude Opus 4.5 |
