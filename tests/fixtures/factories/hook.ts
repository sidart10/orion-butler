/**
 * Hook Factory for Orion Butler Tests
 *
 * Creates test Hook entities with support for all 12 SDK hook event types.
 * Includes predefined factories for common hook patterns.
 *
 * @see AC#1: HookFactory.create() creates valid Hook with event type support
 * @see FR-7: Permission System - PreToolUse hook pipeline
 * @see docs/claude-agent-sdk-reference.md
 */
import type { Hook, HookEventType } from './types';

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
 * All 12 SDK hook event types
 * @see docs/claude-agent-sdk-reference.md
 */
export const HOOK_EVENT_TYPES: HookEventType[] = [
  'SessionStart',
  'SessionEnd',
  'PreToolUse',
  'PostToolUse',
  'PreMessage',
  'PostMessage',
  'PreSubagent',
  'PostSubagent',
  'PreMcp',
  'PostMcp',
  'OnError',
  'OnContextCompaction',
];

/**
 * Counter for generating unique hook names
 */
let hookCounter = 0;

/**
 * Factory for creating Hook entities
 */
export const HookFactory = {
  /**
   * Create a single Hook entity with defaults
   *
   * @param overrides - Partial Hook to override defaults
   * @returns A valid Hook entity
   *
   * @example
   * ```typescript
   * const hook = HookFactory.create({ event: 'PreToolUse' });
   * expect(hook.event).toBe('PreToolUse');
   * ```
   */
  create(overrides: Partial<Hook> = {}): Hook {
    hookCounter++;
    const hookName = `test-hook-${hookCounter}`;

    return {
      id: generateUUID(),
      event: 'SessionStart' as HookEventType,
      handler: `.claude/hooks/${hookName}.ts`,
      timeout: 5000, // NFR-6.6: 5s hook timeout
      isActive: true,
      ...overrides,
    };
  },

  /**
   * Create multiple Hook entities
   *
   * @param count - Number of hooks to create
   * @param overrides - Partial Hook to apply to all created hooks
   * @returns Array of Hook entities
   */
  createMany(count: number, overrides: Partial<Hook> = {}): Hook[] {
    const hooks: Hook[] = [];
    for (let i = 0; i < count; i++) {
      hooks.push(this.create(overrides));
    }
    return hooks;
  },

  // ===== Lifecycle Hook Factories =====

  /**
   * Create a SessionStart hook
   */
  createSessionStartHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'SessionStart',
      handler: '.claude/hooks/session-start.ts',
      ...overrides,
    });
  },

  /**
   * Create a SessionEnd hook
   */
  createSessionEndHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'SessionEnd',
      handler: '.claude/hooks/session-end.ts',
      ...overrides,
    });
  },

  // ===== Tool Hook Factories =====

  /**
   * Create a PreToolUse hook
   */
  createPreToolUseHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'PreToolUse',
      handler: '.claude/hooks/pre-tool-use.ts',
      ...overrides,
    });
  },

  /**
   * Create a PostToolUse hook
   */
  createPostToolUseHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'PostToolUse',
      handler: '.claude/hooks/post-tool-use.ts',
      ...overrides,
    });
  },

  // ===== Error Hook Factory =====

  /**
   * Create an OnError hook
   */
  createOnErrorHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'OnError',
      handler: '.claude/hooks/on-error.ts',
      ...overrides,
    });
  },

  // ===== Common Pattern Factories =====

  /**
   * Create the Permission Guard hook (FR-7)
   *
   * PreToolUse hook that enforces permission rules.
   */
  createPermissionGuardHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'PreToolUse',
      handler: '.claude/hooks/permission-guard.ts',
      timeout: 1000, // Fast timeout for permission checks
      ...overrides,
    });
  },

  /**
   * Create the Audit Logger hook (FR-7)
   *
   * PostToolUse hook that logs all tool calls.
   */
  createAuditLoggerHook(overrides: Partial<Hook> = {}): Hook {
    return this.create({
      event: 'PostToolUse',
      handler: '.claude/hooks/audit-logger.ts',
      timeout: 2000,
      ...overrides,
    });
  },

  // ===== Composite Hook Factories =====

  /**
   * Create hooks for session lifecycle events
   *
   * @returns Object with sessionStart and sessionEnd hooks
   */
  createLifecycleHooks(): { sessionStart: Hook; sessionEnd: Hook } {
    return {
      sessionStart: this.createSessionStartHook(),
      sessionEnd: this.createSessionEndHook(),
    };
  },

  /**
   * Create hooks for tool use pipeline
   *
   * @returns Object with preToolUse and postToolUse hooks
   */
  createToolPipelineHooks(): { preToolUse: Hook; postToolUse: Hook } {
    return {
      preToolUse: this.createPreToolUseHook(),
      postToolUse: this.createPostToolUseHook(),
    };
  },

  /**
   * Create a complete hook set for all 12 event types
   *
   * @returns Array of hooks, one for each event type
   */
  createAllEventTypeHooks(): Hook[] {
    return HOOK_EVENT_TYPES.map((event) =>
      this.create({
        event,
        handler: `.claude/hooks/${event.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}.ts`,
      })
    );
  },

  /**
   * Reset the counter (useful for test isolation)
   */
  resetCounter(): void {
    hookCounter = 0;
  },
};
