/**
 * Tests for Templates Zod Schemas
 * Story 4.11: Initialize Templates Subdirectory
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';
import {
  TemplatesIndexSchema,
  type TemplatesIndex,
} from '@/lib/para/schemas/templates';

describe('Templates Zod Schemas (Story 4.11)', () => {
  describe('TemplatesIndexSchema', () => {
    it('should validate a valid templates index', () => {
      const validIndex: TemplatesIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['email-templates', 'meeting-templates'],
      };

      const result = TemplatesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require version to be a positive integer', () => {
      const invalidIndex = {
        version: 0,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should require version to be an integer', () => {
      const invalidIndex = {
        version: 1.5,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should require updated_at to be a valid ISO 8601 datetime', () => {
      const invalidIndex = {
        version: 1,
        updated_at: 'not-a-date',
        subdirectories: [],
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should accept updated_at with timezone offset', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T12:30:00+05:30',
        subdirectories: [],
      };

      const result = TemplatesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require subdirectories to be an array', () => {
      const invalidIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: 'not-an-array',
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should allow empty subdirectories array', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [],
      };

      const result = TemplatesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should require subdirectory names to be non-empty strings', () => {
      const invalidIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: [''],
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidIndex = {
        version: 1,
      };

      const result = TemplatesIndexSchema.safeParse(invalidIndex);
      expect(result.success).toBe(false);
    });

    it('should accept optional description field', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['email-templates'],
        description: 'Reusable templates for various document types',
      };

      const result = TemplatesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Reusable templates for various document types');
      }
    });

    it('should accept optional templates array for template registry', () => {
      const validIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['email-templates'],
        templates: [
          {
            name: 'follow-up',
            path: 'email-templates/follow-up.md',
            category: 'email',
          },
        ],
      };

      const result = TemplatesIndexSchema.safeParse(validIndex);
      expect(result.success).toBe(true);
    });

    it('should infer correct TypeScript type', () => {
      const index: TemplatesIndex = {
        version: 1,
        updated_at: '2026-01-27T00:00:00Z',
        subdirectories: ['email-templates', 'meeting-templates'],
      };

      // Type check - this should compile
      const _version: number = index.version;
      const _updatedAt: string = index.updated_at;
      const _subdirs: string[] = index.subdirectories;

      expect(_version).toBe(1);
      expect(_updatedAt).toBe('2026-01-27T00:00:00Z');
      expect(_subdirs).toEqual(['email-templates', 'meeting-templates']);
    });
  });
});
