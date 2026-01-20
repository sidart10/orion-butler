# Plan: Multi-Editor Canvas with Polotno & TipTap

## Goal

Build a **malleable canvas panel** that dynamically switches between different editors based on context. The canvas is hidden by default and only appears when needed. Editors are controlled programmatically by Claude agents.

**Canvas Modes:**
- `hidden` - Default state, full-width chat
- `document` / `email-compose` - TipTap rich text editor
- `design` - Polotno visual design editor
- `calendar` - Calendar/scheduler view
- `table` - Data grid view

## Technical Choices

- **Canvas Architecture**: Switchable container with lazy-loaded editors
- **Document Editor**: TipTap (Free MIT core, $149/mo Starter for AI features)
- **Design Editor**: Polotno SDK ($199-399/mo) - Full programmatic API, Cloud Render
- **Integration Pattern**: Tool-based control via Claude Agent SDK custom tools
- **State Management**: Zustand for canvas state, each editor manages its own internal state
- **UI Pattern**: A2UI for inline chat components, Canvas for immersive editing

---

## UI Clarifications

### A2UI vs Canvas Panel

| Component | Location | Purpose |
|-----------|----------|---------|
| **A2UI components** | Inline in chat | Buttons, pickers, forms, confirmations |
| **Canvas editors** | Side panel (on-demand) | Immersive editing experiences |

**A2UI is for quick interactions embedded in chat.** Canvas is for full editors.

### Canvas Visibility

- **Default**: Hidden - user sees full-width chat
- **Opens when**: Agent triggers design/document/calendar task
- **Closes when**: User clicks close or task completes

---

## Current State Analysis

### Existing Architecture (from research docs)

- **UI Pattern**: Full-width chat by default, split-screen when canvas needed
- **Dynamic UI**: A2UI protocol for inline chat components
- **Agent SDK**: Claude Agent SDK with custom tools, MCP integration, skills
- **No canvas code yet**: Project is in early stages (PARA folders only)

### Key Files:

- `thoughts/research/orion-ui-design.md` - UI architecture decisions
- `thoughts/research/claude-agent-sdk-deep-dive.md` - SDK capabilities
- `thoughts/research/composio-deep-dive.md` - External tool integrations

---

## Architecture Overview

### Multi-Editor Canvas Container

```
DEFAULT STATE (Canvas Hidden):
┌─────────────────────────────────────────────────────────────────┐
│                        ORION UI                                  │
├─────────────────────────────────────────────────────────────────┤
│                         CHAT (full width)                        │
│                                                                  │
│  🤖 I found 3 available meeting times with John:                │
│                                                                  │
│  ┌─────────────────────────────────────────┐  ← A2UI inline     │
│  │  ○ Mon 10am   ○ Tue 2pm   ● Wed 11am   │                     │
│  │  Duration: [30 min ▼]                   │                     │
│  │  [Schedule Meeting]                     │                     │
│  └─────────────────────────────────────────┘                     │
│                                                                  │
│  User: Create an Instagram post about our Q1 launch             │
│                                                                  │
│  🤖 Opening the design canvas...                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘


CANVAS OPEN STATE (Design Mode):
┌─────────────────────────────────────────────────────────────────┐
│                        ORION UI                                  │
├──────────────────────────┬──────────────────────────────────────┤
│      CHAT (narrower)     │       CANVAS PANEL                    │
│                          │  ┌────────────────────────────────┐   │
│  🤖 I've set up an       │  │  [✕ Close]                     │   │
│     Instagram template.  │  │                                │   │
│     What text would you  │  │  ┌──────────────────────────┐  │   │
│     like on it?          │  │  │   POLOTNO EDITOR         │  │   │
│                          │  │  │                          │  │   │
│  User: "Q1 Launch! 🚀"   │  │  │   [Design Preview]       │  │   │
│                          │  │  │                          │  │   │
│  🤖 Added the headline.  │  │  └──────────────────────────┘  │   │
│     Shall I add a        │  │                                │   │
│     product image?       │  │  [Export ▼] [Templates]        │   │
│                          │  └────────────────────────────────┘   │
└──────────────────────────┴──────────────────────────────────────┘


CANVAS OPEN STATE (Document Mode):
┌─────────────────────────────────────────────────────────────────┐
│                        ORION UI                                  │
├──────────────────────────┬──────────────────────────────────────┤
│      CHAT (narrower)     │       CANVAS PANEL                    │
│                          │  ┌────────────────────────────────┐   │
│  🤖 I've drafted a       │  │  [✕ Close]                     │   │
│     reply to John's      │  │                                │   │
│     email.               │  │  ┌──────────────────────────┐  │   │
│                          │  │  │   TIPTAP EDITOR          │  │   │
│  User: Make it more      │  │  │                          │  │   │
│        formal            │  │  │   Hi John,               │  │   │
│                          │  │  │                          │  │   │
│  🤖 Updated the tone.    │  │  │   Thank you for your...  │  │   │
│                          │  │  │                          │  │   │
│                          │  │  └──────────────────────────┘  │   │
│                          │  │                                │   │
│                          │  │  [Send] [Save Draft]           │   │
│                          │  └────────────────────────────────┘   │
└──────────────────────────┴──────────────────────────────────────┘
```

### Canvas Panel Implementation

```tsx
// CanvasPanel.tsx - Switchable multi-editor container
import { lazy, Suspense } from 'react';
import { useCanvasStore } from '@/stores/canvas-store';

// Lazy load editors - only loaded when first needed
const TipTapEditor = lazy(() => import('./editors/TipTapEditor'));
const PolotnoCanvas = lazy(() => import('./editors/PolotnoCanvas'));
const CalendarView = lazy(() => import('./editors/CalendarView'));
const DataTable = lazy(() => import('./editors/DataTable'));

export type CanvasMode =
  | 'hidden'
  | 'document'
  | 'email-compose'
  | 'design'
  | 'calendar'
  | 'table';

export function CanvasPanel() {
  const { mode, closeCanvas } = useCanvasStore();

  // Hidden = no panel rendered
  if (mode === 'hidden') return null;

  return (
    <div className="canvas-panel border-l h-full">
      <div className="flex justify-between p-2 border-b">
        <span className="font-medium">{getModeLabel(mode)}</span>
        <button onClick={closeCanvas}>✕ Close</button>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {/* TipTap for documents and emails */}
        {(mode === 'document' || mode === 'email-compose') && (
          <TipTapEditor mode={mode} />
        )}

        {/* Polotno for visual design */}
        {mode === 'design' && (
          <PolotnoCanvas />
        )}

        {/* Calendar for scheduling */}
        {mode === 'calendar' && (
          <CalendarView />
        )}

        {/* Data table for lists */}
        {mode === 'table' && (
          <DataTable />
        )}
      </Suspense>
    </div>
  );
}
```

### Canvas State Management

```typescript
// canvas-store.ts - Zustand store for canvas state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CanvasState {
  mode: CanvasMode;

  // Each editor's state persisted separately
  documentState: TipTapJSON | null;
  designState: PolotnoJSON | null;
  calendarState: CalendarState | null;

  // Actions
  openCanvas: (mode: CanvasMode) => void;
  closeCanvas: () => void;

  // Editor-specific state setters
  setDocumentState: (state: TipTapJSON) => void;
  setDesignState: (state: PolotnoJSON) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      mode: 'hidden',
      documentState: null,
      designState: null,
      calendarState: null,

      openCanvas: (mode) => set({ mode }),
      closeCanvas: () => set({ mode: 'hidden' }),

      setDocumentState: (state) => set({ documentState: state }),
      setDesignState: (state) => set({ designState: state }),
    }),
    { name: 'orion-canvas' }
  )
);
```

### Agent Tool for Canvas Control

```python
@tool
def open_canvas(mode: Literal["document", "email-compose", "design", "calendar", "table"]) -> CallToolResult:
    """
    Open the canvas panel in a specific mode.

    Modes:
    - document: Rich text document editor (TipTap)
    - email-compose: Email composer (TipTap)
    - design: Visual design editor (Polotno)
    - calendar: Calendar/scheduling view
    - table: Data table view

    The canvas appears on the right side of the chat.
    """
    frontend_bridge.call("canvas.setMode", {"mode": mode})
    return CallToolResult(content=[{"type": "text", "text": f"Opened {mode} canvas"}])

@tool
def close_canvas() -> CallToolResult:
    """Close the canvas panel and return to full-width chat."""
    frontend_bridge.call("canvas.setMode", {"mode": "hidden"})
    return CallToolResult(content=[{"type": "text", "text": "Closed canvas"}])
```

---

## Editor Integration Details

### TipTap (Documents & Email)

**Package**: `@tiptap/react` (Free MIT core)

**Extensions (Free)**:
- StarterKit (bold, italic, lists, headings)
- Placeholder
- CharacterCount
- Link, Image, Table

**Optional Paid ($149/mo Starter)**:
- AI Suggestion (proofreading)
- Comments
- Export/Import (DOCX)

```tsx
// TipTapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface TipTapEditorProps {
  mode: 'document' | 'email-compose';
}

export function TipTapEditor({ mode }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: mode === 'email-compose'
          ? 'Compose your email...'
          : 'Start writing...'
      }),
    ],
    onUpdate: ({ editor }) => {
      // Sync to canvas store
      useCanvasStore.getState().setDocumentState(editor.getJSON());
    }
  });

  return (
    <div className="tiptap-editor p-4">
      <EditorContent editor={editor} />
      {mode === 'email-compose' && (
        <div className="mt-4 flex gap-2">
          <button className="btn-primary">Send</button>
          <button className="btn-secondary">Save Draft</button>
        </div>
      )}
    </div>
  );
}
```

### Polotno (Visual Design)

**Package**: `polotno` ($199-399/mo)

```tsx
// PolotnoCanvas.tsx (simplified from earlier)
export function PolotnoCanvas() {
  const { store } = usePolotnoStore();

  return (
    <PolotnoContainer style={{ height: '100%' }}>
      <WorkspaceWrap>
        <Toolbar store={store} />
        <Workspace store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
}
```

---

## Claude Agent SDK Integration

### Tools Overview

| Tool | Purpose | Editor |
|------|---------|--------|
| `open_canvas` | Open canvas in specific mode | All |
| `close_canvas` | Close canvas | All |
| `tiptap_*` | Document/email operations | TipTap |
| `polotno_*` | Design operations | Polotno |
| `calendar_*` | Scheduling operations | Calendar |

---

## Tasks

### Task 0: Canvas Container Infrastructure

Build the malleable canvas container that switches between editors.

- [ ] Create CanvasPanel component with mode switching
- [ ] Set up Zustand canvas store with persistence
- [ ] Implement lazy loading for editors
- [ ] Add loading states and error boundaries
- [ ] Create `open_canvas` and `close_canvas` agent tools

**Files to create:**
- `orion/frontend/src/components/canvas/CanvasPanel.tsx`
- `orion/frontend/src/stores/canvas-store.ts`
- `orion/backend/src/tools/canvas_tools.py`

---

### Task 1: Project Setup & Dependencies

Set up the frontend infrastructure for all editors.

- [x] Create Next.js 14+ project structure (if not exists)
- [ ] Install TipTap: `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit`
- [ ] Install Polotno SDK: `npm install polotno`
- [ ] Install Blueprint CSS (Polotno dependency): `npm install @blueprintjs/core`
- [ ] Set up API keys in environment (Polotno)
- [ ] Configure TypeScript for both editors

**Files to create/modify:**
- `orion/frontend/package.json`
- `orion/frontend/.env.local`
- `orion/frontend/tsconfig.json`

---

### Task 2: Polotno Store Bridge

Create a bridge between Polotno's MobX store and Orion's state management.

- [ ] Create PolotnoStoreManager class
- [ ] Implement singleton store instance management
- [ ] Add event emitters for store changes (MobX reactions)
- [ ] Expose typed API for agent interactions
- [ ] Add serialization helpers (toJSON/loadJSON)

**Files to create:**
- `orion/frontend/src/canvas/polotno-store.ts`

```typescript
// polotno-store.ts - Core store management
import { createStore, StoreType } from 'polotno/model/store';
import { reaction } from 'mobx';

export class PolotnoStoreManager {
  private store: StoreType;
  private disposers: (() => void)[] = [];

  constructor(apiKey: string) {
    this.store = createStore({
      key: apiKey,
      showCredit: false,
    });
    this.setupReactions();
  }

  private setupReactions() {
    // Watch selection changes
    const disposeSelection = reaction(
      () => this.store.selectedElements.map(e => e.id),
      (selectedIds) => {
        this.emit('selectionChange', selectedIds);
      }
    );
    this.disposers.push(disposeSelection);

    // Watch content changes
    this.store.on('change', () => {
      this.emit('contentChange', this.getState());
    });
  }

  // Agent-callable methods
  addElement(type: string, props: Record<string, any>) {
    const page = this.store.activePage;
    if (!page) throw new Error('No active page');
    return page.addElement({ type, ...props });
  }

  updateElement(id: string, props: Record<string, any>) {
    const element = this.store.getElementById(id);
    if (!element) throw new Error(`Element ${id} not found`);
    element.set(props);
  }

  removeElement(id: string) {
    const element = this.store.getElementById(id);
    if (!element) throw new Error(`Element ${id} not found`);
    element.remove();
  }

  async exportDesign(format: 'png' | 'jpeg' | 'pdf' = 'png') {
    switch (format) {
      case 'pdf':
        return await this.store.saveAsPDF();
      default:
        return await this.store.toDataURL({ mimeType: `image/${format}` });
    }
  }

  getState() {
    return this.store.toJSON();
  }

  loadState(json: any) {
    this.store.loadJSON(json);
  }

  dispose() {
    this.disposers.forEach(d => d());
  }
}
```

---

### Task 2B: TipTap Editor Integration

Build the TipTap editor for documents and emails.

- [ ] Create TipTapEditor component
- [ ] Configure extensions (StarterKit, Placeholder, CharacterCount, Link, Image)
- [ ] Add email-compose mode with Send/Save Draft buttons
- [ ] Implement content sync with canvas store
- [ ] Create Claude agent tools for TipTap control

**Files to create:**
- `orion/frontend/src/components/canvas/editors/TipTapEditor.tsx`
- `orion/backend/src/tools/tiptap_tools.py`

```python
# tiptap_tools.py - Claude Agent SDK Tools for TipTap
from claude_agent_sdk.tools import tool, CallToolResult
from typing import Literal, Optional

@tool
def tiptap_set_content(content: str, format: Literal["html", "text"] = "html") -> CallToolResult:
    """
    Set the content of the TipTap editor.

    Args:
        content: The content to set (HTML or plain text)
        format: Content format - "html" for rich text, "text" for plain

    Use this to draft emails or documents for the user.
    """
    frontend_bridge.call("tiptap.setContent", {"content": content, "format": format})
    return CallToolResult(content=[{"type": "text", "text": "Set editor content"}])

@tool
def tiptap_get_content(format: Literal["html", "text", "json"] = "html") -> CallToolResult:
    """
    Get the current content of the TipTap editor.

    Args:
        format: Output format - "html", "text" (plain), or "json" (ProseMirror)
    """
    result = frontend_bridge.call("tiptap.getContent", {"format": format})
    return CallToolResult(content=[{"type": "text", "text": result["content"]}])

@tool
def tiptap_insert_at_cursor(text: str) -> CallToolResult:
    """Insert text at the current cursor position."""
    frontend_bridge.call("tiptap.insertAtCursor", {"text": text})
    return CallToolResult(content=[{"type": "text", "text": "Inserted text at cursor"}])

@tool
def tiptap_apply_formatting(
    format_type: Literal["bold", "italic", "underline", "strike", "code", "link"],
    link_url: Optional[str] = None
) -> CallToolResult:
    """
    Apply formatting to the current selection.

    Args:
        format_type: The formatting to apply
        link_url: URL for link formatting (required if format_type is "link")
    """
    frontend_bridge.call("tiptap.applyFormat", {
        "type": format_type,
        "url": link_url
    })
    return CallToolResult(content=[{"type": "text", "text": f"Applied {format_type} formatting"}])
```

---

### Task 3: React Components for Canvas Panel

Build the React components that render Polotno in Orion's canvas panel.

- [ ] Create PolotnoCanvas wrapper component
- [ ] Implement lazy loading for performance
- [ ] Add loading states and error boundaries
- [ ] Connect to Orion's canvas mode system
- [ ] Style integration with shadcn/ui theme

**Files to create:**
- `orion/frontend/src/canvas/PolotnoCanvas.tsx`
- `orion/frontend/src/canvas/CanvasModeProvider.tsx`

```tsx
// PolotnoCanvas.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import '@blueprintjs/core/lib/css/blueprint.css';

import { usePolotnoStore } from './usePolotnoStore';

interface PolotnoCanvasProps {
  className?: string;
  onExport?: (dataUrl: string) => void;
  onStateChange?: (state: any) => void;
}

export function PolotnoCanvas({
  className,
  onExport,
  onStateChange
}: PolotnoCanvasProps) {
  const { store, isLoading, error } = usePolotnoStore();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      Loading canvas...
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">
      Failed to load canvas: {error.message}
    </div>;
  }

  return (
    <PolotnoContainer
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      <SidePanelWrap>
        <SidePanel store={store} />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={store} downloadButtonEnabled />
        <Workspace store={store} />
        <ZoomButtons store={store} />
        <PagesTimeline store={store} />
      </WorkspaceWrap>
    </PolotnoContainer>
  );
}
```

---

### Task 4: Claude Agent SDK Custom Tool

Create the MCP tool that allows Claude agents to control Polotno.

- [ ] Define tool schema with JSON types
- [ ] Implement tool handler functions
- [ ] Add validation for tool inputs
- [ ] Create TypeScript types for tool parameters
- [ ] Register tool with Claude Agent SDK

**Files to create:**
- `orion/backend/src/tools/polotno_tool.py`

```python
# polotno_tool.py - Claude Agent SDK Custom Tool
from claude_agent_sdk.tools import tool, CallToolResult
from typing import Literal, Optional, Dict, Any
from pydantic import BaseModel, Field

class AddElementParams(BaseModel):
    type: Literal["text", "image", "svg", "figure", "video"]
    x: float = Field(default=100, description="X position on canvas")
    y: float = Field(default=100, description="Y position on canvas")
    width: Optional[float] = Field(default=None, description="Element width")
    height: Optional[float] = Field(default=None, description="Element height")
    text: Optional[str] = Field(default=None, description="Text content (for text elements)")
    src: Optional[str] = Field(default=None, description="Image/SVG source URL")
    fill: Optional[str] = Field(default=None, description="Fill color")
    fontSize: Optional[int] = Field(default=None, description="Font size (for text)")

class UpdateElementParams(BaseModel):
    element_id: str = Field(description="ID of element to update")
    properties: Dict[str, Any] = Field(description="Properties to update")

class ExportParams(BaseModel):
    format: Literal["png", "jpeg", "pdf", "gif", "mp4"] = Field(default="png")
    quality: Optional[float] = Field(default=1.0, ge=0.1, le=2.0)

# Tool implementations
@tool
def polotno_add_element(params: AddElementParams) -> CallToolResult:
    """
    Add a new element to the Polotno canvas.

    Supported element types:
    - text: Text with customizable font, size, color
    - image: Raster images from URL
    - svg: Vector graphics with color replacement
    - figure: Basic shapes (rectangle, circle, star, etc.)
    - video: Video elements with trimming

    Returns the ID of the created element.
    """
    # This will be called via IPC to the frontend
    # Implementation depends on Orion's frontend-backend communication
    element_data = params.model_dump(exclude_none=True)

    # Placeholder - actual implementation calls frontend
    result = frontend_bridge.call("polotno.addElement", element_data)

    return CallToolResult(
        content=[{"type": "text", "text": f"Created {params.type} element with ID: {result['id']}"}]
    )

@tool
def polotno_update_element(params: UpdateElementParams) -> CallToolResult:
    """
    Update properties of an existing element on the canvas.

    Common properties:
    - x, y: Position
    - width, height: Dimensions
    - rotation: Rotation in degrees
    - fill: Fill color
    - opacity: Transparency (0-1)
    - text: Text content (for text elements)
    """
    result = frontend_bridge.call("polotno.updateElement", {
        "id": params.element_id,
        "props": params.properties
    })

    return CallToolResult(
        content=[{"type": "text", "text": f"Updated element {params.element_id}"}]
    )

@tool
def polotno_remove_element(element_id: str) -> CallToolResult:
    """Remove an element from the canvas by its ID."""
    frontend_bridge.call("polotno.removeElement", {"id": element_id})

    return CallToolResult(
        content=[{"type": "text", "text": f"Removed element {element_id}"}]
    )

@tool
def polotno_export_design(params: ExportParams) -> CallToolResult:
    """
    Export the current canvas design to an image or document.

    Formats:
    - png: High-quality raster (default)
    - jpeg: Compressed raster
    - pdf: Vector PDF for print
    - gif: Animated (if design has animations)
    - mp4: Video (if design has video/animations)

    Returns the exported file as base64 or URL.
    """
    result = frontend_bridge.call("polotno.export", {
        "format": params.format,
        "quality": params.quality
    })

    return CallToolResult(
        content=[{"type": "text", "text": f"Exported design as {params.format}: {result['url']}"}]
    )

@tool
def polotno_get_canvas_state() -> CallToolResult:
    """
    Get the current state of the canvas as JSON.

    Returns the full design structure including:
    - Pages and their dimensions
    - All elements with their properties
    - Can be saved and loaded later
    """
    state = frontend_bridge.call("polotno.getState", {})

    return CallToolResult(
        content=[{"type": "text", "text": f"Canvas state: {json.dumps(state, indent=2)}"}]
    )

@tool
def polotno_load_template(template_id: str) -> CallToolResult:
    """
    Load a pre-defined template into the canvas.

    Templates can be:
    - Social media posts (instagram, twitter, linkedin)
    - Marketing materials (flyer, banner, poster)
    - Presentations (slide deck)
    - Custom user-saved templates
    """
    result = frontend_bridge.call("polotno.loadTemplate", {"templateId": template_id})

    return CallToolResult(
        content=[{"type": "text", "text": f"Loaded template: {template_id}"}]
    )

@tool
def polotno_set_page_size(width: int, height: int, preset: Optional[str] = None) -> CallToolResult:
    """
    Set the canvas page dimensions.

    Common presets:
    - instagram_post: 1080x1080
    - instagram_story: 1080x1920
    - twitter_post: 1200x675
    - linkedin_post: 1200x628
    - presentation: 1920x1080

    Or specify custom width/height in pixels.
    """
    presets = {
        "instagram_post": (1080, 1080),
        "instagram_story": (1080, 1920),
        "twitter_post": (1200, 675),
        "linkedin_post": (1200, 628),
        "presentation": (1920, 1080),
        "a4_portrait": (2480, 3508),
        "a4_landscape": (3508, 2480),
    }

    if preset and preset in presets:
        width, height = presets[preset]

    frontend_bridge.call("polotno.setPageSize", {"width": width, "height": height})

    return CallToolResult(
        content=[{"type": "text", "text": f"Set page size to {width}x{height}"}]
    )
```

---

### Task 5: Frontend-Backend Bridge

Create the communication layer between the Python backend and React frontend.

- [ ] Set up WebSocket server for real-time communication
- [ ] Define message protocol for tool calls
- [ ] Implement request/response handling
- [ ] Add connection state management
- [ ] Handle reconnection logic

**Files to create:**
- `orion/backend/src/bridge/frontend_bridge.py`
- `orion/frontend/src/bridge/useBridge.ts`

---

### Task 6: Design Assistant Agent

Create a specialized agent for design tasks.

- [ ] Define agent system prompt
- [ ] Configure allowed tools (Polotno + utility tools)
- [ ] Add brand guidelines context loading
- [ ] Create template library knowledge base
- [ ] Add design principles instructions

**Files to create:**
- `.claude/agents/design-assistant.md`

```markdown
---
name: design-assistant
description: AI assistant for creating and editing visual designs
model: claude-sonnet-4-5
allowed_tools:
  - polotno_add_element
  - polotno_update_element
  - polotno_remove_element
  - polotno_export_design
  - polotno_get_canvas_state
  - polotno_load_template
  - polotno_set_page_size
  - Read
  - WebSearch
hooks:
  PostToolUse:
    - matcher: "polotno_*"
      action: log_design_action
---

# Design Assistant

You are a professional graphic designer AI assistant with expertise in:
- Social media content creation
- Marketing materials
- Brand consistency
- Visual hierarchy
- Color theory
- Typography

## Your Approach

1. **Understand the brief**: Ask clarifying questions about purpose, audience, style
2. **Set up canvas**: Choose appropriate dimensions for the platform
3. **Build layout**: Start with structure, then add details
4. **Apply branding**: Use brand colors, fonts, and style guidelines
5. **Refine**: Adjust spacing, alignment, visual balance
6. **Export**: Deliver in the requested format

## Design Principles

- Less is more - avoid cluttered designs
- Hierarchy guides the eye - most important elements should be prominent
- Consistency in spacing, colors, and typography
- Consider accessibility (contrast ratios, readable fonts)
- Mobile-first for social media content

## Available Templates

Query the template library for:
- Instagram posts/stories
- Twitter/X posts
- LinkedIn posts
- Facebook posts
- YouTube thumbnails
- Presentation slides
- Marketing flyers

## Brand Guidelines

Load brand guidelines from the user's profile when available:
- Primary/secondary colors
- Font preferences
- Logo usage rules
- Tone and style

## Common Workflows

### Social Media Post
1. Set page size to platform dimensions
2. Add background (color or image)
3. Add main visual (product, photo, illustration)
4. Add headline text
5. Add supporting text/CTA
6. Add logo/branding
7. Export as PNG

### Presentation Slide
1. Set page size to 16:9 (1920x1080)
2. Add title
3. Add content (text, images, charts)
4. Apply consistent styling
5. Export as PDF or PPTX
```

---

### Task 7: Design Skills

Create reusable skills for common design workflows.

- [ ] `/design` - Main design skill
- [ ] `/create-post` - Social media post creation
- [ ] `/export-design` - Export and share design
- [ ] `/apply-brand` - Apply brand guidelines

**Files to create:**
- `.claude/skills/design/SKILL.md`
- `.claude/skills/create-post/SKILL.md`

```markdown
# .claude/skills/design/SKILL.md
---
name: design
description: Create or edit visual designs
agent: design-assistant
context: fork
allowed_tools:
  - polotno_*
  - Read
  - WebSearch
---

# Design Skill

Create beautiful visual designs through conversation.

## Usage

Invoke with a design request:
- "Create an Instagram post announcing our new product"
- "Design a presentation slide about Q1 results"
- "Make a LinkedIn banner for our company page"

## Process

1. Parse the design request
2. Spawn design-assistant agent
3. Agent creates design iteratively
4. Show preview to user
5. Accept feedback for refinements
6. Export final design

## Arguments

- `--template <id>`: Start from a specific template
- `--platform <name>`: Auto-set dimensions for platform
- `--export <format>`: Auto-export when done
```

---

### Task 8: Template Library

Create a template system for common design starting points.

- [ ] Define template JSON schema
- [ ] Create template loader/saver
- [ ] Build initial template library (10+ templates)
- [ ] Add template preview generation
- [ ] Implement template search/filter

**Files to create:**
- `orion/data/templates/instagram-post.json`
- `orion/data/templates/presentation-slide.json`
- `orion/backend/src/templates/template_manager.py`

---

### Task 9: Cloud Render Integration

Set up server-side rendering for automation workflows.

- [ ] Configure Cloud Render API credentials
- [ ] Create render job management
- [ ] Implement async rendering with webhooks
- [ ] Add render status tracking
- [ ] Handle render results storage

**Files to create:**
- `orion/backend/src/render/cloud_render.py`

```python
# cloud_render.py - Polotno Cloud Render integration
import httpx
from typing import Literal, Optional
import asyncio

class CloudRenderClient:
    BASE_URL = "https://api.polotno.com/api/renders"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = httpx.AsyncClient()

    async def render(
        self,
        design: dict,
        format: Literal["png", "jpeg", "pdf", "gif", "mp4"] = "png",
        pixel_ratio: float = 1.0,
        webhook_url: Optional[str] = None
    ) -> dict:
        """Submit a render job."""
        response = await self.client.post(
            f"{self.BASE_URL}?KEY={self.api_key}",
            json={
                "design": design,
                "format": format,
                "pixelRatio": pixel_ratio,
                "webhook": webhook_url
            },
            headers={"Content-Type": "application/json"}
        )
        return response.json()

    async def render_sync(
        self,
        design: dict,
        format: Literal["png", "jpeg", "pdf"] = "png",
        timeout: int = 60
    ) -> dict:
        """Submit and wait for render to complete."""
        response = await self.client.post(
            f"{self.BASE_URL}?KEY={self.api_key}",
            json={
                "design": design,
                "format": format
            },
            headers={
                "Content-Type": "application/json",
                "Prefer": "wait"
            },
            timeout=timeout
        )
        return response.json()

    async def get_job_status(self, job_id: str) -> dict:
        """Check the status of a render job."""
        response = await self.client.get(
            f"{self.BASE_URL}/{job_id}?KEY={self.api_key}"
        )
        return response.json()

    async def wait_for_completion(
        self,
        job_id: str,
        poll_interval: int = 2,
        timeout: int = 300
    ) -> dict:
        """Poll until job completes."""
        start_time = asyncio.get_event_loop().time()

        while True:
            status = await self.get_job_status(job_id)

            if status["status"] == "done":
                return status
            elif status["status"] == "error":
                raise Exception(f"Render failed: {status.get('error')}")

            if asyncio.get_event_loop().time() - start_time > timeout:
                raise TimeoutError(f"Render timed out after {timeout}s")

            await asyncio.sleep(poll_interval)
```

---

### Task 10: Integration Testing

Create tests to verify the integration works end-to-end.

- [ ] Unit tests for PolotnoStoreManager
- [ ] Integration tests for tool handlers
- [ ] E2E tests for design workflows
- [ ] Test template loading/saving
- [ ] Test Cloud Render integration

**Files to create:**
- `orion/tests/test_polotno_integration.py`
- `orion/tests/test_design_agent.py`

---

## Success Criteria

### Automated Verification:

- [ ] `npm run build` - Frontend builds without errors
- [ ] `uv run pytest orion/tests/` - All tests pass
- [ ] `uv run mypy orion/backend/` - Type checks pass
- [ ] Polotno loads in browser without console errors

### Manual Verification:

- [ ] User can say "Create an Instagram post" → canvas shows design
- [ ] User can modify design via chat ("make the text bigger")
- [ ] Design exports correctly in all formats (PNG, PDF, JPEG)
- [ ] Templates load and are editable
- [ ] Brand guidelines are applied when available
- [ ] Cloud Render produces correct output

---

## Implementation Sequence

```
Phase 0: Canvas Infrastructure (Task 0)
└── Multi-editor container with mode switching

Phase 1: Foundation (Tasks 1-3)
├── Project setup (TipTap + Polotno)
├── TipTap editor integration (Task 2B) ← START HERE (free, simpler)
├── Polotno store bridge (Task 2)
└── React components (Task 3)

Phase 2: Agent Integration (Tasks 4-6)
├── Canvas control tools (open_canvas, close_canvas)
├── TipTap tools (tiptap_set_content, etc.)
├── Polotno tools (polotno_add_element, etc.)
├── Frontend-backend bridge
└── Design assistant agent

Phase 3: Workflows (Tasks 7-8)
├── Design skills (/design, /create-post)
├── Document skills (/draft-email, /write-doc)
└── Template library

Phase 4: Production (Tasks 9-10)
├── Cloud Render (Polotno)
└── Testing
```

**Recommended start**: Task 0 + Task 2B (TipTap) - get documents/emails working first with the free editor, then add Polotno for design.

---

## Risks (Pre-Mortem)

### Tigers (Clear Threats):

- **Polotno pricing** (MEDIUM)
  - $399/month is significant ongoing cost
  - Mitigation: Start with Team tier ($199/mo), upgrade if needed

- **Frontend-backend latency** (MEDIUM)
  - WebSocket round-trips for each tool call may feel slow
  - Mitigation: Batch operations, optimistic UI updates

### Elephants (Unspoken Concerns):

- **MobX + Zustand state conflicts** (MEDIUM)
  - Two reactive systems may cause unexpected behavior
  - Note: Need clear ownership boundaries

- **Cloud Render costs at scale** (MEDIUM)
  - $0.004/image adds up with heavy automation
  - Note: May need client-side rendering fallback

---

## Out of Scope

- Video editing (Polotno supports it, but not for MVP)
- Custom element types (experimental feature, avoid for now)
- Multi-user collaboration (future feature)
- Offline support (requires significant additional work)
- Mobile-specific UI (desktop-first for MVP)

---

## Dependencies

### Required (Free)
- TipTap core packages (MIT license)
- Next.js 14+ frontend setup
- Claude Agent SDK integration
- WebSocket server for bridge
- Zustand for state management

### Optional (Paid)
- Polotno SDK ($199-399/mo) - for visual design mode
- TipTap Starter ($149/mo) - for AI suggestions, comments, DOCX export

### Cost Summary

| Component | Free Tier | Paid Tier |
|-----------|-----------|-----------|
| TipTap | MIT core | $149/mo (AI, comments) |
| Polotno | N/A | $199-399/mo |
| **Minimum viable** | **$0** | Documents/emails only |
| **Full featured** | **$348-548/mo** | All editors + AI |

---

## References

### TipTap
- [TipTap React Integration](https://tiptap.dev/docs/editor/getting-started/install/react)
- [TipTap Extensions](https://tiptap.dev/docs/editor/extensions/overview)
- [TipTap AI Toolkit](https://tiptap.dev/docs/content-ai/capabilities/ai-toolkit/overview)
- [TipTap Pricing](https://tiptap.dev/pricing)

### Polotno
- [Polotno SDK Documentation](https://polotno.com/docs)
- [Polotno Store API](https://polotno.com/docs/store)
- [Polotno Cloud Render API](https://polotno.com/docs/cloud-render-api)

### Orion
- [Claude Agent SDK Deep Dive](thoughts/research/claude-agent-sdk-deep-dive.md)
- [Orion UI Design](thoughts/research/orion-ui-design.md)
