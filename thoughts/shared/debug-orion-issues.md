# Debug Report: Orion App Issues

Generated: 2026-01-19

## Summary

Three issues investigated:
1. **ENV not being picked up** - VERIFIED root cause found
2. **404 errors on click** - VERIFIED root cause found
3. **Layout issues** - Needs more context (layout appears correct in code)

---

## Issue 1: ENV Not Being Picked Up

### Symptom
The `.env` file has `ANTHROPIC_API_KEY` configured but the app reports "ANTHROPIC_API_KEY not set".

### Root Cause Analysis

**VERIFIED: Tauri spawns agent-server without passing env vars**

Location: `/Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler/src-tauri/src/agent_server.rs:195-201`

```rust
// Spawn the Node.js process
let child = Command::new("node")
    .args([entry_point])
    .current_dir(&server_path)
    .env("PORT", AGENT_SERVER_PORT.to_string())
    .env("NODE_ENV", "production")
    .env("CORS_ORIGIN", "http://localhost:3000")
    // MISSING: .env("ANTHROPIC_API_KEY", ...)
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()
```

The Rust code explicitly sets `PORT`, `NODE_ENV`, and `CORS_ORIGIN` but does NOT pass `ANTHROPIC_API_KEY`. Environment variables from the parent process are NOT automatically inherited when using explicit `.env()` calls.

**Secondary Issue: No env loading**

The agent-server at `/agent-server/src/index.ts` checks `process.env.ANTHROPIC_API_KEY` via `isApiKeyConfigured()` (line 46), but:
1. Tauri doesn't pass it
2. Agent-server has no `dotenv` loading

### Evidence

1. **agent_server.rs:195-201** - Only passes PORT, NODE_ENV, CORS_ORIGIN
2. **agent-server/src/index.ts:46-53** - Shows "ANTHROPIC_API_KEY not set" message in logs
3. **agent-server/src/config/api-keys.ts:86-91** - `isApiKeyConfigured()` just checks `process.env.ANTHROPIC_API_KEY`

### Recommended Fix

**Option A: Pass env from Tauri (Recommended)**

Modify `agent_server.rs` to read and pass the API key:

```rust
// Add at top of start_agent_server function
let api_key = std::env::var("ANTHROPIC_API_KEY").ok();

// In the Command builder, add:
let mut cmd = Command::new("node");
cmd.args([entry_point])
   .current_dir(&server_path)
   .env("PORT", AGENT_SERVER_PORT.to_string())
   .env("NODE_ENV", "production")
   .env("CORS_ORIGIN", "http://localhost:3000");

if let Some(key) = api_key {
    cmd.env("ANTHROPIC_API_KEY", key);
}

let child = cmd.stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()
```

**Option B: Load dotenv in agent-server**

Add to `agent-server/src/index.ts` at the top:

```typescript
import 'dotenv/config'; // Add dotenv as dependency
```

**Files to modify:**
- `/Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler/src-tauri/src/agent_server.rs` (line ~195)

---

## Issue 2: 404 Errors on Click

### Symptom
User clicks on elements and gets 404 errors.

### Root Cause Analysis

**VERIFIED: Links to non-existent routes**

The app has links to `/settings` but no settings page exists.

### Evidence

1. **ChatInput.tsx:137** - `href="/settings"` for API key configuration
2. **ChatError.tsx:115** - `window.location.href = '/settings'`
3. **src/app/ directory** - Only contains:
   - `page.tsx` (root `/`)
   - `design-system-test/page.tsx` (`/design-system-test`)
   - NO `settings/page.tsx`

App router pages found:
```
src/app/page.tsx                    -> /
src/app/design-system-test/page.tsx -> /design-system-test
```

### Recommended Fix

**Option A: Create settings page (Proper fix)**

Create `/Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler/src/app/settings/page.tsx`:

```tsx
'use client';

import { ApiKeyInput } from '@/components/settings/ApiKeyInput';
import { AppLayout } from '@/components/layout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="font-serif text-3xl mb-8">Settings</h1>
        <section>
          <h2 className="text-lg font-medium mb-4">API Configuration</h2>
          <ApiKeyInput />
        </section>
      </div>
    </AppLayout>
  );
}
```

**Option B: Use modal instead of route (Quick fix)**

Replace links with modal trigger:
- Modify ChatInput to show ApiKeyInput in a modal
- Use UI store to control modal visibility

**Files to modify:**
- Create: `/Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler/src/app/settings/page.tsx`
- OR modify: ChatInput.tsx and ChatError.tsx to use modals

---

## Issue 3: Layout Issues (Side Panel and Chats in Wrong Positions)

### Symptom
Side panel and chats are in wrong positions.

### Investigation

The layout structure in code appears correct:

```
AppLayout (flex column, h-screen)
├── Header (h-header = 80px, fixed top)
└── Main Content (flex row, flex-1)
    ├── Sidebar (w-sidebar = 280px, left)
    ├── SplitPanel (flex-1, center)
    │   ├── Chat Panel (35-100%)
    │   └── Canvas Panel (0-65%)
    └── AgentRail (w-rail = 64px, right)
```

**Verified correct structure in:**
- AppLayout.tsx: Uses `flex flex-col h-screen` for outer, `flex-1 flex` for inner
- Sidebar.tsx: Uses `w-sidebar` (280px) or collapsed width
- SplitPanel.tsx: Uses framer-motion for chat/canvas split
- AgentRail.tsx: Uses `w-rail` (64px)

### Possible Causes (Need More Info)

1. **CSS variable not applied** - Check if `--spacing-sidebar`, `--spacing-rail`, `--spacing-header` are properly defined
2. **Tailwind v4 migration issue** - The config uses `@theme` blocks which may not be compiling correctly
3. **Build cache** - Static export may have stale CSS

### Questions for User

To diagnose further:
1. What specifically is "wrong"? (sidebar on right? chat overlapping?)
2. Is this in dev mode (`pnpm dev`) or production build?
3. Can you share a screenshot?
4. Any console errors related to CSS?

### Diagnostic Steps

```bash
# Check if CSS variables are being applied
# In browser DevTools, inspect an element and check computed styles for:
# - --spacing-sidebar: should be 280px
# - --spacing-rail: should be 64px
# - --spacing-header: should be 80px

# Rebuild the app
cd /Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler
pnpm build
```

---

## Summary of Fixes

| Issue | Priority | Effort | Files |
|-------|----------|--------|-------|
| ENV not passed to agent-server | High | Low | `src-tauri/src/agent_server.rs` |
| Missing /settings route | High | Medium | Create `src/app/settings/page.tsx` |
| Layout issues | Medium | Unknown | Need more info |

## Confidence Levels

- **Issue 1 (ENV)**: HIGH confidence - root cause verified in code
- **Issue 2 (404)**: HIGH confidence - missing route verified
- **Issue 3 (Layout)**: LOW confidence - code looks correct, need visual confirmation

---

## Quick Fix Commands

```bash
# For Issue 1: Test if env is being read at all
cd /Users/sid/Desktop/2-Coding/Active/2026-01-orion-personal-butler
echo $ANTHROPIC_API_KEY  # Should show the key if exported

# For Issue 2: Check what routes exist
ls -la src/app/*/page.tsx 2>/dev/null || echo "Only root page exists"
```
