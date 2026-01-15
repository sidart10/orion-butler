# Areas

**Ongoing responsibilities with standards to maintain.**

An Area is a sphere of activity with a standard to be maintained over time. Unlike Projects, Areas don't have an end date.

## What Belongs Here

- Health & Wellness (exercise, diet, mental health)
- Finance (budgeting, investments, taxes)
- Career (professional development, work responsibilities)
- Relationships (family, friends, professional network)
- Home (maintenance, organization)
- Any other ongoing life domain

## What Doesn't Belong Here

- Time-bound work with deadlines (those are Projects)
- Reference material (that's Resources)
- Completed items (those go to Archive)

## The Relationship Between Areas and Projects

**Areas spawn Projects.** For example:
- Area: Health → Project: "Complete 5K training by March 15"
- Area: Finance → Project: "File 2025 taxes by April 15"
- Area: Career → Project: "Q1 Product Launch by March 31"

## Structure

```
areas/
├── _index.yaml              # Auto-generated area registry
├── health/
│   ├── meta.yaml            # Area metadata
│   ├── metrics/             # Tracked data over time
│   └── routines.yaml        # Regular practices
├── finance/
│   ├── meta.yaml
│   ├── accounts.yaml        # Account overview
│   └── budgets/
└── career/
    └── ...
```

## Naming Convention

Simple, lowercase, descriptive slugs:
- `health/`
- `finance/`
- `career/`
- `relationships/`
- `home/`

## Area Metadata

```yaml
# areas/health/meta.yaml
id: area_health
name: Health & Wellness
description: Physical and mental health maintenance
status: active  # active, dormant

responsibilities:
  - "Regular exercise (3x/week)"
  - "Annual checkups"
  - "Mental health maintenance"

goals:
  - metric: "exercise_sessions_per_week"
    target: 3
  - metric: "sleep_hours_avg"
    target: 7.5

review: weekly  # daily, weekly, monthly
```

## Review Cadence

Areas should be reviewed regularly:
- **Daily**: What needs attention today?
- **Weekly**: Am I maintaining my standards?
- **Monthly**: Are my goals still relevant?

## See Also

- [PARA Deep Dive](../thoughts/research/PARA-DEEP-DIVE-SYNTHESIS.md)
- [Projects README](../projects/README.md)
