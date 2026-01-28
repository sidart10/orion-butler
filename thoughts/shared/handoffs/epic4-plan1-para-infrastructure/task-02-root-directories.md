---
root_span_id: 7192facd-b6a1-493f-ab14-1890946efe6a
turn_span_id: 054ac336-9b21-4b02-9072-a85c940e6d3c
session_id: 7192facd-b6a1-493f-ab14-1890946efe6a
---

# Task 02: Root Directories (Story 4.1a)

**Status:** COMPLETE
**Completed:** 2026-01-27T22:52:00Z
**Agent:** kraken

## Summary

Successfully implemented the PARA root directory structure initialization following TDD:
- Created `src/lib/para/paths.ts` with path constants and helpers
- Created `src/lib/para/init.ts` with idempotent directory creation
- Created `src/lib/para/index.ts` module barrel export
- All 24 new unit tests pass (67 total PARA-related tests)

## Acceptance Criteria Status

- [x] Create `~/Orion/` directory if not exists
- [x] Create `~/Orion/.orion/` system folder
- [x] Set directory permissions to 755 (via mkdir recursive)
- [x] Handle case where directory already exists (idempotent)
- [x] Log creation events for debugging

## TDD Summary

### Tests Written FIRST (Red Phase)

1. `/Users/sid/Desktop/orion-butler/tests/unit/lib/para/paths.spec.ts` (11 tests)
   - Tests for ORION_ROOT and ORION_SYSTEM_DIR constants
   - Tests for getOrionPaths() returning correct structure
   - Tests for OrionPaths type shape

2. `/Users/sid/Desktop/orion-butler/tests/unit/lib/para/init.spec.ts` (13 tests)
   - Tests for initParaRoot() returning Result type
   - Tests for directory creation behavior
   - Tests for idempotent behavior
   - Tests for error handling (FS_ERROR, permission denied)
   - Tests for logging creation events
   - Tests for partial existence handling

### Implementation (Green Phase)

1. `src/lib/para/paths.ts`:
   - `ORION_ROOT = 'Orion'` constant
   - `ORION_SYSTEM_DIR = '.orion'` constant
   - `OrionPaths` interface with all PARA directories
   - `getOrionPaths()` function
   - `buildOrionPath()` helper

2. `src/lib/para/init.ts`:
   - `ParaInitResult` interface
   - `ParaInitError` interface
   - `initParaRoot()` function using neverthrow Result
   - Uses `@tauri-apps/plugin-fs` mkdir and exists
   - Uses `BaseDirectory.Home` for home directory access

3. `src/lib/para/index.ts`:
   - Barrel export for public API

### Test Results (All Green)

```
PARA Path tests: 11 passed
PARA Init tests: 13 passed
ID Generator PARA tests: 34 passed (from Task 01)
YAML Package tests: 9 passed (from Task 01)
Total PARA-related: 67 passed
```

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/para/paths.ts` | Path constants and helpers |
| `src/lib/para/init.ts` | Directory initialization with neverthrow |
| `src/lib/para/index.ts` | Module barrel export |
| `tests/unit/lib/para/paths.spec.ts` | Path helper tests |
| `tests/unit/lib/para/init.spec.ts` | Init function tests |

## Dependencies Used

- `neverthrow` (existing) - Result type for error handling
- `@tauri-apps/plugin-fs` (new npm package) - Tauri filesystem access
- `@tauri-apps/api/path` (existing) - BaseDirectory enum

## API Reference

### Path Constants

```typescript
import { ORION_ROOT, ORION_SYSTEM_DIR, getOrionPaths } from '@/lib/para';

ORION_ROOT === 'Orion'
ORION_SYSTEM_DIR === '.orion'

const paths = getOrionPaths();
// paths.root === 'Orion'
// paths.system === 'Orion/.orion'
// paths.projects === 'Orion/Projects'
// paths.areas === 'Orion/Areas'
// paths.resources === 'Orion/Resources'
// paths.archive === 'Orion/Archive'
// paths.inbox === 'Orion/Inbox'
```

### Initialization

```typescript
import { initParaRoot } from '@/lib/para';

const result = await initParaRoot();

if (result.isOk()) {
  console.log('Created:', result.value.created);
  console.log('Skipped:', result.value.skipped);
} else {
  console.error('Error:', result.error.code, result.error.message);
}
```

### Error Types

```typescript
interface ParaInitError {
  code: 'FS_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  cause?: Error | unknown;
}
```

## Next Task

Task 3 should create the PARA subdirectories:
- Create `/Users/sid/Orion/Projects/`
- Create `/Users/sid/Orion/Areas/`
- Create `/Users/sid/Orion/Resources/`
- Create `/Users/sid/Orion/Archive/`
- Create `/Users/sid/Orion/Inbox/`

These paths are already defined in `getOrionPaths()` - the implementation just needs to extend `initParaRoot()` or create a new `initParaDirs()` function.

## Notes

- The npm package `@tauri-apps/plugin-fs` was installed during this task
- Mocking pattern for Tauri plugins: `vi.mock('@tauri-apps/plugin-fs', () => ({...}))`
- Logs use `[PARA]` prefix for filtering
- Pre-existing ESLint error in ActivityHeader.tsx is unrelated to this task
