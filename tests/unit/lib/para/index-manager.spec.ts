/**
 * Tests for PARA Index Manager Utilities
 * Story 4.13: Agent Write Access to PARA
 *
 * TDD Phase: RED - Write failing tests first
 *
 * Provides utility functions for managing PARA index files:
 * - getIndexPathForType: Get index file path for an entity type
 * - getIndexListKey: Get the array key name in the index file
 * - getEntityTypeFromPath: Determine entity type from file path
 */
import { describe, it, expect } from 'vitest';
import {
  getIndexPathForType,
  getIndexListKey,
  getEntityTypeFromPath,
} from '@/lib/para/index-manager';

// =============================================================================
// getIndexPathForType Tests
// =============================================================================

describe('getIndexPathForType (Story 4.13)', () => {
  describe('PARA root entity types', () => {
    it('should return "Orion/Projects/_index.yaml" for "project"', () => {
      const result = getIndexPathForType('project');
      expect(result).toBe('Orion/Projects/_index.yaml');
    });

    it('should return "Orion/Areas/_index.yaml" for "area"', () => {
      const result = getIndexPathForType('area');
      expect(result).toBe('Orion/Areas/_index.yaml');
    });

    it('should return "Orion/Archive/_index.yaml" for "archive"', () => {
      const result = getIndexPathForType('archive');
      expect(result).toBe('Orion/Archive/_index.yaml');
    });

    it('should return "Orion/Inbox/_index.yaml" for "inbox"', () => {
      const result = getIndexPathForType('inbox');
      expect(result).toBe('Orion/Inbox/_index.yaml');
    });
  });

  describe('Resources sub-entity types', () => {
    it('should return "Orion/Resources/contacts/_index.yaml" for "contact"', () => {
      const result = getIndexPathForType('contact');
      expect(result).toBe('Orion/Resources/contacts/_index.yaml');
    });

    it('should return "Orion/Resources/notes/_index.yaml" for "note"', () => {
      const result = getIndexPathForType('note');
      expect(result).toBe('Orion/Resources/notes/_index.yaml');
    });

    it('should return "Orion/Resources/templates/_index.yaml" for "template"', () => {
      const result = getIndexPathForType('template');
      expect(result).toBe('Orion/Resources/templates/_index.yaml');
    });

    it('should return "Orion/Resources/procedures/_index.yaml" for "procedure"', () => {
      const result = getIndexPathForType('procedure');
      expect(result).toBe('Orion/Resources/procedures/_index.yaml');
    });

    it('should return "Orion/Resources/preferences/_index.yaml" for "preference"', () => {
      const result = getIndexPathForType('preference');
      expect(result).toBe('Orion/Resources/preferences/_index.yaml');
    });
  });

  describe('error handling', () => {
    it('should throw for unknown entity type', () => {
      expect(() => getIndexPathForType('unknown')).toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => getIndexPathForType('')).toThrow();
    });

    it('should be case-sensitive (throws for "Project")', () => {
      expect(() => getIndexPathForType('Project')).toThrow();
    });
  });
});

// =============================================================================
// getIndexListKey Tests
// =============================================================================

describe('getIndexListKey (Story 4.13)', () => {
  describe('PARA root entity types', () => {
    it('should return "projects" for "project"', () => {
      const result = getIndexListKey('project');
      expect(result).toBe('projects');
    });

    it('should return "areas" for "area"', () => {
      const result = getIndexListKey('area');
      expect(result).toBe('areas');
    });

    it('should return "archived" for "archive"', () => {
      const result = getIndexListKey('archive');
      expect(result).toBe('archived');
    });

    it('should return "items" for "inbox"', () => {
      const result = getIndexListKey('inbox');
      expect(result).toBe('items');
    });
  });

  describe('Resources sub-entity types', () => {
    it('should return "contacts" for "contact"', () => {
      const result = getIndexListKey('contact');
      expect(result).toBe('contacts');
    });

    it('should return "notes" for "note"', () => {
      const result = getIndexListKey('note');
      expect(result).toBe('notes');
    });

    it('should return "templates" for "template"', () => {
      const result = getIndexListKey('template');
      expect(result).toBe('templates');
    });

    it('should return "procedures" for "procedure"', () => {
      const result = getIndexListKey('procedure');
      expect(result).toBe('procedures');
    });

    it('should return "preferences" for "preference"', () => {
      const result = getIndexListKey('preference');
      expect(result).toBe('preferences');
    });
  });

  describe('error handling', () => {
    it('should throw for unknown entity type', () => {
      expect(() => getIndexListKey('unknown')).toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => getIndexListKey('')).toThrow();
    });
  });
});

// =============================================================================
// getEntityTypeFromPath Tests
// =============================================================================

describe('getEntityTypeFromPath (Story 4.13)', () => {
  describe('PARA root paths', () => {
    it('should return "project" for "Orion/Projects/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Projects/test/_meta.yaml');
      expect(result).toBe('project');
    });

    it('should return "project" for nested project paths', () => {
      const result = getEntityTypeFromPath('Orion/Projects/deep/nested/project/_meta.yaml');
      expect(result).toBe('project');
    });

    it('should return "area" for "Orion/Areas/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Areas/health/_meta.yaml');
      expect(result).toBe('area');
    });

    it('should return "archive" for "Orion/Archive/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Archive/old-project/_meta.yaml');
      expect(result).toBe('archive');
    });

    it('should return "inbox" for "Orion/Inbox/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Inbox/item.yaml');
      expect(result).toBe('inbox');
    });
  });

  describe('Resources sub-paths', () => {
    it('should return "contact" for "Orion/Resources/contacts/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Resources/contacts/john-doe.yaml');
      expect(result).toBe('contact');
    });

    it('should return "note" for "Orion/Resources/notes/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Resources/notes/meeting-notes.yaml');
      expect(result).toBe('note');
    });

    it('should return "template" for "Orion/Resources/templates/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Resources/templates/project-template.yaml');
      expect(result).toBe('template');
    });

    it('should return "procedure" for "Orion/Resources/procedures/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Resources/procedures/deploy.yaml');
      expect(result).toBe('procedure');
    });

    it('should return "preference" for "Orion/Resources/preferences/..." paths', () => {
      const result = getEntityTypeFromPath('Orion/Resources/preferences/theme.yaml');
      expect(result).toBe('preference');
    });
  });

  describe('null returns for non-PARA paths', () => {
    it('should return null for unknown path', () => {
      const result = getEntityTypeFromPath('Documents/file.txt');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getEntityTypeFromPath('');
      expect(result).toBeNull();
    });

    it('should return null for partial Orion path', () => {
      const result = getEntityTypeFromPath('OrionExtra/file.txt');
      expect(result).toBeNull();
    });

    it('should return null for Orion root without subdirectory', () => {
      const result = getEntityTypeFromPath('Orion');
      expect(result).toBeNull();
    });

    it('should return null for unknown Orion subdirectory', () => {
      const result = getEntityTypeFromPath('Orion/Unknown/file.yaml');
      expect(result).toBeNull();
    });

    it('should return null for generic Resources path (no sub-type)', () => {
      const result = getEntityTypeFromPath('Orion/Resources/unknown/file.yaml');
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle trailing slashes', () => {
      const result = getEntityTypeFromPath('Orion/Projects/test/');
      expect(result).toBe('project');
    });

    it('should handle paths with special characters', () => {
      const result = getEntityTypeFromPath('Orion/Projects/test-project (2026)/_meta.yaml');
      expect(result).toBe('project');
    });

    it('should be case-sensitive for Orion root', () => {
      const result = getEntityTypeFromPath('orion/Projects/test/_meta.yaml');
      expect(result).toBeNull();
    });

    it('should be case-sensitive for PARA directories', () => {
      const result = getEntityTypeFromPath('Orion/projects/test/_meta.yaml');
      expect(result).toBeNull();
    });
  });
});

// =============================================================================
// Integration-like Tests
// =============================================================================

describe('Index Manager round-trip (Story 4.13)', () => {
  it('should map project path to correct index path and key', () => {
    const path = 'Orion/Projects/my-project/_meta.yaml';
    const entityType = getEntityTypeFromPath(path);
    expect(entityType).toBe('project');

    const indexPath = getIndexPathForType(entityType!);
    expect(indexPath).toBe('Orion/Projects/_index.yaml');

    const listKey = getIndexListKey(entityType!);
    expect(listKey).toBe('projects');
  });

  it('should map contact path to correct index path and key', () => {
    const path = 'Orion/Resources/contacts/alice.yaml';
    const entityType = getEntityTypeFromPath(path);
    expect(entityType).toBe('contact');

    const indexPath = getIndexPathForType(entityType!);
    expect(indexPath).toBe('Orion/Resources/contacts/_index.yaml');

    const listKey = getIndexListKey(entityType!);
    expect(listKey).toBe('contacts');
  });

  it('should map area path to correct index path and key', () => {
    const path = 'Orion/Areas/health-fitness/_meta.yaml';
    const entityType = getEntityTypeFromPath(path);
    expect(entityType).toBe('area');

    const indexPath = getIndexPathForType(entityType!);
    expect(indexPath).toBe('Orion/Areas/_index.yaml');

    const listKey = getIndexListKey(entityType!);
    expect(listKey).toBe('areas');
  });

  it('should return null for non-PARA paths', () => {
    const path = 'Documents/notes.txt';
    const entityType = getEntityTypeFromPath(path);
    expect(entityType).toBeNull();

    // Should not proceed to index operations for non-PARA paths
    expect(() => {
      if (entityType) {
        getIndexPathForType(entityType);
      }
    }).not.toThrow();
  });
});
