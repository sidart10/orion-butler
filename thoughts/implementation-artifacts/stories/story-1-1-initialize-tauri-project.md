# Story 1.1: Initialize Tauri Project

Status: done

---

## Story

As a **developer**,
I want the project scaffolded with Tauri 2.0 + Next.js 15 + shadcn/ui,
So that I have a working foundation that builds and runs on macOS.

---

## Acceptance Criteria

1. **Given** no project exists
   **When** I run `npx create-tauri-ui@latest orion --template next`
   **Then** the project structure is created with Tauri 2.0, Next.js 15, shadcn/ui, and TypeScript

2. **And** `npm run tauri dev` launches a window on macOS 12+

3. **And** the app cold starts to interactive UI in <3 seconds (NFR-1.2)

---

## Tasks / Subtasks

- [x] Task 1: Run project scaffold command (AC: #1)
  - [x] 1.1: Execute `npx create-tauri-ui@latest orion --template next` in project root
  - [x] 1.2: Verify directory structure matches expected Tauri + Next.js layout
  - [x] 1.3: Verify `package.json` includes required dependencies

- [x] Task 2: Validate project structure (AC: #1)
  - [x] 2.1: Confirm `src-tauri/` directory exists with `Cargo.toml`, `tauri.conf.json`
  - [x] 2.2: Confirm `src/` directory has Next.js App Router structure
  - [x] 2.3: Confirm `components/ui/` exists with shadcn/ui components *(infrastructure only - components.json configured, components added on-demand)*
  - [x] 2.4: Confirm `tailwind.config.js` or `tailwind.config.ts` exists
  - [x] 2.5: Confirm TypeScript is configured (`tsconfig.json` with strict mode)

- [x] Task 3: Verify build and launch (AC: #2, #3)
  - [x] 3.1: Run `npm install` to install dependencies
  - [x] 3.2: Run `npm run tauri dev` and verify window opens
  - [x] 3.3: Verify app launches on macOS 12+ (test target platform)
  - [x] 3.4: Measure cold start time (target: <3s to interactive UI) *(357-860ms per validation)*

- [x] Task 4: Post-scaffold configuration (AC: #1)
  - [x] 4.1: Verify Next.js is configured for static export (`output: 'export'` in next.config)
  - [x] 4.2: Add any missing ESLint/Prettier configuration if not included
  - [x] 4.3: Update `package.json` scripts if needed for project conventions

---

## Dev Notes

### Architecture Compliance

This story establishes the foundational project structure per Architecture Document Section "Starter Template Evaluation":

**Selected Starter:** `create-tauri-ui` (agmmnn)

**Rationale for Selection:**
- Provides shadcn/ui components essential for Canvas System (FR-8.x)
- Includes native macOS window controls via tauri-controls
- Pre-configured dark/light mode theming
- Active maintenance and community support
- Small production bundle (~2-2.5MB)

**Initialization Command:**
```bash
npx create-tauri-ui@latest orion --template next
```

### Technology Stack (from Architecture)

| Technology | Purpose |
|------------|---------|
| **Tauri 2.0** | Desktop app framework (Rust shell) |
| **Next.js 15** | React framework with App Router (SSG mode) |
| **TypeScript** | Type safety (strict mode) |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library (Radix primitives) |

### Expected Project Structure

After scaffold, verify this structure exists:

```
orion/
├── package.json
├── next.config.js (or .mjs/.ts)
├── tailwind.config.js (or .ts)
├── tsconfig.json
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── ui/                 # shadcn/ui primitives
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── icons/
    └── src/
        ├── main.rs
        └── lib.rs
```

### Post-Scaffold Customizations Required (Future Stories)

Per Architecture Document, these will be added in subsequent stories:
1. SQLite plugin (`tauri-plugin-sql`) - Story 3.1
2. sqlite-vec for vector embeddings - Story 25.1
3. IPC commands for agent communication - Story 2.4
4. Composio SDK integration - Story 9.1
5. macOS Keychain access (`tauri-plugin-keychain`) - Story 7.1

### NFR Validation

**NFR-1.2: Cold start to interactive UI < 3 seconds**
- Measure from app launch to window render
- Use `performance.now()` or Playwright timing
- Document baseline for regression tracking

### Project Structure Notes

- This story creates the foundational structure that all subsequent stories build upon
- Directory paths established here become the standard referenced in Architecture
- Naming conventions from this scaffold should be preserved (PascalCase components, etc.)
- The `src/` directory is for Next.js frontend; `src-tauri/` is for Rust backend

### Testing Considerations

Per test-design-system.md, this story requires:
- **Cold start timing test**: Validate <3s NFR-1.2 requirement
- **Smoke test**: App window opens successfully
- **Structure validation**: Scaffold created expected directories

Test ID Convention: `1.1-UNIT-001`, `1.1-E2E-001`

### References

- [Source: thoughts/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: thoughts/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: thoughts/planning-artifacts/epics.md#Story 1.1: Initialize Tauri Project]
- [Source: thoughts/planning-artifacts/test-design-system.md#NFR Testing Approach]
- [Source: project-context.md#Technology Stack]

---

## Technical Requirements

### Dependencies (verified by scaffold)

```json
{
  "dependencies": {
    "next": "^15.x",
    "@tauri-apps/api": "^2.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@tauri-apps/cli": "^2.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### Tauri Configuration

Verify `src-tauri/tauri.conf.json` includes:
- `identifier`: Unique app identifier (e.g., `com.orion.butler`)
- `productName`: "Orion"
- `bundle.targets`: At minimum `["dmg"]` for macOS
- macOS minimum version: 12.0 (if configurable)

### Next.js Configuration

Verify `next.config.js` or equivalent:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Tauri
  images: {
    unoptimized: true,  // Required for static export
  },
}
module.exports = nextConfig
```

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Validation report: `/thoughts/shared/handoffs/kraken-20260123/story-1.1-validation.md`
- Review report: `/.claude/cache/agents/review-agent/latest-output.md`

### Completion Notes List

1. **Scaffold Executed**: Project scaffolded with Tauri 2.0 + Next.js (exceeded requirements with Next.js 16.1.2, React 19.2.3)
2. **Structure Verified**: All expected directories present (src/, src-tauri/, components/ui/)
3. **shadcn/ui**: Infrastructure configured via `components.json` - components added on-demand per design
4. **Build Verified**: `npm run build` and `npm run tauri dev` both work
5. **Performance**: Cold start 357-860ms (well under 3s target)
6. **macOS Target**: minimumSystemVersion set to "12.0" in tauri.conf.json
7. **Tests**: 303 unit/integration tests passing, TypeScript clean, ESLint clean

### File List

**Created/Configured Files:**
- `package.json` - Dependencies: Tauri 2.9.5, Next.js 16.1.2, React 19.2.3, TypeScript 5.7.0
- `next.config.ts` - Static export enabled, React Compiler enabled
- `tailwind.config.ts` - Uses orionTailwindPreset from design-system
- `tsconfig.json` - Strict mode, path aliases (@/*)
- `components.json` - shadcn/ui config (new-york style, lucide icons)
- `eslint.config.mjs` - TypeScript + React rules
- `src/app/layout.tsx` - Root layout with Inter + Playfair Display fonts
- `src/app/page.tsx` - Landing page
- `src/app/globals.css` - Imports tailwindcss + design-system
- `src/lib/utils.ts` - cn() utility for class merging
- `src-tauri/Cargo.toml` - Tauri 2.9.5, tauri-build 2.5.3
- `src-tauri/tauri.conf.json` - Window 1280x800, identifier com.orion.butler
- `src-tauri/src/main.rs` - Entry point
- `src-tauri/src/lib.rs` - Tauri builder
- `src-tauri/icons/` - 16 icon files for all platforms

### Completion Date

2026-01-24
