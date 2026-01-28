---
root_span_id: 7192facd-b6a1-493f-ab14-1890946efe6a
turn_span_id: 054ac336-9b21-4b02-9072-a85c940e6d3c
session_id: 7192facd-b6a1-493f-ab14-1890946efe6a
---

# Task 04: Database Schema + Zod Schemas

## Status: COMPLETED
**Date:** 2026-01-27
**Story:** 4.1c - Initialize PARA Database Schema + Zod Schemas

## Summary

Implemented complete PARA database schema (Drizzle ORM) and comprehensive Zod validation schemas for all PARA entities: Projects, Areas, Contacts, and Inbox items.

## Checkpoints

### Phase Status
- Phase 1 (Tests Written): VALIDATED (189 new tests written)
- Phase 2 (Implementation): VALIDATED (all tests pass - 567 total)
- Phase 3 (Integration): VALIDATED (exports verified in index files)

### Validation State
```json
{
  "test_count": 567,
  "tests_passing": 567,
  "files_created": [
    "src/db/schema/para.ts",
    "src/lib/para/schemas/project.ts",
    "src/lib/para/schemas/area.ts",
    "src/lib/para/schemas/contact.ts",
    "src/lib/para/schemas/inbox.ts",
    "tests/unit/db/schema/para.spec.ts",
    "tests/unit/lib/para/schemas/project.spec.ts",
    "tests/unit/lib/para/schemas/area.spec.ts",
    "tests/unit/lib/para/schemas/contact.spec.ts",
    "tests/unit/lib/para/schemas/inbox.spec.ts"
  ],
  "files_modified": [
    "src/db/schema/index.ts",
    "src/lib/para/schemas/index.ts"
  ],
  "last_test_command": "npm run test -- tests/unit/db/schema/para.spec.ts tests/unit/lib/para/schemas/project.spec.ts tests/unit/lib/para/schemas/area.spec.ts tests/unit/lib/para/schemas/contact.spec.ts tests/unit/lib/para/schemas/inbox.spec.ts",
  "last_test_exit_code": 0
}
```

## Implementation Details

### 1. Drizzle ORM Schema (src/db/schema/para.ts)

Created 4 SQLite tables:

| Table | Primary Key | Key Columns | Indexes |
|-------|-------------|-------------|---------|
| `para_projects` | `id` (proj_xxx) | name, status, priority, deadline, areaId, path | status, priority, area, updated |
| `para_areas` | `id` (area_xxx) | name, status, reviewCadence, path | status, updated |
| `para_contacts` | `id` (cont_xxx) | name, type, email, relationship, path | type, email, updated |
| `para_inbox_items` | `id` (inbox_xxx) | type, source, priorityScore, processed, path | type, processed, priority, created |

All tables include:
- `metadata` (text/JSON) for flexible extension
- `createdAt`, `updatedAt` timestamps (ISO 8601)
- Type inference exports (`ParaProject`, `NewParaProject`, etc.)

### 2. Project Zod Schema (src/lib/para/schemas/project.ts)

- `StakeholderSchema` - name, role, optional contact
- `ProjectMetaSchema` - id (proj_*), name, status (active/paused/completed/cancelled), priority (high/medium/low), timestamps, optional: description, area, deadline, stakeholders, tags
- `ProjectIndexSchema` - version, updated_at, projects array

### 3. Area Zod Schema (src/lib/para/schemas/area.ts)

- `GoalSchema` - description, status, optional target_date
- `AreaMetaSchema` - id (area_*), name, status (active/dormant), timestamps, optional: description, responsibilities, goals, review cadence, tags
- `AreaIndexSchema` - version, updated_at, areas array

### 4. Contact Zod Schema (src/lib/para/schemas/contact.ts)

- `ContactCardSchema` - id (cont_*), name, type (person/organization), timestamps, optional: email, phone, company, role, relationship, notes, tags, projects
- `ContactIndexSchema` - version, updated_at, contacts array

### 5. Inbox Zod Schema (src/lib/para/schemas/inbox.ts)

- `InboxItemSchema` - id (inbox_*), title, type (task/note/idea/reference/capture), timestamps, processed (default false), optional: content, source, priority_score, target_project, target_area, due_date, tags
- `InboxStatsSchema` - total, unprocessed, by_type record
- `InboxQueueSchema` - version, updated_at, items array, stats

## Test Coverage

| Test File | Tests |
|-----------|-------|
| `tests/unit/db/schema/para.spec.ts` | 43 tests |
| `tests/unit/lib/para/schemas/project.spec.ts` | 38 tests |
| `tests/unit/lib/para/schemas/area.spec.ts` | 38 tests |
| `tests/unit/lib/para/schemas/contact.spec.ts` | 32 tests |
| `tests/unit/lib/para/schemas/inbox.spec.ts` | 38 tests |
| **Total** | **189 tests** |

All tests verify:
- ID prefix validation (proj_, area_, cont_, inbox_)
- Required vs optional fields
- Enum validation (status, priority, type, review cadence)
- Datetime validation (ISO 8601 with timezone support)
- Default values (e.g., processed: false)
- Type exports work correctly
- Index schemas validate arrays properly

## Exports Added

### src/db/schema/index.ts
```typescript
export { paraProjects, paraAreas, paraContacts, paraInboxItems } from './para';
export type {
  ParaProject, NewParaProject,
  ParaArea, NewParaArea,
  ParaContact, NewParaContact,
  ParaInboxItem, NewParaInboxItem,
} from './para';
```

### src/lib/para/schemas/index.ts
```typescript
// Project
export { StakeholderSchema, ProjectMetaSchema, ProjectIndexSchema };
export type { Stakeholder, ProjectMeta, ProjectIndex };

// Area
export { GoalSchema, AreaMetaSchema, AreaIndexSchema };
export type { Goal, AreaMeta, AreaIndex };

// Contact
export { ContactCardSchema, ContactIndexSchema };
export type { ContactCard, ContactIndex };

// Inbox
export { InboxItemSchema, InboxStatsSchema, InboxQueueSchema };
export type { InboxItem, InboxStats, InboxQueue };
```

## Acceptance Criteria Status

- [x] Create `src/db/schema/para.ts` with Drizzle table definitions
  - [x] para_projects - id, name, status, priority, deadline, area_id, path, metadata
  - [x] para_areas - id, name, status, review_cadence, path, metadata
  - [x] para_contacts - id, name, type, email, relationship, path, metadata
  - [x] para_inbox_items - id, type, source, priority_score, processed, path, metadata
- [x] Export types from `src/db/schema/index.ts`
- [x] Create comprehensive Zod schemas in `src/lib/para/schemas/`:
  - [x] project.ts - ProjectMeta, ProjectIndex schemas
  - [x] area.ts - AreaMeta, AreaIndex schemas
  - [x] contact.ts - ContactCard, ContactIndex schemas
  - [x] inbox.ts - InboxItem, InboxQueue schemas
  - [x] Update index.ts - re-export all schemas

## Dependencies for Next Tasks

This task is a BLOCKING dependency for:
- Task 05: Initialize Projects Directory (needs ProjectMeta schema)
- Task 06: Initialize Areas Directory (needs AreaMeta schema)
- Task 07: Contacts Subdirectory (needs ContactCard schema)
- Task 08: Initialize Inbox Queue (needs InboxItem schema)
- All subsequent PARA operations requiring database persistence

## Notes

1. **Drizzle vs Zod schemas**: The Drizzle schema defines database columns while Zod schemas validate YAML frontmatter. They're complementary - Drizzle for persistence, Zod for file-based data.

2. **Metadata flexibility**: All Drizzle tables have a `metadata` JSON column for extending fields without schema changes.

3. **ID prefixes**: Validated via Zod `startsWith()` matching the ID_PREFIXES from id-generator.ts.

4. **Timestamps**: All schemas use ISO 8601 datetime strings with timezone offset support (`datetime({ offset: true })`).
