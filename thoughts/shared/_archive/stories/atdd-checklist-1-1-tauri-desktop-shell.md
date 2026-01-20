# ATDD Checklist: 1-1-tauri-desktop-shell

**Story:** Tauri Desktop Shell
**Version:** 1.0
**Date:** 2026-01-15
**Author:** TEA (Test Architect Agent)
**Status:** Ready for Implementation

---

## Overview

This checklist provides comprehensive test scenarios for Story 1.1: Tauri Desktop Shell. Tests follow ATDD (Acceptance Test Driven Development) methodology - all tests should be implemented BEFORE story code implementation.

### Coverage Summary

| AC | Happy Path | Edge Cases | Error Handling | Total |
|----|-----------|------------|----------------|-------|
| AC1 | 3 | 4 | 2 | 9 |
| AC2 | 2 | 3 | 2 | 7 |
| **Total** | **5** | **7** | **4** | **16** |

---

## AC1: App Launch from Icon

**Acceptance Criterion:**
> Given Orion is installed on macOS 12+
> When I double-click the app icon or launch from Spotlight
> Then the application window opens within 3 seconds
> And the window has correct dimensions (minimum 1200x800)
> And the app appears in the Dock with the Orion icon

---

### Happy Path Tests

- [x] **Test 1.1.1: App launches successfully from icon**
  - **Given:** Orion.app is installed in /Applications on macOS 12+
  - **When:** User double-clicks the Orion app icon
  - **Then:** The main application window appears and is visible
  - **Test Type:** E2E (Playwright + Tauri driver)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

- [x] **Test 1.1.2: App launches within NFR-P003 threshold (< 3 seconds)**
  - **Given:** Orion.app is installed and not running
  - **When:** Application process is started
  - **Then:** First window is visible and DOM is loaded within 3000ms
  - **Test Type:** E2E (Playwright timing API)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`
  - **NFR Reference:** NFR-P003

```typescript
test('1.1.2 - app launches within 3 seconds (NFR-P003)', async () => {
  const startTime = Date.now();

  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  const launchTime = Date.now() - startTime;

  expect(launchTime).toBeLessThan(3000);
  console.log(`Launch time: ${launchTime}ms`);

  await app.close();
});
```

- [x] **Test 1.1.3: Window has correct minimum dimensions**
  - **Given:** Orion app is launched and window is visible
  - **When:** Window dimensions are measured
  - **Then:** Width >= 1200px AND Height >= 800px
  - **Test Type:** E2E (Playwright)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

```typescript
test('1.1.3 - window has minimum dimensions', async () => {
  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  const window = await app.firstWindow();
  const size = await window.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  expect(size.width).toBeGreaterThanOrEqual(1200);
  expect(size.height).toBeGreaterThanOrEqual(800);

  await app.close();
});
```

---

### Edge Cases

- [ ] **Test 1.1.4: App launches on macOS 12 Monterey (minimum supported)**
  - **Given:** macOS 12.0 Monterey is the host OS
  - **When:** Orion.app is launched
  - **Then:** App opens without compatibility warnings or crashes
  - **Test Type:** E2E (CI matrix on macOS 12)
  - **Notes:** Test on actual macOS 12 runner in CI

- [ ] **Test 1.1.5: App launches on macOS 13+ (Ventura/Sonoma/Sequoia)**
  - **Given:** macOS 13+ is the host OS
  - **When:** Orion.app is launched
  - **Then:** App opens without compatibility warnings or crashes
  - **Test Type:** E2E (CI matrix on latest macOS)
  - **Notes:** Test on macOS-14 (Sonoma) runner in CI

- [x] **Test 1.1.6: Window respects minimum size on resize attempt**
  - **Given:** Orion app window is open
  - **When:** User attempts to resize window smaller than 1200x800
  - **Then:** Window refuses to resize below minimum dimensions
  - **Test Type:** E2E (Playwright)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

```typescript
test('1.1.6 - window respects minimum size constraints', async () => {
  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  const window = await app.firstWindow();

  // Attempt to resize below minimum
  await window.setViewportSize({ width: 800, height: 600 });

  // Wait for resize to settle
  await window.waitForTimeout(100);

  const size = await window.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  // Should be clamped to minimum
  expect(size.width).toBeGreaterThanOrEqual(1200);
  expect(size.height).toBeGreaterThanOrEqual(800);

  await app.close();
});
```

- [ ] **Test 1.1.7: App icon appears in Dock during runtime**
  - **Given:** Orion app is running
  - **When:** User checks macOS Dock
  - **Then:** Orion icon is visible in the Dock
  - **Test Type:** Manual verification (document in test report)
  - **Notes:** Verify icon.icns is correctly bundled and displayed

---

### Error Handling

- [x] **Test 1.1.8: Launch failure produces meaningful error log**
  - **Given:** A condition that would cause launch failure (corrupted binary, missing dependency)
  - **When:** Launch is attempted
  - **Then:** Error is logged with descriptive message (not silent failure)
  - **Test Type:** Integration (log inspection)
  - **File:** `tests/integration/story-1.1-launch-errors.spec.ts`

- [ ] **Test 1.1.9: Missing frontend gracefully shows placeholder**
  - **Given:** Frontend build output is missing or corrupted
  - **When:** Tauri shell launches
  - **Then:** A fallback placeholder is shown instead of blank white screen
  - **Test Type:** Integration
  - **Notes:** Validates tauri.conf.json `build.frontendDist` fallback behavior

---

## AC2: Graceful Shutdown

**Acceptance Criterion:**
> Given the app is running
> When I close the window
> Then the app quits gracefully without errors

---

### Happy Path Tests

- [x] **Test 1.2.1: App quits cleanly with exit code 0**
  - **Given:** Orion app is running with window visible
  - **When:** User closes the window (click X button or Cmd+Q)
  - **Then:** Process exits with code 0 (success)
  - **Test Type:** E2E (Playwright + process check)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

```typescript
test('1.2.1 - app quits cleanly with exit code 0', async () => {
  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('load');

  // Close the app
  const exitCode = await app.close();

  // Exit code should be 0
  expect(exitCode).toBe(0);
});
```

- [x] **Test 1.2.2: No orphan processes after quit**
  - **Given:** Orion app was running
  - **When:** App is closed
  - **Then:** No Orion-related processes remain running (check via pgrep)
  - **Test Type:** E2E (Bash + process inspection)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

```typescript
test('1.2.2 - no orphan processes after quit', async () => {
  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('load');

  // Close and verify cleanup
  await app.close();

  // Wait for process cleanup
  await new Promise(r => setTimeout(r, 1000));

  // Check for orphan processes
  const orphanCheck = execSync('pgrep -f "Orion" || echo "none"').toString().trim();
  expect(orphanCheck).toBe('none');
});
```

---

### Edge Cases

- [x] **Test 1.2.3: Multiple close attempts are idempotent**
  - **Given:** Orion app is running
  - **When:** Close is requested multiple times rapidly
  - **Then:** App closes once without crash or error
  - **Test Type:** E2E
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

- [ ] **Test 1.2.4: Force quit (Cmd+Option+Escape) terminates cleanly**
  - **Given:** Orion app is running
  - **When:** User force quits via macOS Force Quit menu
  - **Then:** Process terminates, no zombie processes
  - **Test Type:** Manual verification
  - **Notes:** Document behavior in test report

- [x] **Test 1.2.5: Close during startup is handled**
  - **Given:** Orion app is in the process of launching
  - **When:** User attempts to close before fully loaded
  - **Then:** App terminates without crash or hang
  - **Test Type:** E2E (race condition test)
  - **File:** `tests/e2e/story-1.1-tauri-shell.spec.ts`

```typescript
test('1.2.5 - close during startup is handled', async () => {
  const app = await electron.launch({
    args: ['./src-tauri/target/release/bundle/macos/Orion.app/Contents/MacOS/Orion'],
  });

  // Don't wait for load - close immediately
  const window = await app.firstWindow();

  // Close as soon as window reference is available (before load)
  const exitCode = await app.close();

  // Should exit cleanly (0 or undefined)
  expect([0, undefined]).toContain(exitCode);
});
```

---

### Error Handling

- [x] **Test 1.2.6: Shutdown logs are written without errors**
  - **Given:** Orion app is running
  - **When:** App is closed
  - **Then:** Shutdown event is logged in Rust logs (no error messages)
  - **Test Type:** Integration (log inspection)
  - **Notes:** Verify `on_window_event(CloseRequested)` handler logs correctly

- [x] **Test 1.2.7: Shutdown completes even if frontend has errors**
  - **Given:** Orion app is running with JavaScript errors in console
  - **When:** User closes the window
  - **Then:** App still quits gracefully (frontend errors don't block shutdown)
  - **Test Type:** Integration
  - **File:** `tests/integration/story-1.1-shutdown.spec.ts`

---

## Unit Test Coverage

These unit tests validate Tauri configuration and Rust components:

- [x] **Test 1.U.1: tauri.conf.json has correct window dimensions**
  - **Test Type:** Unit (Vitest config validation)
  - **File:** `tests/unit/story-1.1-config.spec.ts`

```typescript
test('1.U.1 - tauri.conf.json has correct window config', () => {
  const config = JSON.parse(fs.readFileSync('./src-tauri/tauri.conf.json', 'utf-8'));

  const windowConfig = config.app.windows[0];

  expect(windowConfig.width).toBe(1400);
  expect(windowConfig.height).toBe(900);
  expect(windowConfig.minWidth).toBe(1200);
  expect(windowConfig.minHeight).toBe(800);
  expect(windowConfig.resizable).toBe(true);
  expect(windowConfig.decorations).toBe(true);
  expect(windowConfig.titleBarStyle).toBe('Overlay');
});
```

- [x] **Test 1.U.2: macOS minimum version is 12.0**
  - **Test Type:** Unit (Vitest config validation)

```typescript
test('1.U.2 - macOS minimum version is 12.0', () => {
  const config = JSON.parse(fs.readFileSync('./src-tauri/tauri.conf.json', 'utf-8'));

  expect(config.bundle.macOS.minimumSystemVersion).toBe('12.0');
});
```

- [x] **Test 1.U.3: Product name and identifier are correct**
  - **Test Type:** Unit (Vitest config validation)

```typescript
test('1.U.3 - product name and identifier are correct', () => {
  const config = JSON.parse(fs.readFileSync('./src-tauri/tauri.conf.json', 'utf-8'));

  expect(config.productName).toBe('Orion');
  expect(config.identifier).toBe('com.orion.butler');
});
```

- [x] **Test 1.U.4: Icon files exist at required paths**
  - **Test Type:** Unit (file existence check)

```typescript
test('1.U.4 - required icon files exist', () => {
  const iconDir = './src-tauri/icons/';

  expect(fs.existsSync(path.join(iconDir, '32x32.png'))).toBe(true);
  expect(fs.existsSync(path.join(iconDir, '128x128.png'))).toBe(true);
  expect(fs.existsSync(path.join(iconDir, '128x128@2x.png'))).toBe(true);
  expect(fs.existsSync(path.join(iconDir, 'icon.icns'))).toBe(true);
});
```

---

## Test Execution Plan

### Phase 1: Unit Tests (Before Implementation)
1. Run config validation tests against tauri.conf.json template
2. Verify icon placeholder files exist

### Phase 2: Integration Tests (During Implementation)
1. Test Rust main.rs builds without errors
2. Test shutdown handler logging

### Phase 3: E2E Tests (After Implementation)
1. Run full launch/shutdown cycle tests
2. Performance timing tests for NFR-P003
3. Window dimension validation

### CI Configuration

```yaml
# Run on macOS-14 (Sonoma) for Tauri E2E tests
jobs:
  story-1.1-tests:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit -- --grep "story-1.1"
      - run: pnpm tauri build
      - run: pnpm test:e2e -- --grep "story-1.1"
```

---

## Traceability Matrix

| Test ID | AC | Requirement | NFR | Status |
|---------|-----|-------------|-----|--------|
| 1.1.1 | AC1 | App launches | - | Implemented |
| 1.1.2 | AC1 | Launch < 3s | NFR-P003 | Implemented |
| 1.1.3 | AC1 | Min dimensions | - | Implemented |
| 1.1.4 | AC1 | macOS 12 compat | - | CI-only |
| 1.1.5 | AC1 | macOS 13+ compat | - | CI-only |
| 1.1.6 | AC1 | Min size enforce | - | Implemented |
| 1.1.7 | AC1 | Dock icon | - | Manual |
| 1.1.8 | AC1 | Launch error log | - | Implemented |
| 1.1.9 | AC1 | Frontend fallback | - | Implemented |
| 1.2.1 | AC2 | Exit code 0 | - | Implemented |
| 1.2.2 | AC2 | No orphans | - | Implemented |
| 1.2.3 | AC2 | Idempotent close | - | Implemented |
| 1.2.4 | AC2 | Force quit | - | Manual |
| 1.2.5 | AC2 | Close during startup | - | Implemented |
| 1.2.6 | AC2 | Shutdown logs | - | Implemented |
| 1.2.7 | AC2 | Frontend errors | - | Implemented |

---

## Gate Criteria

Before story can be marked complete:

- [ ] All 16 tests pass (5 happy path + 7 edge cases + 4 error handling)
- [ ] Launch time < 3 seconds (NFR-P003) verified
- [ ] No P0/P1 bugs open
- [ ] Manual verification of Dock icon appearance documented

---

**Document Status:** Tests Implemented
**Next Step:** Verify all tests pass

_Generated by TEA (Test Architect Agent) - 2026-01-15_
