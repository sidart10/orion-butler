/**
 * Tests for Resources Zod Schemas
 * Story 4.4: Create Resources Directory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';
import {
  ResourcesIndexSchema,
  type ResourcesIndex,
} from '@/lib/para/schemas/resources';

describe('Resources Zod Schemas (Story 4.4)', () => {
  describe('ResourcesIndexSchema', () => {
    it('should validate a valid resources index', () => {
      const validIndex: ResourcesIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['contacts', 'templates', 'procedures', 'preferences', 'notes'],
      };

      const result = ResourcesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require version to be a positive integer', () => {
      const invalidIndex = {
        version: 0,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should require version to be an integer', () => {
      const invalidIndex = {
        version: 1.5,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should require updated_at to be a valid ISO 8601 datetime', () => {
      const invalidIndex = {
        version: 1,
        updated_at: 'not-a-date',
        subdirectories: [],
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should accept updated_at with timezone offset', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T12:30:00+05:30',
        subdirectories: [],
      };

      const result = ResourcesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require subdirectories to be an array', () => {
      const invalidIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: 'not-an-array',
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should allow empty subdirectories array', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = ResourcesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require subdirectory names to be non-empty strings', () => {
      const invalidIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [''],
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidIndex = {
        version: 1,
      };

      const result = ResourcesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should accept optional description field', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['contacts'],
        description: 'Reference materials and reusable content',
      };

      const result = ResourcesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Reference materials and reusable content');
      }
    });

    it('should infer correct TypeScript type', () => {
      const index: ResourcesIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['contacts', 'templates'],
      };

      // Type check - this should compile
      const _version: number = index.version;
      const _updatedAt: string = index.updated_at;
      const _subdirs: string[] = index.subdirectories;

      expect(_version).toBe(1);
      expect(_updatedAt).toBe('2026-01-27T00:00:00Z');
      expect(_subdirs).toEqual(['contacts', 'templates']);
    });
  });
});
