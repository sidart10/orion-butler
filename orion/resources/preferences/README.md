# Preferences

**Your settings and learned patterns.**

Preferences control how Orion behaves. Some are set explicitly, others are learned over time.

## Structure

```
preferences/
├── communication.yaml       # Email, messaging preferences
├── scheduling.yaml          # Calendar preferences
├── triage.yaml              # Inbox processing rules
└── vendors.yaml             # Preferred services
```

## Communication Preferences

```yaml
# preferences/communication.yaml
email:
  signature: |
    Best,
    Sid
  tone: professional_friendly  # formal, casual, professional_friendly
  reply_style: concise  # verbose, concise, bullet_points

  # Per-contact overrides (learned)
  contact_overrides:
    cont_johnsmith:
      tone: direct  # Learned: user edits to be more direct with John

messaging:
  default_channel: slack
  urgent_via: sms
```

## Scheduling Preferences

```yaml
# preferences/scheduling.yaml
calendar:
  preferred_meeting_length: 30  # minutes
  buffer_between_meetings: 15

  focus_time_blocks:
    - day: [monday, wednesday, friday]
      start: "09:00"
      end: "12:00"
      label: "Deep Work"

  no_meetings_days: []  # e.g., [friday]

  timezone: America/Los_Angeles

availability:
  work_hours:
    start: "09:00"
    end: "18:00"
  lunch_block:
    start: "12:00"
    end: "13:00"
```

## Triage Preferences

```yaml
# preferences/triage.yaml
inbox:
  auto_archive_newsletters: true
  auto_archive_notifications: false

  vip_contacts:
    - cont_johnsmith  # Always high priority
    - cont_sarahchen

  focus_projects:
    - proj_q1launch   # Boost related items

  quiet_hours:
    start: "22:00"
    end: "08:00"

priority_overrides:
  # Sender domain rules
  domains:
    company.com: +0.2  # Boost work emails
    newsletter.com: -0.5  # Lower newsletters
```

## Vendor Preferences

```yaml
# preferences/vendors.yaml
travel:
  preferred_airline: united
  seat_preference: aisle
  hotel_chain: marriott

food:
  dietary_restrictions: [vegetarian]
  favorite_cuisines: [italian, japanese]

services:
  ride_share: uber
  food_delivery: doordash
```

## Learned vs. Explicit

| Type | Example | How Set |
|------|---------|---------|
| Explicit | Meeting length: 30min | User configures |
| Learned | Direct tone with John | Detected from edits |

Learned preferences have confidence scores:
```yaml
learned:
  - pattern: "Direct tone with John"
    context: "Email communication"
    confidence: 0.85  # High confidence after 5 observations
    observation_count: 5
    first_seen: 2025-12-01
    last_seen: 2026-01-10
```

## Override Hierarchy

```
User explicit setting
    ↓ (overrides)
Learned pattern (high confidence)
    ↓ (overrides)
Learned pattern (low confidence)
    ↓ (overrides)
System default
```

## See Also

- [preference-learn skill](../../.claude/skills/preference-learn/SKILL.md)
- [PARA Deep Dive](../../thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md)
