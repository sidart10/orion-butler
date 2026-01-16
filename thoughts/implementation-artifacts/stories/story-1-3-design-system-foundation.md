# Story 1.3: Design System Foundation

Status: ready-for-dev

---

## Story

As a user,
I want Orion to have a distinctive editorial luxury aesthetic,
So that it feels premium and differentiated from other tools.

---

## Acceptance Criteria

1. **AC1: Typography System**
   - **Given** the app is running
   - **When** any screen loads
   - **Then** typography uses Playfair Display for headlines (serif class)
   - **And** typography uses Inter for body text (sans-serif default)
   - **And** fonts are preloaded via Google Fonts for fast rendering (UX-004)

2. **AC2: Color Palette**
   - **Given** the design system is configured
   - **When** developers use Tailwind classes
   - **Then** colors follow the palette: Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A (UX-003)
   - **And** color tokens are available as `orion-primary`, `orion-bg`, `orion-fg`
   - **And** extended palette includes muted/subtle/faint variants

3. **AC3: Zero Border Radius**
   - **Given** the app is running
   - **When** any component renders
   - **Then** all corners are sharp (zero border radius) throughout (UX-002)
   - **And** shadcn/ui components inherit zero radius via CSS variable override

4. **AC4: Layout Grid**
   - **Given** the app shell is rendered
   - **When** the main layout displays
   - **Then** the layout follows the grid: 80px header, 280px sidebar, 64px agent rail (UX-005)
   - **And** content max width is constrained to 850px
   - **And** CSS custom properties are available for layout dimensions

5. **AC5: Tailwind Configuration**
   - **Given** the design system is implemented
   - **When** a developer creates a new component
   - **Then** Tailwind/CSS tokens enforce the design constraints
   - **And** design system preset integrates cleanly with app's tailwind.config
   - **And** deviations from design system are visually obvious

6. **AC6: Component Classes**
   - **Given** the design system is implemented
   - **When** developers build UI
   - **Then** component classes are available: `.btn-gold-slide`, `.luxury-card`, `.input-editorial`, `.chat-user`, `.chat-agent`
   - **And** utility classes work: `.serif`, `.tracking-editorial`, `.tracking-luxury`, `.grid-bg`

7. **AC7: Accessibility**
   - **Given** the color palette is applied
   - **When** text is displayed on backgrounds
   - **Then** color contrast meets WCAG AA (4.5:1 minimum for normal text)
   - **And** gold accent on cream background passes contrast requirements

---

## Tasks / Subtasks

- [ ] **Task 1: Google Fonts Integration** (AC: 1)
  - [ ] 1.1 Update `src/app/layout.tsx` to include Google Fonts preconnect links
  - [ ] 1.2 Add font CSS import for Inter (100-900 weights) and Playfair Display (400-900, italic)
  - [ ] 1.3 Verify fonts load correctly with Network panel check
  - [ ] 1.4 Add font-display: swap for progressive loading

- [ ] **Task 2: Design System Import into App** (AC: 2, 3, 4, 5, 6)
  - [ ] 2.1 Import design system global styles in `src/app/globals.css`:
    ```css
    @import '../../design-system/styles/globals.css';
    ```
  - [ ] 2.2 Create/update root `tailwind.config.ts` to use Orion preset:
    ```typescript
    import { orionTailwindPreset } from './design-system/tailwind.config'

    export default {
      presets: [orionTailwindPreset],
      content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      ],
    }
    ```
  - [ ] 2.3 Verify Tailwind builds with design system tokens (run `pnpm dev`)
  - [ ] 2.4 Test that `bg-orion-primary`, `text-orion-fg`, `bg-orion-bg` classes work

- [ ] **Task 3: CSS Variables for Layout** (AC: 4)
  - [ ] 3.1 Add CSS custom properties to globals.css (if not already in design-system):
    ```css
    :root {
      --orion-header-height: 80px;
      --orion-sidebar-width: 280px;
      --orion-sidebar-collapsed: 72px;
      --orion-rail-width: 64px;
      --orion-content-max-width: 850px;
      --orion-chat-width: 480px;
    }
    ```
  - [ ] 3.2 Verify CSS variables are accessible from components

- [ ] **Task 4: shadcn/ui Integration** (AC: 3, 5)
  - [ ] 4.1 Initialize shadcn/ui in project: `pnpm dlx shadcn@latest init`
  - [ ] 4.2 Configure `components.json` with Orion settings:
    ```json
    {
      "style": "default",
      "tailwind": {
        "config": "tailwind.config.ts",
        "css": "src/app/globals.css",
        "baseColor": "zinc"
      }
    }
    ```
  - [ ] 4.3 Override shadcn CSS variables to use Orion tokens in globals.css:
    ```css
    :root {
      --background: 38 33% 97%;     /* Orion cream #F9F8F6 */
      --foreground: 0 0% 10%;       /* Orion black #1A1A1A */
      --primary: 43 65% 52%;        /* Orion gold #D4AF37 */
      --primary-foreground: 0 0% 100%;
      --radius: 0rem;               /* Sharp corners */
    }
    ```
  - [ ] 4.4 Install a sample shadcn component to verify integration: `pnpm dlx shadcn@latest add button`
  - [ ] 4.5 Verify Button component renders with zero border radius

- [ ] **Task 5: Typography Verification** (AC: 1)
  - [ ] 5.1 Create test component with serif headline and body text
  - [ ] 5.2 Verify `serif` class applies Playfair Display
  - [ ] 5.3 Verify default font is Inter
  - [ ] 5.4 Test editorial tracking classes: `tracking-editorial`, `tracking-luxury`, `tracking-ultra`

- [ ] **Task 6: Component Classes Verification** (AC: 6)
  - [ ] 6.1 Create test page with all component classes:
    - `.btn-gold-slide` - verify gold slide-in hover effect
    - `.luxury-card` - verify top border and grayscale image hover
    - `.input-editorial` - verify underline style and italic placeholder
    - `.chat-user` - verify black bg, cream text
    - `.chat-agent` - verify gold left border
  - [ ] 6.2 Verify `.grid-bg` creates 40px grid pattern
  - [ ] 6.3 Verify `.dots-bg` creates dot pattern

- [ ] **Task 7: Accessibility Audit** (AC: 7)
  - [ ] 7.1 Test Gold (#D4AF37) on Cream (#F9F8F6) - verify contrast ratio
  - [ ] 7.2 Test Black (#1A1A1A) on Cream (#F9F8F6) - verify contrast ratio
  - [ ] 7.3 Test Cream text on Black background - verify contrast ratio
  - [ ] 7.4 Use browser DevTools or axe extension to verify WCAG AA compliance
  - [ ] 7.5 Document any contrast concerns with gold accent

- [ ] **Task 8: Animation System Verification** (AC: 5)
  - [ ] 8.1 Test animation classes: `animate-reveal`, `animate-reveal-1`, `animate-reveal-2`
  - [ ] 8.2 Verify easing classes: `ease-luxury`, `ease-elegant`
  - [ ] 8.3 Verify duration classes: `duration-500`, `duration-700`, `duration-1200`
  - [ ] 8.4 Test staggered reveal animation pattern

- [ ] **Task 9: Visual Regression Setup** (AC: 1, 2, 3, 4, 5, 6)
  - [ ] 9.1 Create `tests/visual/design-system.spec.ts` with Playwright
  - [ ] 9.2 Capture baseline screenshots for:
    - Typography scale (h1-h6, body, labels)
    - Color palette swatches
    - Component classes (button, card, input)
    - Layout grid
  - [ ] 9.3 Configure Playwright visual comparison threshold

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Design Philosophy | Editorial luxury aesthetic | [architecture.md#3.4] |
| Typography | Playfair Display (serif) + Inter (sans) | [architecture.md#3.4.2] |
| Colors | Gold #D4AF37, Cream #F9F8F6, Black #1A1A1A | [architecture.md#3.4.3] |
| Border Radius | Zero (sharp corners) | [architecture.md#3.4.1] |
| Layout Grid | 80px header, 280px sidebar, 64px rail | [architecture.md#3.4.5] |
| UI Framework | shadcn/ui + Tailwind CSS | [architecture.md#3.1] |

### Design System Already Exists

**IMPORTANT:** The design system has already been extracted and lives in `/design-system/`. This story is about **integrating** it into the Next.js app, not creating it from scratch.

**Existing files:**
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
├── tailwind.config.ts     # Tailwind preset (orionTailwindPreset)
├── index.ts               # Main entry point
└── README.md              # Full documentation
```

### Font Preloading (from architecture.md)

Add to `<head>` in `src/app/layout.tsx`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
```

### Tailwind Preset Integration

The `orionTailwindPreset` includes:
- **Colors:** `orion-primary`, `orion-bg`, `orion-fg`, `orion-border` with variants
- **Typography:** `serif` class, `tracking-editorial/luxury/ultra`
- **Layout:** `w-sidebar`, `w-rail`, `h-header`, `max-w-content`
- **Animations:** `ease-luxury`, `ease-elegant`, `animate-reveal` variants
- **Components:** `.btn-gold-slide`, `.luxury-card`, `.input-editorial`, `.chat-user`, `.chat-agent`

### shadcn/ui Variable Mapping

Override shadcn defaults with Orion tokens:

```css
:root {
  /* shadcn uses HSL format */
  --background: 38 33% 97%;     /* Orion cream #F9F8F6 */
  --foreground: 0 0% 10%;       /* Orion black #1A1A1A */
  --primary: 43 65% 52%;        /* Orion gold #D4AF37 */
  --primary-foreground: 0 0% 100%;
  --secondary: 38 33% 92%;
  --secondary-foreground: 0 0% 10%;
  --muted: 38 20% 90%;
  --muted-foreground: 0 0% 40%;
  --accent: 43 65% 52%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 10%;
  --input: 0 0% 10%;
  --ring: 43 65% 52%;           /* Gold focus ring */
  --radius: 0rem;               /* Sharp corners */
}
```

### Accessibility Considerations

**Contrast Ratios (calculated):**

| Combination | Ratio | WCAG AA | Notes |
|-------------|-------|---------|-------|
| Black (#1A1A1A) on Cream (#F9F8F6) | ~14.7:1 | PASS | Primary text |
| Cream on Black | ~14.7:1 | PASS | Inverse text |
| Gold (#D4AF37) on Cream (#F9F8F6) | ~2.5:1 | FAIL for text | Use for decorative only |
| Gold on Black | ~5.9:1 | PASS | Gold accents on dark |
| Black on Gold | ~5.9:1 | PASS | Text on gold buttons |

**Gold Accent Usage:**
- Use gold for icons, borders, highlights - NOT for body text
- Gold text acceptable only on black backgrounds (5.9:1)
- For buttons, gold slide-in effect uses white text on gold (contrast OK)

### File Structure for This Story

```
src/
├── app/
│   ├── layout.tsx         # MODIFY: Add font preloading
│   └── globals.css        # MODIFY: Import design system, add shadcn vars
├── components/
│   └── ui/                # CREATE: shadcn components directory
│       └── button.tsx     # CREATE: Via shadcn CLI for testing
tailwind.config.ts         # CREATE/MODIFY: Use orionTailwindPreset
components.json            # CREATE: shadcn configuration
tests/
└── visual/
    └── design-system.spec.ts  # CREATE: Visual regression tests
```

### Project Structure Notes

- **Dependency:** Requires Story 1.2 (Next.js Frontend Integration) - needs working Next.js app
- **Parallel:** Can be developed in parallel with Story 1.4 (SQLite Database)
- **Enables:** Story 1.9 (Split-Screen Layout) uses layout variables from this story
- This story establishes visual identity for ALL subsequent stories

### Technical Notes

1. **Font Loading Strategy**
   - Use `display=swap` for fast initial render with fallback fonts
   - Preconnect to Google Fonts domains reduces latency
   - Consider `next/font` for future optimization (optional)

2. **Tailwind Build**
   - Preset approach keeps app config clean
   - Content paths must include both `src/` and `components/`
   - JIT mode handles dynamic classes automatically

3. **shadcn/ui Components**
   - Install components individually as needed: `pnpm dlx shadcn@latest add [component]`
   - Components are copied into `src/components/ui/`
   - Override styles via Tailwind classes or CSS variables

4. **Visual Regression Testing**
   - Use Playwright's `toHaveScreenshot()` for visual comparison
   - Set appropriate threshold (e.g., 0.1% pixel difference)
   - CI should fail on unexpected visual changes

### Testing Standards

| Test Type | Framework | Files |
|-----------|-----------|-------|
| Visual Regression | Playwright | `tests/visual/design-system.spec.ts` |
| Unit | Vitest | `design-system/**/*.test.ts` |
| Accessibility | axe-playwright | `tests/a11y/contrast.spec.ts` |

### Tests to Implement

```typescript
// tests/visual/design-system.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Design System Foundation', () => {
  test('typography renders with correct fonts', async ({ page }) => {
    await page.goto('/');

    // Check serif headline
    const headline = page.locator('.serif');
    await expect(headline).toHaveCSS('font-family', /Playfair Display/);

    // Check body text uses Inter
    const body = page.locator('body');
    await expect(body).toHaveCSS('font-family', /Inter/);
  });

  test('colors match design system', async ({ page }) => {
    await page.goto('/');

    // Check background color
    const bg = page.locator('body');
    await expect(bg).toHaveCSS('background-color', 'rgb(249, 248, 246)'); // #F9F8F6
  });

  test('sharp corners enforced (zero border radius)', async ({ page }) => {
    await page.goto('/');

    // Test shadcn button has sharp corners
    const button = page.locator('button').first();
    await expect(button).toHaveCSS('border-radius', '0px');
  });

  test('layout dimensions match spec', async ({ page }) => {
    await page.goto('/');

    // Get computed style for CSS variable
    const headerHeight = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orion-header-height')
    );
    expect(headerHeight.trim()).toBe('80px');
  });

  test('component classes render correctly', async ({ page }) => {
    await page.goto('/design-system-test'); // Test page with all components

    // Visual regression
    await expect(page).toHaveScreenshot('design-system-components.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});

// tests/a11y/contrast.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - Color Contrast', () => {
  test('meets WCAG AA contrast requirements', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Filter to only color contrast violations
    const contrastViolations = results.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });
});
```

### Component Test Page

Create a test page at `/design-system-test` for visual verification:

```tsx
// src/app/design-system-test/page.tsx
export default function DesignSystemTest() {
  return (
    <div className="bg-orion-bg min-h-screen p-8">
      <h1 className="serif text-7xl text-orion-fg mb-8">Design System</h1>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Typography</h2>
        <h1 className="serif text-7xl">Headline 1</h1>
        <h2 className="serif text-5xl">Headline 2</h2>
        <p className="text-base">Body text in Inter</p>
        <span className="text-xs tracking-editorial uppercase">Editorial Label</span>
      </section>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-orion-primary" title="Gold" />
          <div className="w-24 h-24 bg-orion-bg border" title="Cream" />
          <div className="w-24 h-24 bg-orion-fg" title="Black" />
        </div>
      </section>

      {/* Components */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Components</h2>
        <button className="btn-gold-slide px-8 py-3 uppercase text-xs tracking-luxury font-bold">
          Gold Slide Button
        </button>

        <div className="luxury-card mt-8 p-4 max-w-sm">
          <h3 className="serif text-xl">Luxury Card</h3>
          <p className="text-sm opacity-60">Card description</p>
        </div>

        <input
          className="input-editorial mt-8 max-w-md"
          placeholder="Editorial input placeholder..."
        />
      </section>

      {/* Chat Messages */}
      <section className="mb-12">
        <h2 className="serif text-4xl mb-4">Chat Messages</h2>
        <div className="chat-user max-w-md mb-4">User message</div>
        <div className="chat-agent max-w-md">
          <p className="serif">Agent response with serif text</p>
        </div>
      </section>
    </div>
  );
}
```

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#3.4 Orion Design System]
- [Source: thoughts/planning-artifacts/architecture.md#3.4.1 Design Philosophy]
- [Source: thoughts/planning-artifacts/architecture.md#3.4.2 Required Fonts]
- [Source: thoughts/planning-artifacts/architecture.md#3.4.3 Color Palette]
- [Source: thoughts/planning-artifacts/architecture.md#3.4.5 Layout Dimensions]
- [Source: thoughts/planning-artifacts/architecture.md#3.4.8 Integration with shadcn/ui]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.3: Design System Foundation]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Design Philosophy]
- [Source: design-system/README.md]
- [Source: design-system/tailwind.config.ts]
- [Source: thoughts/implementation-artifacts/stories/story-1-1-tauri-desktop-shell.md] (prerequisite for 1.2)
- [Source: thoughts/implementation-artifacts/stories/story-1-2-nextjs-frontend-integration.md] (direct dependency)

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive design system integration context | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
