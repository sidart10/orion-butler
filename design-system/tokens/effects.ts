/**
 * Orion Design System - Effects Tokens
 *
 * Shadows, filters, backdrops, and visual effects
 * Minimal shadows - luxury comes from space and typography, not elevation
 */

// Box shadows - very subtle
export const shadows = {
  none: 'none',

  // Minimal elevation
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

  // Luxury shadow - very soft, large spread
  luxury: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',

  // Card hover
  card: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',

  // Focused input
  focus: '0 0 0 2px rgba(212, 175, 55, 0.2)',
} as const

// Image filters for grayscale effect
export const filters = {
  none: 'none',

  // Grayscale states
  grayscale: 'grayscale(100%)',
  grayscaleHalf: 'grayscale(50%)',

  // Gilded mesh effect (from mockups)
  gildedMesh: 'contrast(1.1) brightness(0.9)',

  // Backdrop blur for header
  blur: 'blur(8px)',
  blurSm: 'blur(4px)',
  blurLg: 'blur(12px)',
} as const

// Background patterns
export const patterns = {
  // Grid background (40px squares at 3% opacity)
  grid: `
    background-image: linear-gradient(#1A1A1A 0.5px, transparent 0.5px),
                      linear-gradient(90deg, #1A1A1A 0.5px, transparent 0.5px);
    background-size: 40px 40px;
    opacity: 0.03;
  `,

  // Dot pattern (subtle)
  dots: `
    background-image: radial-gradient(circle at 2px 2px, rgba(26, 26, 26, 0.05) 1px, transparent 0);
    background-size: 24px 24px;
  `,

  // Gradient overlay for images
  imageOverlay: 'linear-gradient(to top, rgba(26, 26, 26, 0.8) 0%, transparent 100%)',

  // Primary gradient hint
  goldGradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, transparent 100%)',
} as const

// Backdrop effects
export const backdrop = {
  blur: 'backdrop-filter: blur(8px)',
  blurSm: 'backdrop-filter: blur(4px)',
  saturate: 'backdrop-filter: saturate(180%)',
  combined: 'backdrop-filter: blur(8px) saturate(180%)',
} as const

// Selection colors
export const selection = {
  background: '#D4AF37',
  text: '#FFFFFF',
}

// Scrollbar styling
export const scrollbar = `
  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #F9F8F6;
  }

  ::-webkit-scrollbar-thumb {
    background: #1A1A1A;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #D4AF37;
  }
`

// CSS custom properties
export const effectsCSSVars = `
:root {
  /* Shadows */
  --orion-shadow-sm: ${shadows.sm};
  --orion-shadow: ${shadows.DEFAULT};
  --orion-shadow-md: ${shadows.md};
  --orion-shadow-luxury: ${shadows.luxury};
  --orion-shadow-card: ${shadows.card};
  --orion-shadow-focus: ${shadows.focus};

  /* Filters */
  --orion-filter-grayscale: ${filters.grayscale};
  --orion-filter-blur: ${filters.blur};

  /* Selection */
  --orion-selection-bg: ${selection.background};
  --orion-selection-text: ${selection.text};
}

/* Global selection */
::selection {
  background-color: var(--orion-selection-bg);
  color: var(--orion-selection-text);
}
`

export type OrionEffects = {
  shadows: typeof shadows
  filters: typeof filters
  patterns: typeof patterns
  backdrop: typeof backdrop
  selection: typeof selection
}
