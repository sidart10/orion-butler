/**
 * Tests for PARA Path Constants and Helpers
 * Story 4.1a: Create PARA Root Directory Structure
 *
 * TDD Phase: RED - Write failing tests first
 */
import { describe, it, expect } from 'vitest';

// These imports will fail until we implement the module
import {
  ORION_ROOT,
  ORION_SYSTEM_DIR,
  getOrionPaths,
  type OrionPaths,
} from '@/lib/para/paths';

describe('PARA Path Constants (Story 4.1a)', () => {
  describe('Constants', () => {
    it('should define ORION_ROOT as "Orion"', () => {
      expect(ORION_ROOT).toBe('Orion');
    });

    it('should define ORION_SYSTEM_DIR as ".orion"', () => {
      expect(ORION_SYSTEM_DIR).toBe('.orion');
    });
  });

  describe('getOrionPaths', () => {
    it('should return OrionPaths with root path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.root).toBe('Orion');
    });

    it('should return OrionPaths with system directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.system).toBe('Orion/.orion');
    });

    it('should return OrionPaths with projects directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.projects).toBe('Orion/Projects');
    });

    it('should return OrionPaths with areas directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.areas).toBe('Orion/Areas');
    });

    it('should return OrionPaths with resources directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.resources).toBe('Orion/Resources');
    });

    it('should return OrionPaths with archive directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.archive).toBe('Orion/Archive');
    });

    it('should return OrionPaths with inbox directory path', () => {
      const paths: OrionPaths = getOrionPaths();
      expect(paths.inbox).toBe('Orion/Inbox');
    });

    it('should have all required PARA directories', () => {
      const paths: OrionPaths = getOrionPaths();

      // All paths should be defined
      expect(paths.root).toBeDefined();
      expect(paths.system).toBeDefined();
      expect(paths.projects).toBeDefined();
      expect(paths.areas).toBeDefined();
      expect(paths.resources).toBeDefined();
      expect(paths.archive).toBeDefined();
      expect(paths.inbox).toBeDefined();
    });
  });

  describe('OrionPaths type structure', () => {
    it('should match expected type shape', () => {
      const paths = getOrionPaths();

      // Type checking - all fields should be strings
      expect(typeof paths.root).toBe('string');
      expect(typeof paths.system).toBe('string');
      expect(typeof paths.projects).toBe('string');
      expect(typeof paths.areas).toBe('string');
      expect(typeof paths.resources).toBe('string');
      expect(typeof paths.archive).toBe('string');
      expect(typeof paths.inbox).toBe('string');
    });
  });
});
