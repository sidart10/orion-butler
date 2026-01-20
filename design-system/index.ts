/**
 * Orion Design System
 *
 * A unified design token system extracted from the Orion UI mockups.
 * Editorial luxury aesthetic with black, cream, and gold accent.
 *
 * @version 1.0.0
 *
 * Usage:
 *
 * 1. Import tokens:
 *    import { colors, typography, spacing } from '@/design-system'
 *
 * 2. Import Tailwind preset:
 *    import { orionTailwindPreset } from '@/design-system/tailwind.config'
 *
 * 3. Import global CSS:
 *    import '@/design-system/styles/globals.css'
 */

// Export all tokens
export * from './tokens'

// Export Tailwind preset
export { orionTailwindPreset } from './tailwind.config'

// Version
export const VERSION = '1.0.0'

// Quick reference object for design system values
export const orion = {
  // Brand colors
  gold: '#D4AF37',
  cream: '#F9F8F6',
  black: '#1A1A1A',

  // Font families
  fonts: {
    serif: 'Playfair Display',
    sans: 'Inter',
  },

  // Key dimensions
  dimensions: {
    headerHeight: 80,
    sidebarWidth: 280,
    railWidth: 64,
    maxContentWidth: 850,
  },

  // Animation easing
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Google Fonts URL for <head>
  fontsUrl:
    'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap',
} as const
