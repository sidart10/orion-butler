/**
 * Project Structure Tests - Epic 1 Story 1.1
 *
 * Tests that verify the scaffolding created the expected directory structure.
 * These tests should FAIL until the Tauri scaffold is created.
 *
 * Test IDs: PS-001 through PS-008
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

describe('Project Structure', () => {
  describe('Tauri Backend Structure', () => {
    it('PS-001: should have src-tauri directory', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src-tauri'))).toBe(true);
    });

    it('PS-004: should have Tauri Cargo.toml', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src-tauri', 'Cargo.toml'))).toBe(true);
    });

    it('PS-005: should have tauri.conf.json', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src-tauri', 'tauri.conf.json'))).toBe(true);
    });
  });

  describe('Next.js Frontend Structure', () => {
    it('PS-002: should have src directory for Next.js', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src'))).toBe(true);
    });

    it('PS-003: should have app directory for App Router', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src', 'app'))).toBe(true);
    });

    it('PS-006: should have components directory', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src', 'components'))).toBe(true);
    });

    it('PS-007: should have lib directory', () => {
      expect(existsSync(join(PROJECT_ROOT, 'src', 'lib'))).toBe(true);
    });
  });

  describe('Design System Preservation', () => {
    it('PS-008: should have design-system directory', () => {
      expect(existsSync(join(PROJECT_ROOT, 'design-system'))).toBe(true);
    });
  });
});
