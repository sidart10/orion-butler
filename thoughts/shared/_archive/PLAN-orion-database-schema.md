# Implementation Plan: Orion Database Schema

Generated: 2026-01-14
Plan Agent Output

## Goal

Define a complete, actionable database schema for Orion Personal Butler MVP with:
1. **SQLite (local)** - Desktop app local storage for offline support, fast queries
2. **PostgreSQL (shared)** - Cross-device sync, semantic memory with pgvector
3. **Sync strategy** - What data lives where and how they communicate
4. **Migration path** - How to evolve the schema over time

This schema supports all MVP features: PARA organization, inbox triage, task management, contacts, preferences, and semantic memory.

---

## Research Summary

### Existing Infrastructure (VERIFIED)

| Component | Status | Location |
|-----------|--------|----------|
| PostgreSQL (opc/) | Running | `docker/init-schema.sql` |
| pgvector extension | Enabled | 1024-dim embeddings |
| archival_memory table | Exists | BGE embeddings for learnings |
| handoffs table | Exists | Session handoffs with vectors |
| sessions/file_claims | Exists | Cross-terminal coordination |

### Key Design Decisions (from `database-schema-design.md`)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Local storage | SQLite | Embedded, zero-config, desktop-optimized |
| Vector search (local) | sqlite-vec | F32 blobs initially, migrate to vec0 |
| Full-text search | FTS5 | Porter stemming, built into SQLite |
| Shared memory | PostgreSQL + pgvector | Already running, multi-device |
| Embedding model | BGE-large-en-v1.5 | 1024 dimensions, high quality |

---

## Database Architecture

```
+------------------------------------------------------------------+
|                     Orion Desktop App (Tauri)                     |
+------------------------------------------------------------------+
|                                                                    |
|  SQLite (orion.db)                   PostgreSQL (opc/)             |
|  ~/Library/Application Support/       localhost:5432               |
|  Orion/orion.db                       continuous_claude            |
|  ================================    ==========================   |
|                                                                    |
|  LOCAL-ONLY DATA                      SHARED DATA                  |
|  --------------                       -----------                  |
|  - inbox_items                        - archival_memory (exists)   |
|  - tasks                              - handoffs (exists)          |
|  - projects                           - sessions (exists)          |
|  - areas                              - file_claims (exists)       |
|  - contacts                                                        |
|  - organizations                      NEW TABLES                   |
|  - contact_methods                    ----------                   |
|  - preferences                        - orion_sync_state           |
|  - templates                          - orion_user_profile         |
|  - resources                          - orion_shared_embeddings    |
|  - action_log                                                      |
|  - tags + entity_tags                                              |
|  - conversations + messages                                        |
|  - tool_connections                                                |
|                                                                    |
|  FAST, OFFLINE                        CROSS-DEVICE, SEMANTIC       |
+------------------------------------------------------------------+
```

### Split Rationale

| Data Type | SQLite | PostgreSQL | Why |
|-----------|--------|------------|-----|
| Inbox items | x | | Triage is local-first, fast |
| Tasks | x | | Instant updates, offline |
| Projects/Areas | x | | PARA is personal |
| Contacts | x | | Privacy, local access |
| Preferences | x | | User settings |
| Templates | x | | Quick access |
| Conversations | x | | Chat history local |
| Tool connections | x | | OAuth state |
| Archival memory | | x | Cross-session learnings |
| Sync state | | x | Multi-device coordination |
| Shared embeddings | | x | Expensive to recompute |

---

## SQLite Schema (Complete)

### File Location
```
~/Library/Application Support/Orion/orion.db
```

### Initialization

```sql
-- ============================================================================
-- ORION SQLITE SCHEMA v1.0
-- Generated: 2026-01-14
-- ============================================================================

-- Enable performance optimizations
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA cache_size = -64000;  -- 64MB cache for vectors
PRAGMA temp_store = MEMORY;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT DEFAULT (datetime('now')),
    checksum TEXT
);

-- ============================================================================
-- PARA: AREAS (Ongoing responsibilities)
-- ============================================================================

CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,                     -- area_xxx
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,                               -- emoji or icon name
    color TEXT,                              -- hex color for UI
    status TEXT DEFAULT 'active'             -- active, dormant, archived
        CHECK (status IN ('active', 'dormant', 'archived')),

    -- Responsibilities (JSON array of strings)
    responsibilities TEXT DEFAULT '[]',

    -- Goals (JSON array of {metric, target, current})
    goals TEXT DEFAULT '[]',

    -- Review settings
    review_cadence TEXT DEFAULT 'weekly'     -- daily, weekly, monthly, quarterly
        CHECK (review_cadence IN ('daily', 'weekly', 'monthly', 'quarterly')),
    last_reviewed_at TEXT,
    next_review_at TEXT,

    -- Metadata
    sort_order INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',                  -- JSON array
    metadata TEXT DEFAULT '{}',              -- JSON for extensibility

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    archived_at TEXT
);

CREATE INDEX idx_areas_status ON areas(status);
CREATE INDEX idx_areas_sort ON areas(sort_order);

-- ============================================================================
-- PARA: PROJECTS (Active work with deadlines)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,                     -- proj_xxx
    name TEXT NOT NULL,
    description TEXT,

    -- Status
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'waiting', 'completed', 'cancelled', 'archived')),
    priority TEXT DEFAULT 'medium'
        CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    progress INTEGER DEFAULT 0               -- 0-100 percentage
        CHECK (progress >= 0 AND progress <= 100),

    -- Relationships
    area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
    parent_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,

    -- Timeline
    start_date TEXT,                         -- ISO date
    deadline TEXT,                           -- ISO date
    completed_at TEXT,

    -- Stakeholders (JSON array of {contact_id, role, is_primary})
    stakeholders TEXT DEFAULT '[]',

    -- Success criteria (JSON array of {description, completed})
    success_criteria TEXT DEFAULT '[]',

    -- External links (JSON array of {tool, id, url, title})
    linked_tools TEXT DEFAULT '[]',

    -- Notes
    notes TEXT,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    embedding BLOB,                          -- F32[1024] for semantic search

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    archived_at TEXT
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_area ON projects(area_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_parent ON projects(parent_project_id);

-- Full-text search for projects
CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts USING fts5(
    name, description, notes, tags,
    content='projects',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- FTS sync triggers
CREATE TRIGGER projects_fts_ai AFTER INSERT ON projects BEGIN
    INSERT INTO projects_fts(rowid, name, description, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.description, NEW.notes, NEW.tags);
END;

CREATE TRIGGER projects_fts_ad AFTER DELETE ON projects BEGIN
    INSERT INTO projects_fts(projects_fts, rowid, name, description, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.description, OLD.notes, OLD.tags);
END;

CREATE TRIGGER projects_fts_au AFTER UPDATE ON projects BEGIN
    INSERT INTO projects_fts(projects_fts, rowid, name, description, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.description, OLD.notes, OLD.tags);
    INSERT INTO projects_fts(rowid, name, description, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.description, NEW.notes, NEW.tags);
END;

-- ============================================================================
-- PARA: RESOURCES (Reference materials)
-- ============================================================================

CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,                     -- res_xxx
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL                       -- link, file, note, template, snippet
        CHECK (type IN ('link', 'file', 'note', 'template', 'snippet')),

    -- Content (depends on type)
    url TEXT,                                -- for links
    file_path TEXT,                          -- for files
    content TEXT,                            -- for notes/templates/snippets
    mime_type TEXT,

    -- Relationships
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',

    -- Usage tracking
    use_count INTEGER DEFAULT 0,
    last_used_at TEXT,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_project ON resources(project_id);
CREATE INDEX idx_resources_area ON resources(area_id);

-- ============================================================================
-- TASKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,                     -- task_xxx
    title TEXT NOT NULL,
    description TEXT,

    -- Status and priority
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'waiting', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium'
        CHECK (priority IN ('urgent', 'high', 'medium', 'low')),

    -- Relationships
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
    parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,

    -- People
    assigned_to TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    delegated_to TEXT REFERENCES contacts(id) ON DELETE SET NULL,
    created_by TEXT,                         -- 'user' or 'ai'

    -- Scheduling
    due_date TEXT,                           -- ISO date
    due_time TEXT,                           -- HH:MM
    start_date TEXT,
    scheduled_for TEXT,                      -- ISO datetime for calendar blocking

    -- Time tracking
    estimated_minutes INTEGER,
    actual_minutes INTEGER,

    -- Recurrence (JSON: {frequency, interval, until, days_of_week})
    recurrence TEXT,
    recurrence_parent_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,

    -- Dependencies (JSON array of task_ids)
    depends_on TEXT DEFAULT '[]',
    blocks TEXT DEFAULT '[]',

    -- Source (if extracted from inbox)
    source_inbox_id TEXT REFERENCES inbox_items(id) ON DELETE SET NULL,
    source_tool TEXT,                        -- gmail, slack, linear
    source_id TEXT,                          -- external ID

    -- AI-generated
    ai_suggested INTEGER DEFAULT 0,
    ai_confidence REAL,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    embedding BLOB,                          -- F32[1024]

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_area ON tasks(area_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_source ON tasks(source_tool, source_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);

-- Composite index for common queries
CREATE INDEX idx_tasks_active ON tasks(status, due_date, priority)
    WHERE status IN ('pending', 'in_progress', 'waiting');

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
    title, description, tags,
    content='tasks',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- FTS sync triggers
CREATE TRIGGER tasks_fts_ai AFTER INSERT ON tasks BEGIN
    INSERT INTO tasks_fts(rowid, title, description, tags)
    VALUES (NEW.rowid, NEW.title, NEW.description, NEW.tags);
END;

CREATE TRIGGER tasks_fts_ad AFTER DELETE ON tasks BEGIN
    INSERT INTO tasks_fts(tasks_fts, rowid, title, description, tags)
    VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.tags);
END;

CREATE TRIGGER tasks_fts_au AFTER UPDATE ON tasks BEGIN
    INSERT INTO tasks_fts(tasks_fts, rowid, title, description, tags)
    VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.tags);
    INSERT INTO tasks_fts(rowid, title, description, tags)
    VALUES (NEW.rowid, NEW.title, NEW.description, NEW.tags);
END;

-- ============================================================================
-- INBOX ITEMS (Unified inbox from all sources)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inbox_items (
    id TEXT PRIMARY KEY,                     -- inbox_xxx

    -- Source identification
    source_tool TEXT NOT NULL                -- gmail, slack, calendar, whatsapp, manual
        CHECK (source_tool IN ('gmail', 'slack', 'calendar', 'whatsapp', 'linear', 'github', 'manual')),
    source_id TEXT,                          -- external message/event ID
    source_account TEXT,                     -- work, personal (for multi-account)
    source_thread_id TEXT,                   -- for threaded messages

    -- Content type
    type TEXT NOT NULL                       -- email, message, event, mention, notification
        CHECK (type IN ('email', 'message', 'event', 'mention', 'notification', 'task', 'file')),

    -- Content
    title TEXT NOT NULL,
    preview TEXT,                            -- first ~200 chars
    full_content TEXT,                       -- complete content
    html_content TEXT,                       -- original HTML if applicable

    -- Sender
    from_name TEXT,
    from_email TEXT,
    from_handle TEXT,                        -- @username for Slack/Twitter
    from_contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,

    -- Recipients (JSON array of {name, email, type: to/cc/bcc})
    recipients TEXT DEFAULT '[]',

    -- Thread context
    is_thread_starter INTEGER DEFAULT 0,
    thread_message_count INTEGER DEFAULT 1,

    -- AI Triage Results
    priority_score REAL                      -- 0.0 to 1.0
        CHECK (priority_score IS NULL OR (priority_score >= 0.0 AND priority_score <= 1.0)),
    urgency TEXT                             -- urgent, normal, low
        CHECK (urgency IS NULL OR urgency IN ('urgent', 'normal', 'low')),
    category TEXT                            -- meeting, request, fyi, personal, newsletter, spam
        CHECK (category IS NULL OR category IN (
            'meeting', 'request', 'question', 'fyi', 'personal',
            'newsletter', 'notification', 'spam', 'other'
        )),
    sentiment TEXT                           -- positive, neutral, negative
        CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),

    -- AI-extracted data
    needs_response INTEGER DEFAULT 0,
    response_deadline TEXT,                  -- when to respond by
    detected_actions TEXT DEFAULT '[]',      -- JSON array of {type, description, due_date}
    detected_dates TEXT DEFAULT '[]',        -- JSON array of {date, description}
    detected_contacts TEXT DEFAULT '[]',     -- JSON array of contact mentions
    summary TEXT,                            -- AI-generated summary
    suggested_reply TEXT,                    -- AI draft reply

    -- Filing
    related_project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    related_area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,

    -- Processing state
    processed INTEGER DEFAULT 0,
    processed_at TEXT,
    action_taken TEXT                        -- replied, filed, delegated, archived, snoozed, deleted
        CHECK (action_taken IS NULL OR action_taken IN (
            'replied', 'filed', 'delegated', 'archived', 'snoozed', 'deleted', 'created_task'
        )),
    filed_to TEXT,                           -- project/area path

    -- Snooze/defer
    snoozed_until TEXT,
    deferred_until TEXT,

    -- Read state
    is_read INTEGER DEFAULT 0,
    is_starred INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,

    -- Attachments (JSON array of {name, type, size, url})
    attachments TEXT DEFAULT '[]',

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    embedding BLOB,                          -- F32[1024]

    -- Timestamps
    received_at TEXT NOT NULL,               -- when originally received
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_inbox_processed ON inbox_items(processed);
CREATE INDEX idx_inbox_source ON inbox_items(source_tool, source_id);
CREATE INDEX idx_inbox_priority ON inbox_items(priority_score DESC);
CREATE INDEX idx_inbox_received ON inbox_items(received_at DESC);
CREATE INDEX idx_inbox_contact ON inbox_items(from_contact_id);
CREATE INDEX idx_inbox_snoozed ON inbox_items(snoozed_until) WHERE snoozed_until IS NOT NULL;
CREATE INDEX idx_inbox_project ON inbox_items(related_project_id);

-- Composite for triage queue
CREATE INDEX idx_inbox_triage ON inbox_items(processed, priority_score DESC, received_at DESC)
    WHERE processed = 0;

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS inbox_fts USING fts5(
    title, preview, full_content, from_name, summary,
    content='inbox_items',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- FTS sync triggers
CREATE TRIGGER inbox_fts_ai AFTER INSERT ON inbox_items BEGIN
    INSERT INTO inbox_fts(rowid, title, preview, full_content, from_name, summary)
    VALUES (NEW.rowid, NEW.title, NEW.preview, NEW.full_content, NEW.from_name, NEW.summary);
END;

CREATE TRIGGER inbox_fts_ad AFTER DELETE ON inbox_items BEGIN
    INSERT INTO inbox_fts(inbox_fts, rowid, title, preview, full_content, from_name, summary)
    VALUES('delete', OLD.rowid, OLD.title, OLD.preview, OLD.full_content, OLD.from_name, OLD.summary);
END;

CREATE TRIGGER inbox_fts_au AFTER UPDATE ON inbox_items BEGIN
    INSERT INTO inbox_fts(inbox_fts, rowid, title, preview, full_content, from_name, summary)
    VALUES('delete', OLD.rowid, OLD.title, OLD.preview, OLD.full_content, OLD.from_name, OLD.summary);
    INSERT INTO inbox_fts(rowid, title, preview, full_content, from_name, summary)
    VALUES (NEW.rowid, NEW.title, NEW.preview, NEW.full_content, NEW.from_name, NEW.summary);
END;

-- ============================================================================
-- CONTACTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,                     -- cont_xxx

    -- Basic info
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    nickname TEXT,

    -- Type
    type TEXT DEFAULT 'person'
        CHECK (type IN ('person', 'organization', 'group')),

    -- Relationship
    relationship TEXT                        -- friend, family, colleague, client, vendor, acquaintance
        CHECK (relationship IS NULL OR relationship IN (
            'friend', 'family', 'colleague', 'client', 'vendor', 'acquaintance',
            'manager', 'report', 'mentor', 'mentee', 'other'
        )),
    relationship_strength TEXT DEFAULT 'normal'
        CHECK (relationship_strength IN ('close', 'normal', 'distant')),

    -- Work info
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
    job_title TEXT,
    department TEXT,

    -- Profile
    avatar_url TEXT,
    bio TEXT,

    -- Communication preferences (learned over time)
    preferred_channel TEXT                   -- email, phone, slack, whatsapp
        CHECK (preferred_channel IS NULL OR preferred_channel IN (
            'email', 'phone', 'slack', 'whatsapp', 'linkedin', 'text'
        )),
    preferred_name TEXT,                     -- how they like to be addressed
    timezone TEXT,                           -- e.g., 'America/New_York'
    typical_response_time TEXT,              -- e.g., '2-4 hours'
    best_contact_times TEXT DEFAULT '[]',    -- JSON array of {day, start, end}

    -- Notes
    notes TEXT,
    private_notes TEXT,                      -- never shared with AI

    -- Tracking
    last_interaction_at TEXT,
    last_interaction_type TEXT,              -- email, meeting, call
    interaction_count INTEGER DEFAULT 0,

    -- AI enrichment
    enriched_at TEXT,
    enrichment_source TEXT,                  -- linkedin, clearbit, manual

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    embedding BLOB,                          -- F32[1024]

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_relationship ON contacts(relationship);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_interaction ON contacts(last_interaction_at DESC);

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS contacts_fts USING fts5(
    name, first_name, last_name, nickname, job_title, bio, notes, tags,
    content='contacts',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- FTS sync triggers
CREATE TRIGGER contacts_fts_ai AFTER INSERT ON contacts BEGIN
    INSERT INTO contacts_fts(rowid, name, first_name, last_name, nickname, job_title, bio, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.first_name, NEW.last_name, NEW.nickname, NEW.job_title, NEW.bio, NEW.notes, NEW.tags);
END;

CREATE TRIGGER contacts_fts_ad AFTER DELETE ON contacts BEGIN
    INSERT INTO contacts_fts(contacts_fts, rowid, name, first_name, last_name, nickname, job_title, bio, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.first_name, OLD.last_name, OLD.nickname, OLD.job_title, OLD.bio, OLD.notes, OLD.tags);
END;

CREATE TRIGGER contacts_fts_au AFTER UPDATE ON contacts BEGIN
    INSERT INTO contacts_fts(contacts_fts, rowid, name, first_name, last_name, nickname, job_title, bio, notes, tags)
    VALUES('delete', OLD.rowid, OLD.name, OLD.first_name, OLD.last_name, OLD.nickname, OLD.job_title, OLD.bio, OLD.notes, OLD.tags);
    INSERT INTO contacts_fts(rowid, name, first_name, last_name, nickname, job_title, bio, notes, tags)
    VALUES (NEW.rowid, NEW.name, NEW.first_name, NEW.last_name, NEW.nickname, NEW.job_title, NEW.bio, NEW.notes, NEW.tags);
END;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,                     -- org_xxx
    name TEXT NOT NULL,

    -- Identification
    domain TEXT,                             -- company.com
    linkedin_url TEXT,
    website_url TEXT,

    -- Classification
    industry TEXT,
    size TEXT                                -- startup, small, medium, large, enterprise
        CHECK (size IS NULL OR size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    type TEXT                                -- company, agency, nonprofit, government, other
        CHECK (type IS NULL OR type IN ('company', 'agency', 'nonprofit', 'government', 'other')),

    -- Location
    headquarters_city TEXT,
    headquarters_country TEXT,

    -- Relationship
    relationship_type TEXT                   -- client, vendor, partner, prospect, employer
        CHECK (relationship_type IS NULL OR relationship_type IN (
            'client', 'vendor', 'partner', 'prospect', 'employer', 'other'
        )),

    -- Notes
    notes TEXT,

    -- AI enrichment
    description TEXT,                        -- AI-generated company description
    enriched_at TEXT,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_name ON organizations(name);

-- ============================================================================
-- CONTACT METHODS (emails, phones, social)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_methods (
    id TEXT PRIMARY KEY,                     -- cm_xxx
    contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Type
    type TEXT NOT NULL                       -- email, phone, linkedin, twitter, slack, github
        CHECK (type IN ('email', 'phone', 'linkedin', 'twitter', 'slack', 'github', 'whatsapp', 'other')),

    -- Value
    value TEXT NOT NULL,                     -- the actual address/number/handle

    -- Label
    label TEXT,                              -- work, personal, mobile, main

    -- Flags
    is_primary INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,

    -- Metadata
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_contact_methods_contact ON contact_methods(contact_id);
CREATE INDEX idx_contact_methods_type ON contact_methods(type);
CREATE INDEX idx_contact_methods_value ON contact_methods(value);

-- ============================================================================
-- PREFERENCES (User settings and learned behaviors)
-- ============================================================================

CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY,                     -- pref_xxx

    -- Categorization
    category TEXT NOT NULL,                  -- communication, calendar, triage, ui, agent
    key TEXT NOT NULL,                       -- specific preference name

    -- Value
    value TEXT NOT NULL,                     -- JSON value
    value_type TEXT DEFAULT 'string'         -- string, number, boolean, json
        CHECK (value_type IN ('string', 'number', 'boolean', 'json')),

    -- Learning metadata
    source TEXT DEFAULT 'user'               -- user, learned, default
        CHECK (source IN ('user', 'learned', 'default')),
    confidence REAL DEFAULT 1.0              -- 0.0 to 1.0 for learned preferences
        CHECK (confidence >= 0.0 AND confidence <= 1.0),
    observation_count INTEGER DEFAULT 1,     -- how many times observed (for learned)

    -- Description
    description TEXT,                        -- human-readable explanation

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(category, key)
);

CREATE INDEX idx_preferences_category ON preferences(category);
CREATE INDEX idx_preferences_source ON preferences(source);

-- ============================================================================
-- TEMPLATES (Email, message, document templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,                     -- tmpl_xxx

    -- Identification
    name TEXT NOT NULL,
    description TEXT,

    -- Type
    type TEXT NOT NULL                       -- email, message, meeting_agenda, document
        CHECK (type IN ('email', 'message', 'meeting_agenda', 'document', 'reply', 'other')),

    -- Content
    subject TEXT,                            -- for emails
    body TEXT NOT NULL,

    -- Variables (JSON array of {name, description, default_value})
    variables TEXT DEFAULT '[]',

    -- Context
    use_case TEXT,                           -- cold_outreach, follow_up, meeting_request, etc.
    tone TEXT                                -- formal, casual, friendly, professional
        CHECK (tone IS NULL OR tone IN ('formal', 'casual', 'friendly', 'professional')),

    -- Usage
    use_count INTEGER DEFAULT 0,
    last_used_at TEXT,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_use_case ON templates(use_case);

-- ============================================================================
-- TAGS (Universal tagging system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,                     -- tag_xxx
    name TEXT NOT NULL UNIQUE,

    -- Display
    color TEXT,                              -- hex color
    icon TEXT,                               -- emoji or icon name

    -- Classification
    category TEXT,                           -- work, personal, priority, status

    -- Usage
    use_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_category ON tags(category);

-- ============================================================================
-- ENTITY_TAGS (Many-to-many tag associations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS entity_tags (
    id TEXT PRIMARY KEY,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL                -- project, task, contact, inbox_item, resource
        CHECK (entity_type IN ('project', 'task', 'contact', 'inbox_item', 'resource', 'area')),
    entity_id TEXT NOT NULL,

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),

    UNIQUE(tag_id, entity_type, entity_id)
);

CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id);

-- ============================================================================
-- ACTION LOG (Audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS action_log (
    id TEXT PRIMARY KEY,                     -- log_xxx

    -- What happened
    action_type TEXT NOT NULL,               -- create, update, delete, triage, send, file
    entity_type TEXT NOT NULL,               -- task, inbox_item, contact, project
    entity_id TEXT NOT NULL,

    -- Who/what did it
    actor TEXT NOT NULL,                     -- user, ai, system, agent:<name>

    -- Details
    description TEXT,                        -- human-readable description
    changes TEXT,                            -- JSON of {field: {old, new}}

    -- Context
    conversation_id TEXT,                    -- if from a chat session

    -- Metadata
    metadata TEXT DEFAULT '{}',

    -- Timestamp
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_action_log_entity ON action_log(entity_type, entity_id);
CREATE INDEX idx_action_log_type ON action_log(action_type);
CREATE INDEX idx_action_log_actor ON action_log(actor);
CREATE INDEX idx_action_log_time ON action_log(created_at DESC);

-- ============================================================================
-- CONVERSATIONS (Chat sessions with Orion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,                     -- conv_xxx

    -- SDK integration
    sdk_session_id TEXT,                     -- Claude Agent SDK session ID
    sdk_checkpoint_path TEXT,                -- path to SDK checkpoint file

    -- Display
    title TEXT,                              -- auto-generated or user-set
    summary TEXT,                            -- AI-generated summary

    -- Context
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,

    -- Stats
    message_count INTEGER DEFAULT 0,
    tool_call_count INTEGER DEFAULT 0,

    -- State
    is_active INTEGER DEFAULT 1,
    is_pinned INTEGER DEFAULT 0,

    -- Metadata
    tags TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    started_at TEXT DEFAULT (datetime('now')),
    last_message_at TEXT,
    archived_at TEXT
);

CREATE INDEX idx_conversations_session ON conversations(sdk_session_id);
CREATE INDEX idx_conversations_active ON conversations(is_active, last_message_at DESC);
CREATE INDEX idx_conversations_project ON conversations(project_id);

-- ============================================================================
-- MESSAGES (Individual messages in conversations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,                     -- msg_xxx
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Content
    role TEXT NOT NULL                       -- user, assistant, system
        CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- Tool calls (for assistant messages)
    tool_calls TEXT,                         -- JSON array of tool calls
    tool_results TEXT,                       -- JSON array of results

    -- Tokens (for cost/context tracking)
    input_tokens INTEGER,
    output_tokens INTEGER,

    -- User feedback
    feedback TEXT                            -- thumbs_up, thumbs_down
        CHECK (feedback IS NULL OR feedback IN ('thumbs_up', 'thumbs_down')),
    feedback_note TEXT,

    -- Metadata
    metadata TEXT DEFAULT '{}',

    -- Timestamp
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- ============================================================================
-- TOOL CONNECTIONS (Composio OAuth connections)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tool_connections (
    id TEXT PRIMARY KEY,                     -- conn_xxx

    -- Identification
    tool_name TEXT NOT NULL,                 -- gmail, slack, calendar, linear
    account_alias TEXT NOT NULL,             -- work, personal, default

    -- Connection type
    connection_type TEXT NOT NULL            -- composio, api_key, oauth
        CHECK (connection_type IN ('composio', 'api_key', 'oauth_direct')),

    -- Composio-specific
    composio_connection_id TEXT,
    composio_entity_id TEXT,

    -- Status
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'revoked', 'error', 'pending')),
    last_error TEXT,

    -- Capabilities (JSON array of available actions)
    capabilities TEXT DEFAULT '[]',

    -- Token expiry
    expires_at TEXT,
    last_refreshed_at TEXT,

    -- Account info (non-sensitive)
    account_email TEXT,
    account_name TEXT,

    -- Metadata
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_used_at TEXT,

    UNIQUE(tool_name, account_alias)
);

CREATE INDEX idx_tool_connections_tool ON tool_connections(tool_name);
CREATE INDEX idx_tool_connections_status ON tool_connections(status);

-- ============================================================================
-- SYNC CURSORS (For incremental sync with external tools)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_cursors (
    id TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL,
    account_alias TEXT NOT NULL,
    cursor_type TEXT NOT NULL,               -- messages, events, history_id
    cursor_value TEXT NOT NULL,
    last_synced_at TEXT DEFAULT (datetime('now')),

    UNIQUE(tool_name, account_alias, cursor_type)
);

CREATE INDEX idx_sync_cursors_tool ON sync_cursors(tool_name, account_alias);

-- ============================================================================
-- INTERACTION LOG (For preference learning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS interaction_log (
    id TEXT PRIMARY KEY,                     -- int_xxx

    -- What was suggested
    interaction_type TEXT NOT NULL,          -- email_draft, meeting_time, task_priority, reply_tone
    suggestion TEXT NOT NULL,                -- JSON of what was suggested

    -- User response
    accepted INTEGER,                        -- 1 = yes, 0 = no, NULL = ignored
    user_modification TEXT,                  -- JSON of what user changed

    -- Context
    context TEXT,                            -- JSON of relevant context

    -- Timestamp
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_interaction_type ON interaction_log(interaction_type);
CREATE INDEX idx_interaction_accepted ON interaction_log(accepted);

-- ============================================================================
-- SYNC STATUS (For PARA file sync)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_status (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,               -- contact, project, task, area
    entity_id TEXT NOT NULL,
    file_path TEXT,                          -- PARA file path if synced
    file_hash TEXT,                          -- for change detection
    sync_direction TEXT DEFAULT 'bidirectional'
        CHECK (sync_direction IN ('file_to_db', 'db_to_file', 'bidirectional')),
    last_synced_at TEXT,

    UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_sync_status_entity ON sync_status(entity_type, entity_id);
```

---

## PostgreSQL Schema (Extensions for Orion)

Add these tables to the existing `docker/init-schema.sql`:

```sql
-- ============================================================================
-- ORION-SPECIFIC POSTGRESQL TABLES
-- Add to docker/init-schema.sql after existing tables
-- ============================================================================

-- Orion user profile (for cross-device sync)
CREATE TABLE IF NOT EXISTS orion_user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,            -- stable user identifier

    -- Profile
    name TEXT,
    email TEXT,
    timezone TEXT DEFAULT 'UTC',

    -- Preferences snapshot (synced from SQLite)
    preferences_snapshot JSONB DEFAULT '{}'::jsonb,

    -- Last known state
    last_device_id TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orion_user_email ON orion_user_profile(email);

-- Orion sync state (cross-device coordination)
CREATE TABLE IF NOT EXISTS orion_sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES orion_user_profile(user_id),
    device_id TEXT NOT NULL,

    -- Sync vectors (last sync timestamp per entity type)
    sync_vectors JSONB DEFAULT '{}'::jsonb,  -- {tasks: "2026-01-14T10:00:00Z", ...}

    -- Conflict resolution
    last_conflict_at TIMESTAMPTZ,
    conflict_count INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'active',
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_orion_sync_user ON orion_sync_state(user_id);

-- Orion shared embeddings (expensive to recompute)
CREATE TABLE IF NOT EXISTS orion_shared_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,

    -- Entity reference
    entity_type TEXT NOT NULL,               -- contact, project, task, inbox_item
    entity_id TEXT NOT NULL,
    entity_hash TEXT NOT NULL,               -- hash of content used for embedding

    -- Embedding
    embedding vector(1024),                  -- BGE-large-en-v1.5

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_orion_embeddings_user ON orion_shared_embeddings(user_id, entity_type);
CREATE INDEX idx_orion_embeddings_vector ON orion_shared_embeddings
    USING hnsw(embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Orion learnings (extends archival_memory for Orion-specific learnings)
-- Uses existing archival_memory table with metadata.source = 'orion'
-- No new table needed - just query:
--   SELECT * FROM archival_memory WHERE metadata->>'source' = 'orion'
```

---

## Migration Strategy

### Phase 1: Initial Schema (Week 3)

```javascript
// migrations/001_initial_schema.js
export const migration = {
  version: 1,
  name: 'initial_schema',

  up: async (db) => {
    // Execute full SQLite schema from above
    await db.exec(FULL_SQLITE_SCHEMA);

    // Insert default preferences
    await db.run(`
      INSERT INTO preferences (id, category, key, value, source, description)
      VALUES
        ('pref_001', 'triage', 'auto_categorize', 'true', 'default', 'Auto-categorize inbox items'),
        ('pref_002', 'triage', 'priority_threshold', '0.7', 'default', 'Show items above this priority'),
        ('pref_003', 'calendar', 'default_meeting_duration', '30', 'default', 'Default meeting length in minutes'),
        ('pref_004', 'calendar', 'buffer_between_meetings', '15', 'default', 'Buffer time in minutes'),
        ('pref_005', 'communication', 'default_tone', '"professional"', 'default', 'Default email tone')
    `);

    // Insert default areas
    await db.run(`
      INSERT INTO areas (id, name, description, icon, color, sort_order)
      VALUES
        ('area_career', 'Career', 'Professional development and work', '💼', '#3B82F6', 1),
        ('area_health', 'Health', 'Physical and mental wellbeing', '❤️', '#EF4444', 2),
        ('area_finance', 'Finance', 'Money and investments', '💰', '#10B981', 3),
        ('area_relationships', 'Relationships', 'Family and friends', '👥', '#8B5CF6', 4),
        ('area_personal', 'Personal Growth', 'Learning and development', '🌱', '#F59E0B', 5)
    `);
  },

  down: async (db) => {
    // Drop in reverse dependency order
    const tables = [
      'sync_status', 'interaction_log', 'sync_cursors', 'tool_connections',
      'messages', 'conversations', 'action_log', 'entity_tags', 'tags',
      'templates', 'preferences', 'contact_methods', 'organizations',
      'contacts', 'inbox_items', 'tasks', 'resources', 'projects', 'areas',
      'schema_migrations'
    ];

    for (const table of tables) {
      await db.exec(`DROP TABLE IF EXISTS ${table}`);
    }

    // Drop FTS tables
    const ftsTables = ['projects_fts', 'tasks_fts', 'inbox_fts', 'contacts_fts'];
    for (const table of ftsTables) {
      await db.exec(`DROP TABLE IF EXISTS ${table}`);
    }
  }
};
```

### Phase 2: Vector Tables (Week 4)

```javascript
// migrations/002_vector_tables.js
export const migration = {
  version: 2,
  name: 'vector_tables',

  up: async (db, loadVec) => {
    // Load sqlite-vec extension
    loadVec(db);

    // Create virtual vector tables
    await db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vec_contacts USING vec0(
        id TEXT PRIMARY KEY,
        embedding FLOAT[1024]
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS vec_tasks USING vec0(
        id TEXT PRIMARY KEY,
        embedding FLOAT[1024]
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS vec_inbox USING vec0(
        id TEXT PRIMARY KEY,
        embedding FLOAT[1024]
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS vec_projects USING vec0(
        id TEXT PRIMARY KEY,
        embedding FLOAT[1024]
      );
    `);
  },

  down: async (db) => {
    await db.exec(`
      DROP TABLE IF EXISTS vec_contacts;
      DROP TABLE IF EXISTS vec_tasks;
      DROP TABLE IF EXISTS vec_inbox;
      DROP TABLE IF EXISTS vec_projects;
    `);
  }
};
```

### Phase 3: Backfill Embeddings (Week 4)

```javascript
// migrations/003_backfill_embeddings.js
export const migration = {
  version: 3,
  name: 'backfill_embeddings',

  up: async (db, generateEmbedding) => {
    // Backfill contact embeddings
    const contacts = db.prepare(`
      SELECT id, name, job_title, bio, notes FROM contacts WHERE embedding IS NULL
    `).all();

    for (const contact of contacts) {
      const text = [contact.name, contact.job_title, contact.bio, contact.notes]
        .filter(Boolean)
        .join(' ');

      const embedding = await generateEmbedding(text);
      const buffer = Buffer.from(new Float32Array(embedding).buffer);

      db.prepare('UPDATE contacts SET embedding = ? WHERE id = ?')
        .run(buffer, contact.id);

      db.prepare('INSERT INTO vec_contacts (id, embedding) VALUES (?, ?)')
        .run(contact.id, buffer);
    }

    // Similar for tasks, projects, inbox_items...
  }
};
```

---

## Sync Strategy

### What Syncs Where

| Data | SQLite -> PostgreSQL | PostgreSQL -> SQLite | Notes |
|------|---------------------|---------------------|-------|
| Tasks | No | No | Local only |
| Projects | No | No | Local only |
| Contacts | No | No | Local only |
| Inbox items | No | No | Local only |
| Preferences | Yes (snapshot) | Yes (on login) | Snapshot sync |
| Embeddings | Yes (cache) | Yes (if missing) | Computed once |
| Learnings | Yes (new) | Yes (recall) | Via archival_memory |

### Sync Flow

```
+----------------+                    +----------------+
|    SQLite      |                    |   PostgreSQL   |
|    (Device)    |                    |   (Cloud)      |
+----------------+                    +----------------+
        |                                     |
        |  1. Generate embedding locally      |
        |------------------------------------>|
        |     (if not in shared cache)        |
        |                                     |
        |  2. Cache embedding                 |
        |<------------------------------------|
        |                                     |
        |  3. Store learning                  |
        |------------------------------------>|
        |     (archival_memory)               |
        |                                     |
        |  4. Recall relevant learnings       |
        |<------------------------------------|
        |                                     |
        |  5. Sync preference snapshot        |
        |------------------------------------>|
        |     (on significant change)         |
        |                                     |
```

### Sync Implementation

```typescript
// src/lib/database/sync.ts

interface SyncManager {
  // Embedding sync - check PostgreSQL before computing
  async getOrCreateEmbedding(entityType: string, entityId: string, content: string): Promise<Float32Array> {
    const contentHash = hashContent(content);

    // Check PostgreSQL cache first
    const cached = await postgresQuery(`
      SELECT embedding FROM orion_shared_embeddings
      WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3 AND entity_hash = $4
    `, [userId, entityType, entityId, contentHash]);

    if (cached) {
      // Update local SQLite
      await sqliteRun(`UPDATE ${entityType}s SET embedding = ? WHERE id = ?`,
        [cached.embedding, entityId]);
      return cached.embedding;
    }

    // Generate new embedding
    const embedding = await generateBGEEmbedding(content);

    // Store in both databases
    await sqliteRun(`UPDATE ${entityType}s SET embedding = ? WHERE id = ?`,
      [embedding, entityId]);

    await postgresQuery(`
      INSERT INTO orion_shared_embeddings (user_id, entity_type, entity_id, entity_hash, embedding)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, entity_type, entity_id)
      DO UPDATE SET entity_hash = $4, embedding = $5
    `, [userId, entityType, entityId, contentHash, embedding]);

    return embedding;
  }

  // Preference sync - snapshot on change
  async syncPreferences(): Promise<void> {
    const prefs = await sqliteAll('SELECT category, key, value FROM preferences');
    const snapshot = prefs.reduce((acc, p) => {
      acc[`${p.category}.${p.key}`] = JSON.parse(p.value);
      return acc;
    }, {});

    await postgresQuery(`
      UPDATE orion_user_profile
      SET preferences_snapshot = $1, updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(snapshot), userId]);
  }

  // Learning sync - store to archival_memory
  async storeLearning(content: string, context: string): Promise<void> {
    const embedding = await generateBGEEmbedding(content);

    await postgresQuery(`
      INSERT INTO archival_memory (session_id, content, metadata, embedding)
      VALUES ($1, $2, $3, $4)
    `, [
      'orion-' + Date.now(),
      content,
      JSON.stringify({ source: 'orion', context }),
      embedding
    ]);
  }
}
```

---

## Index Strategy

### SQLite Indexes (Included in Schema)

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| tasks | status, due_date, priority | Composite | Active task queries |
| tasks | project_id | B-tree | Project task list |
| inbox_items | processed, priority_score DESC | Composite | Triage queue |
| inbox_items | received_at DESC | B-tree | Chronological view |
| contacts | name | B-tree | Name lookup |
| contacts | last_interaction_at DESC | B-tree | Recent contacts |
| messages | conversation_id, created_at | Composite | Message history |

### PostgreSQL Indexes (Existing + New)

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| archival_memory | embedding | HNSW | Vector similarity |
| archival_memory | content | GIN (FTS) | Full-text search |
| orion_shared_embeddings | embedding | HNSW | Vector cache lookup |
| orion_shared_embeddings | user_id, entity_type | B-tree | Entity lookup |

### Full-Text Search Strategy

```sql
-- SQLite FTS5 search example
SELECT c.*,
       bm25(contacts_fts) as rank
FROM contacts c
JOIN contacts_fts ON c.rowid = contacts_fts.rowid
WHERE contacts_fts MATCH 'john product manager'
ORDER BY rank
LIMIT 20;

-- PostgreSQL FTS search example
SELECT id, content,
       ts_rank(to_tsvector('english', content), plainto_tsquery('english', 'authentication patterns')) as rank
FROM archival_memory
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'authentication patterns')
ORDER BY rank DESC
LIMIT 10;
```

---

## Embedding Storage

### SQLite (Local)

```typescript
// Store embedding as BLOB (F32 array)
async function storeEmbedding(db: Database, table: string, id: string, embedding: number[]): Promise<void> {
  const buffer = Buffer.from(new Float32Array(embedding).buffer);

  await db.run(
    `UPDATE ${table} SET embedding = ?, updated_at = datetime('now') WHERE id = ?`,
    [buffer, id]
  );

  // Also update vec table if using sqlite-vec
  await db.run(
    `INSERT OR REPLACE INTO vec_${table} (id, embedding) VALUES (?, ?)`,
    [id, buffer]
  );
}

// Query embedding similarity (without sqlite-vec)
async function findSimilar(db: Database, table: string, queryEmbedding: number[], limit = 10): Promise<any[]> {
  const rows = await db.all(`SELECT id, embedding FROM ${table} WHERE embedding IS NOT NULL`);

  // Compute cosine similarity in JS
  const scored = rows.map(row => {
    const stored = new Float32Array(row.embedding);
    const similarity = cosineSimilarity(queryEmbedding, Array.from(stored));
    return { id: row.id, similarity };
  });

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

// Query with sqlite-vec (much faster)
async function findSimilarVec(db: Database, table: string, queryEmbedding: number[], limit = 10): Promise<any[]> {
  const buffer = Buffer.from(new Float32Array(queryEmbedding).buffer);

  return db.all(`
    SELECT t.*, v.distance
    FROM ${table} t
    JOIN vec_${table} v ON t.id = v.id
    WHERE v.embedding MATCH ?
    ORDER BY v.distance
    LIMIT ?
  `, [buffer, limit]);
}
```

### PostgreSQL (Shared)

```typescript
// Store embedding with pgvector
async function storeEmbeddingPg(
  client: Pool,
  entityType: string,
  entityId: string,
  content: string,
  embedding: number[]
): Promise<void> {
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  await client.query(`
    INSERT INTO orion_shared_embeddings (user_id, entity_type, entity_id, entity_hash, embedding)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, entity_type, entity_id)
    DO UPDATE SET entity_hash = $4, embedding = $5, created_at = NOW()
  `, [userId, entityType, entityId, hash, `[${embedding.join(',')}]`]);
}

// Query with pgvector
async function findSimilarPg(
  client: Pool,
  queryEmbedding: number[],
  limit = 10
): Promise<any[]> {
  return client.query(`
    SELECT entity_type, entity_id,
           1 - (embedding <=> $1) as similarity
    FROM orion_shared_embeddings
    WHERE user_id = $2
    ORDER BY embedding <=> $1
    LIMIT $3
  `, [`[${queryEmbedding.join(',')}]`, userId, limit]);
}
```

---

## Sample Queries

### 1. Get Unprocessed Inbox (Triage Queue)

```sql
-- SQLite: Triage queue ordered by priority
SELECT
    i.*,
    c.name as from_contact_name,
    c.relationship as contact_relationship,
    p.name as related_project_name
FROM inbox_items i
LEFT JOIN contacts c ON i.from_contact_id = c.id
LEFT JOIN projects p ON i.related_project_id = p.id
WHERE i.processed = 0
  AND (i.snoozed_until IS NULL OR i.snoozed_until <= datetime('now'))
ORDER BY
    CASE WHEN i.urgency = 'urgent' THEN 0 ELSE 1 END,
    i.priority_score DESC,
    i.received_at DESC
LIMIT 50;

-- Expected: <50ms for 10,000 inbox items
```

### 2. Find Tasks Due This Week

```sql
-- SQLite: Tasks due this week
SELECT
    t.*,
    p.name as project_name,
    c.name as assigned_to_name
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN contacts c ON t.assigned_to = c.id
WHERE t.status IN ('pending', 'in_progress')
  AND t.due_date BETWEEN date('now') AND date('now', '+7 days')
ORDER BY t.due_date, t.priority DESC;

-- Expected: <20ms for 5,000 tasks
```

### 3. Search Contacts Semantically

```sql
-- SQLite with sqlite-vec: Find contacts similar to query
SELECT
    c.*,
    v.distance as similarity_distance
FROM contacts c
JOIN vec_contacts v ON c.id = v.id
WHERE v.embedding MATCH ?  -- query embedding as F32 buffer
ORDER BY v.distance
LIMIT 10;

-- Expected: <100ms for 10,000 contacts
```

### 4. Full-Text Search Across Entities

```sql
-- SQLite FTS5: Search tasks and projects
SELECT 'task' as entity_type, t.id, t.title, bm25(tasks_fts) as rank
FROM tasks t
JOIN tasks_fts ON t.rowid = tasks_fts.rowid
WHERE tasks_fts MATCH 'quarterly review'

UNION ALL

SELECT 'project' as entity_type, p.id, p.name as title, bm25(projects_fts) as rank
FROM projects p
JOIN projects_fts ON p.rowid = projects_fts.rowid
WHERE projects_fts MATCH 'quarterly review'

ORDER BY rank
LIMIT 20;

-- Expected: <50ms for combined 15,000 entities
```

### 5. Get Project with All Related Data

```sql
-- SQLite: Project detail with tasks, contacts, resources
WITH project_tasks AS (
    SELECT project_id,
           COUNT(*) as total_tasks,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
    FROM tasks
    GROUP BY project_id
)
SELECT
    p.*,
    a.name as area_name,
    pt.total_tasks,
    pt.completed_tasks,
    (SELECT json_group_array(json_object(
        'id', c.id, 'name', c.name, 'role', json_extract(s.value, '$.role')
    ))
    FROM json_each(p.stakeholders) s
    JOIN contacts c ON json_extract(s.value, '$.contact_id') = c.id
    ) as stakeholder_details
FROM projects p
LEFT JOIN areas a ON p.area_id = a.id
LEFT JOIN project_tasks pt ON p.id = pt.project_id
WHERE p.id = ?;

-- Expected: <30ms
```

### 6. Recall Relevant Learnings (PostgreSQL)

```sql
-- PostgreSQL: Hybrid search for learnings
WITH text_matches AS (
    SELECT id, content, metadata,
           ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as text_rank
    FROM archival_memory
    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
    LIMIT 50
),
vector_matches AS (
    SELECT id, content, metadata,
           1 - (embedding <=> $2) as vector_rank
    FROM archival_memory
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $2
    LIMIT 50
)
SELECT DISTINCT ON (id)
    COALESCE(t.id, v.id) as id,
    COALESCE(t.content, v.content) as content,
    COALESCE(t.metadata, v.metadata) as metadata,
    -- RRF score
    (1.0 / (60 + COALESCE(t.text_rank, 0))) + (1.0 / (60 + COALESCE(v.vector_rank, 0))) as rrf_score
FROM text_matches t
FULL OUTER JOIN vector_matches v ON t.id = v.id
ORDER BY id, rrf_score DESC
LIMIT 10;

-- Expected: <200ms for 100,000 learnings
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/database/schema.test.ts
describe('SQLite Schema', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database(':memory:');
    await applyMigrations(db);
  });

  test('creates all tables', async () => {
    const tables = await db.all(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `);

    expect(tables.map(t => t.name)).toContain('tasks');
    expect(tables.map(t => t.name)).toContain('inbox_items');
    expect(tables.map(t => t.name)).toContain('contacts');
  });

  test('enforces foreign key constraints', async () => {
    // Should fail - invalid project_id
    await expect(
      db.run(`INSERT INTO tasks (id, title, project_id) VALUES ('t1', 'Test', 'invalid')`)
    ).rejects.toThrow();
  });

  test('FTS triggers work', async () => {
    await db.run(`INSERT INTO contacts (id, name, notes) VALUES ('c1', 'John Doe', 'Product manager at Acme')`);

    const results = await db.all(`
      SELECT * FROM contacts_fts WHERE contacts_fts MATCH 'product manager'
    `);

    expect(results).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
// tests/database/queries.test.ts
describe('Query Performance', () => {
  test('triage queue <50ms with 10k items', async () => {
    // Seed 10k inbox items
    await seedInboxItems(10000);

    const start = performance.now();
    await db.all(TRIAGE_QUEUE_QUERY);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });

  test('semantic search <100ms with 10k contacts', async () => {
    await seedContacts(10000);
    await backfillEmbeddings();

    const queryEmbedding = await generateEmbedding('product manager');

    const start = performance.now();
    await findSimilarVec(db, 'contacts', queryEmbedding, 10);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

---

## Risk Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| sqlite-vec not mature | Medium | Medium | Use BLOB + JS fallback initially |
| Embedding recomputation expensive | Low | Medium | Cache in PostgreSQL |
| Schema migration failures | Low | High | Transaction-wrapped migrations |
| FTS index corruption | Low | High | VACUUM regularly, integrity checks |
| Sync conflicts | Medium | Low | Last-write-wins for preferences |

---

## Estimated Complexity

| Component | Effort | Notes |
|-----------|--------|-------|
| SQLite schema creation | 1 day | Straightforward |
| Migration runner | 0.5 day | Simple version tracking |
| FTS triggers | Included | In schema |
| Vector tables | 0.5 day | After sqlite-vec setup |
| Repository layer | 2 days | Type-safe CRUD |
| Sync implementation | 1 day | Embedding + preference sync |
| **Total** | **5 days** | Phase 2 of MVP |

---

## Next Steps

1. **Immediate:** Create `orion-app/src/lib/database/` directory structure
2. **This week:** Implement migration runner, apply initial schema
3. **Week 3:** Add repository layer with TypeScript types
4. **Week 4:** Enable sqlite-vec, backfill embeddings
5. **Week 5:** Test performance with realistic data volumes

---

## References

- Existing schema: `thoughts/research/database-schema-design.md`
- PostgreSQL schema: `docker/init-schema.sql`
- OPC schema: `opc/init-db.sql`
- sqlite-vec: https://github.com/asg017/sqlite-vec
- Tauri SQLite: https://tauri.app/plugin/sql/
