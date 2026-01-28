/**
 * Tests for PARA-specific ID prefixes (Story 4.0)
 *
 * These tests verify the new ID prefixes required for Epic 4 PARA infrastructure:
 * - project, area, contact, template, note, procedure, preference, inboxItem
 */
import { describe, it, expect } from 'vitest';
import {
  generateId,
  validateId,
  getIdPrefix,
  ID_PREFIXES,
} from '@/db/schema';

describe('PARA ID Prefixes (Story 4.0)', () => {
  describe('ID_PREFIXES constant', () => {
    it('has project prefix', () => {
      expect(ID_PREFIXES.project).toBe('proj');
    });

    it('has area prefix', () => {
      expect(ID_PREFIXES.area).toBe('area');
    });

    it('has contact prefix', () => {
      expect(ID_PREFIXES.contact).toBe('cont');
    });

    it('has template prefix', () => {
      expect(ID_PREFIXES.template).toBe('tmpl');
    });

    it('has note prefix', () => {
      expect(ID_PREFIXES.note).toBe('note');
    });

    it('has procedure prefix', () => {
      expect(ID_PREFIXES.procedure).toBe('proc');
    });

    it('has preference prefix', () => {
      expect(ID_PREFIXES.preference).toBe('pref');
    });

    it('has inboxItem prefix', () => {
      expect(ID_PREFIXES.inboxItem).toBe('inbox');
    });

    it('has all 11 prefixes (3 existing + 8 new)', () => {
      const prefixCount = Object.keys(ID_PREFIXES).length;
      expect(prefixCount).toBe(11);
    });
  });

  describe('generateId for PARA types', () => {
    it('generates project ID with proj_ prefix', () => {
      const id = generateId('project');
      expect(id).toMatch(/^proj_[a-z0-9]{12}$/);
    });

    it('generates area ID with area_ prefix', () => {
      const id = generateId('area');
      expect(id).toMatch(/^area_[a-z0-9]{12}$/);
    });

    it('generates contact ID with cont_ prefix', () => {
      const id = generateId('contact');
      expect(id).toMatch(/^cont_[a-z0-9]{12}$/);
    });

    it('generates template ID with tmpl_ prefix', () => {
      const id = generateId('template');
      expect(id).toMatch(/^tmpl_[a-z0-9]{12}$/);
    });

    it('generates note ID with note_ prefix', () => {
      const id = generateId('note');
      expect(id).toMatch(/^note_[a-z0-9]{12}$/);
    });

    it('generates procedure ID with proc_ prefix', () => {
      const id = generateId('procedure');
      expect(id).toMatch(/^proc_[a-z0-9]{12}$/);
    });

    it('generates preference ID with pref_ prefix', () => {
      const id = generateId('preference');
      expect(id).toMatch(/^pref_[a-z0-9]{12}$/);
    });

    it('generates inboxItem ID with inbox_ prefix', () => {
      const id = generateId('inboxItem');
      expect(id).toMatch(/^inbox_[a-z0-9]{12}$/);
    });
  });

  describe('validateId for PARA types', () => {
    it('validates project IDs', () => {
      expect(validateId('proj_a1b2c3d4e5f6', 'project')).toBe(true);
      expect(validateId('area_a1b2c3d4e5f6', 'project')).toBe(false);
    });

    it('validates area IDs', () => {
      expect(validateId('area_a1b2c3d4e5f6', 'area')).toBe(true);
      expect(validateId('proj_a1b2c3d4e5f6', 'area')).toBe(false);
    });

    it('validates contact IDs', () => {
      expect(validateId('cont_a1b2c3d4e5f6', 'contact')).toBe(true);
      expect(validateId('area_a1b2c3d4e5f6', 'contact')).toBe(false);
    });

    it('validates template IDs', () => {
      expect(validateId('tmpl_a1b2c3d4e5f6', 'template')).toBe(true);
      expect(validateId('note_a1b2c3d4e5f6', 'template')).toBe(false);
    });

    it('validates note IDs', () => {
      expect(validateId('note_a1b2c3d4e5f6', 'note')).toBe(true);
      expect(validateId('tmpl_a1b2c3d4e5f6', 'note')).toBe(false);
    });

    it('validates procedure IDs', () => {
      expect(validateId('proc_a1b2c3d4e5f6', 'procedure')).toBe(true);
      expect(validateId('pref_a1b2c3d4e5f6', 'procedure')).toBe(false);
    });

    it('validates preference IDs', () => {
      expect(validateId('pref_a1b2c3d4e5f6', 'preference')).toBe(true);
      expect(validateId('proc_a1b2c3d4e5f6', 'preference')).toBe(false);
    });

    it('validates inboxItem IDs', () => {
      expect(validateId('inbox_a1b2c3d4e5f6', 'inboxItem')).toBe(true);
      expect(validateId('pref_a1b2c3d4e5f6', 'inboxItem')).toBe(false);
    });

    it('validates inbox IDs with correct length (17 chars: inbox + _ + 12)', () => {
      expect(validateId('inbox_000000000000', 'inboxItem')).toBe(true);
      expect(validateId('inbox_00000000000', 'inboxItem')).toBe(false); // 11 chars
      expect(validateId('inbox_0000000000000', 'inboxItem')).toBe(false); // 13 chars
    });
  });

  describe('getIdPrefix for PARA types', () => {
    it('extracts proj prefix', () => {
      expect(getIdPrefix('proj_a1b2c3d4e5f6')).toBe('proj');
    });

    it('extracts area prefix', () => {
      expect(getIdPrefix('area_a1b2c3d4e5f6')).toBe('area');
    });

    it('extracts cont prefix', () => {
      expect(getIdPrefix('cont_a1b2c3d4e5f6')).toBe('cont');
    });

    it('extracts tmpl prefix', () => {
      expect(getIdPrefix('tmpl_a1b2c3d4e5f6')).toBe('tmpl');
    });

    it('extracts note prefix', () => {
      expect(getIdPrefix('note_a1b2c3d4e5f6')).toBe('note');
    });

    it('extracts proc prefix', () => {
      expect(getIdPrefix('proc_a1b2c3d4e5f6')).toBe('proc');
    });

    it('extracts pref prefix', () => {
      expect(getIdPrefix('pref_a1b2c3d4e5f6')).toBe('pref');
    });

    it('extracts inbox prefix', () => {
      expect(getIdPrefix('inbox_a1b2c3d4e5f6')).toBe('inbox');
    });
  });
});
