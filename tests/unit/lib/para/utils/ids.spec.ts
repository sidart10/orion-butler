/**
 * Tests for PARA Entity ID Generators
 * Epic 4: PARA-Based File Structure
 *
 * TDD tests for ID generation and validation utilities.
 */
import { describe, it, expect } from 'vitest';
import {
  generateProjectId,
  generateAreaId,
  generateContactId,
  generateInboxId,
  generateResourceId,
  generateTemplateId,
  isValidId,
  isValidProjectId,
  isValidAreaId,
  isValidContactId,
  isValidInboxId,
  isValidResourceId,
  isValidTemplateId,
  getIdPrefix,
  getIdSuffix,
  ID_PREFIXES,
} from '@/lib/para/utils/ids';

describe('PARA ID Generators', () => {
  describe('ID_PREFIXES constants', () => {
    it('should have correct prefix for PROJECT', () => {
      expect(ID_PREFIXES.PROJECT).toBe('proj');
    });

    it('should have correct prefix for AREA', () => {
      expect(ID_PREFIXES.AREA).toBe('area');
    });

    it('should have correct prefix for CONTACT', () => {
      expect(ID_PREFIXES.CONTACT).toBe('cont');
    });

    it('should have correct prefix for INBOX', () => {
      expect(ID_PREFIXES.INBOX).toBe('inbox');
    });

    it('should have correct prefix for RESOURCE', () => {
      expect(ID_PREFIXES.RESOURCE).toBe('res');
    });

    it('should have correct prefix for TEMPLATE', () => {
      expect(ID_PREFIXES.TEMPLATE).toBe('tmpl');
    });
  });

  describe('generateProjectId', () => {
    it('should generate ID with proj_ prefix', () => {
      const id = generateProjectId();
      expect(id.startsWith('proj_')).toBe(true);
    });

    it('should generate ID with correct length (proj_ + 12 chars)', () => {
      const id = generateProjectId();
      expect(id.length).toBe(5 + 12); // 'proj_' + 12 chars
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateProjectId());
      }
      expect(ids.size).toBe(100);
    });

    it('should only contain alphanumeric characters after prefix', () => {
      const id = generateProjectId();
      const suffix = id.slice(5);
      expect(/^[a-z0-9]+$/.test(suffix)).toBe(true);
    });
  });

  describe('generateAreaId', () => {
    it('should generate ID with area_ prefix', () => {
      const id = generateAreaId();
      expect(id.startsWith('area_')).toBe(true);
    });

    it('should generate ID with correct length (area_ + 12 chars)', () => {
      const id = generateAreaId();
      expect(id.length).toBe(5 + 12);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateAreaId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateContactId', () => {
    it('should generate ID with cont_ prefix', () => {
      const id = generateContactId();
      expect(id.startsWith('cont_')).toBe(true);
    });

    it('should generate ID with correct length (cont_ + 12 chars)', () => {
      const id = generateContactId();
      expect(id.length).toBe(5 + 12);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateContactId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateInboxId', () => {
    it('should generate ID with inbox_ prefix', () => {
      const id = generateInboxId();
      expect(id.startsWith('inbox_')).toBe(true);
    });

    it('should generate ID with correct length (inbox_ + 12 chars)', () => {
      const id = generateInboxId();
      expect(id.length).toBe(6 + 12); // 'inbox_' is 6 chars
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateInboxId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateResourceId', () => {
    it('should generate ID with res_ prefix', () => {
      const id = generateResourceId();
      expect(id.startsWith('res_')).toBe(true);
    });

    it('should generate ID with correct length (res_ + 12 chars)', () => {
      const id = generateResourceId();
      expect(id.length).toBe(4 + 12);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateResourceId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateTemplateId', () => {
    it('should generate ID with tmpl_ prefix', () => {
      const id = generateTemplateId();
      expect(id.startsWith('tmpl_')).toBe(true);
    });

    it('should generate ID with correct length (tmpl_ + 12 chars)', () => {
      const id = generateTemplateId();
      expect(id.length).toBe(5 + 12);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTemplateId());
      }
      expect(ids.size).toBe(100);
    });
  });
});

describe('PARA ID Validators', () => {
  describe('isValidId', () => {
    it('should accept valid ID with correct prefix', () => {
      expect(isValidId('proj_a1b2c3d4e5f6', 'proj')).toBe(true);
    });

    it('should reject ID with wrong prefix', () => {
      expect(isValidId('area_a1b2c3d4e5f6', 'proj')).toBe(false);
    });

    it('should reject ID that is too short', () => {
      expect(isValidId('proj_short', 'proj')).toBe(false);
    });

    it('should reject ID that is too long', () => {
      expect(isValidId('proj_a1b2c3d4e5f6g7', 'proj')).toBe(false);
    });

    it('should reject ID with uppercase characters', () => {
      expect(isValidId('proj_A1B2C3D4E5F6', 'proj')).toBe(false);
    });

    it('should reject ID with special characters', () => {
      expect(isValidId('proj_a1b2c3d4e5f!', 'proj')).toBe(false);
    });

    it('should reject ID without underscore', () => {
      expect(isValidId('proja1b2c3d4e5f6', 'proj')).toBe(false);
    });
  });

  describe('isValidProjectId', () => {
    it('should accept valid project ID', () => {
      const id = generateProjectId();
      expect(isValidProjectId(id)).toBe(true);
    });

    it('should reject area ID', () => {
      const id = generateAreaId();
      expect(isValidProjectId(id)).toBe(false);
    });

    it('should reject malformed ID', () => {
      expect(isValidProjectId('invalid')).toBe(false);
    });
  });

  describe('isValidAreaId', () => {
    it('should accept valid area ID', () => {
      const id = generateAreaId();
      expect(isValidAreaId(id)).toBe(true);
    });

    it('should reject project ID', () => {
      const id = generateProjectId();
      expect(isValidAreaId(id)).toBe(false);
    });
  });

  describe('isValidContactId', () => {
    it('should accept valid contact ID', () => {
      const id = generateContactId();
      expect(isValidContactId(id)).toBe(true);
    });

    it('should reject project ID', () => {
      const id = generateProjectId();
      expect(isValidContactId(id)).toBe(false);
    });
  });

  describe('isValidInboxId', () => {
    it('should accept valid inbox ID', () => {
      const id = generateInboxId();
      expect(isValidInboxId(id)).toBe(true);
    });

    it('should reject project ID', () => {
      const id = generateProjectId();
      expect(isValidInboxId(id)).toBe(false);
    });
  });

  describe('isValidResourceId', () => {
    it('should accept valid resource ID', () => {
      const id = generateResourceId();
      expect(isValidResourceId(id)).toBe(true);
    });

    it('should reject project ID', () => {
      const id = generateProjectId();
      expect(isValidResourceId(id)).toBe(false);
    });
  });

  describe('isValidTemplateId', () => {
    it('should accept valid template ID', () => {
      const id = generateTemplateId();
      expect(isValidTemplateId(id)).toBe(true);
    });

    it('should reject project ID', () => {
      const id = generateProjectId();
      expect(isValidTemplateId(id)).toBe(false);
    });
  });
});

describe('PARA ID Helpers', () => {
  describe('getIdPrefix', () => {
    it('should extract proj prefix', () => {
      expect(getIdPrefix('proj_a1b2c3d4e5f6')).toBe('proj');
    });

    it('should extract area prefix', () => {
      expect(getIdPrefix('area_a1b2c3d4e5f6')).toBe('area');
    });

    it('should extract cont prefix', () => {
      expect(getIdPrefix('cont_a1b2c3d4e5f6')).toBe('cont');
    });

    it('should extract inbox prefix', () => {
      expect(getIdPrefix('inbox_a1b2c3d4e5f6')).toBe('inbox');
    });

    it('should extract res prefix', () => {
      expect(getIdPrefix('res_a1b2c3d4e5f6')).toBe('res');
    });

    it('should extract tmpl prefix', () => {
      expect(getIdPrefix('tmpl_a1b2c3d4e5f6')).toBe('tmpl');
    });

    it('should return null for invalid ID without underscore', () => {
      expect(getIdPrefix('invalid')).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(getIdPrefix('')).toBe(null);
    });
  });

  describe('getIdSuffix', () => {
    it('should extract suffix from project ID', () => {
      expect(getIdSuffix('proj_a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6');
    });

    it('should extract suffix from area ID', () => {
      expect(getIdSuffix('area_x9y8z7w6v5u4')).toBe('x9y8z7w6v5u4');
    });

    it('should extract suffix from inbox ID', () => {
      expect(getIdSuffix('inbox_a1b2c3d4e5f6')).toBe('a1b2c3d4e5f6');
    });

    it('should return null for invalid ID without underscore', () => {
      expect(getIdSuffix('invalid')).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(getIdSuffix('')).toBe(null);
    });

    it('should return null for ID with special characters in suffix', () => {
      expect(getIdSuffix('proj_a1b2c3d4e5f!')).toBe(null);
    });
  });

  describe('Generated IDs pass validation', () => {
    it('generated project IDs should pass isValidProjectId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateProjectId();
        expect(isValidProjectId(id)).toBe(true);
      }
    });

    it('generated area IDs should pass isValidAreaId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateAreaId();
        expect(isValidAreaId(id)).toBe(true);
      }
    });

    it('generated contact IDs should pass isValidContactId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateContactId();
        expect(isValidContactId(id)).toBe(true);
      }
    });

    it('generated inbox IDs should pass isValidInboxId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateInboxId();
        expect(isValidInboxId(id)).toBe(true);
      }
    });

    it('generated resource IDs should pass isValidResourceId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateResourceId();
        expect(isValidResourceId(id)).toBe(true);
      }
    });

    it('generated template IDs should pass isValidTemplateId', () => {
      for (let i = 0; i < 10; i++) {
        const id = generateTemplateId();
        expect(isValidTemplateId(id)).toBe(true);
      }
    });
  });
});
