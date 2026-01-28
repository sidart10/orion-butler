---
root_span_id: task-10-contacts-subdir
turn_span_id: task-10-impl-2026-01-28
session_id: task-10-contacts-subdir
---

# Task 10: Initialize Contacts Subdirectory

## Status: COMPLETED
**Date:** 2026-01-28
**Story:** 4.10 - Initialize Contacts Subdirectory

## Summary

Implemented the contacts subdirectory index file within `~/Orion/Resources/contacts/`. Created a new `ContactsSubdirIndexSchema` that tracks contact IDs and provides statistics by contact type (people vs organizations).

## Checkpoints

### Phase Status
- Phase 1 (Tests Written): VALIDATED (27 tests written)
- Phase 2 (Implementation): VALIDATED (all tests pass - 81 total across 3 environments)
- Phase 3 (Integration): VALIDATED (exports verified in index files)

### Validation State
```json
{
  "test_count": 81,
  "tests_passing": 81,
  "files_created": [
    "src/lib/para/contacts.ts",
    "tests/unit/lib/para/contacts.spec.ts"
  ],
  "files_modified": [
    "src/lib/para/schemas/contact.ts",
    "src/lib/para/schemas/index.ts",
    "src/lib/para/index.ts"
  ],
  "last_test_command": "npm run test -- tests/unit/lib/para/contacts.spec.ts",
  "last_test_exit_code": 0
}
```

## Implementation Details

### 1. New Schema (src/lib/para/schemas/contact.ts)

Added two new schemas to the existing contact.ts file:

| Schema | Description |
|--------|-------------|
| `ContactsSubdirStatsSchema` | Stats tracking (total, people, organizations counts) |
| `ContactsSubdirIndexSchema` | Full index schema (version, generated_at, contacts[], stats) |

### 2. Contacts Init Function (src/lib/para/contacts.ts)

New function `initContactsIndex()` that:
- Creates `_index.yaml` in `~/Orion/Resources/contacts/`
- Returns `Result<ContactsIndexInitResult, ContactsIndexInitError>`
- Is idempotent (safe to call multiple times)
- Handles errors with proper error codes (FS_ERROR, WRITE_ERROR)

### 3. Index File Structure

```yaml
version: 1
generated_at: "2026-01-28T07:26:13Z"
contacts: []
stats:
  total: 0
  people: 0
  organizations: 0
```

## Test Coverage

| Test File | Tests | Description |
|-----------|-------|-------------|
| `tests/unit/lib/para/contacts.spec.ts` | 27 | Function and schema validation |
| **Total** | **81** | (27 x 3 vitest environments) |

Tests verify:
- Result type pattern (neverthrow)
- Index file creation at correct path
- YAML content validates against schema
- Required fields (version, generated_at, contacts, stats)
- Idempotency (multiple calls safe)
- Error handling (FS_ERROR, WRITE_ERROR)
- Original error preservation

## Exports Added

### src/lib/para/schemas/index.ts
```typescript
export {
  ContactsSubdirStatsSchema,
  ContactsSubdirIndexSchema,
  type ContactsSubdirStats,
  type ContactsSubdirIndex,
} from './contact';
```

### src/lib/para/index.ts
```typescript
export {
  initContactsIndex,
  CONTACTS_INDEX_FILENAME,
  type ContactsIndexInitResult,
  type ContactsIndexInitError,
} from './contacts';

export {
  ContactsSubdirIndexSchema,
  ContactsSubdirStatsSchema,
  type ContactsSubdirIndex,
  type ContactsSubdirStats,
} from './schemas/contact';
```

## Acceptance Criteria Status

- [x] Ensure `~/Orion/resources/contacts/` directory exists (created in 4.4)
- [x] Create `~/Orion/resources/contacts/_index.yaml` with schema:
  ```yaml
  version: 1
  generated_at: "2026-01-27T00:00:00Z"
  contacts: []
  stats:
    total: 0
    people: 0
    organizations: 0
  ```
- [x] Individual contacts will be stored as `{cont_xxx}.yaml` files
- [x] Index validates against `ContactsSubdirIndexSchema`

## Dependencies

### Depends On
- Task 09 (Resources Directory) - creates the contacts/ directory

### Depended By
- Future contact CRUD operations will use this index

## Notes

1. **Schema Design Decision**: Created `ContactsSubdirIndexSchema` as distinct from `ContactIndexSchema` (from 4.1c) because:
   - Task requirements specify `generated_at` (not `updated_at`)
   - Task requires `stats` object with type breakdowns
   - The contacts array stores IDs (references), not full ContactCard objects

2. **Directory Creation**: The `~/Orion/Resources/contacts/` directory is created by `initResourcesDirectory()` in resources.ts (Story 4.4). This function only handles the index file.

3. **Integration Pattern**: Follows the same pattern as inbox.ts, areas.ts, and resources.ts - uses neverthrow Result type and Tauri FS plugin.

## Files Changed

| File | Lines Added | Lines Modified |
|------|-------------|----------------|
| `src/lib/para/contacts.ts` | 130 | 0 (new file) |
| `src/lib/para/schemas/contact.ts` | 50 | 0 |
| `src/lib/para/schemas/index.ts` | 4 | 0 |
| `src/lib/para/index.ts` | 14 | 0 |
| `tests/unit/lib/para/contacts.spec.ts` | 250 | 0 (new file) |
