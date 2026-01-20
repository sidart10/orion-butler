/**
 * Orion Design System - Typography Tokens
 *
 * Dual-font system: Playfair Display (serif) + Inter (sans)
 * Editorial luxury aesthetic with extreme letter-spacing for labels
 */

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  serif: ['Playfair Display', 'Georgia', 'serif'],
} as const

export const fontSize = {
  // Micro labels
  '2xs': ['9px', { lineHeight: '1.4', letterSpacing: '0.3em' }],
  xs: ['10px', { lineHeight: '1.4', letterSpacing: '0.25em' }],
  '2xs-normal': ['9px', { lineHeight: '1.4', letterSpacing: '0.1em' }],
  'xs-normal': ['10px', { lineHeight: '1.4', letterSpacing: '0.1em' }],

  // Body text
  sm: ['11px', { lineHeight: '1.5' }],
  base: ['14px', { lineHeight: '1.6' }],
  lg: ['18px', { lineHeight: '1.6' }],
  xl: ['20px', { lineHeight: '1.5' }],

  // Headlines (for serif)
  '2xl': ['24px', { lineHeight: '1.3' }],
  '3xl': ['30px', { lineHeight: '1.2' }],
  '4xl': ['36px', { lineHeight: '1.15' }],
  '5xl': ['48px', { lineHeight: '1.1' }],
  '6xl': ['60px', { lineHeight: '1.05' }],
  '7xl': ['72px', { lineHeight: '0.95' }],
  '8xl': ['96px', { lineHeight: '0.9' }],
} as const

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
  // Editorial luxury spacing
  editorial: '0.25em',
  luxury: '0.3em',
  ultra: '0.4em',
} as const

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const

// Typography presets for common patterns
export const typographyPresets = {
  // Hero headline - serif, massive
  heroHeadline: {
    fontFamily: fontFamily.serif.join(', '),
    fontSize: '96px',
    fontWeight: '500',
    lineHeight: '0.9',
    letterSpacing: '-0.02em',
  },

  // Section title - serif, large
  sectionTitle: {
    fontFamily: fontFamily.serif.join(', '),
    fontSize: '36px',
    fontWeight: '500',
    lineHeight: '1.15',
    fontStyle: 'italic',
  },

  // Card title - serif, medium
  cardTitle: {
    fontFamily: fontFamily.serif.join(', '),
    fontSize: '24px',
    fontWeight: '400',
    lineHeight: '1.3',
  },

  // Uppercase label - sans, micro, wide tracking
  label: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: '10px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
  },

  // Meta text - sans, faded
  meta: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: '9px',
    fontWeight: '500',
    lineHeight: '1.4',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    opacity: '0.4',
  },

  // Body - sans, readable
  body: {
    fontFamily: fontFamily.sans.join(', '),
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.6',
  },

  // Body serif - for quotes, emphasis
  bodySerif: {
    fontFamily: fontFamily.serif.join(', '),
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '1.6',
    fontStyle: 'italic',
  },

  // Input placeholder - serif italic
  placeholder: {
    fontFamily: fontFamily.serif.join(', '),
    fontSize: '18px',
    fontWeight: '400',
    fontStyle: 'italic',
    opacity: '0.4',
  },
} as const

// CSS custom properties
export const typographyCSSVars = `
:root {
  /* Font Families */
  --orion-font-sans: ${fontFamily.sans.join(', ')};
  --orion-font-serif: ${fontFamily.serif.join(', ')};

  /* Letter Spacing */
  --orion-tracking-editorial: ${letterSpacing.editorial};
  --orion-tracking-luxury: ${letterSpacing.luxury};
  --orion-tracking-ultra: ${letterSpacing.ultra};
}
`

// Google Fonts import URL
export const googleFontsUrl =
  'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap'

export type OrionTypography = {
  fontFamily: typeof fontFamily
  fontSize: typeof fontSize
  letterSpacing: typeof letterSpacing
  fontWeight: typeof fontWeight
  presets: typeof typographyPresets
}
