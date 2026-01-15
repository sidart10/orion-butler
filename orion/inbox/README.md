# Inbox

**Incoming items awaiting processing.**

The Inbox is the capture zone - everything comes here first before being filed to its proper PARA location.

## What Belongs Here

- New emails (synced from Gmail)
- New messages (from Slack, etc.)
- Calendar invites
- Tasks from external tools
- Manual captures ("remind me about X")

## What Doesn't Belong Here

- Already processed items (file them or archive them)
- Reference material (put directly in Resources)
- Project-specific items (put in the project folder)

## Structure

```
inbox/
├── _queue.yaml              # Processing queue with priority scores
└── items/
    ├── email_20260113_001.yaml
    ├── slack_20260113_002.yaml
    └── manual_20260113_003.yaml
```

## Inbox Item Schema

```yaml
# inbox/items/email_20260113_001.yaml
id: inbox_abc123
type: email
source_tool: gmail
source_id: msg_xxx123
source_account: work

received_at: 2026-01-13T09:30:00Z
processed: false

title: "Re: Q1 Planning Meeting"
preview: "Hi Sid, following up on our discussion about..."

from:
  name: John Smith
  email: john@company.com
  contact_id: cont_johnsmith  # Linked if recognized

# AI Analysis (populated by triage)
analysis:
  priority_score: 0.85
  needs_response: true
  suggested_response_by: 2026-01-14
  detected_actions:
    - "Confirm attendance at planning meeting"
    - "Review attached document"
  related_project: proj_q1launch
  sentiment: neutral
  urgency: medium

# Processing status
processed_at: null
action_taken: null
filed_to: null
```

## Processing Flow

```
New item arrives
      │
      ▼
  inbox/items/
      │
      ▼
  Triage Agent analyzes
      │
      ├─► HIGH priority → Surface immediately
      ├─► MEDIUM priority → Include in daily review
      ├─► LOW priority → Batch for later
      └─► MINIMAL priority → Auto-archive candidate
      │
      ▼
  User processes
      │
      ├─► File to project/area
      ├─► Create task
      ├─► Reply (via communicator)
      ├─► Delegate
      ├─► Snooze
      └─► Archive
      │
      ▼
  Mark processed, move/archive
```

## Processing Commands

- `/inbox-process` - Triage all unprocessed items
- `/inbox-process --high-only` - Only high priority
- `/inbox-process --source gmail` - Only Gmail items

## Inbox Zero Philosophy

The goal is to regularly process the inbox to zero:
- Everything gets triaged
- Actions get extracted to tasks
- Items get filed or archived
- Nothing lives in inbox permanently

## See Also

- [inbox-process skill](../.claude/skills/inbox-process/SKILL.md)
- [triage agent](../.claude/agents/triage.md)
- [PARA Deep Dive](../thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md)
