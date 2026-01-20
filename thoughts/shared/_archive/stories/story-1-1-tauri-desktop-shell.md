# Story 1.1: Tauri Desktop Shell

Status: done

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

- [x] **Task 1: Tauri 2.0 Project Scaffolding** (AC: 1)
  - [x] 1.1 Initialize Tauri 2.0 project with `pnpm create tauri-app@latest` using `pnpm` preset
  - [x] 1.2 Configure Rust toolchain for macOS (stable channel)
  - [x] 1.3 Set up pnpm workspace configuration in `pnpm-workspace.yaml`
  - [x] 1.4 Verify Tauri CLI is installed: `pnpm tauri --version`

- [x] **Task 2: Configure tauri.conf.json** (AC: 1, 2)
  - [x] 2.1 Set `productName` to "Orion"
  - [x] 2.2 Set `identifier` to "com.orion.butler"
  - [x] 2.3 Configure window dimensions: width=1400, height=900, minWidth=1200, minHeight=800
  - [x] 2.4 Set `titleBarStyle` to "Overlay" for native macOS look
  - [x] 2.5 Set `decorations: true`, `resizable: true`
  - [x] 2.6 Configure bundle targets: `["dmg", "app"]`
  - [x] 2.7 Set `macOS.minimumSystemVersion` to "12.0"
  - [x] 2.8 Configure icon paths in bundle section

- [x] **Task 3: Create App Icons** (AC: 1)
  - [x] 3.1 Create icon set in `src-tauri/icons/`:
    - 32x32.png
    - 128x128.png
    - 128x128@2x.png
    - icon.icns (macOS app icon)
    - tray.png (for system tray)
  - [x] 3.2 Use placeholder icons initially (can be replaced later)

- [x] **Task 4: Rust Main Process Setup** (AC: 1, 2)
  - [x] 4.1 Create `src-tauri/src/main.rs` with basic Tauri builder
  - [x] 4.2 Implement `setup` hook for initialization
  - [x] 4.3 Implement `on_window_event` handler for `CloseRequested`
  - [x] 4.4 Add logging for startup/shutdown events

- [x] **Task 5: Basic Frontend Placeholder** (AC: 1)
  - [x] 5.1 Create minimal `src/` directory with Next.js stub
  - [x] 5.2 Add simple index page that displays "Orion Loading..."
  - [x] 5.3 Configure `build.frontendDist` to point to Next.js output
  - [x] 5.4 Configure `build.devUrl` to "http://localhost:3000"

- [x] **Task 6: macOS Entitlements** (AC: 1, 2)
  - [x] 6.1 Create `src-tauri/Entitlements.plist` with required capabilities:
    - `com.apple.security.network.client` (for future API calls)
    - `com.apple.security.files.user-selected.read-write`
    - `com.apple.security.files.bookmarks.app-scope`

- [x] **Task 7: Build and Test** (AC: 1, 2)
  - [x] 7.1 Run `pnpm tauri dev` - verify hot reload works
  - [x] 7.2 Run `pnpm tauri build` - verify DMG is created
  - [x] 7.3 Install built app and verify Dock icon appears
  - [x] 7.4 Measure launch time (must be < 3 seconds) - **636ms achieved**
  - [x] 7.5 Verify clean exit with no error logs

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
| E2E | Vercel Browser Agent | `tests/e2e/app-launch.spec.ts` |
| Unit (Rust) | cargo test | `src-tauri/src/main.rs` |

### Tests to Implement

```typescript
// tests/e2e/app-launch.spec.ts
// Using Vercel Browser Agent per architecture.md;

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

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Rust tests: `cd src-tauri && cargo test` - 5 tests pass (3 lib.rs + 2 main.rs)
- Unit tests: `pnpm vitest run tests/unit/story-1.1-config.test.ts` - 50 tests pass
- Integration tests: `pnpm vitest run tests/integration/` - 43 tests pass
- Launch time measurement: 636ms (well under 3000ms NFR-P003 threshold)

### Completion Notes List

1. **Tauri 2.0 Config Changes**: The Tauri 2.0 plugin configuration differs significantly from documented examples. Plugins are initialized in Rust code using `tauri_plugin_*` crates, not via config file declarations. The `plugins` section in tauri.conf.json should be empty `{}` to avoid deserialization errors.

2. **Next.js Static Export**: Configured Next.js with `output: 'export'` for static generation to `out/` directory, which Tauri serves.

3. **RGBA Icons Required**: Tauri requires RGBA PNG format for icons. Simple RGB PNGs cause build failures.

4. **Pages Directory Conflict**: Renamed existing HTML mockup `pages/` directory to `design-mockups/` to avoid Next.js conflict.

5. **Launch Time**: Achieved 636ms launch time, significantly under the 3 second NFR-P003 requirement.

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Story created with comprehensive context | SM Agent (Bob) |
| 2026-01-15 | Implemented all tasks, all tests passing | Dev Agent (Amelia) |
| 2026-01-15 | Code review fixes: schema URL, tray icon config, E2E tests, Rust tests improved | Dev Agent (Amelia) |

### File List

**Created:**
- `src-tauri/tauri.conf.json` - Tauri 2.0 configuration
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/build.rs` - Tauri build script
- `src-tauri/src/main.rs` - Main Rust entry point with event handlers
- `src-tauri/src/lib.rs` - Shared config constants and validation
- `src-tauri/Entitlements.plist` - macOS entitlements
- `src-tauri/icons/32x32.png` - App icon (placeholder)
- `src-tauri/icons/128x128.png` - App icon (placeholder)
- `src-tauri/icons/128x128@2x.png` - App icon retina (placeholder)
- `src-tauri/icons/icon.icns` - macOS app icon (placeholder)
- `src-tauri/icons/tray.png` - System tray icon (placeholder)
- `src/app/layout.tsx` - Next.js root layout
- `src/app/page.tsx` - Minimal placeholder page
- `pnpm-workspace.yaml` - pnpm workspace config
- `next.config.ts` - Next.js configuration
- `.env.example` - Environment template
- `tests/unit/story-1.1-config.test.ts` - 50 unit tests for config validation
- `tests/e2e/story-1.1-tauri-shell.spec.ts` - E2E tests for app launch/shutdown
- `tests/integration/story-1.1-launch-errors.test.ts` - Launch error prevention tests (20 tests)
- `tests/integration/story-1.1-shutdown.test.ts` - Shutdown handler validation tests (23 tests)

**Modified:**
- `package.json` - Added Tauri scripts, Next.js, React dependencies
- `tsconfig.json` - Updated for Next.js compatibility
- `design-mockups/` - Renamed from `pages/` to avoid Next.js conflict
- `src-tauri/tauri.conf.json` - Updated schema URL to stable, added tray icon config
- `src-tauri/Cargo.toml` - Added tray-icon feature to tauri dependency
- `src-tauri/src/main.rs` - Improved Rust tests with meaningful assertions

**Build Outputs:**
- `src-tauri/target/release/bundle/macos/Orion.app` - macOS app bundle
- `src-tauri/target/release/bundle/dmg/Orion_0.1.0_aarch64.dmg` - DMG installer
