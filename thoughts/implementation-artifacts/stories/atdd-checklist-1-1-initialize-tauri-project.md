# ATDD Checklist: 1.1-initialize-tauri-project

**Story:** Initialize Tauri Project
**Status:** Ready for Development
**Test Architect:** TEA (Master Test Architect)
**Generated:** 2026-01-24

---

## Overview

This checklist covers all test scenarios for Story 1.1, which scaffolds the foundational Tauri 2.0 + Next.js 15 + shadcn/ui project structure. As the first story in Epic 1, this establishes test conventions for subsequent stories.

### Test Coverage Summary

| Category | Implemented | Planned | Frameworks |
|----------|-------------|---------|------------|
| Unit Tests | 28 | 37 | Vitest |
| Integration Tests | 5 | 7 | Vitest |
| E2E Tests | 3 | 5 | Playwright |
| **Total** | **36** | **49** | |

**Note:** Implemented counts reflect tests currently in test files. Planned counts include all scenarios in this checklist.

### Test ID Convention

```
1.1-{LEVEL}-{SEQ}

Examples:
1.1-UNIT-001  -> Story 1.1, Unit test #1
1.1-INT-001   -> Story 1.1, Integration test #1
1.1-E2E-001   -> Story 1.1, E2E test #1
```

### Test ID Mapping (Legacy to Standard)

The following mapping correlates legacy test IDs (used in existing test files) to the standard story-based format:

| Legacy ID | Standard ID | Test File |
|-----------|-------------|-----------|
| PS-001 | 1.1-UNIT-001 | project-structure.spec.ts |
| PS-002 | 1.1-UNIT-002 | project-structure.spec.ts |
| PS-003 | 1.1-UNIT-003 | project-structure.spec.ts |
| PS-004 | 1.1-UNIT-004 | project-structure.spec.ts |
| PS-005 | 1.1-UNIT-005 | project-structure.spec.ts |
| PS-006 | 1.1-UNIT-006 | project-structure.spec.ts |
| PS-007 | 1.1-UNIT-007 | project-structure.spec.ts |
| PS-008 | 1.1-UNIT-035 | project-structure.spec.ts |
| PS-009 | 1.1-UNIT-008 | project-structure.spec.ts (TO ADD) |
| PS-010 | 1.1-UNIT-009 | project-structure.spec.ts (TO ADD) |
| PS-011 | 1.1-UNIT-010 | project-structure.spec.ts (TO ADD) |
| CV-001 | 1.1-UNIT-011 | config-validation.spec.ts |
| CV-002 | 1.1-UNIT-012 | config-validation.spec.ts |
| CV-003 | 1.1-UNIT-013 | config-validation.spec.ts |
| CV-004 | 1.1-UNIT-014 | config-validation.spec.ts |
| CV-005 | 1.1-UNIT-018 | config-validation.spec.ts |
| CV-006 | 1.1-UNIT-019 | config-validation.spec.ts |
| CV-007 | 1.1-UNIT-025 | config-validation.spec.ts |
| CV-008 | 1.1-UNIT-021 | config-validation.spec.ts |
| CV-009 | 1.1-UNIT-022 | config-validation.spec.ts |
| CV-010 | 1.1-UNIT-023 | config-validation.spec.ts |
| CV-011 | 1.1-UNIT-015 | config-validation.spec.ts |
| CV-012 | 1.1-UNIT-026 | config-validation.spec.ts |
| CV-013 | 1.1-UNIT-016 | config-validation.spec.ts (TO ADD) |
| CV-014 | 1.1-UNIT-020 | config-validation.spec.ts (TO ADD) |
| CV-015 | 1.1-UNIT-024 | config-validation.spec.ts (TO ADD) |
| CV-016 | 1.1-UNIT-036 | config-validation.spec.ts (TO ADD) |
| CV-017 | 1.1-UNIT-037 | config-validation.spec.ts (TO ADD) |
| DS-001 | 1.1-UNIT-027 | design-system.spec.ts |
| DS-002 | 1.1-UNIT-028 | design-system.spec.ts |
| DS-003 | 1.1-UNIT-029 | design-system.spec.ts |
| DS-004 | 1.1-UNIT-030 | design-system.spec.ts |
| DS-005 | 1.1-UNIT-031 | design-system.spec.ts |
| DS-006 | 1.1-UNIT-032 | design-system.spec.ts |
| DS-007 | 1.1-UNIT-033 | design-system.spec.ts |
| DS-008 | 1.1-UNIT-034 | design-system.spec.ts |
| BP-001 | 1.1-INT-001 | build-process.spec.ts |
| BP-002 | 1.1-INT-002 | build-process.spec.ts |
| BP-003 | 1.1-INT-003 | build-process.spec.ts |
| BP-004 | 1.1-INT-004 | build-process.spec.ts |
| BP-005 | 1.1-INT-005 | build-process.spec.ts |
| CS-001 | 1.1-E2E-001 | cold-start.spec.ts |
| CS-002 | 1.1-E2E-002 | cold-start.spec.ts |
| CS-003 | 1.1-E2E-003 | cold-start.spec.ts |
| - | 1.1-INT-006 | build-process.spec.ts (TO ADD) |
| - | 1.1-INT-007 | dependency-check.spec.ts (TO ADD - file needs creation) |
| - | 1.1-E2E-004 | cold-start.spec.ts (TO ADD) |
| - | 1.1-E2E-005 | cold-start.spec.ts (TO ADD) |

**Rationale:** Legacy IDs (PS-XXX, CV-XXX, etc.) were established before the story-based convention. Both formats are valid; the mapping ensures traceability. Entries with "-" legacy ID indicate new tests planned using only the story-based format.

---

## AC1: Project Structure Created

> **Given** no project exists
> **When** I run `npx create-tauri-ui@latest orion --template next`
> **Then** the project structure is created with Tauri 2.0, Next.js 15, shadcn/ui, and TypeScript

### Happy Path Tests

- [x] **1.1-UNIT-001 (PS-001):** Verify src-tauri directory exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src-tauri/` directory
  - **Then:** Directory exists and is not empty
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-002 (PS-002):** Verify src directory for Next.js exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src/` directory
  - **Then:** Directory exists with App Router structure
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-003 (PS-003):** Verify app directory for App Router exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src/app/` directory
  - **Then:** Directory exists with layout.tsx and page.tsx
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-004 (PS-004):** Verify Tauri Cargo.toml exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src-tauri/Cargo.toml`
  - **Then:** File exists with valid TOML structure
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-005 (PS-005):** Verify tauri.conf.json exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src-tauri/tauri.conf.json`
  - **Then:** File exists with valid JSON structure
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-006 (PS-006):** Verify components directory exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src/components/`
  - **Then:** Directory exists for shadcn/ui components
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [x] **1.1-UNIT-007 (PS-007):** Verify lib directory exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src/lib/`
  - **Then:** Directory exists for utility functions
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

### Edge Cases

- [ ] **1.1-UNIT-008 (PS-009):** Verify icons directory exists in src-tauri **TO ADD**
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src-tauri/icons/`
  - **Then:** Directory exists and contains at least one .png or .icns file
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

- [ ] **1.1-UNIT-009 (PS-010):** Verify main.rs exists in Tauri src **TO ADD**
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for `src-tauri/src/main.rs`
  - **Then:** File exists and contains `fn main()` entry point
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

### Error Handling

- [ ] **1.1-UNIT-010 (PS-011):** Graceful error when src-tauri missing **TO ADD**
  - **Given:** A mock project directory without src-tauri
  - **When:** Running `tauri info` command in that directory
  - **Then:** Exit code is non-zero and stderr contains "not found" or "doesn't exist" or "could not find"
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`
  - **Note:** Uses subprocess to capture Tauri CLI error output

---

## AC2: Dependencies Configured Correctly

> **And** the scaffold includes required dependencies in package.json

### Happy Path Tests

- [x] **1.1-UNIT-011 (CV-001):** Verify package.json has required fields
  - **Given:** Project scaffold has been executed
  - **When:** Reading package.json
  - **Then:** name is "orion-personal-butler", version and scripts are defined
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-012 (CV-002):** Verify Tauri scripts exist
  - **Given:** package.json exists
  - **When:** Checking scripts section
  - **Then:** "tauri", "tauri:dev", "tauri:build" scripts are defined
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-013 (CV-003):** Verify React and Next.js dependencies
  - **Given:** package.json exists
  - **When:** Checking dependencies section
  - **Then:** "react" and "next" are defined with correct versions
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-014 (CV-004):** Verify Tauri devDependencies
  - **Given:** package.json exists
  - **When:** Checking devDependencies section
  - **Then:** "@tauri-apps/cli", "@tauri-apps/api", "typescript" are defined
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-015 (CV-011):** Verify existing dependencies preserved
  - **Given:** package.json exists
  - **When:** Checking for pre-existing dependencies
  - **Then:** "@anthropic-ai/claude-agent-sdk", "zustand", "zod" are preserved
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

### Edge Cases

- [ ] **1.1-UNIT-016 (CV-013):** Verify version ranges are compatible **TO ADD**
  - **Given:** package.json exists
  - **When:** Parsing dependency version strings
  - **Then:** next version starts with "15" or "^15", react version starts with "18" or "^18", @tauri-apps/cli version starts with "2" or "^2"
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

### Error Handling

- [ ] **1.1-INT-007:** Detect conflicting peer dependencies **TO ADD**
  - **Given:** node_modules directory exists with installed dependencies
  - **When:** Running `npm ls --json 2>&1` and parsing output
  - **Then:** No "peer dep missing" or "ERESOLVE" errors in output; OR command exit code 0
  - **File:** `tests/integration/scaffold/dependency-check.spec.ts`
  - **Note:** Moved from UNIT to INT as it requires installed dependencies; file needs to be created

---

## AC3: TypeScript Configuration

> **And** TypeScript is configured with strict mode

### Happy Path Tests

- [x] **1.1-UNIT-018 (CV-005):** Verify tsconfig.json exists and is valid
  - **Given:** Project scaffold has been executed
  - **When:** Reading tsconfig.json
  - **Then:** File parses as valid JSON with compilerOptions
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-019 (CV-006):** Verify strict TypeScript settings
  - **Given:** tsconfig.json exists
  - **When:** Checking compilerOptions.strict
  - **Then:** strict is set to true
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

### Edge Cases

- [ ] **1.1-UNIT-020 (CV-014):** Verify path aliases are configured **TO ADD**
  - **Given:** tsconfig.json exists
  - **When:** Parsing compilerOptions.paths
  - **Then:** Object contains "@/*" key with array value containing "./src/*" or "src/*"
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

---

## AC4: Tauri Configuration

> **And** Tauri is configured with proper bundle identifier and macOS settings

### Happy Path Tests

- [x] **1.1-UNIT-021 (CV-008):** Verify Tauri bundle identifier
  - **Given:** tauri.conf.json exists
  - **When:** Reading identifier field
  - **Then:** Matches pattern `com.*.orion` or similar reverse-domain format
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-022 (CV-009):** Verify Tauri window title
  - **Given:** tauri.conf.json exists
  - **When:** Reading app.windows[0].title
  - **Then:** Title contains "Orion"
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-023 (CV-010):** Verify macOS minimum version
  - **Given:** tauri.conf.json exists
  - **When:** Reading bundle.macOS.minimumSystemVersion
  - **Then:** Version >= 12.0
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

### Edge Cases

- [ ] **1.1-UNIT-024 (CV-015):** Verify bundle targets include DMG **TO ADD**
  - **Given:** tauri.conf.json exists
  - **When:** Parsing bundle.targets array
  - **Then:** Array includes "dmg" OR bundle.macOS.dmg configuration object exists
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

---

## AC5: Tailwind and shadcn/ui Configuration

> **And** Tailwind CSS and shadcn/ui are properly configured

### Happy Path Tests

- [x] **1.1-UNIT-025 (CV-007):** Verify tailwind.config.ts exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for tailwind.config.ts
  - **Then:** File exists
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

- [x] **1.1-UNIT-026 (CV-012):** Verify shadcn components.json exists
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for components.json
  - **Then:** File exists with valid configuration
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`

---

## AC6: Design System Integration

> **And** the Orion design system is integrated

### Happy Path Tests

- [x] **1.1-UNIT-027 (DS-001):** Verify design system tokens exported
  - **Given:** design-system directory exists
  - **When:** Reading design-system/index.ts
  - **Then:** File contains export statements
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-028 (DS-002):** Verify global CSS imports design system
  - **Given:** src/app/globals.css exists
  - **When:** Reading CSS content
  - **Then:** Contains orion tokens or design-system reference
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-029 (DS-003):** Verify Tailwind preset configured
  - **Given:** tailwind.config.ts exists
  - **When:** Reading configuration
  - **Then:** References orionTailwindPreset or orion theme
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-030 (DS-004):** Verify gold accent color defined
  - **Given:** design-system/tokens/colors.ts exists
  - **When:** Reading color definitions
  - **Then:** Contains "#D4AF37" (gold accent)
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-031 (DS-005):** Verify serif font family defined
  - **Given:** design-system/tokens/typography.ts exists
  - **When:** Reading typography definitions
  - **Then:** Contains "Playfair Display"
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-032 (DS-006):** Verify zero border radius
  - **Given:** design-system/tailwind.config.ts exists
  - **When:** Reading borderRadius config
  - **Then:** Contains "none: '0'" for editorial aesthetic
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-033 (DS-007):** Verify layout dimensions
  - **Given:** design-system/tailwind.config.ts exists
  - **When:** Reading spacing config
  - **Then:** Contains sidebar: '280px' and header: '80px'
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

- [x] **1.1-UNIT-034 (DS-008):** Verify shadcn configured for orion
  - **Given:** components.json exists
  - **When:** Reading tailwind.css path
  - **Then:** Points to globals.css
  - **File:** `tests/unit/scaffold/design-system.spec.ts`

### Edge Cases

- [x] **1.1-UNIT-035 (PS-008):** Verify design-system directory preserved
  - **Given:** Project scaffold has been executed
  - **When:** Checking filesystem for design-system/
  - **Then:** Directory exists (not overwritten by scaffold)
  - **File:** `tests/unit/scaffold/project-structure.spec.ts`

---

## AC7: Build Process Verification

> **And** `npm run tauri dev` launches a window on macOS 12+

### Happy Path Tests (Integration)

- [x] **1.1-INT-001 (BP-001):** TypeScript type checking passes
  - **Given:** All TypeScript files exist
  - **When:** Running `npx tsc --noEmit`
  - **Then:** No type errors reported
  - **File:** `tests/integration/scaffold/build-process.spec.ts`

- [x] **1.1-INT-002 (BP-002):** ESLint passes
  - **Given:** All source files exist
  - **When:** Running `npm run lint`
  - **Then:** No linting errors reported
  - **File:** `tests/integration/scaffold/build-process.spec.ts`

- [x] **1.1-INT-003 (BP-003):** Next.js builds successfully
  - **Given:** All configuration is correct
  - **When:** Running `npm run build`
  - **Then:** Build completes without errors
  - **File:** `tests/integration/scaffold/build-process.spec.ts`

- [x] **1.1-INT-004 (BP-004):** Tauri builds successfully
  - **Given:** Rust toolchain and Tauri CLI are installed
  - **When:** Running `npm run tauri build`
  - **Then:** Build completes without errors
  - **File:** `tests/integration/scaffold/build-process.spec.ts`

- [x] **1.1-INT-005 (BP-005):** macOS .app bundle generated
  - **Given:** Tauri build completed successfully
  - **When:** Checking `src-tauri/target/release/bundle/macos/`
  - **Then:** At least one .app file exists
  - **File:** `tests/integration/scaffold/build-process.spec.ts`

### Error Handling

- [ ] **1.1-INT-006:** Build fails gracefully with missing Rust toolchain **TO ADD**
  - **Given:** Environment where cargo is not on PATH (mocked via PATH manipulation)
  - **When:** Running `npm run tauri build` with modified PATH excluding Rust
  - **Then:** Exit code is non-zero and output contains "cargo" or "rust" or "toolchain" (case insensitive)
  - **File:** `tests/integration/scaffold/build-process.spec.ts`
  - **Note:** Test skipped in CI where Rust is always present; uses PATH manipulation to simulate missing toolchain

---

## AC8: Cold Start Performance (NFR-1.2)

> **And** the app cold starts to interactive UI in <3 seconds

### Happy Path Tests (E2E)

- [x] **1.1-E2E-001 (CS-001):** Cold start under 3 seconds
  - **Given:** Application is not running
  - **When:** Launching the app and waiting for interactive UI
  - **Then:** Time from launch to data-testid="app-ready" < 3000ms
  - **File:** `tests/e2e/scaffold/cold-start.spec.ts`

- [x] **1.1-E2E-002 (CS-002):** Main window renders
  - **Given:** Application is launched
  - **When:** Page loads
  - **Then:** Body is visible and main UI elements exist
  - **File:** `tests/e2e/scaffold/cold-start.spec.ts`

- [x] **1.1-E2E-003 (CS-003):** First meaningful paint under 1 second
  - **Given:** Application is launched
  - **When:** Measuring time to first content
  - **Then:** Main content visible < 1000ms
  - **File:** `tests/e2e/scaffold/cold-start.spec.ts`

### Edge Cases

- [ ] **1.1-E2E-004:** Cold start with slow disk I/O **TO ADD**
  - **Given:** System under normal or degraded disk conditions
  - **When:** Launching the app
  - **Then:** App starts within 5 seconds (degraded but acceptable grace period)
  - **File:** `tests/e2e/scaffold/cold-start.spec.ts`
  - **Note:** Automated test uses 5s timeout as degraded threshold; manual verification with Activity Monitor disk pressure is supplementary

### Boundary Conditions

- [ ] **1.1-E2E-005:** Cold start timing consistency **TO ADD**
  - **Given:** App launched 3 times in sequence (reduced from 10 for CI performance)
  - **When:** Recording startup time for each launch
  - **Then:** All launches complete under 3000ms; max variance between runs < 1000ms
  - **File:** `tests/e2e/scaffold/cold-start.spec.ts`
  - **Note:** Reduced iteration count for CI; full 10-run baseline captured separately in performance/ directory

---

## AC9: Next.js Static Export Configuration

> **And** Next.js is configured for static export

### Happy Path Tests

- [ ] **1.1-UNIT-036 (CV-016):** Verify Next.js output mode is export **TO ADD**
  - **Given:** next.config.ts (or next.config.mjs/js) exists
  - **When:** Reading file content as text and matching pattern `output.*['"]export['"]`
  - **Then:** Pattern matches, confirming static export mode is configured
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`
  - **Note:** Uses regex matching since config is TypeScript/ESM (not JSON parseable)

- [ ] **1.1-UNIT-037 (CV-017):** Verify images are unoptimized **TO ADD**
  - **Given:** next.config.ts (or next.config.mjs/js) exists
  - **When:** Reading file content and matching pattern `unoptimized.*true`
  - **Then:** Pattern matches, confirming images.unoptimized is true for static export compatibility
  - **File:** `tests/unit/scaffold/config-validation.spec.ts`
  - **Note:** Uses regex matching since config is TypeScript/ESM (not JSON parseable)

---

## Test Execution Order

### Phase 1: Static Analysis (No Build Required)
1. Project Structure Tests (1.1-UNIT-001 through 1.1-UNIT-010)
2. Configuration Validation Tests (1.1-UNIT-011 through 1.1-UNIT-026)
3. Design System Tests (1.1-UNIT-027 through 1.1-UNIT-035)

### Phase 2: Build Verification (Requires Build)
4. Integration Tests (1.1-INT-001 through 1.1-INT-006)

### Phase 3: Runtime Verification (Requires Running App)
5. E2E Tests (1.1-E2E-001 through 1.1-E2E-005)

---

## Test Commands

```bash
# Run all Story 1.1 unit tests
npm run test:unit -- --grep "1.1"

# Run structure validation only
npm run test:unit -- tests/unit/scaffold/

# Run integration tests (requires build)
npm run test:integration -- tests/integration/scaffold/

# Run E2E tests (requires dev server)
npm run test:e2e -- tests/e2e/scaffold/

# Run performance baseline
npm run test:e2e -- tests/e2e/scaffold/cold-start.spec.ts
```

---

## Dependencies and Prerequisites

### Test Infrastructure Required
- [x] Vitest configured with coverage
- [x] Playwright configured for Tauri
- [x] Test directory structure established
- [x] Performance baseline script
  - **Note:** Cold start baseline captured via Playwright timing in `tests/e2e/scaffold/cold-start.spec.ts` (1.1-E2E-001); k6 deferred to Sprint 1+ for API load testing scenarios. Desktop app startup metrics do not benefit from k6's HTTP focus.

### External Dependencies
- Rust toolchain (for Tauri build)
- macOS 12+ (for full E2E testing)
- Node.js 18+ (for Next.js 15)

---

## Coverage Requirements

Per test-design-system.md:
- **Unit tests:** 80% coverage target
- **Integration tests:** 70% coverage target
- **E2E tests:** Critical paths only (3 journeys)

### Story 1.1 Specific Targets
- All directory existence checks: 100%
- All configuration validation: 100%
- Build process: Pass/Fail gates
- Cold start: NFR-1.2 compliance

---

## Notes for Implementation

1. **First Story Conventions:** This story establishes test ID patterns (`1.1-UNIT-XXX`) for all subsequent stories.

2. **Existing Tests:** Many tests already exist in `tests/unit/scaffold/` and `tests/e2e/scaffold/`. The checklist maps existing test IDs (PS-XXX, CV-XXX, etc.) to the standard 1.1-LEVEL-SEQ format.

3. **TDD Approach:** Tests marked "TO ADD" or "TO CREATE" should be written before the corresponding implementation changes.

4. **Performance Baseline:** CS-001 establishes the cold start baseline for NFR-1.2 regression tracking.

---

*Generated by TEA (Master Test Architect) - Risk-based testing with quality gates backed by data.*
