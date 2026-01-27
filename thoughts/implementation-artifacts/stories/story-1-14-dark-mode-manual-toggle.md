# Story 1.14: Dark Mode - Manual Toggle

Status: ready-for-dev

## Story

As a **user**,
I want to manually override the dark/light mode,
So that I can choose my preference independent of system.

## Acceptance Criteria

1. **Given** the Settings interface
   **When** I access the Appearance settings
   **Then** I see three theme options: "Light", "Dark", "System"
   **And** the currently active option is visually indicated

2. **Given** the app is using system theme detection (default)
   **When** I select "Light" theme option
   **Then** the app immediately switches to light mode
   **And** the app stays in light mode regardless of system setting
   **And** the preference persists across app restarts

3. **Given** the app is using system theme detection (default)
   **When** I select "Dark" theme option
   **Then** the app immediately switches to dark mode
   **And** the app stays in dark mode regardless of system setting
   **And** the preference persists across app restarts

4. **Given** I have a manual theme preference set (Light or Dark)
   **When** I select "System" theme option
   **Then** the app reverts to automatic detection
   **And** the app matches the current macOS appearance setting
   **And** future system changes are followed automatically

5. **Given** I have a manual theme preference set
   **When** I restart the app
   **Then** the app loads in my preferred theme
   **And** no flash of wrong theme occurs during load

6. **Given** the theme is changing (manually or via system)
   **When** the transition occurs
   **Then** all components transition smoothly (200ms crossfade via global `* { transition }` selector from Story 1.13)
   **And** the transition respects `prefers-reduced-motion` setting (also from Story 1.13)

7. **Given** any theme mode (Light, Dark, or System)
   **When** I view the app
   **Then** gold accent (#D4AF37) remains constant
   **And** all components render correctly

## Tasks / Subtasks

- [ ] Task 1: Create theme preference storage in SQLite (AC: #2, #3, #5)
  - [ ] 1.1: Create `src-tauri/src/commands/` directory and `mod.rs` if not exists
  - [ ] 1.2: Create `src-tauri/src/db/` directory and `mod.rs` if not exists
  - [ ] 1.3: Add `theme_preference` to preferences table in `src-tauri/src/db/migrations.rs` (values: 'light', 'dark', 'system')
  - [ ] 1.4: Create Tauri IPC command `get_theme_preference` in `src-tauri/src/commands/preferences.rs`
  - [ ] 1.5: Create Tauri IPC command `set_theme_preference` in `src-tauri/src/commands/preferences.rs`
  - [ ] 1.6: Register commands in `src-tauri/src/lib.rs` with `tauri::generate_handler!`
  - [ ] 1.7: Set default value to 'system' on first launch
  - NOTE: The Tauri backend currently only has minimal lib.rs and main.rs. This task establishes the commands/ and db/ directory patterns specified in architecture.md.

- [ ] Task 2: Create theme Zustand store for runtime state (AC: #2, #3, #4)
  - [ ] 2.1: Create `src/stores/` directory if not exists (per architecture.md structure)
  - [ ] 2.2: Create `src/stores/themeStore.ts` with state: resolvedTheme, preference
  - [ ] 2.3: Implement `setPreference` action that updates store and persists to SQLite
  - [ ] 2.4: Implement `initializeTheme` action to load preference on app start
  - [ ] 2.5: Implement `getResolvedTheme` to compute actual theme from preference + system

- [ ] Task 3: Implement HTML class-based theme override (AC: #2, #3, #4)
  - [ ] 3.1: Add `.dark` class override CSS rules to globals.css
  - [ ] 3.2: Add `.light` class override CSS rules to globals.css (explicit light mode)
  - [ ] 3.3: Ensure class-based rules take precedence over media query
  - [ ] 3.4: Ensure no class applied means system detection (media query)

- [ ] Task 4: Create ThemeProvider component for initialization (AC: #5, #6)
  - [ ] 4.1: Create `src/components/providers/` directory if not exists
  - [ ] 4.2: Create `src/components/providers/ThemeProvider.tsx`
  - [ ] 4.3: Load theme preference from SQLite on mount
  - [ ] 4.4: Apply appropriate class to `<html>` element
  - [ ] 4.5: Listen for system preference changes when in "System" mode
  - [ ] 4.6: Handle `prefers-reduced-motion` for transitions

- [ ] Task 5: Prevent flash of wrong theme on load (AC: #5)
  - [ ] 5.1: Add blocking script in `<head>` to read localStorage cache
  - [ ] 5.2: Store theme preference in localStorage as cache (sync with SQLite)
  - [ ] 5.3: Apply theme class before React hydration
  - [ ] 5.4: Verify no FOUC (Flash of Unstyled Content) occurs

- [ ] Task 6: Create theme selector UI component (AC: #1)
  - [ ] 6.1: Create `src/components/settings/` directory if not exists
  - [ ] 6.2: Create `src/components/settings/ThemeSelector.tsx`
  - [ ] 6.3: Implement three-option segmented control (Light | Dark | System)
  - [ ] 6.4: Show active option with gold accent
  - [ ] 6.5: Wire to themeStore actions

- [ ] Task 7: Add settings page placeholder with theme selector (AC: #1)
  - [ ] 7.1: Create `src/app/settings/` directory if not exists
  - [ ] 7.2: Create `src/app/settings/page.tsx` as minimal settings page placeholder
  - [ ] 7.3: Add Appearance section with ThemeSelector component
  - [ ] 7.4: Style settings page with Editorial Luxury aesthetic (0px border radius, gold accents)
  - [ ] 7.5: Add navigation link/button to settings page from main app (temporary - full nav comes in later stories)
  - NOTE: This creates a minimal settings page with just the Appearance/Theme section. Full settings page with all sections will be expanded in future stories. Navigation to settings can be via a temporary settings icon/button until proper navigation is implemented.

- [ ] Task 8: Write unit tests for theme store and persistence
  - [ ] 8.1: Test themeStore state transitions
  - [ ] 8.2: Test preference persistence to SQLite
  - [ ] 8.3: Test resolvedTheme computation
  - [ ] 8.4: Test localStorage cache sync

- [ ] Task 9: Write E2E tests for manual theme toggle
  - [ ] 9.1: Test selecting Light mode applies light theme
  - [ ] 9.2: Test selecting Dark mode applies dark theme
  - [ ] 9.3: Test selecting System mode follows system preference
  - [ ] 9.4: Test preference persists across page refresh
  - [ ] 9.5: Test no theme flash on load with manual preference

## Dev Notes

### Architecture Compliance

**Persistence Pattern (from architecture.md):**
- User preferences stored in SQLite `preferences` table
- Key: `theme_preference`, Value: `light` | `dark` | `system`
- IPC commands for read/write (Rust backend)

**State Management (from architecture.md):**
- Zustand for UI state (preference + resolved theme)
- localStorage for fast initial load (cache only, SQLite is source of truth)

**UX Specification Reference:**
- Dark Mode Support section specifies three options: Light, Dark, System
- Preference stored in local settings
- Transition: 200ms crossfade on theme switch

### Implementation Strategy

**Theme Resolution Logic:**

```
┌─────────────────────────────────────────────────────┐
│                 Theme Resolution                     │
│                                                      │
│  preference = 'light'  → resolvedTheme = 'light'    │
│  preference = 'dark'   → resolvedTheme = 'dark'     │
│  preference = 'system' → resolvedTheme = system pref │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Class-Based Override Strategy:**

| HTML Class | Effect |
|------------|--------|
| (no class) | System detection via media query (from Story 1.13) |
| `.light` | Force light mode, override media query |
| `.dark` | Force dark mode, override media query |

**CSS Specificity Order:**

```css
/* Base: light mode tokens */
:root { ... }

/* Media query: system preference */
@media (prefers-color-scheme: dark) { :root { ... } }

/* Class override: highest specificity */
.dark { ... }
.light { ... }
```

### CSS Implementation

```css
/* globals.css additions */

/* Manual dark mode class override */
html.dark {
  --orion-bg: #121212;
  --orion-surface: #1A1A1A;
  --orion-surface-elevated: #242424;
  --orion-fg: #FAF8F5;
  --orion-fg-muted: #9CA3AF;
  --orion-border: #2D2D2D;
  --orion-scrollbar: #333333;
  --orion-success: #10B981;
  --orion-error: #EF4444;
}

/* Manual light mode class override */
html.light {
  --orion-bg: #FAF8F5;
  --orion-surface: #FFFFFF;
  --orion-surface-elevated: #FFFFFF;
  --orion-fg: #1A1A1A;
  --orion-fg-muted: #6B6B6B;
  --orion-border: #E5E5E5;
  --orion-scrollbar: #CCCCCC;
  --orion-success: #059669;
  --orion-error: #9B2C2C;
}

/* Backdrop opacity adjustments for dark mode class */
html.dark .backdrop {
  background: rgba(0, 0, 0, 0.7);
}
```

### Theme Store Implementation

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isInitialized: boolean;

  setPreference: (pref: ThemePreference) => Promise<void>;
  initializeTheme: () => Promise<void>;
  updateResolvedTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  resolvedTheme: 'light',
  isInitialized: false,

  setPreference: async (pref: ThemePreference) => {
    // Update store
    set({ preference: pref });

    // Persist to SQLite via IPC
    await invoke('set_theme_preference', { preference: pref });

    // Cache in localStorage for fast load
    localStorage.setItem('theme-preference', pref);

    // Update resolved theme
    get().updateResolvedTheme();

    // Apply class to HTML element
    applyThemeClass(get().resolvedTheme, pref);
  },

  initializeTheme: async () => {
    // Try localStorage cache first (fast)
    const cached = localStorage.getItem('theme-preference') as ThemePreference | null;

    // Load from SQLite (authoritative)
    const stored = await invoke<ThemePreference | null>('get_theme_preference');
    const preference = stored ?? cached ?? 'system';

    // Sync localStorage cache
    localStorage.setItem('theme-preference', preference);

    set({ preference, isInitialized: true });
    get().updateResolvedTheme();
    applyThemeClass(get().resolvedTheme, preference);
  },

  updateResolvedTheme: () => {
    const { preference } = get();
    let resolved: ResolvedTheme;

    if (preference === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      resolved = preference;
    }

    set({ resolvedTheme: resolved });
  },
}));

function applyThemeClass(resolved: ResolvedTheme, preference: ThemePreference) {
  const html = document.documentElement;

  // Remove any existing theme class
  html.classList.remove('light', 'dark');

  // Apply class only if not using system preference
  if (preference !== 'system') {
    html.classList.add(resolved);
  }
  // No class = system detection via media query (Story 1.13)
}
```

### Flash Prevention Script

To prevent FOUC, add a blocking script in `<head>`:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Blocking script to prevent theme flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const pref = localStorage.getItem('theme-preference');
              if (pref === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (pref === 'light') {
                document.documentElement.classList.add('light');
              }
              // 'system' or null = no class, media query handles it
            })();
          `
        }} />
      </head>
      <body className="bg-orion-bg text-orion-fg">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### ThemeProvider Component

```tsx
// src/components/providers/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initializeTheme, preference, updateResolvedTheme } = useThemeStore();

  // Initialize on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Listen for system preference changes when in "System" mode
  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateResolvedTheme();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference, updateResolvedTheme]);

  return <>{children}</>;
}
```

### ThemeSelector Component

```tsx
// src/components/settings/ThemeSelector.tsx
'use client';

import { useThemeStore } from '@/stores/themeStore';

type ThemeOption = 'light' | 'dark' | 'system';

const options: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeSelector() {
  const { preference, setPreference } = useThemeStore();

  return (
    <div className="flex gap-0">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setPreference(option.value)}
          className={`
            px-4 py-2 text-sm font-medium
            border border-orion-border
            transition-colors duration-100
            ${preference === option.value
              ? 'bg-orion-gold text-orion-bg border-orion-gold'
              : 'bg-orion-surface text-orion-fg hover:bg-orion-surface-elevated'
            }
          `}
          aria-pressed={preference === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### IPC Commands (Rust)

**PREREQUISITE:** The Tauri backend currently only has minimal `lib.rs` and `main.rs` files. Before implementing these commands, you must:

1. Create directory structure: `src-tauri/src/commands/` and `src-tauri/src/db/`
2. Add `tauri-plugin-sql` to `Cargo.toml` for SQLite support
3. Create `AppState` struct in `lib.rs` to hold database connection
4. Initialize database connection in `main.rs` or `lib.rs`

**Example AppState setup (add to src-tauri/src/lib.rs):**

```rust
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri_plugin_sql::{Migration, MigrationKind};

pub struct AppState {
    pub db: Arc<Mutex<sqlx::SqlitePool>>,
}
```

**Commands implementation (src-tauri/src/commands/preferences.rs):**

```rust
// src-tauri/src/commands/preferences.rs
use crate::AppState;

#[tauri::command]
pub async fn get_theme_preference(
    state: tauri::State<'_, AppState>,
) -> Result<Option<String>, String> {
    let db = state.db.lock().await;

    let result = sqlx::query_scalar!(
        "SELECT value FROM preferences WHERE key = 'theme_preference'"
    )
    .fetch_optional(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn set_theme_preference(
    state: tauri::State<'_, AppState>,
    preference: String,
) -> Result<(), String> {
    // Validate preference value
    if !["light", "dark", "system"].contains(&preference.as_str()) {
        return Err("Invalid theme preference".to_string());
    }

    let db = state.db.lock().await;

    sqlx::query!(
        r#"
        INSERT INTO preferences (key, value, updated_at)
        VALUES ('theme_preference', $1, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = excluded.updated_at
        "#,
        preference
    )
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
```

**Register commands in src-tauri/src/lib.rs:**

```rust
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState { db: /* initialize */ })
        .invoke_handler(tauri::generate_handler![
            commands::preferences::get_theme_preference,
            commands::preferences::set_theme_preference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### SQLite Schema Addition

```sql
-- preferences table (may already exist from architecture.md)
CREATE TABLE IF NOT EXISTS preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    source TEXT DEFAULT 'user',
    confidence REAL DEFAULT 1.0,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default theme preference if not exists
INSERT OR IGNORE INTO preferences (key, value, source)
VALUES ('theme_preference', 'system', 'default');
```

### Dependencies on Prior Stories

| Story | Dependency |
|-------|------------|
| 1.13 | Dark mode tokens and media query detection |
| 1.3 | CSS Design Tokens `--orion-*` variables |
| 1.4-1.12 | All components use design tokens |

### Files to Create

| File | Purpose |
|------|---------|
| `src/stores/themeStore.ts` | Zustand store for theme state |
| `src/components/providers/ThemeProvider.tsx` | Theme initialization component |
| `src/components/settings/ThemeSelector.tsx` | Three-option theme selector |
| `src/app/settings/page.tsx` | Settings page with appearance section |
| `tests/unit/themeStore.test.ts` | Unit tests for theme store |
| `tests/e2e/theme-toggle.spec.ts` | E2E tests for manual toggle |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add `.dark` and `.light` class overrides |
| `src/app/layout.tsx` | Add flash prevention script and ThemeProvider wrapper |
| `src-tauri/src/lib.rs` | Add AppState struct, database init, and register IPC commands |
| `src-tauri/Cargo.toml` | Add `tauri-plugin-sql` and `sqlx` dependencies |

### Directories to Create

| Directory | Purpose |
|-----------|---------|
| `src/stores/` | Zustand stores (per architecture.md) |
| `src/components/providers/` | Provider components like ThemeProvider |
| `src/components/settings/` | Settings UI components |
| `src/app/settings/` | Settings page route |
| `src-tauri/src/commands/` | Tauri IPC command modules |
| `src-tauri/src/db/` | Database operations and migrations |

### Testing Standards

**Unit Tests (Vitest):**

```typescript
// tests/unit/themeStore.test.ts
import { useThemeStore } from '@/stores/themeStore';
import { vi } from 'vitest';

// Mock Tauri invoke for unit tests
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockImplementation((cmd: string, args?: any) => {
    if (cmd === 'get_theme_preference') {
      return Promise.resolve(null); // Default: no stored preference
    }
    if (cmd === 'set_theme_preference') {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unknown command: ${cmd}`));
  }),
}));

describe('Theme Store', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    vi.clearAllMocks();
  });

  it('initializes with system preference by default', async () => {
    const store = useThemeStore.getState();
    await store.initializeTheme();

    expect(store.preference).toBe('system');
  });

  it('applies dark class when preference is dark', async () => {
    const store = useThemeStore.getState();
    await store.setPreference('dark');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(store.resolvedTheme).toBe('dark');
  });

  it('applies light class when preference is light', async () => {
    const store = useThemeStore.getState();
    await store.setPreference('light');

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(store.resolvedTheme).toBe('light');
  });

  it('removes class when preference is system', async () => {
    const store = useThemeStore.getState();

    // Set to dark first
    await store.setPreference('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Switch to system
    await store.setPreference('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('caches preference in localStorage', async () => {
    const store = useThemeStore.getState();
    await store.setPreference('dark');

    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('gold accent unchanged regardless of theme', () => {
    // Set dark mode
    document.documentElement.classList.add('dark');
    const darkGold = getComputedStyle(document.documentElement)
      .getPropertyValue('--orion-gold').trim();

    // Set light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    const lightGold = getComputedStyle(document.documentElement)
      .getPropertyValue('--orion-gold').trim();

    expect(darkGold).toBe('#D4AF37');
    expect(lightGold).toBe('#D4AF37');
  });
});
```

**E2E Tests (Playwright):**

```typescript
// tests/e2e/theme-toggle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Manual Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('selecting Dark mode applies dark theme', async ({ page }) => {
    await page.goto('/settings');

    // Click Dark option
    await page.click('button:has-text("Dark")');

    // Check HTML has dark class
    const htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('dark');

    // Check background color
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });
    expect(bgColor).toBe('#121212');
  });

  test('selecting Light mode applies light theme', async ({ page }) => {
    await page.goto('/settings');

    // Click Light option
    await page.click('button:has-text("Light")');

    // Check HTML has light class
    const htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('light');

    // Check background color
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });
    expect(bgColor).toBe('#FAF8F5');
  });

  test('selecting System mode follows system preference', async ({ page }) => {
    // Emulate dark system preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/settings');

    // First set to Light (manual)
    await page.click('button:has-text("Light")');
    let htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('light');

    // Switch to System
    await page.click('button:has-text("System")');
    htmlClass = await page.getAttribute('html', 'class');

    // Should not have light or dark class (media query takes over)
    expect(htmlClass).not.toContain('light');
    expect(htmlClass).not.toContain('dark');

    // Should follow system preference (dark)
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });
    expect(bgColor).toBe('#121212');
  });

  test('preference persists across page refresh', async ({ page }) => {
    await page.goto('/settings');

    // Set to Dark
    await page.click('button:has-text("Dark")');

    // Refresh page
    await page.reload();

    // Should still be dark
    const htmlClass = await page.getAttribute('html', 'class');
    expect(htmlClass).toContain('dark');
  });

  test('no theme flash on load with manual preference', async ({ page }) => {
    // Set dark preference via localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme-preference', 'dark'));

    // Track if we ever see light background
    let sawWrongTheme = false;

    // Navigate fresh and check immediately
    await page.goto('/', { waitUntil: 'commit' });

    const bgOnLoad = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--orion-bg').trim();
    });

    // Should be dark immediately, not light
    expect(bgOnLoad).toBe('#121212');
  });

  test('theme selector shows active option with gold accent', async ({ page }) => {
    await page.goto('/settings');

    // Check System is active by default (or whatever the default is)
    const systemButton = page.locator('button:has-text("System")');
    const bgColor = await systemButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    // Gold accent background (D4AF37 converted to RGB)
    expect(bgColor).toContain('212, 175, 55');
  });

  test('transition is 200ms when changing theme', async ({ page }) => {
    await page.goto('/settings');

    const transitionDuration = await page.evaluate(() => {
      const body = document.body;
      return getComputedStyle(body).transitionDuration;
    });

    expect(transitionDuration).toContain('0.2s');
  });
});
```

### UX Specification Reference

From UX Design Specification (ux-design-specification.md) - Dark Mode Support section:

**Detection & Toggle:**
- System preference: `prefers-color-scheme` media query (default)
- **Manual toggle: Settings -> Appearance** (this story)
- Persistence: User preference stored in local settings
- Transition: 200ms crossfade on theme switch

### References

- [Source: thoughts/planning-artifacts/epics.md#Story 1.14: Dark Mode - Manual Toggle]
- [Source: thoughts/planning-artifacts/ux-design-specification.md#Dark Mode Support]
- [Source: thoughts/planning-artifacts/architecture.md#Data Architecture]
- [Source: .ralph/story-chain.md#Story 1.13: Dark Mode - System Detection]

## Story Chain Context

### Prior Decisions to Honor

From **Story 1.13 (Dark Mode - System Detection)**:
- System detection via `@media (prefers-color-scheme: dark)` already implemented
- All `--orion-*` tokens defined with light and dark values
- 200ms theme transition already implemented
- Gold accent (#D4AF37) constant in both modes
- `prefers-reduced-motion` support already implemented
- `<meta name="color-scheme" content="light dark">` already added

From **Story 1.3 (CSS Design Tokens)**:
- Established `--orion-*` naming pattern
- All components use design tokens

### What This Story Establishes

1. **Manual Theme Override:** `.dark` and `.light` CSS classes on `<html>` element
2. **Theme Preference Storage:** SQLite `preferences` table with `theme_preference` key
3. **Fast Initial Load:** localStorage cache prevents FOUC
4. **Theme Zustand Store:** `useThemeStore` for runtime theme state
5. **ThemeProvider Component:** Initializes theme and listens for system changes
6. **ThemeSelector Component:** Three-option segmented control for settings UI
7. **IPC Commands:** `get_theme_preference` and `set_theme_preference` for persistence

### Notes for Next Story (1.15: Global Keyboard Shortcuts)

- ThemeProvider pattern can be extended for other app-level providers
- Settings page now exists - can add keyboard shortcut configuration
- Global hotkey: `Cmd+Opt+O` (default, configurable)
- Consider adding theme toggle keyboard shortcut (e.g., `Cmd+Shift+T`)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
