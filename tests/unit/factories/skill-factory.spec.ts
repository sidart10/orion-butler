/**
 * Unit tests for SkillFactory
 *
 * Tests AC#1: create() method with valid skill manifest structure
 */
import { describe, it, expect } from 'vitest';
import { SkillFactory } from '../../fixtures/factories/skill';
import type { Skill } from '../../fixtures/factories/types';

describe('SkillFactory', () => {
  describe('create()', () => {
    it('should create a valid Skill entity with default values (AC#1)', () => {
      const skill = SkillFactory.create();

      expect(skill.id).toBeDefined();
      expect(typeof skill.id).toBe('string');
      expect(skill.name).toBeDefined();
      expect(skill.trigger).toBeDefined();
      expect(skill.promptTemplate).toBeDefined();
      expect(typeof skill.isActive).toBe('boolean');
    });

    it('should create a Skill with custom overrides', () => {
      const skill = SkillFactory.create({
        id: 'custom-skill-id',
        name: 'morning-briefing',
        trigger: '/briefing',
        promptTemplate: 'Generate a morning briefing for {{user}}',
        isActive: false,
      });

      expect(skill.id).toBe('custom-skill-id');
      expect(skill.name).toBe('morning-briefing');
      expect(skill.trigger).toBe('/briefing');
      expect(skill.promptTemplate).toBe('Generate a morning briefing for {{user}}');
      expect(skill.isActive).toBe(false);
    });

    it('should generate unique IDs for each skill', () => {
      const skill1 = SkillFactory.create();
      const skill2 = SkillFactory.create();

      expect(skill1.id).not.toBe(skill2.id);
    });

    it('should default to active state', () => {
      const skill = SkillFactory.create();

      expect(skill.isActive).toBe(true);
    });

    it('should include valid skill manifest structure', () => {
      const skill = SkillFactory.create();

      // Verify all required fields are present
      expect(skill).toHaveProperty('id');
      expect(skill).toHaveProperty('name');
      expect(skill).toHaveProperty('trigger');
      expect(skill).toHaveProperty('promptTemplate');
      expect(skill).toHaveProperty('isActive');

      // Verify trigger format (either /command or keyword)
      const isSlashCommand = skill.trigger.startsWith('/');
      const isKeyword = !skill.trigger.includes('/');
      expect(isSlashCommand || isKeyword).toBe(true);
    });
  });

  describe('createMany()', () => {
    it('should create multiple skills with default values', () => {
      const skills = SkillFactory.createMany(3);

      expect(skills).toHaveLength(3);
      skills.forEach((skill) => {
        expect(skill.id).toBeDefined();
        expect(skill.name).toBeDefined();
        expect(skill.trigger).toBeDefined();
      });
    });

    it('should create skills with shared overrides', () => {
      const skills = SkillFactory.createMany(3, { isActive: false });

      skills.forEach((skill) => {
        expect(skill.isActive).toBe(false);
      });
    });

    it('should generate unique IDs for all skills', () => {
      const skills = SkillFactory.createMany(5);
      const ids = skills.map((s) => s.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('should return empty array when count is 0', () => {
      const skills = SkillFactory.createMany(0);

      expect(skills).toHaveLength(0);
    });
  });

  describe('predefined skill factories', () => {
    it('should create morning briefing skill', () => {
      const skill = SkillFactory.createMorningBriefing();

      expect(skill.name).toBe('morning-briefing');
      expect(skill.trigger).toBe('/briefing');
      expect(skill.isActive).toBe(true);
    });

    it('should create inbox triage skill', () => {
      const skill = SkillFactory.createInboxTriage();

      expect(skill.name).toBe('inbox-triage');
      expect(skill.trigger).toBe('/inbox');
      expect(skill.isActive).toBe(true);
    });

    it('should create calendar management skill', () => {
      const skill = SkillFactory.createCalendarManagement();

      expect(skill.name).toBe('calendar-manage');
      expect(skill.trigger).toBe('/schedule');
      expect(skill.isActive).toBe(true);
    });

    it('should create email composition skill', () => {
      const skill = SkillFactory.createEmailComposition();

      expect(skill.name).toBe('email-compose');
      expect(skill.trigger).toBe('/email');
      expect(skill.isActive).toBe(true);
    });

    it('should create weekly review skill', () => {
      const skill = SkillFactory.createWeeklyReview();

      expect(skill.name).toBe('weekly-review');
      expect(skill.trigger).toBe('/review');
      expect(skill.isActive).toBe(true);
    });
  });
});
