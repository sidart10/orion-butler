/**
 * Orion Design System - Spacing & Layout Tokens
 *
 * Generous whitespace for luxury feel
 * Sharp edges (zero border radius)
 */

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const

// Layout dimensions from mockups
export const layout = {
  // Header height
  header: {
    height: '80px',
    heightCompact: '70px',
  },

  // Sidebar widths
  sidebar: {
    width: '280px',
    widthCollapsed: '72px',
    widthWide: '320px',
  },

  // Right rail (agent indicator)
  rail: {
    width: '64px',
    widthHover: '80px',
  },

  // Canvas/Content max widths
  content: {
    maxWidth: '850px',
    maxWidthWide: '1200px',
    maxWidthFull: '100%',
  },

  // Chat panel
  chat: {
    width: '480px',
    minWidth: '320px',
    maxWidth: '600px',
  },

  // Input areas
  input: {
    maxWidth: '800px',
    padding: '32px',
  },

  // Grid background
  grid: {
    size: '40px',
    opacity: '0.03',
  },

  // Scrollbar
  scrollbar: {
    width: '4px',
    thumbColor: '#1A1A1A',
  },
} as const

// Border radius - ZERO for luxury aesthetic
export const borderRadius = {
  none: '0',
  // Only use these for special cases (badges, pills)
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const

// Border widths
export const borderWidth = {
  DEFAULT: '1px',
  0: '0px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

// CSS custom properties
export const spacingCSSVars = `
:root {
  /* Layout */
  --orion-header-height: ${layout.header.height};
  --orion-header-height-compact: ${layout.header.heightCompact};

  --orion-sidebar-width: ${layout.sidebar.width};
  --orion-sidebar-collapsed: ${layout.sidebar.widthCollapsed};

  --orion-rail-width: ${layout.rail.width};
  --orion-rail-width-hover: ${layout.rail.widthHover};

  --orion-content-max-width: ${layout.content.maxWidth};
  --orion-chat-width: ${layout.chat.width};

  /* Grid background */
  --orion-grid-size: ${layout.grid.size};
  --orion-grid-opacity: ${layout.grid.opacity};

  /* Scrollbar */
  --orion-scrollbar-width: ${layout.scrollbar.width};

  /* Border radius - default to 0 */
  --orion-radius: ${borderRadius.none};
}
`

export type OrionSpacing = typeof spacing
export type OrionLayout = typeof layout
