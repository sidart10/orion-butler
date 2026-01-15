/**
 * Orion Design System - Token Index
 *
 * Export all design tokens from a single entry point
 */

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './animations'
export * from './effects'

// Re-export specific commonly used items
export { colors, colorsCSSVars } from './colors'
export {
  fontFamily,
  fontSize,
  letterSpacing,
  fontWeight,
  typographyPresets,
  typographyCSSVars,
  googleFontsUrl,
} from './typography'
export { spacing, layout, borderRadius, borderWidth, spacingCSSVars } from './spacing'
export {
  easing,
  duration,
  delay,
  keyframes,
  animations,
  transitions,
  animationsCSSVars,
  keyframesCSS,
} from './animations'
export { shadows, filters, patterns, backdrop, selection, scrollbar, effectsCSSVars } from './effects'

// Combined CSS output
import { colorsCSSVars } from './colors'
import { typographyCSSVars } from './typography'
import { spacingCSSVars } from './spacing'
import { animationsCSSVars, keyframesCSS } from './animations'
import { effectsCSSVars, scrollbar } from './effects'

export const allCSSVars = `
${colorsCSSVars}
${typographyCSSVars}
${spacingCSSVars}
${animationsCSSVars}
${effectsCSSVars}
${keyframesCSS}
${scrollbar}
`

// Design system version
export const ORION_DESIGN_SYSTEM_VERSION = '1.0.0'
