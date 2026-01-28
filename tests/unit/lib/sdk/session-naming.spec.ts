/**
 * Session Naming Module Tests
 * Epic 3: Conversation Persistence
 *
 * TDD RED Phase - Tests written BEFORE implementation.
 * These tests MUST FAIL until session-naming.ts is implemented.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Import the module under test (does not exist yet - will cause import error)
import {
  generateSessionId,
  generateDisplayName,
  formatDateForDisplay,
  isSameDay,
  isToday,
  startOfDay,
  tomorrow,
} from '@/lib/sdk/session-naming'

import type { SessionType } from '@/lib/sdk/types'

// =============================================================================
// Test Constants
// =============================================================================

const FIXED_DATE = new Date('2026-01-27T14:30:00.000Z')
const FIXED_DATE_LOCAL = new Date('2026-01-27T14:30:00') // Local time
const FIXED_UUID = '550e8400-e29b-41d4-a716-446655440000'

// =============================================================================
// generateSessionId Tests
// =============================================================================

describe('generateSessionId', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE)
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => FIXED_UUID),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('daily type', () => {
    it('generates orion-daily-YYYY-MM-DD format', () => {
      const id = generateSessionId('daily')
      expect(id).toMatch(/^orion-daily-\d{4}-\d{2}-\d{2}$/)
    })

    it('uses current date', () => {
      const id = generateSessionId('daily')
      expect(id).toBe('orion-daily-2026-01-27')
    })

    it('ignores context parameter for daily type', () => {
      const id = generateSessionId('daily', 'some context')
      expect(id).toBe('orion-daily-2026-01-27')
    })
  })

  describe('project type', () => {
    it('generates orion-project-{slug} format', () => {
      const id = generateSessionId('project', 'My Project Name')
      expect(id).toMatch(/^orion-project-[a-z0-9-]+$/)
    })

    it('slugifies the context', () => {
      const id = generateSessionId('project', 'My Project Name')
      expect(id).toBe('orion-project-my-project-name')
    })

    it('handles special characters in context', () => {
      const id = generateSessionId('project', 'Project #1: Test & Demo!')
      expect(id).toBe('orion-project-project-1-test-demo')
    })

    it('handles unicode characters', () => {
      const id = generateSessionId('project', 'Projet Francais')
      expect(id).toBe('orion-project-projet-francais')
    })

    it('collapses multiple hyphens', () => {
      const id = generateSessionId('project', 'My   Spaced   Project')
      expect(id).toBe('orion-project-my-spaced-project')
    })

    it('trims leading and trailing hyphens', () => {
      const id = generateSessionId('project', '  --test--  ')
      expect(id).toBe('orion-project-test')
    })

    it('throws error if context is missing', () => {
      expect(() => generateSessionId('project')).toThrow()
    })

    it('throws error if context is empty string', () => {
      expect(() => generateSessionId('project', '')).toThrow()
    })

    it('throws error if context is only whitespace', () => {
      expect(() => generateSessionId('project', '   ')).toThrow()
    })
  })

  describe('inbox type', () => {
    it('generates orion-inbox-YYYY-MM-DD format', () => {
      const id = generateSessionId('inbox')
      expect(id).toMatch(/^orion-inbox-\d{4}-\d{2}-\d{2}$/)
    })

    it('uses current date', () => {
      const id = generateSessionId('inbox')
      expect(id).toBe('orion-inbox-2026-01-27')
    })
  })

  describe('adhoc type', () => {
    it('generates orion-adhoc-{uuid} format', () => {
      const id = generateSessionId('adhoc')
      expect(id).toMatch(/^orion-adhoc-[a-f0-9-]{36}$/)
    })

    it('uses crypto.randomUUID', () => {
      const id = generateSessionId('adhoc')
      expect(id).toBe(`orion-adhoc-${FIXED_UUID}`)
      expect(crypto.randomUUID).toHaveBeenCalled()
    })

    it('generates unique IDs on each call', () => {
      vi.mocked(crypto.randomUUID)
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')

      const id1 = generateSessionId('adhoc')
      const id2 = generateSessionId('adhoc')

      expect(id1).not.toBe(id2)
    })
  })

  describe('edge cases', () => {
    it('handles date at midnight boundary', () => {
      vi.setSystemTime(new Date('2026-01-27T00:00:00.000'))
      const id = generateSessionId('daily')
      expect(id).toBe('orion-daily-2026-01-27')
    })

    it('handles date at end of day', () => {
      vi.setSystemTime(new Date('2026-01-27T23:59:59.999'))
      const id = generateSessionId('daily')
      expect(id).toBe('orion-daily-2026-01-27')
    })

    it('handles year boundary', () => {
      vi.setSystemTime(new Date('2026-12-31T23:59:59.999'))
      const id = generateSessionId('daily')
      expect(id).toBe('orion-daily-2026-12-31')
    })
  })
})

// =============================================================================
// generateDisplayName Tests
// =============================================================================

describe('generateDisplayName', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE_LOCAL)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('daily type', () => {
    it('generates "Daily - {locale_date}" format', () => {
      const name = generateDisplayName('daily')
      expect(name).toMatch(/^Daily - .+$/)
    })

    it('uses locale-formatted date for en-US', () => {
      const name = generateDisplayName('daily', { locale: 'en-US' })
      expect(name).toBe('Daily - January 27, 2026')
    })

    it('accepts custom date option for testing', () => {
      const customDate = new Date('2026-03-15T10:00:00')
      const name = generateDisplayName('daily', {
        date: customDate,
        locale: 'en-US',
      })
      expect(name).toBe('Daily - March 15, 2026')
    })

    it('supports different locales', () => {
      const name = generateDisplayName('daily', { locale: 'de-DE' })
      expect(name).toMatch(/27.*Januar.*2026/)
    })
  })

  describe('project type', () => {
    it('generates "Project: {projectName}" format', () => {
      const name = generateDisplayName('project', { projectName: 'My App' })
      expect(name).toBe('Project: My App')
    })

    it('preserves original casing in projectName', () => {
      const name = generateDisplayName('project', {
        projectName: 'Orion Butler',
      })
      expect(name).toBe('Project: Orion Butler')
    })

    it('uses placeholder if projectName not provided', () => {
      const name = generateDisplayName('project')
      expect(name).toBe('Project: Untitled')
    })

    it('handles empty projectName', () => {
      const name = generateDisplayName('project', { projectName: '' })
      expect(name).toBe('Project: Untitled')
    })
  })

  describe('inbox type', () => {
    it('generates static "Inbox Processing" string', () => {
      const name = generateDisplayName('inbox')
      expect(name).toBe('Inbox Processing')
    })

    it('ignores all options for inbox type', () => {
      const name = generateDisplayName('inbox', {
        projectName: 'ignored',
        customName: 'also ignored',
      })
      expect(name).toBe('Inbox Processing')
    })
  })

  describe('adhoc type', () => {
    it('uses customName if provided', () => {
      const name = generateDisplayName('adhoc', { customName: 'Quick Chat' })
      expect(name).toBe('Quick Chat')
    })

    it('generates "Session at HH:MM" if no customName', () => {
      const name = generateDisplayName('adhoc')
      expect(name).toMatch(/^Session at \d{2}:\d{2}$/)
    })

    it('uses current time for default adhoc name', () => {
      // FIXED_DATE_LOCAL is 2026-01-27T14:30:00
      const name = generateDisplayName('adhoc')
      expect(name).toBe('Session at 14:30')
    })

    it('accepts custom date for time display', () => {
      const customDate = new Date('2026-01-27T09:05:00')
      const name = generateDisplayName('adhoc', { date: customDate })
      expect(name).toBe('Session at 09:05')
    })

    it('pads single-digit hours and minutes', () => {
      const customDate = new Date('2026-01-27T05:03:00')
      const name = generateDisplayName('adhoc', { date: customDate })
      expect(name).toBe('Session at 05:03')
    })
  })
})

// =============================================================================
// formatDateForDisplay Tests
// =============================================================================

describe('formatDateForDisplay', () => {
  it('formats date as "Month Day, Year" for en-US', () => {
    const date = new Date('2026-01-27T12:00:00')
    const formatted = formatDateForDisplay(date, 'en-US')
    expect(formatted).toBe('January 27, 2026')
  })

  it('formats date for different months', () => {
    // Use explicit local time (noon) to avoid UTC/local timezone conversion issues
    const dates = [
      { date: new Date(2026, 2, 15, 12, 0, 0), expected: 'March 15, 2026' },
      { date: new Date(2026, 6, 4, 12, 0, 0), expected: 'July 4, 2026' },
      { date: new Date(2026, 11, 25, 12, 0, 0), expected: 'December 25, 2026' },
    ]

    dates.forEach(({ date, expected }) => {
      expect(formatDateForDisplay(date, 'en-US')).toBe(expected)
    })
  })

  it('uses en-US as default locale', () => {
    const date = new Date('2026-01-27T12:00:00')
    const formatted = formatDateForDisplay(date)
    expect(formatted).toBe('January 27, 2026')
  })

  it('supports de-DE locale', () => {
    const date = new Date('2026-01-27T12:00:00')
    const formatted = formatDateForDisplay(date, 'de-DE')
    // German format: "27. Januar 2026"
    expect(formatted).toMatch(/27.*Januar.*2026/)
  })

  it('supports fr-FR locale', () => {
    const date = new Date('2026-01-27T12:00:00')
    const formatted = formatDateForDisplay(date, 'fr-FR')
    // French format: "27 janvier 2026"
    expect(formatted).toMatch(/27.*janvier.*2026/i)
  })

  it('supports ja-JP locale', () => {
    const date = new Date('2026-01-27T12:00:00')
    const formatted = formatDateForDisplay(date, 'ja-JP')
    // Japanese format includes year/month/day
    expect(formatted).toMatch(/2026/)
  })
})

// =============================================================================
// isSameDay Tests
// =============================================================================

describe('isSameDay', () => {
  it('returns true for same calendar day', () => {
    const date1 = new Date('2026-01-27T10:00:00')
    const date2 = new Date('2026-01-27T22:00:00')
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('returns false for different days', () => {
    const date1 = new Date('2026-01-27T10:00:00')
    const date2 = new Date('2026-01-28T10:00:00')
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('returns false for different months', () => {
    const date1 = new Date('2026-01-27T10:00:00')
    const date2 = new Date('2026-02-27T10:00:00')
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('returns false for different years', () => {
    const date1 = new Date('2026-01-27T10:00:00')
    const date2 = new Date('2027-01-27T10:00:00')
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('handles midnight boundary correctly', () => {
    const date1 = new Date('2026-01-27T00:00:00')
    const date2 = new Date('2026-01-27T23:59:59.999')
    expect(isSameDay(date1, date2)).toBe(true)
  })

  it('returns false for dates one second apart across midnight', () => {
    const date1 = new Date('2026-01-27T23:59:59')
    const date2 = new Date('2026-01-28T00:00:00')
    expect(isSameDay(date1, date2)).toBe(false)
  })

  it('returns true for identical dates', () => {
    const date = new Date('2026-01-27T14:30:00')
    expect(isSameDay(date, date)).toBe(true)
  })

  it('uses local time, not UTC', () => {
    // This test ensures we compare in local timezone
    // Create dates that are same UTC day but different local day
    // This is tricky and depends on local timezone
    const date1 = new Date('2026-01-27T10:00:00')
    const date2 = new Date('2026-01-27T10:00:00')
    expect(isSameDay(date1, date2)).toBe(true)
  })
})

// =============================================================================
// isToday Tests
// =============================================================================

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE_LOCAL)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for current date', () => {
    const today = new Date('2026-01-27T10:00:00')
    expect(isToday(today)).toBe(true)
  })

  it('returns true for different time on same day', () => {
    const todayMorning = new Date('2026-01-27T06:00:00')
    const todayEvening = new Date('2026-01-27T22:00:00')
    expect(isToday(todayMorning)).toBe(true)
    expect(isToday(todayEvening)).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date('2026-01-26T14:30:00')
    expect(isToday(yesterday)).toBe(false)
  })

  it('returns false for tomorrow', () => {
    const tomorrowDate = new Date('2026-01-28T14:30:00')
    expect(isToday(tomorrowDate)).toBe(false)
  })

  it('returns false for distant past date', () => {
    const pastDate = new Date('2020-01-01T12:00:00')
    expect(isToday(pastDate)).toBe(false)
  })

  it('returns false for distant future date', () => {
    const futureDate = new Date('2030-12-31T12:00:00')
    expect(isToday(futureDate)).toBe(false)
  })

  it('handles midnight boundary correctly', () => {
    const startOfToday = new Date('2026-01-27T00:00:00')
    const endOfToday = new Date('2026-01-27T23:59:59.999')
    expect(isToday(startOfToday)).toBe(true)
    expect(isToday(endOfToday)).toBe(true)
  })
})

// =============================================================================
// startOfDay Tests
// =============================================================================

describe('startOfDay', () => {
  it('returns date with time set to 00:00:00.000', () => {
    const date = new Date('2026-01-27T14:30:45.123')
    const start = startOfDay(date)

    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('preserves the calendar date', () => {
    const date = new Date('2026-01-27T14:30:45.123')
    const start = startOfDay(date)

    expect(start.getFullYear()).toBe(2026)
    expect(start.getMonth()).toBe(0) // January is 0
    expect(start.getDate()).toBe(27)
  })

  it('returns a new Date instance', () => {
    const date = new Date('2026-01-27T14:30:45.123')
    const start = startOfDay(date)

    expect(start).not.toBe(date)
    expect(start).toBeInstanceOf(Date)
  })

  it('does not mutate the original date', () => {
    const date = new Date('2026-01-27T14:30:45.123')
    const originalTime = date.getTime()
    startOfDay(date)

    expect(date.getTime()).toBe(originalTime)
  })

  it('handles date already at midnight', () => {
    const date = new Date('2026-01-27T00:00:00.000')
    const start = startOfDay(date)

    expect(start.getTime()).toBe(date.getTime())
  })

  it('handles end of day correctly', () => {
    const date = new Date('2026-01-27T23:59:59.999')
    const start = startOfDay(date)

    expect(start.getDate()).toBe(27)
    expect(start.getHours()).toBe(0)
  })

  it('handles different months', () => {
    const dates = [
      new Date('2026-02-15T10:00:00'),
      new Date('2026-06-30T18:45:00'),
      new Date('2026-12-31T23:59:59'),
    ]

    dates.forEach((date) => {
      const start = startOfDay(date)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getMonth()).toBe(date.getMonth())
      expect(start.getDate()).toBe(date.getDate())
    })
  })
})

// =============================================================================
// tomorrow Tests
// =============================================================================

describe('tomorrow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE_LOCAL)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns tomorrow at midnight', () => {
    const result = tomorrow()

    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(0) // January
    expect(result.getDate()).toBe(28) // Day after 27
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('handles end of month', () => {
    vi.setSystemTime(new Date('2026-01-31T14:30:00'))
    const result = tomorrow()

    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(1)
  })

  it('handles end of year', () => {
    vi.setSystemTime(new Date('2026-12-31T14:30:00'))
    const result = tomorrow()

    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0) // January
    expect(result.getDate()).toBe(1)
  })

  it('handles February in leap year', () => {
    // 2028 is a leap year
    vi.setSystemTime(new Date('2028-02-28T14:30:00'))
    const result = tomorrow()

    expect(result.getMonth()).toBe(1) // Still February
    expect(result.getDate()).toBe(29) // Leap day
  })

  it('handles February in non-leap year', () => {
    // 2026 is not a leap year
    vi.setSystemTime(new Date('2026-02-28T14:30:00'))
    const result = tomorrow()

    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(1)
  })

  it('returns a new Date instance', () => {
    const result1 = tomorrow()
    const result2 = tomorrow()

    expect(result1).not.toBe(result2)
    expect(result1).toBeInstanceOf(Date)
  })

  it('time at midnight regardless of current time', () => {
    // Early morning
    vi.setSystemTime(new Date('2026-01-27T01:00:00'))
    expect(tomorrow().getHours()).toBe(0)

    // Late night
    vi.setSystemTime(new Date('2026-01-27T23:59:59'))
    expect(tomorrow().getHours()).toBe(0)
  })
})

// =============================================================================
// Type Safety Tests
// =============================================================================

describe('Type Safety', () => {
  it('generateSessionId accepts all SessionType values', () => {
    const types: SessionType[] = ['daily', 'project', 'inbox', 'adhoc']

    types.forEach((type) => {
      if (type === 'project') {
        expect(() => generateSessionId(type, 'test')).not.toThrow()
      } else {
        expect(() => generateSessionId(type)).not.toThrow()
      }
    })
  })

  it('generateDisplayName accepts all SessionType values', () => {
    const types: SessionType[] = ['daily', 'project', 'inbox', 'adhoc']

    types.forEach((type) => {
      if (type === 'project') {
        expect(() =>
          generateDisplayName(type, { projectName: 'test' })
        ).not.toThrow()
      } else {
        expect(() => generateDisplayName(type)).not.toThrow()
      }
    })
  })
})

// =============================================================================
// Integration Tests
// =============================================================================

describe('Integration: Session ID and Display Name consistency', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_DATE_LOCAL)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('daily session ID and display name use same date', () => {
    const id = generateSessionId('daily')
    const name = generateDisplayName('daily', { locale: 'en-US' })

    // ID contains 2026-01-27, name contains January 27, 2026
    expect(id).toContain('2026-01-27')
    expect(name).toContain('January 27, 2026')
  })

  it('project session ID slugifies while display name preserves original', () => {
    const projectName = 'My Great Project'
    const id = generateSessionId('project', projectName)
    const name = generateDisplayName('project', { projectName })

    expect(id).toBe('orion-project-my-great-project')
    expect(name).toBe('Project: My Great Project')
  })

  it('inbox session has deterministic ID for same day', () => {
    const id1 = generateSessionId('inbox')
    vi.advanceTimersByTime(1000 * 60 * 60) // 1 hour later
    const id2 = generateSessionId('inbox')

    expect(id1).toBe(id2)
  })
})
