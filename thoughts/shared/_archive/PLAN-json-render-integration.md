# Implementation Plan: json-render Integration for Orion Canvas

**Generated:** 2026-01-14
**Updated:** 2026-01-14 (Pre-mortem mitigations added)
**Status:** Ready for Implementation (after prerequisites)
**Replaces:** A2UI Integration Plan (A2UI not available for React)

---

## Prerequisites

> **BLOCKING:** This plan requires the following to be completed first.

### 1. Base Application Scaffold (MVP Plan Phase 0-1)

The orion-app directory was deleted. Before this plan can execute, complete:

| Prerequisite | Source | Status |
|--------------|--------|--------|
| Tauri + Next.js project scaffold | MVP Plan Phase 0 | Required |
| shadcn/ui components installed | MVP Plan Phase 0 | Required |
| Split-screen layout (Chat + Canvas) | MVP Plan Phase 1 | Required |
| SQLite schema implemented | MVP Plan Phase 1 | Required |
| Zustand stores created | MVP Plan Phase 1 | Required |

**Reference:** `thoughts/shared/plans/PLAN-orion-mvp.md`

### 2. Required Files That Must Exist

Before starting Phase 1 of this plan, ensure these files exist:

```
src/
├── stores/
│   ├── canvas-store.ts      # Canvas state management
│   └── chat-store.ts        # Chat state management
├── components/
│   ├── canvas/
│   │   └── CanvasPanel.tsx  # Canvas container
│   └── chat/
│       └── ChatPanel.tsx    # Chat container
├── lib/
│   └── utils.ts             # cn() utility
└── components/ui/           # shadcn/ui components
    ├── card.tsx
    ├── button.tsx
    ├── input.tsx
    └── ... (other components)
```

### 3. Zod Version Compatibility

This plan uses **Zod 4.x** syntax (required by json-render). Key differences from Zod 3.x:

| Zod 3.x | Zod 4.x |
|---------|---------|
| `z.object({})` | `z.object({})` (same) |
| `.default()` | `.default()` (same) |
| `z.infer<typeof schema>` | `z.infer<typeof schema>` (same) |
| Import from `'zod'` | Import from `'zod'` (same) |

> Note: Zod 4.x is largely compatible. Main change is stricter type inference.

---

## Goal

Integrate [vercel-labs/json-render](https://github.com/vercel-labs/json-render) to power dynamic, AI-generated UI in Orion's canvas panel. This enables the Butler agent to render type-safe, guardrailed UI components for inbox triage, email composition, calendar scheduling, and contact management - without arbitrary code execution.

---

## Research Summary

### json-render Overview

json-render is Vercel's framework for AI-generated UI with key advantages:

| Feature | Benefit for Orion |
|---------|-------------------|
| **Zod-based catalogs** | Type-safe component definitions the AI must follow |
| **Streaming support** | `useUIStream` hook for progressive rendering |
| **Action system** | Declarative actions with confirmations and callbacks |
| **Conditional visibility** | Show/hide based on data or auth state |
| **Data binding** | `valuePath` for reactive data connections |

### Key APIs

```typescript
// Core packages
import { createCatalog } from '@json-render/core';
import { DataProvider, ActionProvider, Renderer, useUIStream } from '@json-render/react';
```

### Why json-render over A2UI

| A2UI | json-render |
|------|-------------|
| No official React renderer | First-class React support |
| Requires custom implementation | Production-ready from Vercel |
| JSONL streaming | Native streaming with useUIStream |
| Generic component catalog | Zod schemas for type safety |

---

## Existing Codebase Analysis

### Current Canvas Architecture

From `thoughts/research/canvas-architecture.md`:
- Canvas panel is hidden by default, opens via agent tool call
- Uses Zustand for state management (`canvas-store.ts`)
- Lazy-loads editors (TipTap, Polotno, Calendar)
- WebSocket bridge for agent-frontend communication

### Integration Points

1. **ChatPanel** - json-render for inline interactions (< 30 seconds)
2. **CanvasPanel** - json-render for complex forms (inbox triage, scheduling)
3. **Agent Bridge** - Stream JSON from Butler agent to Renderer

### Files to Modify

| File | Change |
|------|--------|
| `src/stores/canvas-store.ts` | Add `json-render` mode |
| `src/components/canvas/CanvasPanel.tsx` | Add JsonRenderCanvas editor |
| `src/hooks/useBridge.ts` | Handle json-render streaming |
| `package.json` | Add @json-render/core, @json-render/react |

---

## Implementation Phases

### Phase 0.5: Agent Streaming Backend (NEW)
**Duration:** 1-2 days
**Added:** Pre-mortem mitigation

> This phase was added because Phase 4 (Streaming Integration) depends on an agent backend that doesn't exist yet.

#### 0.5.1 Create Streaming API Endpoint

**Files to create:** `src/app/api/agent/stream/route.ts`

**Steps:**
1. Create Next.js API route for agent streaming
2. Connect to Claude API via SDK
3. Stream JSON tree responses

```typescript
// src/app/api/agent/stream/route.ts
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { catalogPrompt } from '@/lib/json-render/catalog';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { message, conversationId } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: `You are Orion, a personal AI butler. When appropriate, render UI components using JSON.

${catalogPrompt}

When rendering UI, output a JSON code block with the UI tree structure.`,
          messages: [
            { role: 'user', content: message }
          ],
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

#### 0.5.2 Add JSON Tree Parser

**Files to create:** `src/lib/json-render/parser.ts`

**Steps:**
1. Parse JSON code blocks from agent response
2. Extract UI tree structure
3. Handle partial/streaming JSON

```typescript
// src/lib/json-render/parser.ts
import { UITree } from '@json-render/core';

/**
 * Extract JSON UI tree from agent response text
 */
export function extractUITree(text: string): UITree | null {
  // Look for JSON code blocks
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    // Validate it's a UI tree structure
    if (parsed.root && parsed.elements) {
      return parsed as UITree;
    }
  } catch (e) {
    // Invalid JSON - may be streaming incomplete
    return null;
  }

  return null;
}

/**
 * Streaming JSON parser for progressive rendering
 */
export class StreamingJSONParser {
  private buffer = '';
  private lastValidTree: UITree | null = null;

  append(chunk: string): UITree | null {
    this.buffer += chunk;
    const tree = extractUITree(this.buffer);
    if (tree) {
      this.lastValidTree = tree;
    }
    return this.lastValidTree;
  }

  reset() {
    this.buffer = '';
    this.lastValidTree = null;
  }
}
```

**Acceptance criteria:**
- [ ] `/api/agent/stream` endpoint returns SSE stream
- [ ] Agent responses include catalog in system prompt
- [ ] JSON code blocks are parsed from response
- [ ] Streaming parser handles incomplete JSON gracefully

---

### Phase 1: Foundation Setup
**Duration:** 1-2 days

#### 1.1 Install Dependencies

**Files to modify:** `package.json`

**Steps:**
1. Install json-render packages:
   ```bash
   npm install @json-render/core @json-render/react zod
   ```

2. Add to package.json devDependencies if needed:
   ```json
   {
     "dependencies": {
       "@json-render/core": "^0.x.x",
       "@json-render/react": "^0.x.x",
       "zod": "^3.22.x"
     }
   }
   ```

**Acceptance criteria:**
- [ ] Packages install without conflicts
- [ ] TypeScript types resolve correctly
- [ ] No peer dependency warnings

#### 1.2 Create Component Catalog

**Files to create:** `src/lib/json-render/catalog.ts`

**Steps:**
1. Define base catalog with Zod schemas for all Orion components
2. Export catalog for AI prompt injection
3. Export JSON schema for agent system prompt

```typescript
// src/lib/json-render/catalog.ts
import { createCatalog } from '@json-render/core';
import { z } from 'zod';

export const orionCatalog = createCatalog({
  components: {
    // Layout Components
    Card: {
      props: z.object({
        title: z.string().optional(),
        variant: z.enum(['default', 'outlined', 'elevated']).default('default'),
      }),
      hasChildren: true,
    },
    Row: {
      props: z.object({
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
        align: z.enum(['start', 'center', 'end', 'stretch']).default('start'),
      }),
      hasChildren: true,
    },
    Column: {
      props: z.object({
        gap: z.enum(['sm', 'md', 'lg']).default('md'),
      }),
      hasChildren: true,
    },

    // Display Components
    Text: {
      props: z.object({
        content: z.string(),
        variant: z.enum(['body', 'heading', 'label', 'caption']).default('body'),
      }),
    },
    Badge: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['default', 'success', 'warning', 'error', 'info']).default('default'),
      }),
    },
    Divider: {
      props: z.object({}),
    },
    Avatar: {
      props: z.object({
        name: z.string(),
        src: z.string().optional(),
        size: z.enum(['sm', 'md', 'lg']).default('md'),
      }),
    },

    // Interactive Components
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(['default', 'primary', 'secondary', 'ghost', 'destructive']).default('default'),
        disabled: z.boolean().default(false),
      }),
    },
    TextField: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        valuePath: z.string(), // Data binding path
        type: z.enum(['text', 'email', 'password', 'textarea']).default('text'),
        required: z.boolean().default(false),
      }),
    },
    Select: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
        options: z.array(z.object({
          value: z.string(),
          label: z.string(),
        })),
        placeholder: z.string().optional(),
      }),
    },
    RadioGroup: {
      props: z.object({
        label: z.string().optional(),
        valuePath: z.string(),
        options: z.array(z.object({
          value: z.string(),
          label: z.string(),
          description: z.string().optional(),
          recommended: z.boolean().optional(),
        })),
      }),
    },
    Checkbox: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
      }),
    },
    DatePicker: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
        minDate: z.string().optional(),
        maxDate: z.string().optional(),
      }),
    },
    TimePicker: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
        minTime: z.string().optional(),
        maxTime: z.string().optional(),
        intervalMinutes: z.number().default(15),
      }),
    },

    // Orion-Specific Components
    EmailComposer: {
      props: z.object({
        toPath: z.string(), // Data path for recipients
        subjectPath: z.string(),
        bodyPath: z.string(),
        replyToId: z.string().optional(),
        draftId: z.string().optional(),
      }),
    },
    EmailPreview: {
      props: z.object({
        emailId: z.string().optional(),
        from: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        date: z.string(),
        attachments: z.array(z.object({
          name: z.string(),
          size: z.number(),
          type: z.string(),
        })).optional(),
      }),
    },
    InboxItem: {
      props: z.object({
        itemId: z.string(),
        source: z.enum(['gmail', 'slack', 'calendar', 'task']),
        title: z.string(),
        preview: z.string(),
        sender: z.string(),
        date: z.string(),
        priority: z.number().min(0).max(1),
        unread: z.boolean().default(false),
        needsResponse: z.boolean().default(false),
        suggestedActions: z.array(z.string()).optional(),
      }),
    },
    ContactCard: {
      props: z.object({
        contactId: z.string().optional(),
        name: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        company: z.string().optional(),
        role: z.string().optional(),
        avatarUrl: z.string().optional(),
        lastInteraction: z.string().optional(),
        relationship: z.enum(['colleague', 'client', 'vendor', 'personal', 'other']).optional(),
      }),
    },
    CalendarSlotPicker: {
      props: z.object({
        valuePath: z.string(),
        slots: z.array(z.object({
          id: z.string(),
          start: z.string(), // ISO datetime
          end: z.string(),
          available: z.boolean(),
          recommended: z.boolean().optional(),
          reason: z.string().optional(),
        })),
        duration: z.number().default(30), // minutes
      }),
    },
    CalendarView: {
      props: z.object({
        view: z.enum(['day', 'week', 'month']).default('week'),
        date: z.string(), // ISO date
        events: z.array(z.object({
          id: z.string(),
          title: z.string(),
          start: z.string(),
          end: z.string(),
          type: z.enum(['meeting', 'focus', 'travel', 'personal']).optional(),
        })),
      }),
    },
    TaskList: {
      props: z.object({
        tasks: z.array(z.object({
          id: z.string(),
          title: z.string(),
          status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
          dueDate: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          projectId: z.string().optional(),
        })),
        showCompleted: z.boolean().default(false),
      }),
    },
    TaskItem: {
      props: z.object({
        taskId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
        dueDate: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        source: z.enum(['manual', 'gmail', 'slack', 'linear']).optional(),
      }),
    },
    SchedulerForm: {
      props: z.object({
        titlePath: z.string(),
        attendeesPath: z.string(),
        datePath: z.string(),
        timePath: z.string(),
        durationPath: z.string(),
        locationPath: z.string().optional(),
        descriptionPath: z.string().optional(),
        suggestedSlots: z.array(z.object({
          id: z.string(),
          start: z.string(),
          end: z.string(),
          score: z.number().optional(),
        })).optional(),
      }),
    },
    TriagePanel: {
      props: z.object({
        items: z.array(z.object({
          id: z.string(),
          source: z.enum(['gmail', 'slack', 'calendar']),
          title: z.string(),
          preview: z.string(),
          priority: z.number(),
          suggestedAction: z.string().optional(),
          suggestedProject: z.string().optional(),
        })),
        selectedPath: z.string(),
      }),
    },
    Confirmation: {
      props: z.object({
        title: z.string(),
        message: z.string(),
        confirmLabel: z.string().default('Confirm'),
        cancelLabel: z.string().default('Cancel'),
        variant: z.enum(['default', 'destructive']).default('default'),
      }),
    },
    ProgressIndicator: {
      props: z.object({
        label: z.string().optional(),
        valuePath: z.string().optional(),
        value: z.number().optional(),
        max: z.number().default(100),
        variant: z.enum(['bar', 'circular', 'steps']).default('bar'),
      }),
    },
  },

  // Actions the AI can trigger
  actions: {
    send_email: {
      description: 'Send the composed email',
    },
    save_draft: {
      description: 'Save email as draft',
    },
    schedule_meeting: {
      description: 'Create calendar event with current form data',
    },
    file_to_project: {
      description: 'File inbox item to a project',
    },
    archive_item: {
      description: 'Archive the inbox item',
    },
    snooze_item: {
      description: 'Snooze inbox item until specified time',
    },
    create_task: {
      description: 'Create task from current context',
    },
    complete_task: {
      description: 'Mark task as completed',
    },
    refresh_data: {
      description: 'Refresh data from external sources',
    },
    open_canvas: {
      description: 'Open canvas panel with specified mode',
    },
    close_canvas: {
      description: 'Close the canvas panel',
    },
  },
});

// Export catalog schema for AI system prompts
export const catalogSchema = orionCatalog.toJSON();
export const catalogPrompt = `
You can render UI using the following component catalog. Output valid JSON conforming to this schema:

${JSON.stringify(catalogSchema, null, 2)}

## Component Rules
1. Only use components defined in this catalog
2. All props must match the schema exactly
3. Use valuePath for data binding (e.g., "/form/email")
4. Use actions from the actions list only
5. Prefer semantic component names (EmailComposer over generic forms)

## Inline vs Canvas Rendering
Render UI in the appropriate location based on complexity:

### INLINE (in chat panel) - for quick interactions:
- Simple confirmations (Yes/No)
- 2-3 button choices
- Quick pickers with ≤3 options
- Progress indicators
- Single-field inputs

### CANVAS (opens side panel) - for complex interactions:
- EmailComposer (always)
- CalendarSlotPicker with >3 slots
- SchedulerForm (always)
- TriagePanel (always)
- Multi-field forms
- Document editing

When opening canvas, use the open_canvas action with mode: "json-render":
{ "action": { "name": "open_canvas", "payload": { "mode": "json-render" } } }

Then emit the UI tree which will render in the canvas panel.

## Canvas Behavior
- Canvas opens to 50% width
- User closes with Esc or X button
- After completing an action (send_email, schedule_meeting), close canvas automatically
- Announce canvas actions: "I've opened the composer in the workspace."
`;
```

**Acceptance criteria:**
- [ ] All component schemas validate with Zod
- [ ] Catalog exports JSON schema for prompts
- [ ] TypeScript types infer correctly from schemas

---

### Phase 2: Component Registry
**Duration:** 2-3 days

#### 2.1 Create Component Mapping

**Files to create:** `src/lib/json-render/registry.tsx`

**Steps:**
1. Map each catalog component to a shadcn/ui implementation
2. Handle data binding with useDataValue hook
3. Wire up action triggers

```typescript
// src/lib/json-render/registry.tsx
import React from 'react';
import { useDataValue, useDataSetter, useAction } from '@json-render/react';
import { Card as ShadcnCard, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types from json-render
interface ComponentProps {
  element: {
    type: string;
    props: Record<string, any>;
    action?: {
      name: string;
      payload?: Record<string, any>;
      confirm?: { title: string; message?: string };
    };
    visible?: { auth?: string; path?: string; value?: any };
  };
  children?: React.ReactNode;
}

// Layout Components
const CardComponent: React.FC<ComponentProps> = ({ element, children }) => {
  const { title, variant } = element.props;
  return (
    <ShadcnCard className={cn(
      variant === 'outlined' && 'border-2',
      variant === 'elevated' && 'shadow-lg',
    )}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </ShadcnCard>
  );
};

const RowComponent: React.FC<ComponentProps> = ({ element, children }) => {
  const { gap, align } = element.props;
  const gapClass = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }[gap] || 'gap-4';
  const alignClass = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' }[align] || 'items-start';
  return <div className={cn('flex flex-row', gapClass, alignClass)}>{children}</div>;
};

const ColumnComponent: React.FC<ComponentProps> = ({ element, children }) => {
  const { gap } = element.props;
  const gapClass = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' }[gap] || 'gap-4';
  return <div className={cn('flex flex-col', gapClass)}>{children}</div>;
};

// Display Components
const TextComponent: React.FC<ComponentProps> = ({ element }) => {
  const { content, variant } = element.props;
  const variantClass = {
    body: 'text-base',
    heading: 'text-xl font-semibold',
    label: 'text-sm font-medium',
    caption: 'text-sm text-muted-foreground',
  }[variant] || 'text-base';
  return <p className={variantClass}>{content}</p>;
};

const BadgeComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, variant } = element.props;
  return <Badge variant={variant}>{label}</Badge>;
};

const DividerComponent: React.FC<ComponentProps> = () => <Separator />;

const AvatarComponent: React.FC<ComponentProps> = ({ element }) => {
  const { name, src, size } = element.props;
  const sizeClass = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }[size] || 'h-10 w-10';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Avatar className={sizeClass}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

// Interactive Components
const ButtonComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, variant, disabled } = element.props;
  const triggerAction = useAction(element.action?.name);

  const handleClick = () => {
    if (element.action) {
      triggerAction(element.action.payload);
    }
  };

  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};

const TextFieldComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, placeholder, valuePath, type, required } = element.props;
  const value = useDataValue(valuePath) || '';
  const setValue = useDataSetter(valuePath);

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
        <textarea
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

const SelectComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, valuePath, options, placeholder } = element.props;
  const value = useDataValue(valuePath) || '';
  const setValue = useDataSetter(valuePath);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: { value: string; label: string }) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const RadioGroupComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, valuePath, options } = element.props;
  const value = useDataValue(valuePath) || '';
  const setValue = useDataSetter(valuePath);

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      <RadioGroup value={value} onValueChange={setValue}>
        {options.map((opt: { value: string; label: string; description?: string; recommended?: boolean }) => (
          <div key={opt.value} className="flex items-start space-x-3">
            <RadioGroupItem value={opt.value} id={opt.value} />
            <div className="space-y-1">
              <Label htmlFor={opt.value} className="flex items-center gap-2">
                {opt.label}
                {opt.recommended && <Badge variant="secondary">Recommended</Badge>}
              </Label>
              {opt.description && (
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

const CheckboxComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, valuePath } = element.props;
  const value = useDataValue(valuePath) || false;
  const setValue = useDataSetter(valuePath);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={valuePath}
        checked={value}
        onCheckedChange={setValue}
      />
      <Label htmlFor={valuePath}>{label}</Label>
    </div>
  );
};

const ProgressIndicatorComponent: React.FC<ComponentProps> = ({ element }) => {
  const { label, valuePath, value: staticValue, max, variant } = element.props;
  const boundValue = useDataValue(valuePath);
  const value = boundValue ?? staticValue ?? 0;
  const percentage = (value / max) * 100;

  if (variant === 'circular') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-16 w-16">
          <svg className="h-full w-full -rotate-90">
            <circle
              className="stroke-muted"
              strokeWidth="4"
              fill="none"
              r="28"
              cx="32"
              cy="32"
            />
            <circle
              className="stroke-primary transition-all"
              strokeWidth="4"
              fill="none"
              r="28"
              cx="32"
              cy="32"
              strokeDasharray={`${percentage * 1.76} 176`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="text-muted-foreground">{value}/{max}</span>
        </div>
      )}
      <Progress value={percentage} />
    </div>
  );
};

// Export complete registry
export const componentRegistry: Record<string, React.FC<ComponentProps>> = {
  // Layout
  Card: CardComponent,
  Row: RowComponent,
  Column: ColumnComponent,

  // Display
  Text: TextComponent,
  Badge: BadgeComponent,
  Divider: DividerComponent,
  Avatar: AvatarComponent,

  // Interactive
  Button: ButtonComponent,
  TextField: TextFieldComponent,
  Select: SelectComponent,
  RadioGroup: RadioGroupComponent,
  Checkbox: CheckboxComponent,
  ProgressIndicator: ProgressIndicatorComponent,

  // Orion-specific (Phase 3)
  // EmailComposer: EmailComposerComponent,
  // EmailPreview: EmailPreviewComponent,
  // InboxItem: InboxItemComponent,
  // ContactCard: ContactCardComponent,
  // CalendarSlotPicker: CalendarSlotPickerComponent,
  // CalendarView: CalendarViewComponent,
  // TaskList: TaskListComponent,
  // TaskItem: TaskItemComponent,
  // SchedulerForm: SchedulerFormComponent,
  // TriagePanel: TriagePanelComponent,
  // Confirmation: ConfirmationComponent,
};
```

**Acceptance criteria:**
- [ ] All layout components render correctly
- [ ] All display components render correctly
- [ ] All interactive components handle data binding
- [ ] Actions trigger correctly via useAction

#### 2.2 Create DatePicker and TimePicker Components

**Files to create:**
- `src/lib/json-render/components/date-picker.tsx`
- `src/lib/json-render/components/time-picker.tsx`

**Steps:**
1. Implement DatePicker wrapping shadcn Calendar
2. Implement TimePicker with interval-based options
3. Add data binding hooks

**Acceptance criteria:**
- [ ] DatePicker respects min/max constraints
- [ ] TimePicker generates time slots at specified intervals
- [ ] Both components bind to data paths correctly

---

### Phase 3: Orion-Specific Components
**Duration:** 3-4 days

#### 3.1 Email Components

**Files to create:**
- `src/lib/json-render/components/email-composer.tsx`
- `src/lib/json-render/components/email-preview.tsx`

```typescript
// src/lib/json-render/components/email-composer.tsx
import React from 'react';
import { useDataValue, useDataSetter, useAction } from '@json-render/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Send, Save } from 'lucide-react';
// TipTap for rich text editing (PRD requirement 5.1.7)
import { TipTapEditor } from '@/components/editors/TipTapEditor';

interface EmailComposerProps {
  element: {
    props: {
      toPath: string;
      subjectPath: string;
      bodyPath: string;
      replyToId?: string;
      draftId?: string;
    };
  };
}

export const EmailComposerComponent: React.FC<EmailComposerProps> = ({ element }) => {
  const { toPath, subjectPath, bodyPath, replyToId, draftId } = element.props;

  // json-render data binding for structured fields
  const to = useDataValue(toPath) || '';
  const setTo = useDataSetter(toPath);
  const subject = useDataValue(subjectPath) || '';
  const setSubject = useDataSetter(subjectPath);
  const body = useDataValue(bodyPath) || '';
  const setBody = useDataSetter(bodyPath);

  // json-render actions
  const sendEmail = useAction('send_email');
  const saveDraft = useAction('save_draft');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{replyToId ? 'Reply' : 'Compose Email'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* json-render: structured input fields */}
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* TipTap: Rich text editing for email body */}
        <div className="space-y-2">
          <Label>Message</Label>
          <div className="border rounded-md">
            <TipTapEditor
              content={body}
              onChange={setBody}
              placeholder="Write your message..."
              className="min-h-[200px] p-3"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={() => saveDraft({ draftId })}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={() => sendEmail({ to, subject, body, replyToId })}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};
```

> **Note:** EmailComposer demonstrates the json-render + TipTap integration pattern:
> - **json-render** handles structured fields (To, Subject) and actions (Send, Save Draft)
> - **TipTap** handles the free-form rich text body editing
> - Data flows through json-render's `useDataValue`/`useDataSetter` for both

**Acceptance criteria:**
- [ ] EmailComposer binds to data paths
- [ ] Send action triggers with correct payload
- [ ] Draft saving works
- [ ] Reply mode shows original context

#### 3.2 Contact Components

**Files to create:** `src/lib/json-render/components/contact-card.tsx`

**Steps:**
1. Display contact information attractively
2. Show last interaction date
3. Include quick actions (email, call, view)

**Acceptance criteria:**
- [ ] Contact card displays all fields
- [ ] Avatar shows initials fallback
- [ ] Quick actions trigger appropriate flows

#### 3.3 Calendar Components

**Files to create:**
- `src/lib/json-render/components/calendar-slot-picker.tsx`
- `src/lib/json-render/components/calendar-view.tsx`

**Steps:**
1. CalendarSlotPicker shows available slots with recommendations
2. CalendarView renders day/week view with events
3. Both integrate with data binding

**Acceptance criteria:**
- [ ] Slot picker highlights recommended times
- [ ] Calendar view renders events correctly
- [ ] Selection updates data path

#### 3.4 Inbox/Triage Components

**Files to create:**
- `src/lib/json-render/components/inbox-item.tsx`
- `src/lib/json-render/components/triage-panel.tsx`

**Steps:**
1. InboxItem shows email/slack/calendar item with priority
2. TriagePanel allows bulk operations
3. Actions for file, archive, snooze

**Acceptance criteria:**
- [ ] Priority score displays visually (color/badge)
- [ ] Source icons differentiate Gmail/Slack/Calendar
- [ ] Bulk selection works
- [ ] Actions trigger correctly

#### 3.5 Task Components

**Files to create:**
- `src/lib/json-render/components/task-list.tsx`
- `src/lib/json-render/components/task-item.tsx`

**Steps:**
1. TaskList renders list with optional completed toggle
2. TaskItem shows status, priority, due date
3. Quick actions for complete/edit/delete

**Acceptance criteria:**
- [ ] Status displays with appropriate styling
- [ ] Overdue tasks highlighted
- [ ] Complete action updates status

---

### Phase 4: Streaming Integration
**Duration:** 2 days

#### 4.1 Setup useUIStream Hook

**Files to create:** `src/lib/json-render/stream.ts`

**Steps:**
1. Create streaming endpoint connection
2. Handle progressive JSON parsing
3. Integrate with chat store

```typescript
// src/lib/json-render/stream.ts
import { useUIStream as useBaseUIStream } from '@json-render/react';
import { useChatStore } from '@/stores/chat-store';

interface StreamConfig {
  conversationId: string;
  onAction?: (action: string, payload: any) => void;
}

export function useOrionUIStream(config: StreamConfig) {
  const { addMessage, updateMessage } = useChatStore();

  const { tree, send, isStreaming, error } = useBaseUIStream({
    api: `/api/agent/stream`,
    headers: {
      'X-Conversation-Id': config.conversationId,
    },
    onAction: config.onAction,
  });

  const sendMessage = async (content: string) => {
    // Add user message to chat
    const userMsgId = addMessage({
      role: 'user',
      content,
    });

    // Send to agent and stream response
    await send(content);

    // UI tree is automatically updated by useBaseUIStream
  };

  return {
    tree,
    sendMessage,
    isStreaming,
    error,
  };
}
```

#### 4.2 Integrate with ChatPanel

**Files to modify:** `src/components/chat/ChatPanel.tsx`

**Steps:**
1. Use useOrionUIStream in ChatPanel
2. Render streaming json-render tree
3. Handle loading states

**Acceptance criteria:**
- [ ] Messages stream progressively
- [ ] UI components appear as JSON arrives
- [ ] Loading indicators show during stream
- [ ] Errors display gracefully

---

### Phase 5: Action Handling
**Duration:** 2 days

#### 5.1 Create Action Provider Implementation

**Files to create:** `src/lib/json-render/actions.ts`

**Steps:**
1. Map action names to handler functions
2. Integrate with Composio tools
3. Handle confirmations

```typescript
// src/lib/json-render/actions.ts
import { composioClient } from '@/lib/composio';

export const actionHandlers: Record<string, (payload: any) => Promise<void>> = {
  send_email: async ({ to, subject, body, replyToId }) => {
    await composioClient.execute('GMAIL_SEND_EMAIL', {
      to,
      subject,
      body,
      threadId: replyToId,
    });
  },

  save_draft: async ({ to, subject, body, draftId }) => {
    await composioClient.execute('GMAIL_CREATE_DRAFT', {
      to,
      subject,
      body,
      draftId,
    });
  },

  schedule_meeting: async ({ title, attendees, start, end, location, description }) => {
    await composioClient.execute('GOOGLECALENDAR_CREATE_EVENT', {
      summary: title,
      attendees: attendees.map((email: string) => ({ email })),
      start: { dateTime: start },
      end: { dateTime: end },
      location,
      description,
    });
  },

  file_to_project: async ({ itemId, projectId }) => {
    // Update local database
    await db.inboxItems.update({
      where: { id: itemId },
      data: { projectId, processed: true },
    });
  },

  archive_item: async ({ itemId }) => {
    await db.inboxItems.update({
      where: { id: itemId },
      data: { archived: true },
    });
  },

  snooze_item: async ({ itemId, until }) => {
    await db.inboxItems.update({
      where: { id: itemId },
      data: { snoozedUntil: until },
    });
  },

  create_task: async ({ title, description, projectId, dueDate, priority }) => {
    await db.tasks.create({
      data: {
        title,
        description,
        projectId,
        dueDate,
        priority,
        status: 'pending',
        sourceTool: 'manual',
      },
    });
  },

  complete_task: async ({ taskId }) => {
    await db.tasks.update({
      where: { id: taskId },
      data: { status: 'completed' },
    });
  },

  refresh_data: async () => {
    // Trigger inbox sync
    await syncInbox();
  },

  open_canvas: async ({ mode }) => {
    useCanvasStore.getState().openCanvas(mode);
  },

  close_canvas: async () => {
    useCanvasStore.getState().closeCanvas();
  },
};
```

#### 5.2 Wire Up ActionProvider

**Files to modify:** `src/app/(app)/layout.tsx` or `src/components/layout/AppLayout.tsx`

**Steps:**
1. Wrap app with ActionProvider
2. Connect action handlers
3. Handle async action results

**Acceptance criteria:**
- [ ] All actions execute correctly
- [ ] Async actions show loading state
- [ ] Errors surface to user
- [ ] Success triggers UI update

---

### Phase 6: Canvas Integration
**Duration:** 1-2 days

#### 6.1 Add json-render Canvas Mode

**Files to modify:**
- `src/stores/canvas-store.ts`
- `src/components/canvas/CanvasPanel.tsx`

**Steps:**
1. Add 'json-render' to CanvasMode type
2. Create JsonRenderCanvas component
3. Connect to streaming

```typescript
// Add to canvas-store.ts
type CanvasMode =
  | 'hidden'
  | 'document'
  | 'email-compose'
  | 'design'
  | 'calendar'
  | 'table'
  | 'json-render'; // New mode

// Add to CanvasState
interface CanvasState {
  // ... existing
  jsonRenderTree: any | null;
  setJsonRenderTree: (tree: any) => void;
}
```

```typescript
// src/components/canvas/editors/JsonRenderCanvas.tsx
import { DataProvider, ActionProvider, Renderer } from '@json-render/react';
import { componentRegistry } from '@/lib/json-render/registry';
import { actionHandlers } from '@/lib/json-render/actions';
import { useCanvasStore } from '@/stores/canvas-store';

export function JsonRenderCanvas() {
  const { jsonRenderTree } = useCanvasStore();

  if (!jsonRenderTree) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Waiting for agent...
      </div>
    );
  }

  return (
    <DataProvider initialData={{}}>
      <ActionProvider actions={actionHandlers}>
        <div className="p-4 overflow-auto h-full">
          <Renderer tree={jsonRenderTree} components={componentRegistry} />
        </div>
      </ActionProvider>
    </DataProvider>
  );
}
```

**Acceptance criteria:**
- [ ] Canvas mode 'json-render' works
- [ ] Tree renders in canvas panel
- [ ] Actions work from canvas
- [ ] State persists on mode switch

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORION APP                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐   │
│  │         CHAT PANEL           │    │         CANVAS PANEL              │   │
│  │                              │    │                                   │   │
│  │  ┌────────────────────────┐  │    │  ┌─────────────────────────────┐ │   │
│  │  │     User Message       │  │    │  │    json-render Canvas       │ │   │
│  │  └────────────────────────┘  │    │  │                             │ │   │
│  │  ┌────────────────────────┐  │    │  │  DataProvider               │ │   │
│  │  │  Agent Response +      │  │    │  │    ├── ActionProvider       │ │   │
│  │  │  Inline json-render    │  │    │  │    │    └── Renderer        │ │   │
│  │  │  ┌──────────────────┐  │  │    │  │    │         ├── Card       │ │   │
│  │  │  │ Quick Forms      │  │  │    │  │    │         ├── Forms      │ │   │
│  │  │  │ Confirmations    │  │  │    │  │    │         └── Actions    │ │   │
│  │  │  │ Pickers          │  │  │    │  │                             │ │   │
│  │  │  └──────────────────┘  │  │    │  └─────────────────────────────┘ │   │
│  │  └────────────────────────┘  │    │                                   │   │
│  │                              │    │  OR TipTap / Calendar / Table    │   │
│  └──────────────────────────────┘    └──────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        json-render Layer                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Catalog   │  │  Registry   │  │  Actions    │  │   Stream    │  │   │
│  │  │ (Zod schemas)│  │ (shadcn/ui)│  │ (handlers)  │  │ (useUIStream)│  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        AGENT BACKEND                                  │   │
│  │                                                                       │   │
│  │  Butler Agent ──► Emits JSON tree ──► Streamed to Frontend           │   │
│  │       │                                                               │   │
│  │       └── Catalog schema in system prompt                            │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

| Component | Test Coverage |
|-----------|---------------|
| Catalog validation | All Zod schemas validate correctly |
| Component registry | Each component renders without errors |
| Data binding | useDataValue/useDataSetter work |
| Actions | Each action handler executes correctly |

### Integration Tests

| Flow | Test |
|------|------|
| Email composition | User fills form → send_email action triggers → Gmail API called |
| Meeting scheduling | Agent suggests times → user picks → schedule_meeting creates event |
| Inbox triage | Items display → user files → database updated |

### E2E Tests

| Scenario | Steps |
|----------|-------|
| Complete email flow | Chat "draft email to John" → Composer appears → Fill → Send → Confirm |
| Meeting scheduling | Chat "schedule meeting" → Slots shown → Pick time → Event created |

---

## Component Catalog Summary

### Layout Components (5)
- `Card` - Container with title
- `Row` - Horizontal flex layout
- `Column` - Vertical flex layout
- `Divider` - Horizontal separator
- (Grid - future)

### Display Components (4)
- `Text` - Text with variants
- `Badge` - Status/label badge
- `Avatar` - User avatar
- `ProgressIndicator` - Progress bar/circle

### Interactive Components (8)
- `Button` - Action button
- `TextField` - Text/email/textarea input
- `Select` - Dropdown select
- `RadioGroup` - Radio button group
- `Checkbox` - Single checkbox
- `DatePicker` - Date selection
- `TimePicker` - Time selection
- `Confirmation` - Confirm dialog

### Orion-Specific Components (10)
- `EmailComposer` - Full email composition
- `EmailPreview` - Email display
- `InboxItem` - Single inbox item
- `ContactCard` - Contact display
- `CalendarSlotPicker` - Meeting time picker
- `CalendarView` - Calendar week/day view
- `TaskList` - Task list view
- `TaskItem` - Single task display
- `SchedulerForm` - Meeting scheduling form
- `TriagePanel` - Inbox triage interface

**Total: 27 components**

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| json-render API changes | Low | Medium | Pin version, abstract behind our types |
| Complex component needs | Medium | Medium | Build custom components as needed |
| Streaming performance | Low | High | Batch updates, virtual scrolling |
| Agent generates invalid JSON | Medium | Low | Validate + fallback to text display |
| Action race conditions | Low | Medium | Queue actions, show loading states |

---

## Estimated Complexity

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Foundation | 1-2 days | Low |
| Phase 2: Component Registry | 2-3 days | Low |
| Phase 3: Orion Components | 3-4 days | Medium |
| Phase 4: Streaming | 2 days | Medium |
| Phase 5: Actions | 2 days | Low |
| Phase 6: Canvas Integration | 1-2 days | Low |

**Total Estimated: 11-15 days**

---

## Dependencies

### External Packages
- `@json-render/core` - Core types and catalog
- `@json-render/react` - React renderer and hooks
- `zod` - Schema validation

### Internal Dependencies
- Existing shadcn/ui components
- Canvas store (Zustand)
- Composio client
- Chat store

---

## Next Steps

1. **Install packages** - `npm install @json-render/core @json-render/react zod`
2. **Create catalog** - Define all component schemas
3. **Build registry** - Map to shadcn/ui implementations
4. **Test basic rendering** - Verify streaming works
5. **Add Orion components** - Build email, calendar, task components
6. **Wire up actions** - Connect to Composio and database
7. **Integrate with agent** - Add catalog to agent system prompt

---

## Risk Mitigations (Pre-Mortem)

**Pre-Mortem Run:** 2026-01-14
**Mode:** Deep

### Tigers Addressed

| # | Risk | Severity | Mitigation | Phase |
|---|------|----------|------------|-------|
| 1 | No app codebase exists | HIGH | Added Prerequisites section requiring MVP Plan Phase 0-1 completion | Prerequisites |
| 2 | Plan used Zod 3.x syntax | HIGH | Verified Zod 4.x is compatible; documented in Prerequisites | Prerequisites |
| 3 | No agent backend or streaming endpoint | HIGH | Added Phase 0.5 with streaming API and JSON parser | Phase 0.5 |

### Elephants Acknowledged

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | Timeline assumes base app exists | HIGH | Documented in Prerequisites - true timeline is MVP phases (4 weeks) + this plan (11-15 days) |
| 2 | EmailComposer used plain Textarea instead of TipTap | MEDIUM | Updated EmailComposer in Phase 3.1 to embed TipTap editor |

### Paper Tigers (Dismissed)

| Risk | Why It's Fine |
|------|---------------|
| json-render too new/unstable | Package exists on npm (v0.2.0), Vercel backing, comprehensive TypeScript types verified |
| 27 components is too many | Phased approach - base components in Phase 2, Orion-specific in Phase 3 |

### Updated Timeline

| Dependency | Duration |
|------------|----------|
| MVP Plan Phase 0 (scaffold) | 1 week |
| MVP Plan Phase 1 (core infra) | 3 weeks |
| **This plan (json-render)** | **12-17 days** |
| **Total** | **~6-7 weeks** |

> Phase 0.5 adds 1-2 days to original estimate.

---

## Hybrid Component Pattern: TipTap + json-render

Some components like `EmailComposer` embed TipTap for rich text editing. This is a **hybrid pattern**:

```
json-render (DataProvider)
    └── EmailComposer
        ├── To field (json-render TextField)
        ├── Subject field (json-render TextField)
        └── Body (TipTap Editor - native React)
            └── onChange → updates json-render data path
```

**Why hybrid?**
- TipTap is a complex editor with its own state management
- Can't be represented as a simple json-render component
- Data binding done manually via `useDataSetter(bodyPath)`

**Components using this pattern:**
- `EmailComposer` - TipTap for body
- `DocumentEditor` (future) - TipTap for full document
- `DesignCanvas` (future) - Polotno for design

---

## References

- [json-render GitHub](https://github.com/vercel-labs/json-render)
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
- [Chat + Canvas Interaction Spec](../../docs/CHAT-CANVAS-INTERACTION-SPEC.md) - Canonical UI patterns
- [Existing Canvas Architecture](./canvas-architecture.md)
- [A2UI Research](./A2UI-deep-dive.md) (replaced by json-render)
- [PRD Feature Requirements](../../docs/PRD-orion-personal-butler.md#5-feature-requirements)
- [MVP Implementation Plan](./PLAN-orion-mvp.md) (prerequisite)
