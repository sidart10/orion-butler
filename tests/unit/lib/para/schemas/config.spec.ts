/**
 * Tests for Orion Config Schema
 * Story 4.1b: Initialize Orion Config
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import schemas - will fail until implemented
import {
  OrionPreferencesSchema,
  OrionConfigSchema,
  type OrionPreferences,
  type OrionConfig,
} from '@/lib/para/schemas/config';

describe('OrionPreferencesSchema (Story 4.1b)', () => {
  describe('theme validation', () => {
    it('should accept "system" as valid theme', () => {
      const result = OrionPreferencesSchema.safeParse({ theme: 'system' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('system');
      }
    });

    it('should accept "light" as valid theme', () => {
      const result = OrionPreferencesSchema.safeParse({ theme: 'light' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('light');
      }
    });

    it('should accept "dark" as valid theme', () => {
      const result = OrionPreferencesSchema.safeParse({ theme: 'dark' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('dark');
      }
    });

    it('should reject invalid theme values', () => {
      const result = OrionPreferencesSchema.safeParse({ theme: 'purple' });
      expect(result.success).toBe(false);
    });

    it('should default theme to "system" when not provided', () => {
      const result = OrionPreferencesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('system');
      }
    });
  });

  describe('archive_after_days validation', () => {
    it('should accept positive integers', () => {
      const result = OrionPreferencesSchema.safeParse({ archive_after_days: 30 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.archive_after_days).toBe(30);
      }
    });

    it('should reject zero', () => {
      const result = OrionPreferencesSchema.safeParse({ archive_after_days: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative numbers', () => {
      const result = OrionPreferencesSchema.safeParse({ archive_after_days: -5 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integers', () => {
      const result = OrionPreferencesSchema.safeParse({ archive_after_days: 30.5 });
      expect(result.success).toBe(false);
    });

    it('should default to 30 when not provided', () => {
      const result = OrionPreferencesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.archive_after_days).toBe(30);
      }
    });
  });

  describe('full preferences object', () => {
    it('should accept valid full preferences object', () => {
      const prefs = {
        theme: 'dark' as const,
        archive_after_days: 60,
      };
      const result = OrionPreferencesSchema.safeParse(prefs);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(prefs);
      }
    });

    it('should apply all defaults for empty object', () => {
      const result = OrionPreferencesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.theme).toBe('system');
        expect(result.data.archive_after_days).toBe(30);
      }
    });
  });
});

describe('OrionConfigSchema (Story 4.1b)', () => {
  const validConfig = {
    version: 1,
    created_at: '2026-01-27T00:00:00Z',
    para_root: '~/Orion',
    preferences: {
      theme: 'system' as const,
      archive_after_days: 30,
    },
  };

  describe('version validation', () => {
    it('should accept version 1', () => {
      const result = OrionConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe(1);
      }
    });

    it('should reject version 0', () => {
      const result = OrionConfigSchema.safeParse({ ...validConfig, version: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject version 2 (future version)', () => {
      const result = OrionConfigSchema.safeParse({ ...validConfig, version: 2 });
      expect(result.success).toBe(false);
    });

    it('should reject missing version', () => {
      const { version, ...withoutVersion } = validConfig;
      const result = OrionConfigSchema.safeParse(withoutVersion);
      expect(result.success).toBe(false);
    });
  });

  describe('created_at validation', () => {
    it('should accept valid ISO 8601 datetime strings', () => {
      const result = OrionConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created_at).toBe('2026-01-27T00:00:00Z');
      }
    });

    it('should accept datetime with timezone offset', () => {
      const result = OrionConfigSchema.safeParse({
        ...validConfig,
        created_at: '2026-01-27T12:30:00+05:30',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid datetime format', () => {
      const result = OrionConfigSchema.safeParse({
        ...validConfig,
        created_at: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing created_at', () => {
      const { created_at, ...withoutCreatedAt } = validConfig;
      const result = OrionConfigSchema.safeParse(withoutCreatedAt);
      expect(result.success).toBe(false);
    });
  });

  describe('para_root validation', () => {
    it('should accept valid path string', () => {
      const result = OrionConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.para_root).toBe('~/Orion');
      }
    });

    it('should reject empty string', () => {
      const result = OrionConfigSchema.safeParse({
        ...validConfig,
        para_root: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing para_root', () => {
      const { para_root, ...withoutParaRoot } = validConfig;
      const result = OrionConfigSchema.safeParse(withoutParaRoot);
      expect(result.success).toBe(false);
    });
  });

  describe('preferences validation', () => {
    it('should accept valid preferences', () => {
      const result = OrionConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferences.theme).toBe('system');
        expect(result.data.preferences.archive_after_days).toBe(30);
      }
    });

    it('should apply preference defaults when preferences is empty object', () => {
      const result = OrionConfigSchema.safeParse({
        ...validConfig,
        preferences: {},
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferences.theme).toBe('system');
        expect(result.data.preferences.archive_after_days).toBe(30);
      }
    });

    it('should reject missing preferences object', () => {
      const { preferences, ...withoutPreferences } = validConfig;
      const result = OrionConfigSchema.safeParse(withoutPreferences);
      expect(result.success).toBe(false);
    });
  });

  describe('full config validation', () => {
    it('should accept complete valid config', () => {
      const result = OrionConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({
          version: 1,
          created_at: '2026-01-27T00:00:00Z',
          para_root: '~/Orion',
          preferences: {
            theme: 'system',
            archive_after_days: 30,
          },
        });
      }
    });

    it('should reject completely invalid object', () => {
      const result = OrionConfigSchema.safeParse({ foo: 'bar' });
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = OrionConfigSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = OrionConfigSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });
});

describe('Type exports (Story 4.1b)', () => {
  it('should export OrionPreferences type that matches schema output', () => {
    const preferences: OrionPreferences = {
      theme: 'dark',
      archive_after_days: 60,
    };
    // Type check - if this compiles, the type is correct
    expect(preferences.theme).toBe('dark');
    expect(preferences.archive_after_days).toBe(60);
  });

  it('should export OrionConfig type that matches schema output', () => {
    const config: OrionConfig = {
      version: 1,
      created_at: '2026-01-27T00:00:00Z',
      para_root: '~/Orion',
      preferences: {
        theme: 'system',
        archive_after_days: 30,
      },
    };
    // Type check - if this compiles, the type is correct
    expect(config.version).toBe(1);
  });
});
