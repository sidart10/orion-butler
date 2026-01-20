/**
 * Orion Design System - Tailwind CSS Configuration
 *
 * Merge this with your app's tailwind.config.ts:
 *
 * import { orionTailwindPreset } from '@/design-system/tailwind.config'
 *
 * export default {
 *   presets: [orionTailwindPreset],
 *   // your other config...
 * }
 */

import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export const orionTailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      // Colors
      colors: {
        orion: {
          primary: {
            DEFAULT: '#D4AF37',
            hover: '#C9A431',
            muted: 'rgba(212, 175, 55, 0.12)',
            light: 'rgba(212, 175, 55, 0.05)',
          },
          bg: {
            DEFAULT: '#F9F8F6',
            white: '#FFFFFF',
            muted: 'rgba(249, 248, 246, 0.95)',
          },
          fg: {
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
        },
      },

      // Font families
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },

      // Font sizes with line-height
      fontSize: {
        '2xs': ['9px', { lineHeight: '1.4' }],
        xs: ['10px', { lineHeight: '1.4' }],
      },

      // Letter spacing (editorial wide tracking)
      letterSpacing: {
        editorial: '0.25em',
        luxury: '0.3em',
        ultra: '0.4em',
      },

      // Spacing additions
      spacing: {
        18: '72px',
        22: '88px',
      },

      // Border radius (sharp by default)
      borderRadius: {
        none: '0',
      },

      // Box shadows
      boxShadow: {
        luxury: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        'focus-gold': '0 0 0 2px rgba(212, 175, 55, 0.2)',
      },

      // Width/height for layout
      width: {
        sidebar: '280px',
        'sidebar-collapsed': '72px',
        rail: '64px',
        chat: '480px',
      },

      height: {
        header: '80px',
        'header-compact': '70px',
      },

      maxWidth: {
        content: '850px',
        'content-wide': '1200px',
      },

      // Animations
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        elegant: 'cubic-bezier(0.19, 1, 0.22, 1)',
        'orion-ease': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      transitionDuration: {
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        canvas: '600ms',
        '1000': '1000ms',
        '1200': '1200ms',
        '2000': '2000ms',
      },

      // Keyframes
      keyframes: {
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'image-reveal': {
          from: { transform: 'scale(1.1)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'gold-slide': {
          from: { transform: 'translateX(-101%)' },
          to: { transform: 'translateX(0)' },
        },
      },

      animation: {
        reveal: 'slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'reveal-1': 'slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards',
        'reveal-2': 'slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards',
        'reveal-3': 'slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards',
        'image-reveal': 'image-reveal 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },

      // Background size for grid pattern
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    plugin(function ({ addUtilities, addComponents }) {
      // Utility classes
      addUtilities({
        // Serif font shorthand
        '.serif': {
          fontFamily: "'Playfair Display', Georgia, serif",
        },

        // Editorial tracking
        '.tracking-editorial': {
          letterSpacing: '0.25em',
        },
        '.tracking-luxury': {
          letterSpacing: '0.3em',
        },
        '.tracking-ultra': {
          letterSpacing: '0.4em',
        },

        // Grid background pattern
        '.grid-bg': {
          backgroundImage:
            'linear-gradient(#1A1A1A 0.5px, transparent 0.5px), linear-gradient(90deg, #1A1A1A 0.5px, transparent 0.5px)',
          backgroundSize: '40px 40px',
          opacity: '0.03',
        },

        // Dot pattern
        '.dots-bg': {
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(26, 26, 26, 0.05) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        },

        // Zero border radius (override all)
        '.sharp': {
          borderRadius: '0 !important',
        },

        // Grayscale filter
        '.grayscale-full': {
          filter: 'grayscale(100%)',
        },

        // Writing mode for vertical text
        '.writing-vertical': {
          writingMode: 'vertical-lr',
        },
      })

      // Component classes
      addComponents({
        // Gold slide button
        '.btn-gold-slide': {
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #1A1A1A',
          transition: 'color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: '1',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#D4AF37',
            transform: 'translateX(-101%)',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            zIndex: '-1',
          },
          '&:hover::after': {
            transform: 'translateX(0)',
          },
          '&:hover': {
            color: '#FFFFFF',
            borderColor: '#D4AF37',
          },
        },

        // Luxury card with top border
        '.luxury-card': {
          borderTop: '1px solid #1A1A1A',
          transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '& img': {
            filter: 'grayscale(100%)',
            transition: 'filter 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          },
          '&:hover img': {
            filter: 'grayscale(0%)',
            transform: 'scale(1.05)',
          },
          '&:hover': {
            borderColor: '#D4AF37',
          },
        },

        // Input editorial style
        '.input-editorial': {
          background: 'transparent',
          borderBottom: '1px solid rgba(26, 26, 26, 0.2)',
          padding: '1rem 0',
          width: '100%',
          outline: 'none',
          transition: 'border-color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:focus': {
            borderColor: '#D4AF37',
          },
          '&::placeholder': {
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            opacity: '0.4',
          },
        },

        // Chat message (user)
        '.chat-user': {
          backgroundColor: '#1A1A1A',
          color: '#F9F8F6',
          padding: '1rem',
        },

        // Chat message (agent)
        '.chat-agent': {
          paddingLeft: '1rem',
          borderLeft: '2px solid rgba(212, 175, 55, 0.3)',
        },

        // Custom scrollbar
        '.custom-scrollbar': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#1A1A1A #F9F8F6',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F9F8F6',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#1A1A1A',
          },
        },
      })
    }),
  ],
}

export default orionTailwindPreset
