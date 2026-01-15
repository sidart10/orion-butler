/**
 * Orion Design System - Animation Tokens
 *
 * Luxury easing with smooth, refined motion
 * Never bouncy - always controlled and elegant
 */

// Easing curves
export const easing = {
  // Default luxury easing - smooth deceleration
  DEFAULT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom luxury variants
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  elegant: 'cubic-bezier(0.19, 1, 0.22, 1)',
  subtle: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const

// Duration presets
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  medium: '500ms',
  slow: '700ms',
  slower: '1000ms',
  slowest: '1200ms',

  // Specific durations from mockups
  panelTransition: '600ms',
  buttonSlide: '500ms',
  imageReveal: '2000ms',
  hoverState: '500ms',
} as const

// Delays for staggered animations
export const delay = {
  0: '0ms',
  1: '200ms',
  2: '400ms',
  3: '600ms',
  4: '800ms',
  5: '1000ms',
} as const

// Animation keyframes
export const keyframes = {
  slideInUp: {
    from: {
      opacity: '0',
      transform: 'translateY(20px)',
    },
    to: {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },

  slideInDown: {
    from: {
      opacity: '0',
      transform: 'translateY(-20px)',
    },
    to: {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },

  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },

  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },

  imageReveal: {
    from: {
      transform: 'scale(1.1)',
      opacity: '0',
    },
    to: {
      transform: 'scale(1)',
      opacity: '1',
    },
  },

  goldSlide: {
    from: {
      transform: 'translateX(-101%)',
    },
    to: {
      transform: 'translateX(0)',
    },
  },

  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },

  shimmer: {
    '0%': {
      backgroundPosition: '-200% 0',
    },
    '100%': {
      backgroundPosition: '200% 0',
    },
  },
} as const

// Animation presets (combines keyframes + timing)
export const animations = {
  // Reveal animation for content
  reveal: `slideInUp ${duration.slowest} ${easing.luxury} forwards`,

  // Reveal with delays
  'reveal-1': `slideInUp ${duration.slowest} ${easing.luxury} ${delay[1]} forwards`,
  'reveal-2': `slideInUp ${duration.slowest} ${easing.luxury} ${delay[2]} forwards`,
  'reveal-3': `slideInUp ${duration.slowest} ${easing.luxury} ${delay[3]} forwards`,

  // Image reveal (for grayscale images)
  imageReveal: `imageReveal ${duration.imageReveal} ${easing.luxury} forwards`,

  // Fade
  fadeIn: `fadeIn ${duration.medium} ${easing.luxury} forwards`,
  fadeOut: `fadeOut ${duration.medium} ${easing.luxury} forwards`,

  // Pulse for indicators
  pulse: `pulse 2s ${easing.subtle} infinite`,

  // Shimmer for loading states
  shimmer: `shimmer 2s ${easing.linear} infinite`,
} as const

// Transition presets
export const transitions = {
  // Default transition
  DEFAULT: `all ${duration.medium} ${easing.luxury}`,

  // Specific transitions
  colors: `color ${duration.hoverState} ${easing.luxury}, background-color ${duration.hoverState} ${easing.luxury}, border-color ${duration.hoverState} ${easing.luxury}`,
  opacity: `opacity ${duration.hoverState} ${easing.luxury}`,
  transform: `transform ${duration.medium} ${easing.luxury}`,
  panel: `all ${duration.panelTransition} ${easing.luxury}`,
  button: `all ${duration.buttonSlide} ${easing.luxury}`,

  // None (for disabling)
  none: 'none',
} as const

// CSS custom properties
export const animationsCSSVars = `
:root {
  /* Easing */
  --orion-easing: ${easing.luxury};
  --orion-easing-smooth: ${easing.smooth};
  --orion-easing-elegant: ${easing.elegant};

  /* Durations */
  --orion-duration-fast: ${duration.fast};
  --orion-duration-normal: ${duration.normal};
  --orion-duration-medium: ${duration.medium};
  --orion-duration-slow: ${duration.slow};
  --orion-duration-slowest: ${duration.slowest};

  /* Delays */
  --orion-delay-1: ${delay[1]};
  --orion-delay-2: ${delay[2]};
  --orion-delay-3: ${delay[3]};
}
`

// CSS keyframes output
export const keyframesCSS = `
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes imageReveal {
  from {
    transform: scale(1.1);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes goldSlide {
  from {
    transform: translateX(-101%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`

export type OrionAnimations = {
  easing: typeof easing
  duration: typeof duration
  delay: typeof delay
  keyframes: typeof keyframes
  animations: typeof animations
  transitions: typeof transitions
}
