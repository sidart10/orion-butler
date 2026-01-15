# Contacts

**People and organizations you interact with.**

Contacts are central to the butler - every email, meeting, and task references contacts.

## Structure

```
contacts/
├── _index.yaml              # Auto-generated contact registry
├── john-smith.yaml          # Individual person
├── sarah-chen.yaml
└── acme-corp.yaml           # Organization
```

## Person Schema

```yaml
# contacts/john-smith.yaml
id: cont_johnsmith
type: person
name: John Smith
nickname: Johnny
relationship: colleague  # friend, family, colleague, vendor, client

# Contact methods
email:
  - address: john@company.com
    label: work
    primary: true
  - address: john.smith@gmail.com
    label: personal

phone:
  - number: "+1-555-1234"
    label: mobile
    primary: true

# Organization
organization:
  name: Acme Corp
  title: VP Engineering
  department: Engineering

# Social
social:
  linkedin: /in/johnsmith
  twitter: "@johnsmith"

# Communication preferences (learned over time)
preferences:
  preferred_channel: email
  response_time: "usually responds within 24h"
  timezone: America/New_York
  best_times: ["9am-12pm", "2pm-5pm"]

# Relationship notes
notes: |
  Met at TechConf 2024. Interested in AI applications.
  Has two kids, enjoys hiking.

# Tracking
last_interaction: 2026-01-10
interaction_count: 47
topics: [ai, engineering, hiking]

tags: [work, engineering, acme-corp]

created_at: 2024-06-15
updated_at: 2026-01-10
```

## Organization Schema

```yaml
# contacts/acme-corp.yaml
id: org_acmecorp
type: organization
name: Acme Corp
domain: acme.com

industry: Technology
size: large  # startup, small, medium, large, enterprise

# Key contacts at this org
contacts:
  - contact_id: cont_johnsmith
    role: primary

notes: |
  Enterprise client since 2024.
  Main contact is John Smith (VP Eng).

tags: [client, enterprise, technology]
```

## Naming Convention

- People: `firstname-lastname.yaml` (lowercase, hyphenated)
- Organizations: `company-name.yaml`

Examples:
- `john-smith.yaml`
- `sarah-chen.yaml`
- `acme-corp.yaml`

## Contact Sources

Contacts can be imported from:
- Google Contacts (via Composio)
- LinkedIn exports
- Email signatures (auto-detected)
- Manual entry

## Relationship Types

| Type | Description |
|------|-------------|
| `friend` | Personal relationship |
| `family` | Family member |
| `colleague` | Work together currently |
| `ex-colleague` | Worked together previously |
| `client` | They pay you |
| `vendor` | You pay them |
| `mentor` | Advisory relationship |
| `connection` | Professional acquaintance |

## See Also

- [contact-lookup skill](../../.claude/skills/contact-lookup/SKILL.md)
- [Database Schema](../../thoughts/research/database-schema-design.md)
