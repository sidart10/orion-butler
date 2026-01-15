# Templates

**Reusable content patterns.**

Templates help maintain consistency and save time on repetitive communications.

## Structure

```
templates/
├── email-templates/
│   ├── meeting-request.md
│   ├── follow-up.md
│   ├── thank-you.md
│   └── introduction.md
├── meeting-templates/
│   ├── 1on1-agenda.md
│   ├── standup.md
│   └── retrospective.md
└── document-templates/
    ├── project-brief.md
    └── decision-record.md
```

## Email Template Example

```markdown
<!-- templates/email-templates/meeting-request.md -->
---
name: Meeting Request
description: Request a meeting with someone
variables:
  - recipient_name
  - meeting_topic
  - suggested_times
  - duration (default: 30 minutes)
---

Subject: Meeting Request: {{meeting_topic}}

Hi {{recipient_name}},

I'd like to schedule {{duration}} to discuss {{meeting_topic}}.

Would any of these times work for you?
{{suggested_times}}

Let me know what works best, and I'll send a calendar invite.

{{signature}}
```

## Meeting Template Example

```markdown
<!-- templates/meeting-templates/1on1-agenda.md -->
---
name: 1:1 Agenda
description: Template for recurring 1:1 meetings
variables:
  - person_name
  - date
---

# 1:1 with {{person_name}} - {{date}}

## Check-in
- How are things going?
- Any blockers or concerns?

## Updates
- [Their updates]
- [My updates]

## Discussion Items
- [ ] Item 1
- [ ] Item 2

## Action Items
- [ ] [Owner] Action from last time
- [ ] [Owner] New action

## Next Meeting
- Date: [TBD]
```

## Using Templates

Templates are used by the communicator agent when drafting:

```
User: "Send a meeting request to John about the Q1 roadmap"

Butler → Communicator:
  - Template: meeting-request
  - Variables:
      recipient_name: John Smith
      meeting_topic: Q1 roadmap discussion
      suggested_times: [from scheduler]
  - Tone: [from preferences for John]
```

## Template Variables

| Variable | Source |
|----------|--------|
| `{{recipient_name}}` | Contact lookup |
| `{{signature}}` | User preferences |
| `{{suggested_times}}` | Scheduler agent |
| `{{project_name}}` | Context |
| `{{date}}` | System |

## Creating New Templates

1. Create a markdown file with YAML frontmatter
2. Define variables in the frontmatter
3. Use `{{variable}}` syntax in the body
4. Templates are auto-discovered by the communicator

## See Also

- [communicator agent](../../.claude/agents/communicator.md)
- [Preferences](../preferences/README.md)
