---
name: inbox-process
description: Triage inbox items - score priority, extract actions, suggest filing
version: 1.0.0
keywords: [inbox, triage, email, priority, actions]
---

# Inbox Process Skill

Process incoming items in the Orion inbox.

## What This Skill Does

1. Fetches unprocessed items from inbox
2. Spawns triage agent to analyze each item
3. Presents prioritized results to user
4. Executes user-approved actions (file, create tasks, etc.)

## Usage

```
/inbox-process              # Process all unprocessed items
/inbox-process --limit 10   # Process top 10 by received time
/inbox-process --source gmail  # Only Gmail items
/inbox-process --high-only  # Only items scoring > 0.8
```

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     INBOX PROCESS FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: FETCH
━━━━━━━━━━━━━
Query: SELECT * FROM inbox_items WHERE processed = false
       ORDER BY received_at DESC
       LIMIT {limit}

Step 2: TRIAGE (spawn triage agent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For each item:
  → Load item content
  → Load potential contact matches
  → Load active projects/areas
  → Run triage analysis
  → Store results

Step 3: PRESENT
━━━━━━━━━━━━━━━
Group by priority band:

🔴 HIGH PRIORITY (3 items)
├─ [EMAIL] John Smith: Q1 Budget Review (score: 0.85)
│  Actions: Review proposal, Reply to confirm
│  Suggested: File to projects/q1-launch/
│
├─ [SLACK] Sarah Chen: Design blocker (score: 0.82)
│  Actions: Respond with decision
│  Suggested: File to projects/q1-launch/
│
└─ [CALENDAR] Meeting invite: Board Review (score: 0.80)
   Actions: Accept/Decline
   Suggested: Link to areas/career/

🟡 MEDIUM PRIORITY (5 items)
├─ ...

🟢 LOW PRIORITY (12 items)
├─ ...

⚪ AUTO-ARCHIVE CANDIDATES (8 items)
├─ Newsletter: Tech Weekly
├─ Notification: GitHub star
└─ ...

Step 4: ACT (user-driven)
━━━━━━━━━━━━━━━━━━━━━━━━━
User chooses:
  [1] Process high priority items one-by-one
  [2] Bulk approve suggested filings
  [3] Auto-archive low priority items
  [4] Skip for now

For each approved action:
  → Execute (file, create task, archive)
  → Mark item as processed
  → Log action taken
```

## Output Format

### Summary View (default)
```
📥 INBOX TRIAGE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Processed: 28 items
  🔴 High: 3 (need attention now)
  🟡 Medium: 5 (daily review)
  🟢 Low: 12 (batch later)
  ⚪ Archive: 8 (auto-archive?)

Top actions extracted:
  1. Review Q1 budget proposal (due: tomorrow)
  2. Reply to John re: planning meeting (due: today)
  3. Decide on design direction (due: this week)

New contacts detected: 2
  → "Mike Johnson <mike@vendor.com>" (vendor?)
  → "Lisa Park <lisa@partner.co>" (partner?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Process high priority] [Bulk file] [Auto-archive low] [Details]
```

### Detail View (per item)
```
📧 EMAIL: Q1 Budget Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: John Smith (VP Engineering) ✓ Known contact
Date: 2026-01-13 09:30
Priority: 🔴 0.85 (HIGH)

Preview:
"Hi, following up on our discussion about the Q1 budget.
 Please review the attached proposal and confirm your
 attendance at Thursday's planning meeting..."

Extracted Actions:
  ☐ Review attached proposal → Task (due: Jan 15)
  ☐ Confirm meeting attendance → Reply (due: Jan 14)

Suggested Filing: projects/q1-product-launch/inbox/
Related Project: Q1 Product Launch (active, due Mar 31)

[Create Tasks] [Draft Reply] [File] [Snooze] [Archive]
```

## Integration Points

### Input Sources (via Composio)
- Gmail → New emails
- Slack → DMs and mentions
- Calendar → New invites
- Linear → Assigned issues
- Notion → Mentions and comments

### Output Destinations
- `inbox_items` table → Update processed status
- `tasks` table → Create extracted tasks
- PARA folders → File items
- `contacts` table → Create new contacts
- `archive/` → Move archived items

## Preferences Applied

| Preference | Effect |
|------------|--------|
| `triage.auto_archive_newsletters` | Skip newsletter scoring, auto-archive |
| `triage.vip_contacts` | Boost priority for listed contacts |
| `triage.focus_projects` | Boost priority for related items |
| `triage.quiet_hours` | Don't surface during these times |
| `triage.batch_threshold` | Min items before suggesting batch |

## Error Handling

| Error | Handling |
|-------|----------|
| Contact not found | Flag for review, suggest creating |
| Project unclear | Ask user to clarify or file to inbox |
| Tool disconnected | Skip that source, notify user |
| Rate limited | Queue remaining, process later |

## Metrics Tracked

- Items processed per session
- Average priority score
- Actions extracted per item
- Filing accuracy (user overrides)
- Time from receive to process

## Dependencies

- **triage agent** - Does the actual analysis
- **contact-lookup skill** - Matches senders to contacts
- **para-search skill** - Finds related projects/areas
- **task-create skill** - Creates extracted tasks
- **composio-router skill** - Fetches items from tools

## Implementation Notes

The skill orchestrates the triage agent and handles the UI presentation. The agent does the analytical work.

```
inbox-process skill (orchestration, UI)
        │
        └──► triage agent (analysis, scoring)
                │
                ├──► contact-lookup
                ├──► para-search
                └──► task-create (when approved)
```
