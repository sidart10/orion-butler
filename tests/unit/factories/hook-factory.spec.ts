/**
 * Unit tests for HookFactory
 *
 * Tests AC#1: create() method with support for all 12 SDK hook event types
 */
import { describe, it, expect } from 'vitest';
import { HookFactory, HOOK_EVENT_TYPES } from '../../fixtures/factories/hook';
import type { Hook, HookEventType } from '../../fixtures/factories/types';

describe('HookFactory', () => {
  describe('create()', () => {
    it('should create a valid Hook entity with default values (AC#1)', () => {
      const hook = HookFactory.create();

      expect(hook.id).toBeDefined();
      expect(typeof hook.id).toBe('string');
      expect(hook.event).toBeDefined();
      expect(hook.handler).toBeDefined();
      expect(typeof hook.timeout).toBe('number');
      expect(typeof hook.isActive).toBe('boolean');
    });

    it('should create a Hook with custom overrides', () => {
      const hook = HookFactory.create({
        id: 'custom-hook-id',
        event: 'PreToolUse',
        handler: '.claude/hooks/permission-guard.ts',
        timeout: 5000,
        isActive: false,
      });

      expect(hook.id).toBe('custom-hook-id');
      expect(hook.event).toBe('PreToolUse');
      expect(hook.handler).toBe('.claude/hooks/permission-guard.ts');
      expect(hook.timeout).toBe(5000);
      expect(hook.isActive).toBe(false);
    });

    it('should generate unique IDs for each hook', () => {
      const hook1 = HookFactory.create();
      const hook2 = HookFactory.create();

      expect(hook1.id).not.toBe(hook2.id);
    });

    it('should default to active state', () => {
      const hook = HookFactory.create();

      expect(hook.isActive).toBe(true);
    });

    it('should have sensible default timeout', () => {
      const hook = HookFactory.create();

      // NFR-1.4: Hook execution <50ms (p95), but timeout is a safety limit
      // NFR-6.6: 5s hook timeout
      expect(hook.timeout).toBeGreaterThan(0);
      expect(hook.timeout).toBeLessThanOrEqual(5000);
    });
  });

  describe('createMany()', () => {
    it('should create multiple hooks with default values', () => {
      const hooks = HookFactory.createMany(3);

      expect(hooks).toHaveLength(3);
      hooks.forEach((hook) => {
        expect(hook.id).toBeDefined();
        expect(hook.event).toBeDefined();
        expect(hook.handler).toBeDefined();
      });
    });

    it('should create hooks with shared overrides', () => {
      const hooks = HookFactory.createMany(3, { isActive: false });

      hooks.forEach((hook) => {
        expect(hook.isActive).toBe(false);
      });
    });

    it('should generate unique IDs for all hooks', () => {
      const hooks = HookFactory.createMany(5);
      const ids = hooks.map((h) => h.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('should return empty array when count is 0', () => {
      const hooks = HookFactory.createMany(0);

      expect(hooks).toHaveLength(0);
    });
  });

  describe('all 12 SDK hook event types', () => {
    const expectedEventTypes: HookEventType[] = [
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

    it('should export all 12 hook event types', () => {
      expect(HOOK_EVENT_TYPES).toHaveLength(12);
      expectedEventTypes.forEach((type) => {
        expect(HOOK_EVENT_TYPES).toContain(type);
      });
    });

    expectedEventTypes.forEach((eventType) => {
      it(`should support ${eventType} event type`, () => {
        const hook = HookFactory.create({ event: eventType });

        expect(hook.event).toBe(eventType);
      });
    });
  });

  describe('predefined hook factories', () => {
    it('should create SessionStart hook', () => {
      const hook = HookFactory.createSessionStartHook();

      expect(hook.event).toBe('SessionStart');
      expect(hook.isActive).toBe(true);
    });

    it('should create SessionEnd hook', () => {
      const hook = HookFactory.createSessionEndHook();

      expect(hook.event).toBe('SessionEnd');
      expect(hook.isActive).toBe(true);
    });

    it('should create PreToolUse hook', () => {
      const hook = HookFactory.createPreToolUseHook();

      expect(hook.event).toBe('PreToolUse');
      expect(hook.isActive).toBe(true);
    });

    it('should create PostToolUse hook', () => {
      const hook = HookFactory.createPostToolUseHook();

      expect(hook.event).toBe('PostToolUse');
      expect(hook.isActive).toBe(true);
    });

    it('should create OnError hook', () => {
      const hook = HookFactory.createOnErrorHook();

      expect(hook.event).toBe('OnError');
      expect(hook.isActive).toBe(true);
    });

    it('should create permission guard hook', () => {
      const hook = HookFactory.createPermissionGuardHook();

      expect(hook.event).toBe('PreToolUse');
      expect(hook.handler).toContain('permission');
      expect(hook.isActive).toBe(true);
    });

    it('should create audit logger hook', () => {
      const hook = HookFactory.createAuditLoggerHook();

      expect(hook.event).toBe('PostToolUse');
      expect(hook.handler).toContain('audit');
      expect(hook.isActive).toBe(true);
    });
  });

  describe('hooks for specific scenarios', () => {
    it('should create hooks for all lifecycle events', () => {
      const lifecycleHooks = HookFactory.createLifecycleHooks();

      expect(lifecycleHooks.sessionStart.event).toBe('SessionStart');
      expect(lifecycleHooks.sessionEnd.event).toBe('SessionEnd');
    });

    it('should create hooks for tool use pipeline', () => {
      const toolHooks = HookFactory.createToolPipelineHooks();

      expect(toolHooks.preToolUse.event).toBe('PreToolUse');
      expect(toolHooks.postToolUse.event).toBe('PostToolUse');
    });
  });
});
