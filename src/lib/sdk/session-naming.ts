/**
 * Session Naming Module
 * Epic 3: Conversation Persistence
 *
 * Provides utilities for generating session IDs and display names
 * for different session types (daily, project, inbox, adhoc).
 */

import type { SessionType } from './types';

// =============================================================================
// Constants
// =============================================================================

/** Prefix for all Orion session IDs */
export const SESSION_ID_PREFIX = 'orion';

/** Session type ID prefixes */
export const SESSION_TYPE_PREFIXES = {
  daily: `${SESSION_ID_PREFIX}-daily`,
  project: `${SESSION_ID_PREFIX}-project`,
  inbox: `${SESSION_ID_PREFIX}-inbox`,
  adhoc: `${SESSION_ID_PREFIX}-adhoc`,
} as const;

/** Default locale for date formatting */
export const DEFAULT_LOCALE = 'en-US';

/** Default project name when none provided */
export const DEFAULT_PROJECT_NAME = 'Untitled';

// =============================================================================
// ID Generation
// =============================================================================

/**
 * Generates a unique session ID based on session type.
 *
 * @param type - The session type
 * @param context - Optional context (required for 'project' type)
 * @returns A formatted session ID string
 * @throws Error if 'project' type is missing valid context
 */
export function generateSessionId(type: SessionType, context?: string): string {
  const date = formatDateForId(new Date());

  switch (type) {
    case 'daily':
      return `${SESSION_TYPE_PREFIXES.daily}-${date}`;
    case 'project':
      if (!context || context.trim() === '') {
        throw new Error('Project sessions require project slug');
      }
      return `${SESSION_TYPE_PREFIXES.project}-${slugify(context)}`;
    case 'inbox':
      return `${SESSION_TYPE_PREFIXES.inbox}-${date}`;
    case 'adhoc':
      return `${SESSION_TYPE_PREFIXES.adhoc}-${crypto.randomUUID()}`;
  }
}

/**
 * Formats a date as YYYY-MM-DD for use in session IDs.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts text to a URL-safe slug.
 *
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with dashes
 * - Collapses multiple consecutive dashes
 * - Removes leading/trailing dashes
 *
 * @param text - The text to slugify
 * @returns A URL-safe slug string
 * @throws Error if text is empty or produces an empty slug (M1 validation)
 */
export function slugify(text: string): string {
  if (!text || text.trim() === '') {
    throw new Error('Cannot slugify empty text');
  }

  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

  if (slug === '') {
    throw new Error(`Cannot slugify text: "${text}" produces empty slug`);
  }

  return slug;
}

// =============================================================================
// Display Name Generation
// =============================================================================

export interface DisplayNameOptions {
  projectName?: string;
  customName?: string;
  date?: Date;
  locale?: string;
}

/**
 * Generates a human-readable display name for a session.
 *
 * @param type - The session type
 * @param options - Optional configuration for display name generation
 * @returns A formatted display name string
 */
export function generateDisplayName(
  type: SessionType,
  options?: DisplayNameOptions
): string {
  const date = options?.date ?? new Date();
  const locale = options?.locale ?? DEFAULT_LOCALE;

  switch (type) {
    case 'daily':
      return `Daily - ${formatDateForDisplay(date, locale)}`;
    case 'project': {
      const projectName = options?.projectName?.trim() || DEFAULT_PROJECT_NAME;
      return `Project: ${projectName}`;
    }
    case 'inbox':
      return 'Inbox Processing';
    case 'adhoc': {
      if (options?.customName) {
        return options.customName;
      }
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `Session at ${hours}:${minutes}`;
    }
  }
}

/**
 * Formats a date for display using locale-specific formatting.
 *
 * @param date - The date to format
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns A locale-formatted date string
 */
export function formatDateForDisplay(date: Date, locale: string = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Checks if two dates are on the same calendar day (local time).
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if both dates are on the same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Checks if a date is today (local time).
 *
 * @param date - The date to check
 * @returns true if the date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Returns a new Date set to the start of the day (00:00:00.000).
 * Does not mutate the original date.
 *
 * @param date - The date to get the start of
 * @returns A new Date instance set to midnight
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Returns tomorrow's date at midnight (start of day).
 *
 * @returns A Date instance for tomorrow at 00:00:00.000
 */
export function tomorrow(): Date {
  const today = new Date();
  const result = new Date(today);
  result.setDate(result.getDate() + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}
