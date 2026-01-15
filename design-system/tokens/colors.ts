/**
 * Orion Design System - Color Tokens
 *
 * Extracted from UI mockups in /pages/
 * Editorial luxury aesthetic with black, cream, and gold accent
 */

export const colors = {
  // Core palette
  primary: {
    DEFAULT: '#D4AF37',
    hover: '#C9A431',
    muted: 'rgba(212, 175, 55, 0.12)',
    light: 'rgba(212, 175, 55, 0.05)',
  },

  background: {
    DEFAULT: '#F9F8F6',
    white: '#FFFFFF',
    muted: 'rgba(249, 248, 246, 0.95)',
  },

  foreground: {
    DEFAULT: '#1A1A1A',
    muted: 'rgba(26, 26, 26, 0.6)',
    subtle: 'rgba(26, 26, 26, 0.4)',
    faint: 'rgba(26, 26, 26, 0.2)',
  },

  border: {
    DEFAULT: '#1A1A1A',
    muted: 'rgba(26, 26, 26, 0.15)',
    subtle: 'rgba(26, 26, 26, 0.1)',
    faint: 'rgba(26, 26, 26, 0.05)',
  },

  // Semantic colors
  success: {
    DEFAULT: '#22C55E',
    muted: 'rgba(34, 197, 94, 0.1)',
  },

  warning: {
    DEFAULT: '#EAB308',
    muted: 'rgba(234, 179, 8, 0.1)',
  },

  error: {
    DEFAULT: '#EF4444',
    muted: 'rgba(239, 68, 68, 0.1)',
  },

  // Chat message backgrounds
  chat: {
    user: '#1A1A1A',
    userText: '#F9F8F6',
    agent: 'transparent',
    agentBorder: 'rgba(212, 175, 55, 0.3)',
  },
} as const

// CSS custom properties export
export const colorsCSSVars = `
:root {
  /* Core */
  --orion-primary: ${colors.primary.DEFAULT};
  --orion-primary-hover: ${colors.primary.hover};
  --orion-primary-muted: ${colors.primary.muted};
  --orion-primary-light: ${colors.primary.light};

  /* Background */
  --orion-bg: ${colors.background.DEFAULT};
  --orion-bg-white: ${colors.background.white};
  --orion-bg-muted: ${colors.background.muted};

  /* Foreground */
  --orion-fg: ${colors.foreground.DEFAULT};
  --orion-fg-muted: ${colors.foreground.muted};
  --orion-fg-subtle: ${colors.foreground.subtle};
  --orion-fg-faint: ${colors.foreground.faint};

  /* Border */
  --orion-border: ${colors.border.DEFAULT};
  --orion-border-muted: ${colors.border.muted};
  --orion-border-subtle: ${colors.border.subtle};
  --orion-border-faint: ${colors.border.faint};

  /* Semantic */
  --orion-success: ${colors.success.DEFAULT};
  --orion-warning: ${colors.warning.DEFAULT};
  --orion-error: ${colors.error.DEFAULT};

  /* Chat */
  --orion-chat-user: ${colors.chat.user};
  --orion-chat-user-text: ${colors.chat.userText};
  --orion-chat-agent-border: ${colors.chat.agentBorder};
}
`

export type OrionColors = typeof colors
