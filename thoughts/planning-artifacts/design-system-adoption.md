# Orion Design System Adoption Guide

**Date:** 2026-01-14
**Status:** Ready for Implementation

## Overview

The Orion Design System has been extracted from the 29 HTML mockups in `/pages/` and is now available as a reusable Tailwind CSS preset with TypeScript design tokens.

### Location

```
design-system/
├── tokens/           # TypeScript design tokens
│   ├── colors.ts     # Color palette
│   ├── typography.ts # Fonts, sizes, spacing
│   ├── spacing.ts    # Spacing, layout dimensions
│   ├── animations.ts # Easing, keyframes, durations
│   ├── effects.ts    # Shadows, filters, patterns
│   └── index.ts      # Token exports
├── styles/
│   └── globals.css   # Global CSS with all styles
├── tailwind.config.ts # Tailwind preset
├── index.ts          # Main entry point
└── README.md         # Full documentation
```

---

## Quick Start

### Step 1: Add Google Fonts

Add to your root layout's `<head>`:

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Step 2: Import Global Styles

Add to your `app/globals.css`:

```css
@import '../design-system/styles/globals.css';

/* Your additional styles below */
```

### Step 3: Configure Tailwind

Update your `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'
import { orionTailwindPreset } from './design-system/tailwind.config'

const config: Config = {
  presets: [orionTailwindPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Your additional config...
}

export default config
```

---

## Using the Design System

### Colors

```html
<!-- Gold accent -->
<button class="bg-orion-primary text-white">Gold Button</button>

<!-- Background and foreground -->
<div class="bg-orion-bg text-orion-fg">Content</div>

<!-- Muted variants -->
<p class="text-orion-fg-muted">Subtle text</p>
<div class="border border-orion-border-subtle">Subtle border</div>
```

### Typography

```html
<!-- Serif headline -->
<h1 class="serif text-7xl font-medium">The Daily Brief</h1>

<!-- Editorial label -->
<span class="text-xs tracking-luxury uppercase font-bold opacity-40">
  Section Label
</span>

<!-- Body text -->
<p class="text-base leading-relaxed opacity-80">
  Body copy with comfortable reading...
</p>
```

### Components

#### Gold Slide Button

```html
<button class="btn-gold-slide px-10 py-4 uppercase text-xs tracking-luxury font-bold">
  Execute Action
</button>
```

#### Luxury Card

```html
<div class="luxury-card pt-4">
  <img src="..." class="w-full h-48 object-cover" />
  <p class="text-xs uppercase tracking-widest mt-4">Category</p>
  <h3 class="serif text-xl">Card Title</h3>
</div>
```

#### Editorial Input

```html
<input
  type="text"
  placeholder="Search your knowledge archive..."
  class="input-editorial text-lg"
/>
```

#### Chat Messages

```html
<!-- User message -->
<div class="chat-user p-4 max-w-md">
  User message text...
</div>

<!-- Agent message -->
<div class="chat-agent pl-4 border-l-2 border-orion-primary/30">
  <p class="serif text-lg">Agent response...</p>
</div>
```

### Layout

Use CSS variables for layout dimensions:

```css
/* Available variables */
--orion-header-height: 80px;
--orion-sidebar-width: 280px;
--orion-sidebar-collapsed: 72px;
--orion-rail-width: 64px;
--orion-content-max-width: 850px;
```

Or Tailwind utilities:

```html
<header class="h-header">80px header</header>
<aside class="w-sidebar">280px sidebar</aside>
<main class="max-w-content">850px max content</main>
```

### Animations

```html
<!-- Staggered reveal -->
<div class="animate-reveal">First item</div>
<div class="animate-reveal delay-1">Second item (0.2s delay)</div>
<div class="animate-reveal delay-2">Third item (0.4s delay)</div>
<div class="animate-reveal delay-3">Fourth item (0.6s delay)</div>

<!-- Fade in -->
<div class="animate-fade-in">Fading content</div>
```

---

## TypeScript Token Access

Import typed tokens for programmatic access:

```typescript
import { colors, typography, spacing, animations } from '@/design-system'

// Access typed values
const gold = colors.primary.DEFAULT     // '#D4AF37'
const serif = typography.fontFamily.serif // ['Playfair Display', ...]
const easing = animations.easing.luxury  // 'cubic-bezier(...)'
```

---

## shadcn/ui Integration

Override shadcn variables in your `globals.css`:

```css
:root {
  --background: 38 33% 97%;     /* Orion cream */
  --foreground: 0 0% 10%;       /* Orion black */
  --primary: 43 65% 52%;        /* Orion gold */
  --primary-foreground: 0 0% 100%;
  --radius: 0rem;               /* Sharp corners */
}
```

---

## Migration Checklist

For existing Orion code, update these patterns:

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-amber-500` | `bg-orion-primary` |
| `text-neutral-900` | `text-orion-fg` |
| `bg-stone-50` | `bg-orion-bg` |
| `rounded-lg` | Remove (global 0 radius) |
| `tracking-wider` | `tracking-luxury` |
| `font-serif` | `serif` (class) |
| Custom gold slide CSS | `btn-gold-slide` |
| Custom input underline | `input-editorial` |

---

## Related Documents

- **Full Design System Docs:** `design-system/README.md`
- **UI Implementation Plan:** `thoughts/shared/plans/PLAN-orion-ui-implementation.md`
- **Pages/Components Plan:** `thoughts/shared/plans/PLAN-orion-pages-components.md`
- **PRD Section 7.1.1:** Design system in product requirements

---

## Version

**Design System Version:** 1.0.0
**Extracted from:** `/pages/` mockups on 2026-01-14
