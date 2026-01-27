/**
 * Skill Factory for Orion Butler Tests
 *
 * Creates test Skill entities with valid manifest structure.
 * Includes predefined factories for the 5 Butler skills.
 *
 * @see AC#1: SkillFactory.create() creates valid Skill with manifest structure
 * @see FR-9: Butler Plugin - 5 skills
 * @see thoughts/planning-artifacts/architecture.md#Extension System Architecture
 */
import type { Skill } from './types';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Counter for generating unique skill names
 */
let skillCounter = 0;

/**
 * Factory for creating Skill entities
 */
export const SkillFactory = {
  /**
   * Create a single Skill entity with defaults
   *
   * @param overrides - Partial Skill to override defaults
   * @returns A valid Skill entity with manifest structure
   *
   * @example
   * ```typescript
   * const skill = SkillFactory.create({ name: 'my-skill', trigger: '/myskill' });
   * expect(skill.trigger).toBe('/myskill');
   * ```
   */
  create(overrides: Partial<Skill> = {}): Skill {
    skillCounter++;
    const skillName = `test-skill-${skillCounter}`;

    return {
      id: generateUUID(),
      name: skillName,
      trigger: `/${skillName}`,
      promptTemplate: `Execute ${skillName} for the user. Context: {{context}}`,
      isActive: true,
      ...overrides,
    };
  },

  /**
   * Create multiple Skill entities
   *
   * @param count - Number of skills to create
   * @param overrides - Partial Skill to apply to all created skills
   * @returns Array of Skill entities
   */
  createMany(count: number, overrides: Partial<Skill> = {}): Skill[] {
    const skills: Skill[] = [];
    for (let i = 0; i < count; i++) {
      skills.push(this.create(overrides));
    }
    return skills;
  },

  /**
   * Create the Morning Briefing skill (Butler skill #1)
   *
   * @returns A configured morning-briefing Skill
   */
  createMorningBriefing(): Skill {
    return this.create({
      name: 'morning-briefing',
      trigger: '/briefing',
      promptTemplate: `Generate a morning briefing for the user including:
- Top 3 priorities for today
- Upcoming calendar events
- Urgent emails requiring attention
- Weather forecast (if location available)

User context: {{user_context}}
Date: {{date}}`,
      isActive: true,
    });
  },

  /**
   * Create the Inbox Triage skill (Butler skill #2)
   *
   * @returns A configured inbox-triage Skill
   */
  createInboxTriage(): Skill {
    return this.create({
      name: 'inbox-triage',
      trigger: '/inbox',
      promptTemplate: `Process the user's inbox by:
1. Fetching unread emails
2. Scoring each by urgency (0-100)
3. Categorizing: Urgent | Important | FYI | Archive
4. Suggesting actions for top 5

User preferences: {{preferences}}
Time since last triage: {{last_triage}}`,
      isActive: true,
    });
  },

  /**
   * Create the Calendar Management skill (Butler skill #3)
   *
   * @returns A configured calendar-manage Skill
   */
  createCalendarManagement(): Skill {
    return this.create({
      name: 'calendar-manage',
      trigger: '/schedule',
      promptTemplate: `Help the user manage their calendar:
- View upcoming events
- Find available time slots
- Schedule new meetings
- Apply user preferences (meeting length, buffer time, focus hours)

Request: {{request}}
User calendar preferences: {{calendar_prefs}}`,
      isActive: true,
    });
  },

  /**
   * Create the Email Composition skill (Butler skill #4)
   *
   * @returns A configured email-compose Skill
   */
  createEmailComposition(): Skill {
    return this.create({
      name: 'email-compose',
      trigger: '/email',
      promptTemplate: `Draft an email for the user:
- Match user's natural writing style
- Apply appropriate tone for recipient
- Include relevant context from PARA
- Spawn EmailEditor canvas for composition

Request: {{request}}
Recipient: {{recipient}}
User tone profile: {{tone_profile}}`,
      isActive: true,
    });
  },

  /**
   * Create the Weekly Review skill (Butler skill #5)
   *
   * @returns A configured weekly-review Skill
   */
  createWeeklyReview(): Skill {
    return this.create({
      name: 'weekly-review',
      trigger: '/review',
      promptTemplate: `Guide the user through GTD weekly review:
1. Clear Inbox - Process all captures
2. Review Next Actions - Update statuses
3. Review Projects - Check progress
4. Review Waiting For - Follow up
5. Review Someday/Maybe - Activate or archive
6. Plan Next Week - Set top priorities

Spawn WeeklyReview canvas for guided flow.

Current GTD state: {{gtd_state}}`,
      isActive: true,
    });
  },

  /**
   * Reset the counter (useful for test isolation)
   */
  resetCounter(): void {
    skillCounter = 0;
  },
};
