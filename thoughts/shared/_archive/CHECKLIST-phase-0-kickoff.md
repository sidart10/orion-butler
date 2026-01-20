# Phase 0 Kickoff Checklist

**Project:** Orion Personal Butler MVP
**Phase:** 0 - Project Setup (Week 1)
**Goal:** Bootable desktop app with basic structure

---

## Pre-Kickoff (Before Starting)

### Environment Setup
- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Rust toolchain installed (`rustc --version`, `cargo --version`)
- [ ] Tauri CLI installed (`cargo install tauri-cli`)
- [ ] Git configured for this project

### Dependencies Verified
- [ ] Anthropic API key available (for testing)
- [ ] PostgreSQL running locally (for memory system)
  ```bash
  docker exec continuous-claude-postgres psql -U claude -d continuous_claude -c "SELECT 1"
  ```

### Prior Decisions Documented
- [ ] React 18.x locked (TipTap compatibility)
- [ ] Native connection pooling chosen over pgbouncer (from validation)
- [ ] Polotno deferred to post-MVP

---

## Phase 0 Tasks

### Step 1: Initialize Tauri + Next.js Project
```bash
npm create tauri-app@latest orion-app -- --template next
cd orion-app
pnpm install
```

**Verify:**
- [ ] `orion-app/` directory created
- [ ] `src-tauri/` contains Rust files
- [ ] `src/` contains Next.js app

---

### Step 2: Lock React to 18.x
```bash
# In orion-app/package.json, ensure:
# "react": "^18.2.0"
# "react-dom": "^18.2.0"
# NOT "^19.x" or "latest"
```

**Verify:**
- [ ] `package.json` shows React 18.x
- [ ] `pnpm install` completes without errors

---

### Step 3: Configure Tauri Permissions

Create `src-tauri/capabilities/default.json`:
```json
{
  "identifier": "default",
  "description": "Default capabilities for Orion",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-spawn",
    "shell:allow-execute",
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "path:default"
  ]
}
```

**Verify:**
- [ ] File created at correct path
- [ ] No JSON syntax errors

---

### Step 4: Install Core Dependencies

```bash
# Tauri plugins
pnpm add @tauri-apps/plugin-shell @tauri-apps/plugin-fs

# State management
pnpm add zustand @tanstack/react-query

# UI framework
npx shadcn@latest init
```

**shadcn/ui init answers:**
- Style: New York
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components: src/components/ui
- Utils: src/lib/utils

**Verify:**
- [ ] `@tauri-apps/plugin-shell` in dependencies
- [ ] `zustand` in dependencies
- [ ] `components.json` created
- [ ] `src/lib/utils.ts` exists

---

### Step 5: Add shadcn/ui Components

```bash
npx shadcn@latest add button card dialog input textarea
npx shadcn@latest add sidebar scroll-area tooltip
npx shadcn@latest add form label
npx shadcn@latest add resizable
```

**Verify:**
- [ ] Components exist in `src/components/ui/`
- [ ] At least: button.tsx, card.tsx, dialog.tsx, input.tsx

---

### Step 6: Create Basic Layout Structure

Create directories:
```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home -> redirect to /chat
│   └── (app)/
│       ├── chat/
│       │   └── page.tsx
│       ├── inbox/
│       │   └── page.tsx
│       ├── calendar/
│       │   └── page.tsx
│       ├── projects/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
├── components/
│   ├── ui/               # shadcn components
│   ├── chat/             # Chat-specific
│   ├── canvas/           # Canvas-specific
│   └── layout/           # App layout
│       └── Sidebar.tsx
└── lib/
    ├── agent-client.ts   # Placeholder
    ├── database.ts       # Placeholder
    └── composio.ts       # Placeholder
```

**Verify:**
- [ ] All directories created
- [ ] Each `page.tsx` has basic placeholder content
- [ ] `layout.tsx` wraps children properly

---

### Step 7: Create Basic Sidebar

`src/components/layout/Sidebar.tsx`:
```tsx
// Minimal sidebar with navigation links:
// - Chat (home)
// - Inbox
// - Calendar
// - Projects
// - Settings
```

**Verify:**
- [ ] Sidebar renders
- [ ] Links navigate between routes
- [ ] Active state shows current page

---

### Step 8: Test Tauri Shell Execution

Create a test to verify Claude CLI can be spawned:

```typescript
// src/lib/test-shell.ts
import { Command } from '@tauri-apps/plugin-shell';

export async function testShellExecution() {
  const output = await Command.create('echo', ['Hello from Tauri']).execute();
  return output.stdout;
}
```

**Verify:**
- [ ] `pnpm tauri dev` launches window
- [ ] Shell execution returns expected output
- [ ] No permission errors in console

---

## Acceptance Criteria (All Must Pass)

- [ ] `pnpm tauri dev` launches desktop window
- [ ] Basic Next.js routes render (/, /chat, /inbox, /settings)
- [ ] shadcn/ui components display correctly
- [ ] Sidebar navigation works
- [ ] Can execute shell commands via Tauri (tested)
- [ ] React 18.x confirmed in package.json
- [ ] No console errors on startup

---

## Post-Phase 0 Handoff

### Files Created
```
orion-app/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/default.json
│   └── src/main.rs, lib.rs
├── src/
│   ├── app/layout.tsx, page.tsx
│   ├── app/(app)/chat|inbox|calendar|projects|settings/page.tsx
│   ├── components/ui/*.tsx (shadcn)
│   ├── components/layout/Sidebar.tsx
│   └── lib/agent-client.ts, database.ts, composio.ts (placeholders)
├── package.json (React 18.x locked)
├── tailwind.config.js
└── components.json
```

### Ready for Phase 1
- [ ] App launches without errors
- [ ] Layout structure supports split-screen (Phase 1)
- [ ] Shell execution works for Claude CLI (Phase 3)

---

## Troubleshooting

### Tauri build fails
```bash
# Check Rust toolchain
rustup update
cargo clean
pnpm tauri build
```

### Shell permission denied
- Verify `capabilities/default.json` includes `shell:allow-spawn`
- Check Tauri version is 2.0+

### React version conflict
```bash
# Force React 18
pnpm add react@18.2.0 react-dom@18.2.0 --save-exact
```

### shadcn/ui component errors
```bash
# Reinstall with correct config
npx shadcn@latest init --force
```

---

## Time Estimate

| Task | Estimated Time |
|------|----------------|
| Environment setup | 30 min |
| Tauri + Next.js init | 15 min |
| Dependencies install | 20 min |
| shadcn/ui setup | 15 min |
| Layout structure | 1 hour |
| Sidebar component | 30 min |
| Shell test | 30 min |
| Verification | 30 min |
| **Total** | **~4 hours** |

---

## Next Phase Preview

**Phase 1: Core UI Shell (Week 2-3)**
- Split-screen chat + canvas layout
- Resizable panels
- Chat message display
- Canvas mode switching
- Keyboard shortcuts (Cmd+K, Cmd+Enter)

Start Phase 1 when all Phase 0 acceptance criteria pass.
