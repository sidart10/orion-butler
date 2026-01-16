# Story 1.1: Tauri Desktop Shell

Status: ready-for-dev

---

## Story

As a user,
I want to launch Orion as a native macOS application,
So that I have a dedicated desktop experience for my AI butler.

---

## Acceptance Criteria

1. **AC1: App Launch from Icon**
   - **Given** Orion is installed on macOS 12+
   - **When** I double-click the app icon or launch from Spotlight
   - **Then** the application window opens within 3 seconds
   - **And** the window has correct dimensions (minimum 1200x800)
   - **And** the app appears in the Dock with the Orion icon

2. **AC2: Graceful Shutdown**
   - **Given** the app is running
   - **When** I close the window
   - **Then** the app quits gracefully without errors

---

## Tasks / Subtasks

- [ ] **Task 1: Tauri 2.0 Project Scaffolding** (AC: 1)
  - [ ] 1.1 Initialize Tauri 2.0 project with `pnpm create tauri-app@latest` using `pnpm` preset
  - [ ] 1.2 Configure Rust toolchain for macOS (stable channel)
  - [ ] 1.3 Set up pnpm workspace configuration in `pnpm-workspace.yaml`
  - [ ] 1.4 Verify Tauri CLI is installed: `pnpm tauri --version`

- [ ] **Task 2: Configure tauri.conf.json** (AC: 1, 2)
  - [ ] 2.1 Set `productName` to "Orion"
  - [ ] 2.2 Set `identifier` to "com.orion.butler"
  - [ ] 2.3 Configure window dimensions: width=1400, height=900, minWidth=1200, minHeight=800
  - [ ] 2.4 Set `titleBarStyle` to "Overlay" for native macOS look
  - [ ] 2.5 Set `decorations: true`, `resizable: true`
  - [ ] 2.6 Configure bundle targets: `["dmg", "app"]`
  - [ ] 2.7 Set `macOS.minimumSystemVersion` to "12.0"
  - [ ] 2.8 Configure icon paths in bundle section

- [ ] **Task 3: Create App Icons** (AC: 1)
  - [ ] 3.1 Create icon set in `src-tauri/icons/`:
    - 32x32.png
    - 128x128.png
    - 128x128@2x.png
    - icon.icns (macOS app icon)
    - tray.png (for system tray)
  - [ ] 3.2 Use placeholder icons initially (can be replaced later)

- [ ] **Task 4: Rust Main Process Setup** (AC: 1, 2)
  - [ ] 4.1 Create `src-tauri/src/main.rs` with basic Tauri builder
  - [ ] 4.2 Implement `setup` hook for initialization
  - [ ] 4.3 Implement `on_window_event` handler for `CloseRequested`
  - [ ] 4.4 Add logging for startup/shutdown events

- [ ] **Task 5: Basic Frontend Placeholder** (AC: 1)
  - [ ] 5.1 Create minimal `src/` directory with Next.js stub
  - [ ] 5.2 Add simple index page that displays "Orion Loading..."
  - [ ] 5.3 Configure `build.frontendDist` to point to Next.js output
  - [ ] 5.4 Configure `build.devUrl` to "http://localhost:3000"

- [ ] **Task 6: macOS Entitlements** (AC: 1, 2)
  - [ ] 6.1 Create `src-tauri/Entitlements.plist` with required capabilities:
    - `com.apple.security.network.client` (for future API calls)
    - `com.apple.security.files.user-selected.read-write`
    - `com.apple.security.files.bookmarks.app-scope`

- [ ] **Task 7: Build and Test** (AC: 1, 2)
  - [ ] 7.1 Run `pnpm tauri dev` - verify hot reload works
  - [ ] 7.2 Run `pnpm tauri build` - verify DMG is created
  - [ ] 7.3 Install built app and verify Dock icon appears
  - [ ] 7.4 Measure launch time (must be < 3 seconds)
  - [ ] 7.5 Verify clean exit with no error logs

---

## Dev Notes

### Critical Architecture Constraints

| Constraint | Requirement | Source |
|------------|-------------|--------|
| Desktop Framework | Tauri 2.0 | [architecture.md#1.3] |
| Minimum macOS | 12.0 (Monterey) | [architecture.md#8.1] |
| Package Manager | pnpm | [architecture.md#3.2] |
| Window Min Size | 1200x800 | [epics.md#Story 1.1] |
| Launch Time | < 3 seconds | NFR-P003 |

### Tauri 2.0 Specifics (2026)

Tauri 2.0 has breaking changes from 1.x:
- Config file schema changed: use `$schema: "https://tauri.app/v2/tauri.conf.json"`
- Plugin system is completely different - plugins declared in `plugins` section
- `app.windows` replaces `tauri.windows`
- `app.security.csp` replaces `tauri.security.csp`
- `bundle.macOS` replaces `tauri.bundle.macOS`

### Window Configuration (from Architecture)

```json
{
  "app": {
    "windows": [{
      "title": "Orion",
      "width": 1400,
      "height": 900,
      "minWidth": 1200,
      "minHeight": 800,
      "resizable": true,
      "fullscreen": false,
      "decorations": true,
      "transparent": false,
      "titleBarStyle": "Overlay"
    }]
  }
}
```

### File Structure for This Story

```
orion/
├── src-tauri/
│   ├── src/
│   │   └── main.rs           # CREATE: Basic Tauri entry point
│   ├── icons/
│   │   ├── 32x32.png         # CREATE: App icons
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── icon.icns
│   │   └── tray.png
│   ├── tauri.conf.json       # CREATE: Tauri configuration
│   ├── Cargo.toml            # CREATE: Rust dependencies
│   └── Entitlements.plist    # CREATE: macOS entitlements
├── src/
│   └── app/
│       └── page.tsx          # CREATE: Minimal placeholder page
├── package.json              # MODIFY: Add tauri scripts
├── pnpm-workspace.yaml       # CREATE: Workspace config
└── .env.example              # CREATE: Environment template
```

### Project Structure Notes

- This is the foundation story - creates the Tauri shell that all other stories build upon
- Story 1.2 (Next.js Frontend Integration) depends on this story completing first
- Story 1.3 (Design System Foundation) can be developed in parallel
- The placeholder frontend will be replaced by Story 1.2

### Technical Notes

1. **Tauri 2.0 CLI Installation**
   ```bash
   pnpm add -D @tauri-apps/cli@next
   ```

2. **Rust Toolchain**
   - Requires Rust stable (not nightly)
   - macOS requires Xcode Command Line Tools

3. **Launch Time Measurement**
   - Measure from process start to first window paint
   - Use `console.time()` in frontend or Rust logging
   - Target: < 3 seconds (NFR-P003)

4. **Graceful Shutdown**
   - Must handle `CloseRequested` event
   - Future stories will add agent server cleanup here (Story 1.5)

### Testing Standards

| Test Type | Framework | Files |
|-----------|-----------|-------|
| E2E | Playwright | `tests/e2e/app-launch.spec.ts` |
| Unit (Rust) | cargo test | `src-tauri/src/main.rs` |

### Tests to Implement

```typescript
// tests/e2e/app-launch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('App Launch', () => {
  test('launches within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    // Launch app and wait for window
    const launchTime = Date.now() - startTime;
    expect(launchTime).toBeLessThan(3000);
  });

  test('window has minimum dimensions', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(1200);
    expect(viewport?.height).toBeGreaterThanOrEqual(800);
  });

  test('app quits cleanly', async ({ page }) => {
    // Close window and verify no error dialogs
    await page.close();
    // Check exit code is 0
  });
});
```

---

### References

- [Source: thoughts/planning-artifacts/architecture.md#8. Tauri Integration]
- [Source: thoughts/planning-artifacts/architecture.md#8.1 Tauri Configuration]
- [Source: thoughts/planning-artifacts/architecture.md#16. File Structure]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.1: Tauri Desktop Shell]
- [Source: thoughts/planning-artifacts/prd.md#2.3 Key Differentiators - Desktop Native]
- [Source: thoughts/planning-artifacts/architecture.md#3.1 Core Technologies]

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
| 2026-01-15 | Story created with comprehensive context | SM Agent (Bob) |

### File List

(To be filled during implementation - track all files created/modified)
