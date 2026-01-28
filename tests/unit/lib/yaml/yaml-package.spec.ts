/**
 * Tests for YAML package installation (Story 4.0)
 *
 * Verifies that the `yaml` npm package is installed and functional.
 * This is needed for Epic 4 to parse and stringify YAML frontmatter in markdown files.
 */
import { describe, it, expect } from 'vitest';
import { parse, stringify } from 'yaml';

describe('YAML Package (Story 4.0)', () => {
  describe('parse', () => {
    it('parses simple YAML string to object', () => {
      const yaml = `
name: Test Project
status: active
priority: 1
`;
      const result = parse(yaml);
      expect(result).toEqual({
        name: 'Test Project',
        status: 'active',
        priority: 1,
      });
    });

    it('parses nested YAML structures', () => {
      const yaml = `
project:
  name: Test
  metadata:
    created: 2026-01-27
    tags:
      - urgent
      - work
`;
      const result = parse(yaml);
      expect(result).toEqual({
        project: {
          name: 'Test',
          metadata: {
            created: '2026-01-27',
            tags: ['urgent', 'work'],
          },
        },
      });
    });

    it('parses arrays', () => {
      const yaml = `
items:
  - first
  - second
  - third
`;
      const result = parse(yaml);
      expect(result.items).toEqual(['first', 'second', 'third']);
    });

    it('handles empty input', () => {
      expect(parse('')).toBe(null);
      expect(parse('   ')).toBe(null);
    });

    it('parses frontmatter-style YAML', () => {
      // Note: The YAML package parses the content between --- markers
      // The delimiters themselves are typically stripped before parsing
      const frontmatter = `
title: Project Alpha
type: project
id: proj_abc123def456
created: 2026-01-27T10:00:00Z
`;
      const result = parse(frontmatter);
      expect(result.title).toBe('Project Alpha');
      expect(result.type).toBe('project');
      expect(result.id).toBe('proj_abc123def456');
    });
  });

  describe('stringify', () => {
    it('stringifies object to YAML', () => {
      const obj = {
        name: 'Test Project',
        status: 'active',
        priority: 1,
      };
      const yaml = stringify(obj);
      expect(yaml).toContain('name: Test Project');
      expect(yaml).toContain('status: active');
      expect(yaml).toContain('priority: 1');
    });

    it('stringifies nested objects', () => {
      const obj = {
        project: {
          name: 'Test',
          metadata: {
            created: '2026-01-27',
          },
        },
      };
      const yaml = stringify(obj);
      expect(yaml).toContain('project:');
      expect(yaml).toContain('name: Test');
      expect(yaml).toContain('metadata:');
      expect(yaml).toContain('created:');
    });

    it('stringifies arrays', () => {
      const obj = {
        tags: ['urgent', 'work', 'review'],
      };
      const yaml = stringify(obj);
      expect(yaml).toContain('tags:');
      expect(yaml).toContain('- urgent');
      expect(yaml).toContain('- work');
      expect(yaml).toContain('- review');
    });

    it('round-trips correctly', () => {
      const original = {
        id: 'proj_a1b2c3d4e5f6',
        title: 'Test Project',
        type: 'project',
        metadata: {
          created: '2026-01-27T10:00:00Z',
          tags: ['work', 'important'],
        },
      };
      const yaml = stringify(original);
      const parsed = parse(yaml);
      expect(parsed).toEqual(original);
    });
  });
});
