# Resources

**Reference material for future use.**

Resources are topics of interest that may be useful someday, but you're not actively responsible for maintaining them.

## What Belongs Here

- **Contacts** - People and organizations
- **Templates** - Reusable documents, email templates
- **Preferences** - Your settings and learned patterns
- **Procedures** - How-to guides, processes
- **Reference** - Articles, notes, collected information

## What Doesn't Belong Here

- Active work (that's Projects)
- Ongoing responsibilities (that's Areas)
- Old/completed items (that's Archive)

## Structure

```
resources/
├── contacts/
│   ├── _index.yaml          # Contact registry
│   └── john-smith.yaml      # Individual contacts
├── templates/
│   ├── email-templates/
│   └── meeting-templates/
├── preferences/
│   ├── communication.yaml   # How you like to communicate
│   ├── scheduling.yaml      # Calendar preferences
│   └── vendors.yaml         # Preferred services
└── procedures/
    ├── expense-reporting.md
    └── travel-booking.md
```

## Contacts

Contacts are the backbone of the butler. Every interaction references contacts.

```yaml
# resources/contacts/john-smith.yaml
id: cont_johnsmith
type: person
name: John Smith
relationship: colleague

email:
  - address: john@company.com
    label: work
    primary: true

organization:
  name: Acme Corp
  title: VP Engineering

preferences:
  preferred_channel: email
  timezone: America/New_York

tags: [work, engineering, acme-corp]
```

## Templates

Reusable content patterns:

```
templates/
├── email-templates/
│   ├── meeting-request.md
│   ├── follow-up.md
│   └── thank-you.md
└── meeting-templates/
    ├── 1on1-agenda.md
    └── standup.md
```

## Preferences

Your settings and learned patterns:

```yaml
# resources/preferences/communication.yaml
email:
  signature: "Best, Sid"
  tone: professional_friendly
  reply_style: concise

calendar:
  preferred_meeting_length: 30
  buffer_between_meetings: 15
  focus_time_blocks:
    - day: [monday, wednesday, friday]
      start: "09:00"
      end: "12:00"
```

## See Also

- [PARA Deep Dive](../thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md)
- [Contact Schema](../thoughts/research/para-system-design.md)
