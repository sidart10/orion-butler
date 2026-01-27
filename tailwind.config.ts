import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./design-system/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colors
      colors: {
        orion: {
          gold: "var(--orion-gold)",
          "gold-muted": "var(--orion-gold-muted)",
          "gold-accessible": "var(--orion-gold-accessible)", // Story 1.18: 3.5:1 contrast on cream
          primary: {
            DEFAULT: "#D4AF37",
            hover: "#C9A431",
            muted: "rgba(212, 175, 55, 0.12)",
            light: "rgba(212, 175, 55, 0.05)",
          },
          bg: {
            DEFAULT: "var(--orion-bg)",
            white: "#FFFFFF",
            muted: "rgba(249, 248, 246, 0.95)",
          },
          surface: "var(--orion-surface)",
          "surface-elevated": "var(--orion-surface-elevated)",
          fg: {
            DEFAULT: "var(--orion-fg)",
            muted: "var(--orion-fg-muted)",
            subtle: "var(--orion-fg-subtle)",
            faint: "var(--orion-fg-faint)",
          },
          border: {
            DEFAULT: "var(--orion-border)",
            muted: "var(--orion-border-muted)",
            subtle: "var(--orion-border-subtle)",
            faint: "var(--orion-border-faint)",
          },
          blue: "var(--orion-blue)",
          success: "var(--orion-success)",
          error: "var(--orion-error)",
          badge: "var(--orion-badge-bg)",
          // Message colors
          "user-bubble": "#3D3831",
          "agent-bubble": "var(--orion-bg)",
        },
      },

      // Font Families
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },

      fontSize: {
        "2xs": ["9px", { lineHeight: "1.4" }],
        xs: ["10px", { lineHeight: "1.4" }],
        display: ["32px", { lineHeight: "1.1" }],
      },

      letterSpacing: {
        luxury: "var(--tracking-luxury)",
        widest: "var(--tracking-widest)",
        editorial: "0.25em",
        ultra: "0.4em",
      },

      // Spacing
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        header: "var(--orion-header-height)",
        "header-compact": "var(--orion-header-height-compact)",
        sidebar: "var(--orion-sidebar-width)",
        "sidebar-collapsed": "var(--orion-sidebar-collapsed)",
        "sidebar-icon-only": "var(--orion-sidebar-icon-only)",
        rail: "var(--orion-rail-width)",
        canvas: "var(--orion-canvas-width)",
        context: "var(--orion-context-width)",
        13: "52px",
        18: "72px",
        22: "88px",
      },

      // Border Radius - Sharp corners (Editorial Luxury)
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },

      // Box Shadows
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -4px rgba(0, 0, 0, 0.08)",
        "focus-gold": "0 0 0 2px rgba(212, 175, 55, 0.2)",
      },

      // Width/Height for Layout
      width: {
        sidebar: "280px",
        "sidebar-collapsed": "72px",
        "sidebar-icon-only": "48px",
        rail: "64px",
        chat: "480px",
        canvas: "480px",
        context: "320px",
      },

      height: {
        header: "80px",
        "header-compact": "70px",
      },

      maxWidth: {
        content: "850px",
        "content-wide": "1200px",
      },

      // Animation
      transitionTimingFunction: {
        luxury: "var(--easing-luxury)",
        elegant: "cubic-bezier(0.19, 1, 0.22, 1)",
        "orion-ease": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },

      transitionDuration: {
        entrance: "var(--duration-entrance)",
        exit: "var(--duration-exit)",
        state: "var(--duration-state)",
        canvas: "var(--duration-canvas)",
        "400": "400ms",
        "500": "500ms",
        "600": "600ms",
        "700": "700ms",
        "1000": "1000ms",
        "1200": "1200ms",
        "2000": "2000ms",
      },

      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },

      animation: {
        reveal: "reveal var(--duration-entrance) var(--easing-out) forwards",
        "reveal-1": "slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards",
        "reveal-2": "slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards",
        "reveal-3": "slide-in-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards",
        "fade-in": "fade-in var(--duration-entrance) var(--easing-out) forwards",
        pulse: "pulse var(--duration-pulse) ease-in-out infinite",
        spin: "spin var(--duration-spinner) linear infinite",
      },

      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [
    typography,
    plugin(function ({ addUtilities, addComponents }) {
      addUtilities({
        ".focus-ring-orion": {
          "&:focus": {
            outline: "none",
          },
          "&:focus-visible": {
            outline: "2px solid var(--orion-gold)",
            "outline-offset": "2px",
          },
        },
        ".focus-ring-orion-error": {
          "&:focus": {
            outline: "none",
          },
          "&:focus-visible": {
            outline: "2px solid var(--orion-error)",
            "outline-offset": "2px",
          },
        },
        ".serif": {
          fontFamily: "'Playfair Display', Georgia, serif",
        },
        ".tracking-editorial": {
          letterSpacing: "0.25em",
        },
        ".tracking-luxury": {
          letterSpacing: "var(--tracking-luxury)",
        },
        ".tracking-ultra": {
          letterSpacing: "0.4em",
        },
        ".sharp": {
          borderRadius: "0 !important",
        },
        ".small-caps": {
          fontVariant: "all-small-caps",
          letterSpacing: "0.15em",
        },
      });

      addComponents({
        ".btn-gold-slide": {
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--orion-border)",
          transition: "color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          zIndex: "1",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "#D4AF37",
            transform: "translateX(-101%)",
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            zIndex: "-1",
          },
          "&:hover::after": {
            transform: "translateX(0)",
          },
          "&:hover": {
            color: "#FFFFFF",
            borderColor: "#D4AF37",
          },
        },
        ".chat-user": {
          backgroundColor: "var(--orion-fg)",
          color: "var(--orion-bg)",
          padding: "1rem",
        },
        ".chat-agent": {
          paddingLeft: "1rem",
          borderLeft: "2px solid rgba(212, 175, 55, 0.3)",
        },
        ".custom-scrollbar": {
          scrollbarWidth: "thin",
          scrollbarColor: "var(--orion-scrollbar) var(--orion-bg)",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "var(--orion-bg)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--orion-scrollbar)",
          },
        },
      });
    }),
  ],
};

export default config;
