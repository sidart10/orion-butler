# Story 2a.4: Tool Permission System (canUseTool)

**Status:** ready-for-dev
**Epic:** 2a - Core Agent Infrastructure
**Story Key:** 2a-4-tool-permission-system
**Priority:** P0 (Security)
**Risk:** HIGH

---

## Story

As a user,
I want control over what actions agents can take automatically,
So that I maintain oversight of sensitive operations.

---

## Acceptance Criteria

### AC1: Tool Categorization and Automatic Execution

**Given** an agent wants to use a tool
**When** it calls canUseTool callback (ARCH-021)
**Then** read-only tools execute automatically
**And** write/send tools require user confirmation
**And** destructive tools are blocked until explicitly approved

- [ ] `canUseTool` function categorizes all tools into READ/WRITE/DESTRUCTIVE
- [ ] READ tools (get_emails, get_calendar_events, search_contacts, get_preferences) execute without prompt
- [ ] WRITE tools (send_email, create_event, update_contact, create_task) require confirmation
- [ ] DESTRUCTIVE tools (delete_email, cancel_event, delete_contact, archive_project) are blocked by default
- [ ] Tool categories are defined in a central `TOOL_CATALOG` constant

### AC2: User Confirmation UI

**Given** a tool requires confirmation
**When** the agent requests it
**Then** I see a clear prompt explaining what the tool will do
**And** I can approve, deny, or modify the action
**And** my decision is logged for audit

- [ ] Permission dialog component shows tool name and action description
- [ ] Dialog displays input parameters (summarized, not raw JSON)
- [ ] "Approve" button allows tool execution
- [ ] "Deny" button blocks tool execution and returns denial to agent
- [ ] Permission decision is logged to `action_log` table (PM-001)
- [ ] Dialog has clear visual hierarchy matching Orion Design System

### AC3: Session Permission Memory

**Given** I've approved a tool type before
**When** the same tool is requested again in the session
**Then** I can choose "always allow" for the session
**And** session permissions reset on app restart

- [ ] "Always allow for this session" checkbox in permission dialog
- [ ] Session permissions stored in memory (not persisted)
- [ ] Session permissions are checked before showing dialog
- [ ] All session permissions cleared on app restart
- [ ] Permission state is accessible via `SessionPermissionStore`

### AC4: Permission Decision Audit

**Given** any tool permission decision occurs
**When** the user approves, denies, or auto-allows
**Then** the decision is recorded in action_log with context
**And** the audit trail can be queried for analysis

- [ ] `PermissionService` records all decisions to action_log table
- [ ] Audit log includes: tool name, decision, timestamp, context, always_allow flag
- [ ] Denied decisions include reason (if provided)
- [ ] Audit log supports queries by tool, decision type, time range

### AC5: Warning Messages for Destructive Tools

**Given** a destructive tool is requested
**When** canUseTool evaluates it
**Then** a clear warning message is generated
**And** explicit approval requires an extra confirmation step

- [ ] Warning messages are defined for each destructive tool
- [ ] Warning messages explain potential consequences
- [ ] Two-step approval for destructive actions (confirm dialog + type confirmation)
- [ ] Cannot "always allow" destructive tools

---

## Tasks / Subtasks

### Task 1: Create Tool Permission Types and Catalog (AC: #1)

- [ ] 1.1 Create `src/agents/permissions/types.ts` with TypeScript interfaces
- [ ] 1.2 Create `src/agents/permissions/catalog.ts` with TOOL_CATALOG constant
- [ ] 1.3 Define `ToolCategory` enum: READ, WRITE, DESTRUCTIVE
- [ ] 1.4 Define `PermissionDecision` interface with allowed, requiresConfirmation, etc.
- [ ] 1.5 Map all known Orion tools to their categories

### Task 2: Implement canUseTool Function (AC: #1, #3)

- [ ] 2.1 Create `src/agents/permissions/canUseTool.ts` - main permission evaluation function
- [ ] 2.2 Implement category lookup from TOOL_CATALOG
- [ ] 2.3 Implement session permission checking
- [ ] 2.4 Return structured `PermissionDecision` with all required fields
- [ ] 2.5 Add warning message generation for destructive tools

### Task 3: Create Session Permission Store (AC: #3)

- [ ] 3.1 Create `src/agents/permissions/session-store.ts`
- [ ] 3.2 Implement `SessionPermissionStore` class with in-memory storage
- [ ] 3.3 Add `grantPermission(tool, alwaysAllow)` method
- [ ] 3.4 Add `checkPermission(tool)` method
- [ ] 3.5 Add `clearAll()` method for app restart
- [ ] 3.6 Wire store clearing to app initialization

### Task 4: Create Permission Service for Audit (AC: #2, #4)

- [ ] 4.1 Create `src/services/permissions.ts` - PermissionService class
- [ ] 4.2 Implement `recordDecision(tool, decision, context)` method
- [ ] 4.3 Create action_log table schema migration (if not exists from PM-001)
- [ ] 4.4 Implement query methods for audit trail
- [ ] 4.5 Add Zod schemas for permission audit records

### Task 5: Create Permission Dialog Component (AC: #2, #5)

- [ ] 5.1 Create `src/components/chat/permission-dialog.tsx`
- [ ] 5.2 Implement dialog with tool name, description, parameters
- [ ] 5.3 Add approve/deny buttons with proper styling
- [ ] 5.4 Add "always allow" checkbox (disabled for destructive tools)
- [ ] 5.5 Implement two-step confirmation for destructive tools
- [ ] 5.6 Add data-testid attributes for E2E testing
- [ ] 5.7 Style according to Orion Design System (zero border radius, gold accents)

### Task 6: Wire Permission System to Agent Orchestrator (AC: #1, #2)

- [ ] 6.1 Update `AgentOrchestrator` to call canUseTool before tool execution
- [ ] 6.2 Emit `awaiting_permission` SSE event when confirmation needed
- [ ] 6.3 Handle permission response from frontend
- [ ] 6.4 Resume or abort tool execution based on decision
- [ ] 6.5 Pass permission context to PermissionService for logging

### Task 7: Write Tests (AC: #1, #2, #3, #4, #5)

- [ ] 7.1 Unit test: canUseTool categorizes tools correctly (test 2.4.1, 2.4.2, 2.4.3)
- [ ] 7.2 E2E test: Read tools execute without prompt (test 2.4.4)
- [ ] 7.3 E2E test: Write tools show confirmation dialog (test 2.4.5)
- [ ] 7.4 E2E test: "Always allow" persists for session (test 2.4.6)
- [ ] 7.5 Integration test: Permission decisions logged to action_log (test 2.4.7)
- [ ] 7.6 Unit test: Session permissions reset behavior

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

From architecture.md ARCH-021:

**canUseTool Callback Pattern:**
```typescript
// The Claude Agent SDK supports a canUseTool callback
const agent = new ClaudeAgent({
  // ... other config
  canUseTool: async (tool: string, input: Record<string, unknown>) => {
    const decision = await evaluateToolPermission(tool, input);
    if (decision.allowed && !decision.requiresConfirmation) {
      return true; // Auto-execute
    }
    if (decision.requiresConfirmation) {
      return await requestUserConfirmation(tool, input, decision);
    }
    return false; // Block
  }
});
```

**Tool Permission Tiers:**
```
READ (Auto-execute)     → get_*, search_*, list_*, fetch_*
WRITE (Confirm)         → send_*, create_*, update_*, add_*
DESTRUCTIVE (Block)     → delete_*, cancel_*, remove_*, archive_*
```

### File Structure Requirements

Create files in these locations:

```
src/
  agents/
    permissions/
      index.ts                    # NEW - Export all permission utilities
      types.ts                    # NEW - TypeScript interfaces and enums
      catalog.ts                  # NEW - TOOL_CATALOG constant
      canUseTool.ts              # NEW - Main permission evaluation
      session-store.ts           # NEW - SessionPermissionStore class
    schemas/
      permissions.ts             # NEW - Zod schemas for permissions
  services/
    permissions.ts               # NEW - PermissionService for audit
  components/
    chat/
      permission-dialog.tsx      # NEW - Permission confirmation dialog
agent-server/
  src/
    routes/
      stream.ts                  # UPDATE - Add awaiting_permission event
    agents/
      orchestrator.ts            # UPDATE - Wire canUseTool callback
tests/
  unit/
    story-2.4-permissions.spec.ts    # NEW - canUseTool unit tests
  integration/
    story-2.4-audit-log.spec.ts      # NEW - Permission audit tests
  e2e/
    story-2.4-permission-dialog.spec.ts # NEW - Dialog E2E tests
```

### Permission Types and Schemas

**Core TypeScript types:**
```typescript
// src/agents/permissions/types.ts

export enum ToolCategory {
  READ = 'read',
  WRITE = 'write',
  DESTRUCTIVE = 'destructive',
}

export interface PermissionDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  requiresExplicitApproval?: boolean;  // For destructive tools
  category: ToolCategory;
  warningMessage?: string;
  grantedBy?: 'auto' | 'session' | 'user';
}

export interface SessionPermission {
  allowed: boolean;
  alwaysAllow: boolean;
  grantedAt: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  warningMessage?: string;  // Required for DESTRUCTIVE
}
```

**Zod schemas for validation:**
```typescript
// src/agents/schemas/permissions.ts

import { z } from 'zod';

export const ToolCategorySchema = z.enum(['read', 'write', 'destructive']);

export const PermissionDecisionSchema = z.object({
  allowed: z.boolean(),
  requiresConfirmation: z.boolean(),
  requiresExplicitApproval: z.boolean().optional(),
  category: ToolCategorySchema,
  warningMessage: z.string().optional(),
  grantedBy: z.enum(['auto', 'session', 'user']).optional(),
});

export type PermissionDecision = z.infer<typeof PermissionDecisionSchema>;

export const PermissionAuditSchema = z.object({
  id: z.string(),
  tool: z.string(),
  decision: z.enum(['approved', 'denied', 'auto_allowed']),
  alwaysAllow: z.boolean(),
  context: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export type PermissionAudit = z.infer<typeof PermissionAuditSchema>;
```

### Tool Catalog Implementation

**TOOL_CATALOG constant:**
```typescript
// src/agents/permissions/catalog.ts

import { ToolCategory, ToolDefinition } from './types';

export const TOOL_CATALOG: Record<string, ToolDefinition> = {
  // READ tools - auto-execute
  get_emails: {
    name: 'get_emails',
    description: 'Fetch emails from inbox',
    category: ToolCategory.READ,
  },
  get_calendar_events: {
    name: 'get_calendar_events',
    description: 'Fetch calendar events',
    category: ToolCategory.READ,
  },
  search_contacts: {
    name: 'search_contacts',
    description: 'Search contacts database',
    category: ToolCategory.READ,
  },
  get_preferences: {
    name: 'get_preferences',
    description: 'Get user preferences',
    category: ToolCategory.READ,
  },
  list_tasks: {
    name: 'list_tasks',
    description: 'List tasks from projects',
    category: ToolCategory.READ,
  },
  fetch_project: {
    name: 'fetch_project',
    description: 'Get project details',
    category: ToolCategory.READ,
  },

  // WRITE tools - require confirmation
  send_email: {
    name: 'send_email',
    description: 'Send an email',
    category: ToolCategory.WRITE,
  },
  create_event: {
    name: 'create_event',
    description: 'Create a calendar event',
    category: ToolCategory.WRITE,
  },
  update_contact: {
    name: 'update_contact',
    description: 'Update contact information',
    category: ToolCategory.WRITE,
  },
  create_task: {
    name: 'create_task',
    description: 'Create a new task',
    category: ToolCategory.WRITE,
  },
  update_project: {
    name: 'update_project',
    description: 'Update project details',
    category: ToolCategory.WRITE,
  },

  // DESTRUCTIVE tools - blocked until explicit approval
  delete_email: {
    name: 'delete_email',
    description: 'Permanently delete an email',
    category: ToolCategory.DESTRUCTIVE,
    warningMessage: 'This will permanently delete the email. This action cannot be undone.',
  },
  cancel_event: {
    name: 'cancel_event',
    description: 'Cancel a calendar event',
    category: ToolCategory.DESTRUCTIVE,
    warningMessage: 'This will cancel the event and notify all attendees.',
  },
  delete_contact: {
    name: 'delete_contact',
    description: 'Delete a contact',
    category: ToolCategory.DESTRUCTIVE,
    warningMessage: 'This will remove the contact and all associated interaction history.',
  },
  archive_project: {
    name: 'archive_project',
    description: 'Archive a project',
    category: ToolCategory.DESTRUCTIVE,
    warningMessage: 'This will archive the project. It can be restored from the Archive.',
  },
};
```

### canUseTool Implementation

**Main permission evaluation function:**
```typescript
// src/agents/permissions/canUseTool.ts

import { TOOL_CATALOG } from './catalog';
import { ToolCategory, PermissionDecision, SessionPermission } from './types';

interface CanUseToolOptions {
  sessionPermissions: Record<string, SessionPermission>;
}

export function canUseTool(
  toolName: string,
  options: CanUseToolOptions
): PermissionDecision {
  const tool = TOOL_CATALOG[toolName];

  // Unknown tool - default to requiring confirmation
  if (!tool) {
    return {
      allowed: true,
      requiresConfirmation: true,
      category: ToolCategory.WRITE,
    };
  }

  // Check session permissions first
  const sessionPerm = options.sessionPermissions[toolName];
  if (sessionPerm?.alwaysAllow) {
    return {
      allowed: true,
      requiresConfirmation: false,
      category: tool.category,
      grantedBy: 'session',
    };
  }

  // Category-based decision
  switch (tool.category) {
    case ToolCategory.READ:
      return {
        allowed: true,
        requiresConfirmation: false,
        category: ToolCategory.READ,
        grantedBy: 'auto',
      };

    case ToolCategory.WRITE:
      return {
        allowed: true,
        requiresConfirmation: true,
        category: ToolCategory.WRITE,
      };

    case ToolCategory.DESTRUCTIVE:
      return {
        allowed: false,
        requiresConfirmation: true,
        requiresExplicitApproval: true,
        category: ToolCategory.DESTRUCTIVE,
        warningMessage: tool.warningMessage,
      };

    default:
      return {
        allowed: true,
        requiresConfirmation: true,
        category: ToolCategory.WRITE,
      };
  }
}
```

### Session Permission Store

**In-memory permission store:**
```typescript
// src/agents/permissions/session-store.ts

import { SessionPermission } from './types';

export class SessionPermissionStore {
  private permissions: Map<string, SessionPermission> = new Map();

  grantPermission(tool: string, alwaysAllow: boolean): void {
    this.permissions.set(tool, {
      allowed: true,
      alwaysAllow,
      grantedAt: Date.now(),
    });
  }

  checkPermission(tool: string): SessionPermission | undefined {
    return this.permissions.get(tool);
  }

  denyPermission(tool: string): void {
    this.permissions.set(tool, {
      allowed: false,
      alwaysAllow: false,
      grantedAt: Date.now(),
    });
  }

  clearAll(): void {
    this.permissions.clear();
  }

  getAll(): Record<string, SessionPermission> {
    return Object.fromEntries(this.permissions);
  }
}

// Singleton instance
export const sessionPermissionStore = new SessionPermissionStore();
```

### Permission Service for Audit

**Service for recording and querying permission decisions:**
```typescript
// src/services/permissions.ts

import { Database } from 'better-sqlite3';
import { PermissionAudit, PermissionAuditSchema } from '@/agents/schemas/permissions';

interface RecordDecisionParams {
  tool: string;
  decision: 'approved' | 'denied' | 'auto_allowed';
  alwaysAllow: boolean;
  context?: Record<string, unknown>;
}

export class PermissionService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.ensureTable();
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS action_log (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        tool TEXT,
        action TEXT,
        decision TEXT,
        always_allow INTEGER DEFAULT 0,
        input TEXT,
        output TEXT,
        context TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  async recordDecision(params: RecordDecisionParams): Promise<void> {
    const id = `perm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    this.db.prepare(`
      INSERT INTO action_log (id, type, tool, decision, always_allow, context, created_at)
      VALUES (?, 'permission', ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      params.tool,
      params.decision,
      params.alwaysAllow ? 1 : 0,
      params.context ? JSON.stringify(params.context) : null
    );
  }

  queryByTool(tool: string): PermissionAudit[] {
    const rows = this.db.prepare(`
      SELECT * FROM action_log
      WHERE type = 'permission' AND tool = ?
      ORDER BY created_at DESC
    `).all(tool);

    return rows.map(this.rowToAudit);
  }

  queryByDecision(decision: string): PermissionAudit[] {
    const rows = this.db.prepare(`
      SELECT * FROM action_log
      WHERE type = 'permission' AND decision = ?
      ORDER BY created_at DESC
    `).all(decision);

    return rows.map(this.rowToAudit);
  }

  private rowToAudit(row: any): PermissionAudit {
    return {
      id: row.id,
      tool: row.tool,
      decision: row.decision,
      alwaysAllow: row.always_allow === 1,
      context: row.context ? JSON.parse(row.context) : undefined,
      timestamp: row.created_at,
    };
  }
}
```

### Permission Dialog Component

**React component for permission confirmation:**
```tsx
// src/components/chat/permission-dialog.tsx

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ToolCategory, PermissionDecision } from '@/agents/permissions/types';

interface PermissionDialogProps {
  tool: string;
  toolDescription: string;
  input: Record<string, unknown>;
  decision: PermissionDecision;
  onApprove: (alwaysAllow: boolean) => void;
  onDeny: () => void;
}

export function PermissionDialog({
  tool,
  toolDescription,
  input,
  decision,
  onApprove,
  onDeny,
}: PermissionDialogProps) {
  const [alwaysAllow, setAlwaysAllow] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const isDestructive = decision.category === ToolCategory.DESTRUCTIVE;

  const handleApprove = () => {
    if (isDestructive && !confirmStep) {
      setConfirmStep(true);
      return;
    }
    onApprove(alwaysAllow);
  };

  // Summarize input parameters for display
  const summarizedInput = Object.entries(input)
    .slice(0, 5) // Limit displayed params
    .map(([key, value]) => {
      const displayValue = typeof value === 'string'
        ? (value.length > 50 ? value.slice(0, 50) + '...' : value)
        : JSON.stringify(value);
      return { key, value: displayValue };
    });

  return (
    <div
      className="bg-orion-surface border border-orion-border-muted p-6"
      data-testid="permission-dialog"
    >
      <h3 className="font-playfair text-lg font-semibold text-orion-text-primary mb-4">
        Permission Required
      </h3>

      <div className="space-y-4">
        {/* Tool info */}
        <div>
          <span className="text-sm text-orion-text-secondary">Tool:</span>
          <span className="ml-2 font-mono text-orion-primary">{tool}</span>
        </div>

        <div>
          <span className="text-sm text-orion-text-secondary">Action:</span>
          <span className="ml-2">{toolDescription}</span>
        </div>

        {/* Input parameters */}
        {summarizedInput.length > 0 && (
          <div className="bg-orion-background p-3">
            <span className="text-sm text-orion-text-secondary block mb-2">
              Parameters:
            </span>
            {summarizedInput.map(({ key, value }) => (
              <div key={key} className="text-sm">
                <span className="text-orion-text-secondary">{key}:</span>
                <span className="ml-2 text-orion-text-primary">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warning for destructive tools */}
        {isDestructive && decision.warningMessage && (
          <div className="bg-red-900/20 border border-red-500/50 p-3 text-red-200">
            <strong>Warning:</strong> {decision.warningMessage}
          </div>
        )}

        {/* Two-step confirmation for destructive */}
        {isDestructive && confirmStep && (
          <div className="bg-orion-background p-3">
            <p className="text-sm text-orion-text-secondary mb-2">
              Type "{tool}" to confirm this action:
            </p>
            <input
              type="text"
              className="w-full bg-orion-surface border border-orion-border-muted p-2 text-sm"
              placeholder={tool}
              data-testid="confirm-input"
              onChange={(e) => {
                // Only enable approve if typed correctly
                if (e.target.value === tool) {
                  // Enable approve button
                }
              }}
            />
          </div>
        )}

        {/* Always allow checkbox (not for destructive) */}
        {!isDestructive && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={alwaysAllow}
              onChange={(e) => setAlwaysAllow(e.target.checked)}
              className="w-4 h-4"
              aria-label="Always allow this tool for this session"
            />
            <span className="text-sm text-orion-text-secondary">
              Always allow for this session
            </span>
          </label>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleApprove}
            className={cn(
              'flex-1 py-2 px-4 font-medium transition-colors',
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orion-primary hover:bg-orion-primary-hover text-orion-background'
            )}
            data-testid="approve-button"
          >
            {isDestructive && !confirmStep ? 'Continue' : 'Approve'}
          </button>
          <button
            onClick={onDeny}
            className="flex-1 py-2 px-4 border border-orion-border-muted hover:bg-orion-surface-hover transition-colors"
            data-testid="deny-button"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
}
```

### SSE Event for Awaiting Permission

**Update streaming endpoint to emit permission events:**
```typescript
// Event format when permission is needed
data: {"type":"tool_request","name":"send_email","input":{"to":"john@example.com","subject":"Meeting"}}
data: {"type":"awaiting_permission"}

// After user decision
data: {"type":"permission_granted","tool":"send_email"}
// OR
data: {"type":"permission_denied","tool":"send_email"}
```

### Integration with AgentOrchestrator

**Wire canUseTool to orchestrator:**
```typescript
// agent-server/src/agents/orchestrator.ts (partial)

import { canUseTool } from '@/agents/permissions/canUseTool';
import { sessionPermissionStore } from '@/agents/permissions/session-store';

class AgentOrchestrator {
  // ... existing code

  async executeToolWithPermission(
    toolName: string,
    input: Record<string, unknown>
  ): Promise<ToolResult> {
    // 1. Check permission
    const decision = canUseTool(toolName, {
      sessionPermissions: sessionPermissionStore.getAll(),
    });

    // 2. Auto-execute if allowed
    if (decision.allowed && !decision.requiresConfirmation) {
      return this.executeTool(toolName, input);
    }

    // 3. Emit awaiting_permission event
    this.emitEvent('tool_request', { name: toolName, input });
    this.emitEvent('awaiting_permission', {});

    // 4. Wait for user decision
    const userDecision = await this.waitForPermissionDecision(toolName);

    // 5. Record decision in audit log
    await this.permissionService.recordDecision({
      tool: toolName,
      decision: userDecision.approved ? 'approved' : 'denied',
      alwaysAllow: userDecision.alwaysAllow ?? false,
      context: { input },
    });

    // 6. Update session permissions if always allow
    if (userDecision.approved && userDecision.alwaysAllow) {
      sessionPermissionStore.grantPermission(toolName, true);
    }

    // 7. Execute or abort
    if (userDecision.approved) {
      this.emitEvent('permission_granted', { tool: toolName });
      return this.executeTool(toolName, input);
    } else {
      this.emitEvent('permission_denied', { tool: toolName });
      return { success: false, error: 'Permission denied by user' };
    }
  }
}
```

### Critical Design Constraints

1. **Session-Only Persistence** - Never persist "always allow" to disk; memory only
2. **No Destructive Auto-Allow** - DESTRUCTIVE tools cannot use "always allow"
3. **Audit Everything** - Every permission decision must be logged to action_log
4. **User-Friendly Descriptions** - Never show raw JSON to users; summarize parameters
5. **Graceful Unknown Tools** - Unknown tools default to WRITE category (require confirmation)
6. **Clear Warning Messages** - All DESTRUCTIVE tools must have defined warning messages

### Design System Compliance

From UX-001 to UX-005:
- Zero border radius on dialog container and buttons
- Gold (#D4AF37) for primary action button
- Cream (#F9F8F6) for dialog background
- Playfair Display for headings, Inter for body text
- Red accent for destructive tool warnings

---

## Project Structure Notes

**Alignment with unified project structure:**
- Permission logic in `src/agents/permissions/` (shared between frontend and agent-server)
- Schemas in `src/agents/schemas/`
- Services in `src/services/`
- UI components in `src/components/chat/`
- Tests follow naming convention `story-X.X-*.spec.ts`

**Dependencies on prior stories:**
- Story 2.3 (Sub-Agent Spawning) provides AgentOrchestrator to wire into
- Story 1.4 (SQLite Database Setup) provides database for action_log
- Story 1.8 (Streaming Responses) provides SSE infrastructure

**No conflicts detected with existing structure.**

---

## Test Considerations

### Test Strategy (from test-design-epic-2.md)

| ID | Type | Scenario | Expected Result |
|----|------|----------|-----------------|
| 2.4.1 | Unit | Read tool -> auto-execute | No prompt shown |
| 2.4.2 | Unit | Write tool -> confirmation | Prompt required |
| 2.4.3 | Unit | Destructive tool -> blocked | Explicit approval needed |
| 2.4.4 | E2E | Read tool executes silently | No dialog |
| 2.4.5 | E2E | Write tool shows dialog | Confirmation visible |
| 2.4.6 | E2E | "Always allow" persists session | No re-prompt |
| 2.4.7 | Integration | Decisions logged to action_log | Audit trail |

### Test Code Examples (from test-design-epic-2.md)

```typescript
// tests/unit/story-2.4-permissions.spec.ts
import { test, expect, describe } from 'vitest';
import { canUseTool, ToolCategory } from '@/agents/permissions';
import { TOOL_CATALOG } from '@/agents/permissions/catalog';

describe('Story 2.4: Tool Permission System', () => {

  test('2.4.1 - read tools auto-execute without prompt', () => {
    const readTools = ['get_emails', 'get_calendar_events', 'search_contacts', 'get_preferences'];

    for (const tool of readTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(false);
      expect(decision.category).toBe(ToolCategory.READ);
    }
  });

  test('2.4.2 - write tools require confirmation', () => {
    const writeTools = ['send_email', 'create_event', 'update_contact', 'create_task'];

    for (const tool of writeTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(true);
      expect(decision.requiresConfirmation).toBe(true);
      expect(decision.category).toBe(ToolCategory.WRITE);
    }
  });

  test('2.4.3 - destructive tools are blocked until explicit approval', () => {
    const destructiveTools = ['delete_email', 'cancel_event', 'delete_contact', 'archive_project'];

    for (const tool of destructiveTools) {
      const decision = canUseTool(tool, { sessionPermissions: {} });

      expect(decision.allowed).toBe(false);
      expect(decision.requiresExplicitApproval).toBe(true);
      expect(decision.category).toBe(ToolCategory.DESTRUCTIVE);
      expect(decision.warningMessage).toBeTruthy();
    }
  });

  test('2.4.6 - session "always allow" bypasses confirmation', () => {
    const sessionPermissions = {
      send_email: { allowed: true, alwaysAllow: true, grantedAt: Date.now() }
    };

    const decision = canUseTool('send_email', { sessionPermissions });

    expect(decision.allowed).toBe(true);
    expect(decision.requiresConfirmation).toBe(false); // Already granted
    expect(decision.grantedBy).toBe('session');
  });

  test('session permissions reset on app restart', () => {
    // Simulate app restart by clearing session
    const freshSession = {};

    const decision = canUseTool('send_email', { sessionPermissions: freshSession });

    expect(decision.requiresConfirmation).toBe(true); // Back to requiring confirmation
  });

});
```

### Integration Test for Audit

```typescript
// tests/integration/story-2.4-audit-log.spec.ts
import { test, expect, beforeEach } from 'vitest';
import { PermissionService } from '@/services/permissions';
import { createTestDatabase } from '../helpers/database';

let db: any;
let permissionService: PermissionService;

beforeEach(() => {
  db = createTestDatabase();
  permissionService = new PermissionService(db);
});

test('2.4.7 - permission decisions are logged to action_log', async () => {
  // User approves send_email
  await permissionService.recordDecision({
    tool: 'send_email',
    decision: 'approved',
    alwaysAllow: false,
    context: { recipient: 'john@example.com', subject: 'Test' },
  });

  // User denies delete_email
  await permissionService.recordDecision({
    tool: 'delete_email',
    decision: 'denied',
    context: { emailId: 'msg_001' },
  });

  // Query audit log
  const logs = db.prepare(`
    SELECT * FROM action_log WHERE type = 'permission'
    ORDER BY created_at DESC
  `).all();

  expect(logs).toHaveLength(2);

  expect(logs[0].tool).toBe('delete_email');
  expect(logs[0].decision).toBe('denied');

  expect(logs[1].tool).toBe('send_email');
  expect(logs[1].decision).toBe('approved');
});
```

### E2E Test for Permission Dialog

```typescript
// tests/e2e/story-2.4-permission-dialog.spec.ts
import { test, expect } from '@/tests/support/fixtures';

test('2.4.5 - write tool shows confirmation dialog', async ({ page }) => {
  // Mock agent response that uses a write tool
  await page.route('**/api/chat', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `
        data: {"type":"tool_request","name":"send_email","input":{"to":"john@example.com","subject":"Meeting"}}
        data: {"type":"awaiting_permission"}
      `,
    });
  });

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Send an email to John about the meeting');
  await page.click('[data-testid="send-button"]');

  // Permission dialog should appear
  const dialog = page.locator('[data-testid="permission-dialog"]');
  await expect(dialog).toBeVisible();

  // Should show tool name and action
  await expect(dialog.getByText('send_email')).toBeVisible();
  await expect(dialog.getByText('john@example.com')).toBeVisible();

  // Should have approve/deny buttons
  await expect(dialog.getByRole('button', { name: /approve/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /deny/i })).toBeVisible();

  // Should have "always allow" checkbox
  await expect(dialog.getByLabel(/always allow/i)).toBeVisible();
});

test('2.4.4 - read tool executes without dialog', async ({ page }) => {
  // Mock agent response that uses a read tool
  await page.route('**/api/chat', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `
        data: {"type":"tool_use","name":"get_emails","result":{"count":5}}
        data: {"type":"text","content":"You have 5 emails in your inbox."}
        data: {"type":"done"}
      `,
    });
  });

  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Check my inbox');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await expect(page.getByText('You have 5 emails')).toBeVisible();

  // Permission dialog should NOT appear
  const dialog = page.locator('[data-testid="permission-dialog"]');
  await expect(dialog).not.toBeVisible();
});
```

### Test File Locations

```
tests/
  unit/
    story-2.4-permissions.spec.ts      # Tests 2.4.1, 2.4.2, 2.4.3, 2.4.6
  integration/
    story-2.4-audit-log.spec.ts        # Test 2.4.7
  e2e/
    story-2.4-permission-dialog.spec.ts # Tests 2.4.4, 2.4.5
```

---

## Dependencies

### Upstream Dependencies (must be done first)

- **Story 2.3 (Sub-Agent Spawning)** - Provides AgentOrchestrator to wire permission system
- **Story 1.4 (SQLite Database Setup)** - Provides database for action_log table
- **Story 1.8 (Streaming Responses)** - Provides SSE infrastructure for permission events

### Downstream Dependencies (blocked by this story)

- **Story 2.19 (Validation & Safety Hooks)** - Extends permission system with validation hooks
- **Epic 3 (Connect Your Tools)** - Tool permission system governs Composio tool execution
- **Epic 4 (Unified Inbox)** - Email actions will require permission

### Same-Epic Dependencies (can be worked in parallel)

- **Story 2.5-2.10 (Agent Definitions)** - Independent of permission system
- **Story 2.11-2.14 (Skills)** - Independent infrastructure work

---

## References

- [Source: thoughts/planning-artifacts/architecture.md#ARCH-021] - canUseTool callback pattern
- [Source: thoughts/planning-artifacts/epics.md#story-2.4] - User story and acceptance criteria
- [Source: thoughts/planning-artifacts/test-design-epic-2.md#story-2.4] - Test scenarios and code
- [Source: thoughts/planning-artifacts/prd.md#PM-001] - action_log table for undo/rollback
- [Source: thoughts/planning-artifacts/ux-design-specification.md#trust-delegation] - Progressive trust model (UX-011, UX-012)

---

## Dev Agent Record

### Agent Model Used

(To be filled by DEV agent)

### Debug Log References

(To be filled during implementation)

### Completion Notes List

(To be filled during implementation)

### File List

(To be filled during implementation - list all files created/modified)
