# Orion Design System

A unified design token system extracted from the Orion UI mockups. Editorial luxury aesthetic with black, cream, and gold accent.

## Quick Start

### 1. Add Google Fonts

Add to your `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
```

### 2. Import Global Styles

In your `app/globals.css` or layout:

```css
@import '../design-system/styles/globals.css';
```

### 3. Configure Tailwind

In your `tailwind.config.ts`:

```typescript
import { orionTailwindPreset } from './design-system/tailwind.config'

export default {
  presets: [orionTailwindPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... your other config
}
```

---

## Design Philosophy

### Editorial Luxury

Orion follows an editorial luxury aesthetic inspired by high-end magazines and luxury brand catalogs:

- **Zero Border Radius** - Sharp, architectural edges throughout
- **Generous Whitespace** - Breathing room, minimal density
- **Black & Gold** - Monochrome with strategic gold highlights
- **Serif Headlines** - Playfair Display italics for elegance
- **Micro Typography** - 9-11px uppercase tracking for labels
- **Grayscale Imagery** - Images start B&W, reveal color on hover

### Key Principles

1. **Restraint over decoration** - Let content breathe
2. **Typography is the design** - Type choices carry the brand
3. **Motion is subtle** - Smooth, never bouncy animations
4. **Gold is precious** - Use sparingly for emphasis

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#D4AF37` | Gold accent, CTAs, highlights |
| `background` | `#F9F8F6` | Page background (warm cream) |
| `foreground` | `#1A1A1A` | Text, borders (near-black) |

### Usage in Tailwind

```html
<button class="bg-orion-primary text-white">Gold Button</button>
<div class="bg-orion-bg text-orion-fg">Content</div>
<div class="border-orion-border">Bordered</div>
```

---

## Typography

### Font Families

- **Playfair Display** - Headlines, quotes, emphasis
- **Inter** - Body text, labels, UI

### Typography Classes

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

### Letter Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `tracking-editorial` | `0.25em` | Standard label tracking |
| `tracking-luxury` | `0.30em` | Emphasis tracking |
| `tracking-ultra` | `0.40em` | Maximum tracking |

---

## Layout

### Standard Layout

```
┌─────────────────────────────────────────────────────────┐
│ 80px HEADER (logo, search, notifications, avatar)       │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  280px   │      MAIN CONTENT            │  64px         │
│  SIDEBAR │      (Chat / Dashboard)      │  AGENT RAIL   │
│  (PARA)  │                              │  (sparkle)    │
│          │                              │               │
│          ├──────────────────────────────┤               │
│          │  INPUT BAR                   │               │
└──────────┴──────────────────────────────┴───────────────┘
```

### Layout Variables

| Variable | Value |
|----------|-------|
| `--orion-header-height` | `80px` |
| `--orion-sidebar-width` | `280px` |
| `--orion-rail-width` | `64px` |
| `--orion-content-max-width` | `850px` |

---

## Components

### Gold Slide Button

Primary CTA with gold slide-in effect on hover.

```html
<button class="btn-gold-slide px-10 py-4 uppercase text-xs tracking-luxury font-bold">
  Execute Action
</button>
```

### Luxury Card

Card with top border and grayscale-to-color image effect.

```html
<div class="luxury-card pt-4">
  <img src="..." class="w-full h-48 object-cover" />
  <p class="text-xs uppercase tracking-widest">Label</p>
  <h3 class="serif text-xl">Title</h3>
</div>
```

### Editorial Input

Underline-only input with serif italic placeholder.

```html
<input
  type="text"
  placeholder="Search your knowledge archive..."
  class="input-editorial text-lg"
/>
```

### Grid Background

Subtle 40px grid pattern at 3% opacity.

```html
<div class="relative">
  <div class="absolute inset-0 grid-bg pointer-events-none"></div>
  <!-- Content -->
</div>
```

### Chat Messages

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

---

## Animation

### Easing

Use the luxury easing for all animations:

```css
transition: all 0.5s var(--orion-easing);
/* or */
transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Reveal Animation

Staggered reveal for content:

```html
<div class="animate-reveal">First item</div>
<div class="animate-reveal delay-1">Second item (0.2s delay)</div>
<div class="animate-reveal delay-2">Third item (0.4s delay)</div>
<div class="animate-reveal delay-3">Fourth item (0.6s delay)</div>
```

### Image Reveal

Grayscale images that reveal color on hover:

```html
<div class="luxury-card">
  <img src="..." class="grayscale hover:grayscale-0 transition-all duration-[1500ms]" />
</div>
```

---

## File Structure

```
design-system/
├── tokens/
│   ├── colors.ts          # Color palette
│   ├── typography.ts      # Fonts, sizes, spacing
│   ├── spacing.ts         # Spacing, layout dimensions
│   ├── animations.ts      # Easing, keyframes, durations
│   ├── effects.ts         # Shadows, filters, patterns
│   └── index.ts           # Token exports
├── styles/
│   └── globals.css        # Global CSS with all styles
├── tailwind.config.ts     # Tailwind preset
├── index.ts               # Main entry point
└── README.md              # This file
```

---

## Usage with TypeScript

Import typed tokens:

```typescript
import { colors, typography, spacing, animations } from '@/design-system'

// Access typed values
const gold = colors.primary.DEFAULT // '#D4AF37'
const serif = typography.fontFamily.serif // ['Playfair Display', ...]
const easing = animations.easing.luxury // 'cubic-bezier(...)'
```

---

## Integrating with shadcn/ui

When using shadcn/ui, override these values in your `components.json`:

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  }
}
```

Then map shadcn variables to Orion tokens in your globals.css:

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

## Version

**1.0.0** - Extracted from `/pages/` mockups on 2026-01-14
