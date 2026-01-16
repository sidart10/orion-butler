# Story 1.2: Next.js Frontend Integration

Status: ready-for-dev

---

## Story

As a user,
I want the app to display a modern React interface,
So that I have a responsive and familiar web-like experience.

---

## Acceptance Criteria

1. **AC1: Frontend Loads in WebView**
   - **Given** the Tauri shell is running (Story 1.1 complete)
   - **When** the app initializes
   - **Then** the Next.js frontend loads in the webview
   - **And** React components render without hydration errors
   - **And** the frontend communicates with Tauri via IPC

2. **AC2: Error Boundary Protection**
   - **Given** there is a JavaScript error in the frontend
   - **When** the error occurs
   - **Then** it is caught and logged (not silent failure)
   - **And** the app remains functional
   - **And** user sees a friendly error message with recovery option

3. **AC3: Development Hot Reload**
   - **Given** the app is running in development mode
   - **When** I modify a React component
   - **Then** changes appear without full page reload
   - **And** component state is preserved where possible

4. **AC4: Production Build**
   - **Given** the app is built for production
   - **When** the build completes
   - **Then** Next.js outputs static files for Tauri
   - **And** no server-side rendering dependencies remain
   - **And** all assets are bundled correctly

---

## Tasks / Subtasks

- [ ] **Task 1: Next.js 14 App Router Setup** (AC: 1, 3, 4)
  - [ ] 1.1 Initialize Next.js 14 with App Router in project root
  - [ ] 1.2 Configure `next.config.js` for static export (`output: 'export'`)
  - [ ] 1.3 Set up TypeScript configuration (`tsconfig.json`)
  - [ ] 1.4 Configure path aliases (`@/` for `src/`)
  - [ ] 1.5 Add `pnpm` scripts: `dev`, `build`, `lint`

- [ ] **Task 2: Tauri-Next.js Integration** (AC: 1, 3)
  - [ ] 2.1 Update `tauri.conf.json`:
    - Set `build.devUrl` to `"http://localhost:3000"`
    - Set `build.frontendDist` to `"../out"` (Next.js static export)
  - [ ] 2.2 Add `@tauri-apps/api` package for frontend IPC
  - [ ] 2.3 Create `src/lib/tauri.ts` with IPC helper functions
  - [ ] 2.4 Implement basic IPC test: `invoke('greet')` command
  - [ ] 2.5 Add Rust greet command in `src-tauri/src/main.rs` for testing

- [ ] **Task 3: Root Layout and Page Structure** (AC: 1)
  - [ ] 3.1 Create `src/app/layout.tsx` with:
    - HTML lang attribute
    - Font preloading (Google Fonts: Inter, Playfair Display)
    - Viewport meta tags
    - Basic CSS reset
  - [ ] 3.2 Create `src/app/page.tsx` with placeholder content
  - [ ] 3.3 Create `src/app/globals.css` with minimal reset styles
  - [ ] 3.4 Add `src/app/loading.tsx` for loading states

- [ ] **Task 4: Error Boundary Implementation** (AC: 2)
  - [ ] 4.1 Create `src/components/error-boundary.tsx`:
    - React Error Boundary wrapper
    - Friendly error UI with "Try Again" button
    - Error logging to console (with structured format)
  - [ ] 4.2 Create `src/app/error.tsx` (Next.js App Router error page)
  - [ ] 4.3 Create `src/app/global-error.tsx` for root-level errors
  - [ ] 4.4 Add error context provider for centralized error handling
  - [ ] 4.5 Test error boundary with deliberate throw

- [ ] **Task 5: Tauri IPC Communication** (AC: 1)
  - [ ] 5.1 Create `src/lib/tauri.ts` with typed invoke wrapper
  - [ ] 5.2 Implement event listener setup (`listen` from @tauri-apps/api)
  - [ ] 5.3 Create `src/hooks/useTauriEvent.ts` custom hook
  - [ ] 5.4 Test bidirectional IPC:
    - Frontend -> Backend: `invoke` call works
    - Backend -> Frontend: `emit` event received
  - [ ] 5.5 Add IPC status indicator in dev mode

- [ ] **Task 6: Build Configuration for Tauri** (AC: 4)
  - [ ] 6.1 Configure `next.config.js`:
    - `output: 'export'`
    - `distDir: 'out'`
    - `images.unoptimized: true` (required for static export)
    - `trailingSlash: true` (for file:// protocol compatibility)
  - [ ] 6.2 Update `package.json` scripts:
    - `"tauri:dev": "pnpm tauri dev"`
    - `"tauri:build": "pnpm build && pnpm tauri build"`
  - [ ] 6.3 Test production build: verify `out/` directory structure
  - [ ] 6.4 Verify assets load correctly in built app

- [ ] **Task 7: Development Workflow** (AC: 3)
  - [ ] 7.1 Configure concurrent dev scripts:
    - `"dev": "next dev"` (port 3000)
    - Tauri dev watches `http://localhost:3000`
  - [ ] 7.2 Test HMR (Hot Module Replacement) works
  - [ ] 7.3 Verify component state preserves on edit
  - [ ] 7.4 Document development workflow in README

- [ ] **Task 8: Testing Setup** (AC: 1, 2)
  - [ ] 8.1 Verify no React hydration errors in console
  - [ ] 8.2 Test IPC invoke works bidirectionally
  - [ ] 8.3 Test error boundary catches thrown errors
  - [ ] 8.4 Verify hot reload in development mode

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Frontend Framework | Next.js 14 | [architecture.md#3.1] |
| Static Export | Required for Tauri | [architecture.md#1.3] |
| IPC Protocol | Tauri invoke/events | [architecture.md#2.2] |
| TypeScript | Required | [architecture.md#3.2] |
| Package Manager | pnpm | [architecture.md#3.2] |

### Next.js 14 Static Export Requirements

Next.js App Router with static export has specific constraints:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Static HTML export
  distDir: 'out',             // Output to 'out' for Tauri
  images: {
    unoptimized: true,        // Required for static export
  },
  trailingSlash: true,        // Required for file:// protocol
  // No server-side features:
  // - No API routes
  // - No Server Components with async data fetching
  // - No middleware
  // - No ISR/SSR
}

module.exports = nextConfig
```

### Tauri IPC Communication Pattern

```typescript
// src/lib/tauri.ts
import { invoke, listen } from '@tauri-apps/api';

// Frontend -> Backend (invoke)
export async function greet(name: string): Promise<string> {
  return invoke<string>('greet', { name });
}

// Backend -> Frontend (events)
export function onBackendEvent(callback: (payload: unknown) => void) {
  return listen('backend-event', (event) => callback(event.payload));
}
```

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Orion.", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Error Boundary Pattern

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### File Structure for This Story

```
orion/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # CREATE: Root layout with fonts
│   │   ├── page.tsx           # CREATE: Home page (replaces placeholder)
│   │   ├── loading.tsx        # CREATE: Loading state
│   │   ├── error.tsx          # CREATE: Error page
│   │   ├── global-error.tsx   # CREATE: Global error handler
│   │   └── globals.css        # CREATE: Global styles
│   ├── components/
│   │   └── error-boundary.tsx # CREATE: Error boundary component
│   ├── hooks/
│   │   └── useTauriEvent.ts   # CREATE: Tauri event hook
│   └── lib/
│       └── tauri.ts           # CREATE: Tauri IPC helpers
├── src-tauri/
│   ├── src/
│   │   └── main.rs            # MODIFY: Add greet command
│   └── tauri.conf.json        # MODIFY: Configure build paths
├── next.config.js             # CREATE: Next.js configuration
├── tsconfig.json              # CREATE: TypeScript config
└── package.json               # MODIFY: Add dependencies and scripts
```

### Project Structure Notes

- **Dependency**: Requires Story 1.1 (Tauri Desktop Shell) to be complete
- **Parallel**: Story 1.3 (Design System) can proceed in parallel
- **Enables**: Story 1.4 (SQLite) needs frontend for UI testing
- Story 1.9 (Split-Screen Layout) builds directly on this foundation

### Dependencies to Install

```bash
# Next.js and React
pnpm add next@14 react@18 react-dom@18

# Tauri API for frontend
pnpm add @tauri-apps/api@2

# TypeScript types
pnpm add -D typescript @types/react @types/react-dom @types/node

# Development tools (from architecture.md#3.2)
pnpm add -D eslint eslint-config-next prettier
```

### Key Technical Notes

1. **Static Export Limitations**
   - No `getServerSideProps` or `getStaticProps` with revalidate
   - No API routes (`/api/*`) - use Tauri commands instead
   - No Image Optimization API - use `unoptimized: true`
   - All data fetching must be client-side or build-time

2. **Hydration Error Prevention**
   - Avoid `Date.now()` or random values in initial render
   - Use `useEffect` for browser-only code
   - Wrap browser APIs with `typeof window !== 'undefined'` checks
   - Tauri APIs must be called client-side only

3. **IPC Best Practices**
   - Always type IPC payloads with TypeScript
   - Handle IPC errors gracefully (Tauri not available in browser)
   - Use `try/catch` around all `invoke` calls
   - Clean up event listeners on component unmount

4. **Development vs Production**
   - Dev: Next.js dev server at localhost:3000, Tauri loads URL
   - Prod: Static export to `out/`, Tauri bundles files

### Testing Standards

| Test Type | Framework | Files |
|-----------|-----------|-------|
| E2E | Playwright | `tests/e2e/frontend-render.spec.ts` |
| Unit | Vitest | `src/**/*.test.ts` |
| Integration | Playwright | `tests/e2e/ipc-communication.spec.ts` |

### Tests to Implement

```typescript
// tests/e2e/frontend-render.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Next.js Frontend Integration', () => {
  test('frontend renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known non-issues
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('DevTools')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('no React hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('hydration') || msg.text().includes('Hydration')) {
        hydrationErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(hydrationErrors).toHaveLength(0);
  });
});

// tests/e2e/ipc-communication.spec.ts
test.describe('Tauri IPC Communication', () => {
  test('invoke command works from frontend to backend', async ({ page }) => {
    await page.goto('/');

    // This will need actual Tauri test harness
    // For now, verify the frontend initializes IPC
    const result = await page.evaluate(async () => {
      // @ts-ignore - Tauri API
      if (window.__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        return invoke('greet', { name: 'Test' });
      }
      return 'Tauri not available';
    });

    expect(result).toContain('Hello');
  });
});
```

### Hot Reload Verification

```bash
# Development workflow
# Terminal 1: Start Next.js dev server
pnpm dev

# Terminal 2: Start Tauri (connects to dev server)
pnpm tauri dev

# HMR Test:
# 1. Edit src/app/page.tsx
# 2. Save file
# 3. Changes should appear in app without refresh
# 4. Component state should be preserved
```

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#3.1 Core Technologies]
- [Source: thoughts/planning-artifacts/architecture.md#2.2 Process Architecture]
- [Source: thoughts/planning-artifacts/architecture.md#7. Frontend Architecture]
- [Source: thoughts/planning-artifacts/architecture.md#8.2 Frontend-Backend Bridge]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.2: Next.js Frontend Integration]
- [Source: thoughts/planning-artifacts/prd.md#6.1 Platform: macOS Desktop (Tauri)]
- [Source: thoughts/implementation-artifacts/stories/story-1-1-tauri-desktop-shell.md] (predecessor story)

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
| 2026-01-15 | Story created with comprehensive Next.js/Tauri integration context | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
