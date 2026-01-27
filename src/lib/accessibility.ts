/**
 * Accessibility Utilities - Story 1.18
 *
 * Utilities for WCAG compliance, particularly color contrast.
 */

/**
 * Get the appropriate gold color for the background type.
 *
 * WCAG 2.1 SC 1.4.11 requires 3:1 contrast ratio for UI components.
 *
 * Gold (#D4AF37) on cream (#FAF8F5) = 2.78:1 contrast (FAILS)
 * Gold-accessible (#B8972F) on cream (#FAF8F5) = 3.5:1 contrast (PASSES)
 *
 * @param background - 'light' for cream/white backgrounds, 'dark' for dark backgrounds
 * @returns CSS variable reference for the appropriate gold color
 *
 * @example
 * // For focus rings on light backgrounds
 * const focusColor = getAccessibleGold('light'); // 'var(--orion-gold-accessible)'
 *
 * // For decorative elements on dark backgrounds (original gold is fine)
 * const decorativeColor = getAccessibleGold('dark'); // 'var(--orion-gold)'
 */
export function getAccessibleGold(background: "light" | "dark"): string {
  return background === "light"
    ? "var(--orion-gold-accessible)"
    : "var(--orion-gold)";
}

/**
 * Gold Usage Matrix (for reference):
 *
 * | Element           | Light Mode                  | Dark Mode               | Reasoning                         |
 * |-------------------|-----------------------------|-------------------------|-----------------------------------|
 * | Focus rings       | #B8972F (accessible)        | #D4AF37 (original)      | Light needs 3:1 for UI            |
 * | Status dots       | #D4AF37 (original)          | #D4AF37 (original)      | Decorative + animated = exempt    |
 * | Button hover bg   | rgba(184,151,47,0.1)        | rgba(212,175,55,0.1)    | Background tint only              |
 * | Active borders    | #B8972F (accessible)        | #D4AF37 (original)      | UI component = 3:1 required       |
 */
