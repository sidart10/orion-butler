/**
 * Tests for PARA Path Resolver
 * Story 4.14: PARA Path Resolver
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Functions under test (DO NOT EXIST YET):
 * - resolveParaPath(path: string): Result<string, PathResolveError>
 * - isParaPath(relativePath: string): boolean
 * - toParaUri(relativePath: string): Result<string, PathResolveError>
 * - type PathResolveError
 */
import { describe, it, expect } from 'vitest';

// These imports will fail until we implement the functions
import {
  resolveParaPath,
  isParaPath,
  toParaUri,
  type PathResolveError,
  // Existing exports (regression tests)
  getOrionPaths,
  buildOrionPath,
  ORION_ROOT,
  PROJECTS_DIR,
  AREAS_DIR,
  RESOURCES_DIR,
  ARCHIVE_DIR,
  INBOX_DIR,
} from '@/lib/para/paths';

// =============================================================================
// resolveParaPath - para:// scheme tests
// =============================================================================

describe('resolveParaPath (Story 4.14)', () => {
  describe('para:// scheme - root and categories', () => {
    it('should resolve para:// to Orion root', () => {
      const result = resolveParaPath('para://');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion');
      }
    });

    it('should resolve para://projects to Orion/Projects', () => {
      const result = resolveParaPath('para://projects');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects');
      }
    });

    it('should resolve para://projects/q1-launch to Orion/Projects/q1-launch', () => {
      const result = resolveParaPath('para://projects/q1-launch');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/q1-launch');
      }
    });

    it('should resolve para://areas to Orion/Areas', () => {
      const result = resolveParaPath('para://areas');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Areas');
      }
    });

    it('should resolve para://resources to Orion/Resources', () => {
      const result = resolveParaPath('para://resources');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Resources');
      }
    });

    it('should resolve para://archive to Orion/Archive', () => {
      const result = resolveParaPath('para://archive');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Archive');
      }
    });

    it('should resolve para://inbox to Orion/Inbox', () => {
      const result = resolveParaPath('para://inbox');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Inbox');
      }
    });
  });

  describe('para:// scheme - resource shortcuts with auto .yaml', () => {
    it('should resolve para://contacts/john to Orion/Resources/contacts/john.yaml', () => {
      const result = resolveParaPath('para://contacts/john');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Resources/contacts/john.yaml');
      }
    });

    it('should resolve para://notes/research to Orion/Resources/notes/research.yaml', () => {
      const result = resolveParaPath('para://notes/research');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Resources/notes/research.yaml');
      }
    });

    it('should resolve para://templates/meeting to Orion/Resources/templates/meeting.yaml', () => {
      const result = resolveParaPath('para://templates/meeting');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Resources/templates/meeting.yaml');
      }
    });

    it('should NOT add .yaml if already present', () => {
      const result = resolveParaPath('para://contacts/john.yaml');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Resources/contacts/john.yaml');
        // Ensure no double extension
        expect(result.value).not.toContain('.yaml.yaml');
      }
    });
  });

  describe('para:// scheme - error cases', () => {
    it('should return error for invalid category', () => {
      const result = resolveParaPath('para://invalid');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_CATEGORY');
      }
    });

    it('should return error for unknown category', () => {
      const result = resolveParaPath('para://foobar/test');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_CATEGORY');
      }
    });
  });

  describe('para:// scheme - case insensitivity', () => {
    it('should handle uppercase category: para://PROJECTS/TEST', () => {
      const result = resolveParaPath('para://PROJECTS/TEST');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/TEST');
      }
    });

    it('should handle mixed case: para://ArEaS/Health', () => {
      const result = resolveParaPath('para://ArEaS/Health');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Areas/Health');
      }
    });

    it('should handle uppercase scheme: PARA://projects/test', () => {
      const result = resolveParaPath('PARA://projects/test');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/test');
      }
    });
  });

  describe('passthrough paths', () => {
    it('should passthrough Orion/Projects/q1 unchanged', () => {
      const result = resolveParaPath('Orion/Projects/q1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/q1');
      }
    });

    it('should passthrough bare Orion path', () => {
      const result = resolveParaPath('Orion');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion');
      }
    });

    it('should resolve relative path projects/q1 to Orion/Projects/q1', () => {
      const result = resolveParaPath('projects/q1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/q1');
      }
    });

    it('should resolve relative path areas/health to Orion/Areas/health', () => {
      const result = resolveParaPath('areas/health');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Areas/health');
      }
    });

    it('should return error for absolute non-PARA path', () => {
      const result = resolveParaPath('/Users/test/other');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_PARA_PATH');
      }
    });

    it('should return error for non-PARA relative path', () => {
      const result = resolveParaPath('Documents/file.txt');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_PARA_PATH');
      }
    });
  });

  describe('edge cases', () => {
    it('should normalize multiple slashes: para://projects//q1', () => {
      const result = resolveParaPath('para://projects//q1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/q1');
        expect(result.value).not.toContain('//');
      }
    });

    it('should handle trailing slash: para://projects/', () => {
      const result = resolveParaPath('para://projects/');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects');
        expect(result.value).not.toMatch(/\/$/);
      }
    });

    it('should preserve special characters: para://projects/my-project_v2.1', () => {
      const result = resolveParaPath('para://projects/my-project_v2.1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/my-project_v2.1');
      }
    });

    it('should handle deeply nested paths', () => {
      const result = resolveParaPath('para://projects/q1/tasks/sprint-1/backlog');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/q1/tasks/sprint-1/backlog');
      }
    });

    it('should handle empty path after scheme', () => {
      const result = resolveParaPath('para://');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion');
      }
    });

    it('should handle paths with dots in directory names', () => {
      const result = resolveParaPath('para://projects/v1.0.0-release');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/v1.0.0-release');
      }
    });

    it('should handle paths with spaces', () => {
      const result = resolveParaPath('para://projects/my project');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('Orion/Projects/my project');
      }
    });
  });
});

// =============================================================================
// isParaPath tests
// =============================================================================

describe('isParaPath (Story 4.14)', () => {
  describe('valid PARA paths', () => {
    it('should return true for Orion root', () => {
      expect(isParaPath('Orion')).toBe(true);
    });

    it('should return true for Orion/Projects', () => {
      expect(isParaPath('Orion/Projects')).toBe(true);
    });

    it('should return true for Orion/Projects/q1', () => {
      expect(isParaPath('Orion/Projects/q1')).toBe(true);
    });

    it('should return true for Orion/Areas/health', () => {
      expect(isParaPath('Orion/Areas/health')).toBe(true);
    });

    it('should return true for Orion/Resources', () => {
      expect(isParaPath('Orion/Resources')).toBe(true);
    });

    it('should return true for Orion/Archive', () => {
      expect(isParaPath('Orion/Archive')).toBe(true);
    });

    it('should return true for Orion/Inbox', () => {
      expect(isParaPath('Orion/Inbox')).toBe(true);
    });

    it('should return true for Orion/.orion/config.yaml', () => {
      expect(isParaPath('Orion/.orion/config.yaml')).toBe(true);
    });
  });

  describe('invalid PARA paths', () => {
    it('should return false for Documents/file.txt', () => {
      expect(isParaPath('Documents/file.txt')).toBe(false);
    });

    it('should return false for OrionExtra/file (partial match)', () => {
      expect(isParaPath('OrionExtra/file')).toBe(false);
    });

    it('should return false for MyOrion/Projects', () => {
      expect(isParaPath('MyOrion/Projects')).toBe(false);
    });

    it('should return false for absolute non-PARA path', () => {
      expect(isParaPath('/Users/test/Documents')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isParaPath('')).toBe(false);
    });

    it('should return false for orion (lowercase)', () => {
      // Orion root must be exact match
      expect(isParaPath('orion')).toBe(false);
    });

    it('should return false for paths containing Orion but not starting with it', () => {
      expect(isParaPath('backup/Orion/Projects')).toBe(false);
    });
  });
});

// =============================================================================
// toParaUri tests
// =============================================================================

describe('toParaUri (Story 4.14)', () => {
  describe('valid conversions', () => {
    it('should convert Orion/Projects/q1 to para://projects/q1', () => {
      const result = toParaUri('Orion/Projects/q1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://projects/q1');
      }
    });

    it('should convert Orion/Areas/health to para://areas/health', () => {
      const result = toParaUri('Orion/Areas/health');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://areas/health');
      }
    });

    it('should convert Orion/Resources to para://resources', () => {
      const result = toParaUri('Orion/Resources');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://resources');
      }
    });

    it('should convert Orion/Archive to para://archive', () => {
      const result = toParaUri('Orion/Archive');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://archive');
      }
    });

    it('should convert Orion/Inbox to para://inbox', () => {
      const result = toParaUri('Orion/Inbox');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://inbox');
      }
    });

    it('should convert Orion to para://', () => {
      const result = toParaUri('Orion');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://');
      }
    });

    it('should convert Orion/Projects to para://projects', () => {
      const result = toParaUri('Orion/Projects');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://projects');
      }
    });

    it('should convert deeply nested path', () => {
      const result = toParaUri('Orion/Projects/q1/tasks/sprint-1');
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe('para://projects/q1/tasks/sprint-1');
      }
    });
  });

  describe('error cases', () => {
    it('should return error for Documents/file.txt', () => {
      const result = toParaUri('Documents/file.txt');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_PARA_PATH');
      }
    });

    it('should return error for absolute non-PARA path', () => {
      const result = toParaUri('/Users/test/Documents');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_PARA_PATH');
      }
    });

    it('should return error for OrionExtra (partial match)', () => {
      const result = toParaUri('OrionExtra/Projects');
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('NOT_PARA_PATH');
      }
    });
  });

  describe('roundtrip', () => {
    it('should roundtrip: Orion/Projects/q1 -> para:// -> Orion/Projects/q1', () => {
      const original = 'Orion/Projects/q1';
      const uriResult = toParaUri(original);
      expect(uriResult.isOk()).toBe(true);
      if (uriResult.isOk()) {
        const pathResult = resolveParaPath(uriResult.value);
        expect(pathResult.isOk()).toBe(true);
        if (pathResult.isOk()) {
          expect(pathResult.value).toBe(original);
        }
      }
    });

    it('should roundtrip: para://areas/health -> Orion -> para://', () => {
      const original = 'para://areas/health';
      const pathResult = resolveParaPath(original);
      expect(pathResult.isOk()).toBe(true);
      if (pathResult.isOk()) {
        const uriResult = toParaUri(pathResult.value);
        expect(uriResult.isOk()).toBe(true);
        if (uriResult.isOk()) {
          expect(uriResult.value).toBe(original);
        }
      }
    });
  });
});

// =============================================================================
// PathResolveError type tests
// =============================================================================

describe('PathResolveError type (Story 4.14)', () => {
  it('should have INVALID_CATEGORY error code', () => {
    const result = resolveParaPath('para://invalid');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: PathResolveError = result.error;
      expect(error.code).toBe('INVALID_CATEGORY');
      expect(typeof error.message).toBe('string');
    }
  });

  it('should have NOT_PARA_PATH error code', () => {
    const result = resolveParaPath('/Users/test/Documents');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      const error: PathResolveError = result.error;
      expect(error.code).toBe('NOT_PARA_PATH');
      expect(typeof error.message).toBe('string');
    }
  });

  it('should include helpful error message for INVALID_CATEGORY', () => {
    const result = resolveParaPath('para://foobar');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toMatch(/foobar|invalid|category/i);
    }
  });
});

// =============================================================================
// Regression tests - existing functions should still work
// =============================================================================

describe('Regression tests - existing paths.ts exports (Story 4.14)', () => {
  describe('Constants should remain unchanged', () => {
    it('should export ORION_ROOT as "Orion"', () => {
      expect(ORION_ROOT).toBe('Orion');
    });

    it('should export PROJECTS_DIR as "Projects"', () => {
      expect(PROJECTS_DIR).toBe('Projects');
    });

    it('should export AREAS_DIR as "Areas"', () => {
      expect(AREAS_DIR).toBe('Areas');
    });

    it('should export RESOURCES_DIR as "Resources"', () => {
      expect(RESOURCES_DIR).toBe('Resources');
    });

    it('should export ARCHIVE_DIR as "Archive"', () => {
      expect(ARCHIVE_DIR).toBe('Archive');
    });

    it('should export INBOX_DIR as "Inbox"', () => {
      expect(INBOX_DIR).toBe('Inbox');
    });
  });

  describe('getOrionPaths should still work', () => {
    it('should return all PARA directory paths', () => {
      const paths = getOrionPaths();
      expect(paths.root).toBe('Orion');
      expect(paths.projects).toBe('Orion/Projects');
      expect(paths.areas).toBe('Orion/Areas');
      expect(paths.resources).toBe('Orion/Resources');
      expect(paths.archive).toBe('Orion/Archive');
      expect(paths.inbox).toBe('Orion/Inbox');
    });

    it('should return system directory path', () => {
      const paths = getOrionPaths();
      expect(paths.system).toBe('Orion/.orion');
    });
  });

  describe('buildOrionPath should still work', () => {
    it('should build path with single segment', () => {
      expect(buildOrionPath('Projects')).toBe('Orion/Projects');
    });

    it('should build path with multiple segments', () => {
      expect(buildOrionPath('Projects', 'my-project', 'tasks')).toBe(
        'Orion/Projects/my-project/tasks'
      );
    });

    it('should return just Orion root with no segments', () => {
      expect(buildOrionPath()).toBe('Orion');
    });
  });
});
