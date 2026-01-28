/**
 * Clipboard Utility
 * Provides a mockable wrapper around the browser clipboard API
 */

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
