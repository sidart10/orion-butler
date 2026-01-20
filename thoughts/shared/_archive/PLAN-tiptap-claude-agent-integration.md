# Plan: TipTap Integration with Claude Agent SDK

**Created:** 2026-01-13
**Status:** Research Complete - Ready for Implementation
**Purpose:** Comprehensive guide for integrating TipTap rich text editor with Orion's Claude Agent SDK

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [TipTap Architecture Overview](#2-tiptap-architecture-overview)
3. [SDK & Package Requirements](#3-sdk--package-requirements)
4. [Programmatic Control API](#4-programmatic-control-api)
5. [Content Model & Schema](#5-content-model--schema)
6. [Interactive Features](#6-interactive-features)
7. [AI Integration Patterns](#7-ai-integration-patterns)
8. [Agent-Controlled Editor Design](#8-agent-controlled-editor-design)
9. [Implementation Plan](#9-implementation-plan)
10. [Testing Strategy](#10-testing-strategy)
11. [Production Considerations](#11-production-considerations)
12. [A2UI Integration](#12-a2ui-integration)

---

## 1. Executive Summary

### What is TipTap?

TipTap is a **headless, framework-agnostic rich text editor** built on top of ProseMirror. It provides:

- **Schema-based document validation** with transaction-based state changes
- **Extension-driven architecture** where all functionality comes from extensions
- **Programmatic control** for agent-driven content manipulation
- **React integration** via `@tiptap/react`

### Why TipTap for Orion?

| Requirement | TipTap Solution |
|------------|-----------------|
| Agent-controlled editing | Full programmatic API via Commands |
| Streaming AI content | Transaction-based updates + custom extensions |
| Rich formatting | 50+ built-in extensions |
| Framework agnostic | Same schema works web/desktop/mobile |
| Customizable | Build any UI, any toolbar, any feature |

### Current Version

- **TipTap:** v3.15.3 (latest)
- **React 18:** Fully supported
- **React 19:** In progress (use React 18 for now)

---

## 2. TipTap Architecture Overview

### Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                         TipTap Editor                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │  Extensions │   │    Schema   │   │  Commands   │      │
│   │             │   │             │   │             │      │
│   │ StarterKit  │   │ Nodes       │   │ insertContent│     │
│   │ Table       │   │ Marks       │   │ setContent   │     │
│   │ Image       │   │ Validation  │   │ toggleBold   │     │
│   │ Custom AI   │   │             │   │ Custom cmds  │     │
│   └─────────────┘   └─────────────┘   └─────────────┘      │
│          │                 │                 │               │
│          └─────────────────┼─────────────────┘               │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │   Editor State   │                       │
│                   │                  │                       │
│                   │ • Document (JSON)│                       │
│                   │ • Selection      │                       │
│                   │ • Transaction    │                       │
│                   └─────────────────┘                       │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  ProseMirror    │                       │
│                   │  (underlying)   │                       │
│                   └─────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Terminology

| Term | Definition |
|------|------------|
| **Editor** | Main TipTap instance managing state and commands |
| **Extension** | Plugin adding features (nodes, marks, commands) |
| **Node** | Block-level content (paragraph, heading, list) |
| **Mark** | Inline styling (bold, italic, link) |
| **Command** | Function to modify editor state |
| **Transaction** | Atomic state change (batched updates) |
| **Schema** | Document structure validation rules |

---

## 3. SDK & Package Requirements

### Core Packages (Required)

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

| Package | Purpose |
|---------|---------|
| `@tiptap/react` | React integration (useEditor hook, EditorContent) |
| `@tiptap/pm` | ProseMirror dependencies |
| `@tiptap/starter-kit` | Essential extensions bundle |

### Common Extensions (Recommended)

```bash
npm install @tiptap/extension-placeholder \
            @tiptap/extension-link \
            @tiptap/extension-image \
            @tiptap/extension-table \
            @tiptap/extension-code-block-lowlight \
            @tiptap/extension-mention \
            @tiptap/extension-collaboration \
            @tiptap/extension-bubble-menu \
            @tiptap/extension-floating-menu
```

| Extension | Purpose |
|-----------|---------|
| `placeholder` | Show placeholder text when empty |
| `link` | Hyperlinks with auto-detection |
| `image` | Image embedding (requires upload handler) |
| `table` | Table editing (merged cells, resize) |
| `code-block-lowlight` | Syntax highlighting |
| `mention` | @mentions with suggestions |
| `collaboration` | Real-time collaboration (Y.js) |
| `bubble-menu` | Menu on text selection |
| `floating-menu` | Menu on empty lines |

### StarterKit Contents (v3)

StarterKit includes these extensions by default:

```typescript
// Included in StarterKit
- Blockquote
- Bold
- BulletList
- Code
- CodeBlock
- Document
- Dropcursor
- Gapcursor
- HardBreak
- Heading
- History
- HorizontalRule
- Italic
- ListItem
- OrderedList
- Paragraph
- Strike
- Text
- Underline (NEW in v3)
- Link (NEW in v3)
- TrailingNode (NEW in v3)
```

**NOT included in StarterKit:**
- Table
- Image
- Mention
- Collaboration
- CodeBlockLowlight (syntax highlighting)

---

## 4. Programmatic Control API

### Basic Setup (React)

```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

function DocumentEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Initial content</p>',

    // SSR safety - CRITICAL for Next.js
    immediatelyRender: false,

    // Event handlers
    onCreate: ({ editor }) => {
      console.log('Editor ready')
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      // Save to backend
    },
    onSelectionUpdate: ({ editor }) => {
      // Update toolbar state
    },
  })

  return <EditorContent editor={editor} />
}
```

### Content Commands

```typescript
// Insert content at cursor
editor.commands.insertContent('<p>New paragraph</p>')
editor.commands.insertContent({ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] })

// Insert at specific position
editor.commands.insertContentAt(42, '<strong>Bold text</strong>')

// Replace all content
editor.commands.setContent('<h1>New Document</h1><p>Content here</p>')

// Clear content
editor.commands.clearContent()
```

### Text Formatting Commands

```typescript
// Basic formatting (toggles)
editor.commands.toggleBold()
editor.commands.toggleItalic()
editor.commands.toggleStrike()
editor.commands.toggleCode()
editor.commands.toggleUnderline()

// Headings
editor.commands.toggleHeading({ level: 1 })
editor.commands.toggleHeading({ level: 2 })

// Lists
editor.commands.toggleBulletList()
editor.commands.toggleOrderedList()

// Block elements
editor.commands.setBlockquote()
editor.commands.setCodeBlock()
editor.commands.setHorizontalRule()
```

### Selection Commands

```typescript
// Focus editor
editor.commands.focus()
editor.commands.focus('start')  // Focus at start
editor.commands.focus('end')    // Focus at end
editor.commands.focus(42)       // Focus at position

// Set selection
editor.commands.setTextSelection(42)           // Cursor at position
editor.commands.setTextSelection({ from: 10, to: 20 })  // Range

// Select all
editor.commands.selectAll()
```

### Command Chaining

```typescript
// Multiple commands in single transaction
editor.chain()
  .focus()
  .toggleBold()
  .insertContent('Bold text')
  .run()

// Check if command is possible
const canBold = editor.can().toggleBold()
```

### Get/Set State

```typescript
// Get content
const json = editor.getJSON()
const html = editor.getHTML()
const text = editor.getText()

// Get selection info
const { from, to, empty } = editor.state.selection
const selectedText = editor.state.doc.textBetween(from, to)

// Check if empty
const isEmpty = editor.isEmpty

// Check formatting at cursor
const isBold = editor.isActive('bold')
const isH1 = editor.isActive('heading', { level: 1 })
```

---

## 5. Content Model & Schema

### JSON Document Structure

```typescript
interface TipTapDocument {
  type: 'doc'
  content: TipTapNode[]
}

interface TipTapNode {
  type: string           // 'paragraph', 'heading', 'bulletList', etc.
  attrs?: Record<string, any>  // { level: 1 } for headings
  content?: TipTapNode[]       // Child nodes
  marks?: TipTapMark[]         // Inline formatting
  text?: string                // Text content (for text nodes)
}

interface TipTapMark {
  type: string           // 'bold', 'italic', 'link', etc.
  attrs?: Record<string, any>  // { href: '...' } for links
}
```

### Example Document

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Meeting Notes" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Discussed " },
        {
          "type": "text",
          "marks": [{ "type": "bold" }],
          "text": "quarterly goals"
        },
        { "type": "text", "text": " with the team." }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Revenue targets" }]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Hiring plan" }]
            }
          ]
        }
      ]
    }
  ]
}
```

### HTML Import/Export

```typescript
import { generateHTML, generateJSON } from '@tiptap/core'
// OR from '@tiptap/html' for server-side

// Convert JSON to HTML
const html = generateHTML(jsonContent, [StarterKit, ...extensions])

// Convert HTML to JSON
const json = generateJSON(htmlContent, [StarterKit, ...extensions])
```

**CRITICAL:** Use the same extensions for parsing as you do in the editor!

---

## 6. Interactive Features

### Bubble Menu (Selection Menu)

```typescript
import { BubbleMenu } from '@tiptap/react'

<BubbleMenu
  editor={editor}
  tippyOptions={{ duration: 100 }}
  shouldShow={({ editor, view, state, oldState, from, to }) => {
    // Only show for text selection (not empty)
    return !state.selection.empty
  }}
>
  <button onClick={() => editor.chain().focus().toggleBold().run()}>
    Bold
  </button>
  <button onClick={() => editor.chain().focus().toggleItalic().run()}>
    Italic
  </button>
</BubbleMenu>
```

### Floating Menu (Empty Line Menu)

```typescript
import { FloatingMenu } from '@tiptap/react'

<FloatingMenu
  editor={editor}
  tippyOptions={{ duration: 100 }}
  shouldShow={({ editor }) => {
    // Show when cursor is on empty paragraph
    return editor.isActive('paragraph') && editor.isEmpty
  }}
>
  <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
    H1
  </button>
  <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
    List
  </button>
</FloatingMenu>
```

### Slash Commands

Built using the Suggestion utility:

```typescript
import Suggestion from '@tiptap/suggestion'
import { Extension } from '@tiptap/core'

const SlashCommands = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        items: ({ query }) => {
          return [
            { title: 'Heading 1', command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
            { title: 'Bullet List', command: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
            { title: 'Code Block', command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
            // AI commands
            { title: 'AI: Expand', command: ({ editor }) => triggerAIExpand(editor) },
            { title: 'AI: Summarize', command: ({ editor }) => triggerAISummarize(editor) },
          ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
        },
        render: () => {
          // Custom dropdown renderer
          return {
            onStart: (props) => { /* show popup */ },
            onUpdate: (props) => { /* update popup */ },
            onKeyDown: (props) => { /* handle arrow keys */ },
            onExit: () => { /* hide popup */ },
          }
        },
      })
    ]
  }
})
```

### Mentions

```typescript
import Mention from '@tiptap/extension-mention'

const MentionExtension = Mention.configure({
  suggestion: {
    char: '@',
    items: async ({ query }) => {
      // Fetch contacts from Orion
      const contacts = await fetchContacts(query)
      return contacts.map(c => ({ id: c.id, label: c.name }))
    },
    render: () => ({
      // Custom mention dropdown
    }),
  },
})
```

### Drag and Drop

```typescript
// Built-in via Dropcursor extension (in StarterKit)
// For file drops, add custom handler:

import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

const FileDropHandler = Extension.create({
  name: 'fileDropHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDrop: (view, event, slice, moved) => {
            if (!moved && event.dataTransfer?.files.length) {
              const file = event.dataTransfer.files[0]
              handleFileUpload(file, view.state.selection.from)
              return true
            }
            return false
          }
        }
      })
    ]
  }
})
```

---

## 7. AI Integration Patterns

### Pattern 1: Simple Content Insertion

```typescript
async function insertAIContent(editor: Editor, prompt: string) {
  // Get context from selection or document
  const selectedText = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to
  )

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{ role: 'user', content: prompt }],
  })

  // Insert at cursor
  editor.chain()
    .focus()
    .insertContent(response.content[0].text)
    .run()
}
```

### Pattern 2: Streaming Content (Typewriter Effect)

```typescript
async function streamAIContent(editor: Editor, prompt: string) {
  const startPos = editor.state.selection.from
  let currentPos = startPos

  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const text = event.delta.text

      // Insert text at current position
      editor.chain()
        .focus(currentPos)
        .insertContent(text)
        .run()

      currentPos += text.length
    }
  }
}
```

### Pattern 3: Replace Selection with AI Content

```typescript
async function replaceWithAI(editor: Editor, instruction: string) {
  const { from, to } = editor.state.selection
  const selectedText = editor.state.doc.textBetween(from, to)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `${instruction}\n\nText to modify:\n${selectedText}`
    }],
  })

  const newContent = response.content[0].text

  // Delete selection and insert new content
  editor.chain()
    .focus()
    .deleteRange({ from, to })
    .insertContentAt(from, newContent)
    .run()
}
```

### Pattern 4: Custom AI Extension

```typescript
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiCommands: {
      insertAiContent: (content: string) => ReturnType
      replaceWithAi: (from: number, to: number, content: string) => ReturnType
      streamAiContent: (getStream: () => AsyncIterable<string>) => ReturnType
    }
  }
}

const AICommands = Extension.create({
  name: 'aiCommands',

  addCommands() {
    return {
      insertAiContent: (content: string) => ({ chain }) => {
        return chain()
          .focus()
          .insertContent(content)
          .run()
      },

      replaceWithAi: (from: number, to: number, content: string) => ({ chain }) => {
        return chain()
          .focus()
          .deleteRange({ from, to })
          .insertContentAt(from, content)
          .run()
      },

      streamAiContent: (getStream: () => AsyncIterable<string>) => ({ editor, chain }) => {
        const startPos = editor.state.selection.from
        let currentPos = startPos

        // Async execution (non-blocking)
        ;(async () => {
          for await (const chunk of getStream()) {
            editor.chain()
              .focus(currentPos)
              .insertContent(chunk)
              .run()
            currentPos += chunk.length
          }
        })()

        return true
      },
    }
  },
})
```

### TipTap AI Toolkit (Pro - Paid)

TipTap offers a commercial AI Toolkit with:

- **Schema-aware editing** - AI understands document structure
- **Tool definitions** for Vercel AI SDK, LangChain, Anthropic
- **Methods:** `streamHtml()`, `streamText()`, `applyHtmlPatch()`
- **Prevents corruption** by understanding nodes/marks

**For Orion MVP:** Build custom implementation (open source approach)

---

## 8. Agent-Controlled Editor Design

### Architecture for Claude Agent SDK

```
┌─────────────────────────────────────────────────────────────┐
│                     Orion UI (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────┐   ┌─────────────────────────────┐    │
│   │   Chat Panel    │   │       Canvas (A2UI)          │    │
│   │                 │   │                              │    │
│   │  User: "Draft   │   │  ┌─────────────────────────┐ │    │
│   │   a proposal    │   │  │   TipTap Editor         │ │    │
│   │   for Q1..."    │   │  │                         │ │    │
│   │                 │   │  │  [Generated content     │ │    │
│   │  Agent: "I'll   │   │  │   appears here with     │ │    │
│   │   draft that    │   │  │   streaming typewriter  │ │    │
│   │   now..."       │   │  │   effect]               │ │    │
│   │                 │   │  │                         │ │    │
│   └─────────────────┘   │  └─────────────────────────┘ │    │
│                          │                              │    │
│                          └─────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                 ┌─────────────────────────┐                 │
│                 │    Editor Bridge API    │                 │
│                 │                         │                 │
│                 │  • insertContent()      │                 │
│                 │  • replaceSelection()   │                 │
│                 │  • streamContent()      │                 │
│                 │  • getDocument()        │                 │
│                 │  • setDocument()        │                 │
│                 └───────────┬─────────────┘                 │
│                             │                               │
│                             ▼                               │
│                 ┌─────────────────────────┐                 │
│                 │   Claude Agent SDK      │                 │
│                 │                         │                 │
│                 │  Butler Agent with      │                 │
│                 │  document editing tools │                 │
│                 └─────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Editor Bridge API

```typescript
// lib/editor-bridge.ts

import { Editor } from '@tiptap/react'

export interface EditorBridge {
  // State
  isReady: boolean
  isEmpty: boolean

  // Get content
  getJSON: () => any
  getHTML: () => string
  getText: () => string

  // Set content
  setContent: (content: string | object) => void
  clearContent: () => void

  // Insert
  insertContent: (content: string) => void
  insertContentAt: (position: number, content: string) => void

  // Selection
  getSelection: () => { from: number; to: number; text: string }
  replaceSelection: (content: string) => void

  // AI streaming
  startStream: (position: number) => StreamHandle

  // Focus
  focus: (position?: 'start' | 'end' | number) => void
}

export interface StreamHandle {
  append: (text: string) => void
  finish: () => void
  abort: () => void
}

export function createEditorBridge(editor: Editor): EditorBridge {
  return {
    isReady: !!editor,
    isEmpty: editor?.isEmpty ?? true,

    getJSON: () => editor.getJSON(),
    getHTML: () => editor.getHTML(),
    getText: () => editor.getText(),

    setContent: (content) => {
      if (typeof content === 'string') {
        editor.commands.setContent(content)
      } else {
        editor.commands.setContent(content)
      }
    },

    clearContent: () => editor.commands.clearContent(),

    insertContent: (content) => {
      editor.chain().focus().insertContent(content).run()
    },

    insertContentAt: (position, content) => {
      editor.commands.insertContentAt(position, content)
    },

    getSelection: () => {
      const { from, to } = editor.state.selection
      return {
        from,
        to,
        text: editor.state.doc.textBetween(from, to),
      }
    },

    replaceSelection: (content) => {
      const { from, to } = editor.state.selection
      editor.chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, content)
        .run()
    },

    startStream: (position) => {
      let currentPos = position

      return {
        append: (text: string) => {
          editor.chain().focus(currentPos).insertContent(text).run()
          currentPos += text.length
        },
        finish: () => {
          editor.commands.focus('end')
        },
        abort: () => {
          // Optional: undo partial content
        },
      }
    },

    focus: (position) => {
      if (position === undefined) {
        editor.commands.focus()
      } else {
        editor.commands.focus(position)
      }
    },
  }
}
```

### Agent Tool Definition

```typescript
// For Claude Agent SDK tool definition

const documentEditorTools = {
  read_document: {
    description: 'Read the current document content',
    parameters: {
      format: {
        type: 'string',
        enum: ['text', 'html', 'json'],
        description: 'Output format',
      },
    },
    handler: async ({ format }, { editorBridge }) => {
      switch (format) {
        case 'text': return editorBridge.getText()
        case 'html': return editorBridge.getHTML()
        case 'json': return JSON.stringify(editorBridge.getJSON())
      }
    },
  },

  write_document: {
    description: 'Replace entire document with new content',
    parameters: {
      content: { type: 'string', description: 'HTML content' },
    },
    handler: async ({ content }, { editorBridge }) => {
      editorBridge.setContent(content)
      return { success: true }
    },
  },

  insert_content: {
    description: 'Insert content at cursor position',
    parameters: {
      content: { type: 'string', description: 'HTML content to insert' },
    },
    handler: async ({ content }, { editorBridge }) => {
      editorBridge.insertContent(content)
      return { success: true }
    },
  },

  replace_selection: {
    description: 'Replace selected text with new content',
    parameters: {
      content: { type: 'string', description: 'Replacement content' },
    },
    handler: async ({ content }, { editorBridge }) => {
      editorBridge.replaceSelection(content)
      return { success: true }
    },
  },

  stream_content: {
    description: 'Stream content character by character (for AI generation)',
    parameters: {
      content: { type: 'string', description: 'Content to stream' },
      speed: { type: 'number', description: 'Characters per second', default: 50 },
    },
    handler: async ({ content, speed = 50 }, { editorBridge }) => {
      const selection = editorBridge.getSelection()
      const stream = editorBridge.startStream(selection.from)

      for (const char of content) {
        stream.append(char)
        await new Promise(r => setTimeout(r, 1000 / speed))
      }

      stream.finish()
      return { success: true, length: content.length }
    },
  },
}
```

---

## 9. Implementation Plan

### Phase 1: Basic TipTap Setup

**Files to create:**

```
orion-ui/
├── components/
│   └── editor/
│       ├── DocumentEditor.tsx      # Main TipTap component
│       ├── EditorToolbar.tsx       # Formatting toolbar
│       ├── EditorBridge.ts         # Agent API bridge
│       └── extensions/
│           ├── AICommands.ts       # AI command extension
│           ├── SlashCommands.ts    # / command palette
│           └── OrionMentions.ts    # Contact mentions
├── lib/
│   └── tiptap/
│       ├── config.ts               # Extension configuration
│       └── utils.ts                # Helper functions
└── types/
    └── tiptap.d.ts                 # Type declarations
```

**Tasks:**

- [ ] Install TipTap packages
- [ ] Create basic DocumentEditor component
- [ ] Configure StarterKit + common extensions
- [ ] Add SSR safety (`immediatelyRender: false`)
- [ ] Create EditorToolbar with formatting buttons
- [ ] Test basic editing

### Phase 2: A2UI Integration

**Tasks:**

- [ ] Create A2UI `document-editor` component type
- [ ] Register in A2UI component catalog
- [ ] Add `content`, `mode`, `projectId` props
- [ ] Implement `onSave` callback
- [ ] Test agent → A2UI → TipTap flow

**A2UI Component Definition:**

```typescript
// A2UI catalog addition
{
  type: 'document-editor',
  props: {
    content: string | object,  // Initial content (HTML or JSON)
    mode: 'edit' | 'view',     // Edit mode or read-only
    projectId?: string,        // Link to PARA project
    autosave?: boolean,        // Enable auto-save
    onSave?: (content: object) => void,
  }
}
```

### Phase 3: Agent Integration

**Tasks:**

- [ ] Create EditorBridge API
- [ ] Define agent tools (read_document, write_document, etc.)
- [ ] Implement streaming for AI content
- [ ] Create AICommands extension
- [ ] Test Butler agent → Editor flow

### Phase 4: Advanced Features

**Tasks:**

- [ ] Add SlashCommands extension with AI options
- [ ] Add Mentions for Orion contacts
- [ ] Implement BubbleMenu with AI actions
- [ ] Add auto-save with PARA file sync
- [ ] Add version history (optional)

### Phase 5: Polish

**Tasks:**

- [ ] Performance optimization (debounced saves)
- [ ] Accessibility review
- [ ] Keyboard shortcuts
- [ ] Error handling
- [ ] Loading states

---

## 10. Testing Strategy

### Unit Testing Challenges

TipTap tests require extensive DOM mocking:

```typescript
// Required mocks for Jest/Vitest
beforeAll(() => {
  Range.prototype.getBoundingClientRect = jest.fn(() => ({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
    toJSON: () => {},
  }))

  Range.prototype.getClientRects = jest.fn(() => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  }))

  document.elementFromPoint = jest.fn(() => null)
})
```

### Recommended Approach

1. **Unit tests:** Test EditorBridge functions in isolation
2. **Integration tests:** Test components with mocked editor
3. **E2E tests (Playwright):** Test full editor interactions

```typescript
// E2E test example (Playwright)
test('agent can insert content into editor', async ({ page }) => {
  await page.goto('/editor')

  // Type in chat
  await page.fill('[data-testid="chat-input"]', 'Draft a proposal for Q1')
  await page.press('[data-testid="chat-input"]', 'Enter')

  // Wait for editor content
  await expect(page.locator('[data-testid="document-editor"]'))
    .toContainText('Q1 Proposal', { timeout: 30000 })
})
```

---

## 11. Production Considerations

### SSR (Server-Side Rendering)

TipTap is client-side only. For Next.js:

```typescript
// CRITICAL: Set immediatelyRender: false
const editor = useEditor({
  extensions: [StarterKit],
  immediatelyRender: false,  // Prevents hydration mismatch
  content: initialContent,
})

// For SSR content display, use Static Renderer
import { generateHTML } from '@tiptap/core'

function ServerRenderedContent({ json }) {
  const html = generateHTML(json, [StarterKit])
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

### Content Sanitization

Always sanitize server-side:

```typescript
import sanitizeHtml from 'sanitize-html'

function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote'],
    allowedAttributes: {
      'a': ['href', 'target'],
      'code': ['class'],
    },
  })
}
```

### Accessibility

- Keyboard navigation required (arrow keys, Tab)
- Alt+F10 for toolbar focus
- Avoid keyboard traps
- VoiceOver fix: Add zero-width space in empty paragraphs

```typescript
// VoiceOver accessibility fix
const Paragraph = Extension.create({
  addNodeView() {
    return () => {
      const dom = document.createElement('p')
      dom.textContent = '\u200B'  // Zero-width space
      return { dom }
    }
  }
})
```

### Performance

- **Avoid ReactNodeViewRenderer** for large documents
- **Debounce saves** (300-500ms)
- **JSON conversion is cheap** - do it on every change
- **No built-in virtualization** - consider for 1000+ paragraph docs

```typescript
// Debounced save
const editor = useEditor({
  onUpdate: useDebouncedCallback(({ editor }) => {
    saveDocument(editor.getJSON())
  }, 500),
})
```

---

## 12. A2UI Integration

### Component Registration

```typescript
// orion-ui/components/a2ui/catalog.ts

import { DocumentEditor } from '../editor/DocumentEditor'

export const a2uiCatalog = {
  // ... other components ...

  'document-editor': {
    component: DocumentEditor,
    props: {
      content: { type: 'string', required: true },
      mode: { type: 'enum', values: ['edit', 'view'], default: 'edit' },
      projectId: { type: 'string', optional: true },
      autosave: { type: 'boolean', default: true },
    },
    actions: ['save', 'clear', 'export'],
  },
}
```

### Agent Generating Document Editor

```typescript
// Butler agent generates this A2UI payload

const a2uiPayload = {
  version: '0.8',
  components: [
    {
      id: 'doc-editor-1',
      type: 'document-editor',
      content: '<h1>Q1 Product Launch Proposal</h1><p>Executive summary...</p>',
      mode: 'edit',
      projectId: 'proj_q1launch',
      autosave: true,
    },
  ],
}
```

### Action Handling

```typescript
// Handle save action from editor
function handleA2UIAction(action: string, componentId: string, data: any) {
  if (action === 'save' && componentId.startsWith('doc-editor')) {
    const { content, projectId } = data

    // Save to PARA file system
    saveToProject(projectId, content)

    // Notify agent
    sendToAgent({ type: 'document_saved', projectId, content })
  }
}
```

---

## Summary

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Editor | TipTap v3.15.3 | Headless, extensible, React support |
| Starter Kit | Yes + extensions | Covers 90% of needs |
| AI Integration | Custom extension | Open source, no licensing |
| Agent Bridge | EditorBridge API | Clean separation of concerns |
| A2UI Component | `document-editor` | Fits existing pattern |

### Critical Implementation Notes

1. **SSR:** Always use `immediatelyRender: false` for Next.js
2. **React 19:** Not fully supported yet - use React 18
3. **Events:** Never call commands inside `onUpdate` (infinite loops)
4. **Collaboration:** Disable StarterKit history when using Y.js
5. **Performance:** Use vanilla node views for large documents

### Files to Create

| File | Purpose |
|------|---------|
| `DocumentEditor.tsx` | Main TipTap component |
| `EditorToolbar.tsx` | Formatting toolbar |
| `EditorBridge.ts` | Agent API interface |
| `AICommands.ts` | AI command extension |
| `SlashCommands.ts` | / command palette |
| `catalog.ts` | A2UI registration |

### Dependencies

```json
{
  "@tiptap/react": "^3.15.3",
  "@tiptap/pm": "^3.15.3",
  "@tiptap/starter-kit": "^3.15.3",
  "@tiptap/extension-placeholder": "^3.15.3",
  "@tiptap/extension-link": "^3.15.3",
  "@tiptap/extension-image": "^3.15.3",
  "@tiptap/extension-bubble-menu": "^3.15.3",
  "@tiptap/extension-floating-menu": "^3.15.3",
  "@tiptap/extension-mention": "^3.15.3"
}
```

---

## References

- [TipTap Documentation](https://tiptap.dev/docs/editor/getting-started/overview)
- [TipTap Commands API](https://tiptap.dev/docs/editor/api/commands)
- [TipTap Custom Extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions)
- [TipTap Events](https://tiptap.dev/docs/editor/api/events)
- [TipTap GitHub](https://github.com/ueberdosis/tiptap)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Orion UI Design](thoughts/research/orion-ui-design.md)
- [Orion Design Consolidated](thoughts/research/ORION-DESIGN-CONSOLIDATED.md)
