# Plan: Composio SDK Deep Integration for Orion Butler

## Goal

Comprehensive research and integration strategy for Composio SDK to power Orion's tool connections, answering all questions about available tools, enabling process, white-labeling, tool selection, and database/UI design.

---

## 1. Complete Toolkit Catalog (850+ Apps)

Composio provides **850+ toolkits** with **11,000+ individual tools/actions**. Here's the comprehensive breakdown by category:

### Tier 1: Personal Productivity (Butler Core)

| Category | Apps | Key Tools Count |
|----------|------|-----------------|
| **Email** | Gmail, Outlook, Fastmail, ProtonMail | 50-80 each |
| **Calendar** | Google Calendar, Outlook Calendar, Apple Calendar | 40-60 each |
| **Messaging** | Slack, Discord, Microsoft Teams, Telegram | 30-60 each |
| **Notes/Docs** | Notion, Google Docs, Apple Notes, Obsidian | 30-50 each |
| **Cloud Storage** | Google Drive, Dropbox, OneDrive, Box | 40-60 each |
| **Tasks** | Todoist, Asana, TickTick, Things 3 | 25-40 each |

### Tier 2: Developer & Work Tools

| Category | Apps | Key Tools Count |
|----------|------|-----------------|
| **Code Repos** | GitHub, GitLab, Bitbucket | 70-100 each |
| **Issue Tracking** | Jira, Linear, Asana, ClickUp, Monday | 40-80 each |
| **CI/CD** | Vercel, Netlify, AWS, GCP, Azure | 20-50 each |
| **Monitoring** | Sentry, PagerDuty, Datadog, BetterStack | 15-30 each |

### Tier 3: Business & CRM

| Category | Apps | Key Tools Count |
|----------|------|-----------------|
| **CRM** | HubSpot, Salesforce, Pipedrive, Close | 80-150 each |
| **Accounting** | QuickBooks, Xero, Wave, FreshBooks | 30-60 each |
| **E-commerce** | Shopify, WooCommerce, Stripe | 40-80 each |
| **Marketing** | Mailchimp, SendGrid, ConvertKit | 20-40 each |

### Tier 4: Social & Media

| Category | Apps | Key Tools Count |
|----------|------|-----------------|
| **Social** | X/Twitter, LinkedIn, Instagram, TikTok, WhatsApp | 20-50 each |
| **Design** | Figma, Canva, Miro, Adobe Creative Cloud | 15-40 each |
| **Video** | YouTube, Zoom, Loom, Vimeo | 20-40 each |
| **AI/Gen** | Veo3, V0, Nano Banana, DALL-E | 5-20 each |

### Tier 5: Utilities & Infrastructure

| Category | Apps | Key Tools Count |
|----------|------|-----------------|
| **Search** | Google Search, Perplexity, Tavily, Exa | 3-10 each |
| **Scraping** | Firecrawl, Apify, Browser Tool | 10-30 each |
| **AI/LLM** | OpenAI, Anthropic, Groq | 5-15 each |
| **Data** | Airtable, Google Sheets, Postgres | 30-60 each |

### Full Category List (20+ Categories)

1. Developer Tools & DevOps
2. Collaboration & Communication
3. AI & Machine Learning
4. Document & File Management
5. Productivity & Project Management
6. CRM
7. Analytics & Data
8. Entertainment & Media
9. Education & LMS
10. Design & Creative Tools
11. Marketing & Social Media
12. Scheduling & Booking
13. E-commerce
14. Finance & Accounting
15. Sales & Customer Support
16. HR & Recruiting
17. Social Media
18. Workflow Automation
19. Data & Analytics
20. Advertising & Marketing

---

## 2. How Tool Enabling Works

### Developer Side: Enable Specific Tools

```python
from composio import Composio
from composio_langchain import ComposioToolSet, App, Action

# Initialize
composio = Composio(api_key="your_key")
toolset = ComposioToolSet()

# OPTION 1: Get ALL tools for an app (NOT recommended - too many)
tools = toolset.get_tools(apps=[App.GMAIL])  # Returns 70+ tools

# OPTION 2: Get SPECIFIC actions (RECOMMENDED)
tools = toolset.get_tools(actions=[
    Action.GMAIL_SEND_EMAIL,
    Action.GMAIL_FETCH_EMAILS,
    Action.GMAIL_CREATE_EMAIL_DRAFT,
    Action.GMAIL_SEARCH_EMAILS,
])

# OPTION 3: Search by use case (semantic)
filtered = toolset.find_actions_by_use_case(
    App.GMAIL,
    use_case="send and read emails"
)
tools = toolset.get_tools(actions=filtered)

# OPTION 4: Filter by tags
action_enums = toolset.find_actions_by_tags(
    App.GMAIL,
    tags=["messages", "drafts"]
)
tools = toolset.get_tools(actions=action_enums)
```

### User Side: Connect Their Account

```python
# Step 1: Initiate connection
connection = composio.connected_accounts.initiate(
    user_id="user@example.com",  # Your unique user identifier
    toolkit="gmail",
    redirect_url="https://yourapp.com/callback"
)

# Step 2: Redirect user to OAuth
auth_url = connection.redirect_url  # Send user here

# Step 3: User completes OAuth on provider's page

# Step 4: Check connection status
status = composio.connected_accounts.get(connection.id)
# status.status == "ACTIVE" when complete
```

### What You Need (Developer)

1. **Composio API Key** - Get from https://app.composio.dev
2. **SDK Installation** - `pip install composio composio-anthropic`
3. **Define which tools to expose** - Curate list per use case
4. **Handle OAuth callbacks** - Store connection IDs per user

### What User Needs to Do

1. **Click "Connect [App]"** in your UI
2. **Redirected to OAuth consent** (Google, Slack, etc.)
3. **Approve permissions** on provider's page
4. **Redirected back** to your app
5. **Connection stored** - Ready to use

---

## 3. Tool Selection Strategy: Don't Enable Everything

### The Problem

Gmail has 70+ tools. If you enable all:
- LLM context bloats (each tool = ~500 tokens in schema)
- Response time increases
- Accuracy decreases (too many options)
- Costs increase

### The Solution: Curated Tool Sets

```python
# WRONG: Enable everything
tools = toolset.get_tools(apps=[App.GMAIL])  # 70+ tools, 35K tokens

# RIGHT: Curate by use case
BUTLER_GMAIL_TOOLS = [
    Action.GMAIL_FETCH_EMAILS,       # Read inbox
    Action.GMAIL_SEND_EMAIL,         # Send new
    Action.GMAIL_CREATE_EMAIL_DRAFT, # Draft for review
    Action.GMAIL_SEARCH_EMAILS,      # Find specific emails
    Action.GMAIL_LIST_LABELS,        # Organize
    Action.GMAIL_BATCH_MODIFY_MESSAGES,  # Archive/label bulk
]  # 6 tools, ~3K tokens
```

### Composio Best Practice

> **Keep under 20 actions per agent** for optimal LLM performance.

### Tool Selection UI Pattern

Give users control while maintaining constraints:

```
┌────────────────────────────────────────────────────────┐
│ Gmail Tools                                    [✓] ON  │
├────────────────────────────────────────────────────────┤
│ ☑ Read emails          ☑ Send emails                   │
│ ☑ Search emails        ☑ Create drafts                 │
│ ☐ Delete emails        ☐ Manage labels                 │
│ ☐ Access attachments   ☐ Manage threads                │
├────────────────────────────────────────────────────────┤
│ ⚡ 4 tools enabled (recommended: 3-6 per app)         │
└────────────────────────────────────────────────────────┘
```

### Recommended Tool Sets by Category

**Email (Gmail/Outlook) - 6 tools:**
- FETCH_EMAILS, SEND_EMAIL, CREATE_DRAFT
- SEARCH_EMAILS, LIST_LABELS, BATCH_MODIFY

**Calendar - 5 tools:**
- CREATE_EVENT, LIST_EVENTS, UPDATE_EVENT
- FREE_BUSY_QUERY, DELETE_EVENT

**Slack - 5 tools:**
- SEND_MESSAGE, FETCH_HISTORY, SEARCH_MESSAGES
- LIST_CHANNELS, LIST_USERS

**GitHub - 5 tools:**
- CREATE_ISSUE, LIST_ISSUES, CREATE_PR
- LIST_REPOS, SEARCH_CODE

**Notion - 4 tools:**
- CREATE_PAGE, SEARCH, QUERY_DATABASE, UPDATE_PAGE

---

## 4. White-Label OAuth Setup

### Level 1: Basic Customization (Free)

Customize the Composio-hosted auth screen:

1. Go to Project Settings → Auth Screen
2. Upload your logo
3. Set brand colors
4. Set custom button text

**Result:** Users see your branding, but URL is still `composio.dev`

### Level 2: Custom Auth Configs (Full White-Label)

Use YOUR OAuth apps so users see YOUR app name in consent:

**Step 1: Create OAuth App at Provider**

For Google:
1. Create GCP Project
2. Enable APIs (Gmail, Calendar, Drive, etc.)
3. Configure OAuth Consent Screen with YOUR app name
4. Create OAuth Client credentials
5. Set redirect URI: `https://backend.composio.dev/api/v1/auth-apps/add`

**Step 2: Register in Composio**

```python
# Via SDK
auth_config = composio.auth_configs.create(
    toolkit="gmail",
    auth_scheme="oauth2",
    credentials={
        "client_id": "YOUR_GOOGLE_CLIENT_ID",
        "client_secret": "YOUR_GOOGLE_CLIENT_SECRET"
    }
)

# Or via Dashboard:
# Authentication → Create Auth Config → Enter your credentials
```

**Step 3: Use Custom Config for Connections**

```python
connection = composio.connected_accounts.initiate(
    user_id="user@example.com",
    toolkit="gmail",
    auth_config_id=auth_config.id,  # Use YOUR OAuth app
    redirect_url="https://yourapp.com/callback"
)
```

**Result:** User sees "Orion Butler wants to access your Gmail" instead of "Composio wants to..."

### Level 3: Custom Redirect Domain

Hide `composio.dev` from OAuth flow:

```python
# Set custom redirect domain in project settings
# Users see: yourapp.com/oauth/callback
# Instead of: composio.dev/callback
```

### Level 4: Enterprise Self-Hosting

Complete control:
- Deploy Composio on your infrastructure
- All OAuth through your domain
- Full data sovereignty
- Custom rate limits

### White-Label Setup Checklist

| App | OAuth Console | Scopes Needed |
|-----|---------------|---------------|
| Gmail | [console.cloud.google.com](https://console.cloud.google.com) | gmail.readonly, gmail.send, gmail.modify |
| Google Calendar | [console.cloud.google.com](https://console.cloud.google.com) | calendar.readonly, calendar.events |
| Slack | [api.slack.com/apps](https://api.slack.com/apps) | channels:read, chat:write, users:read |
| GitHub | [github.com/settings/developers](https://github.com/settings/developers) | repo, user |
| Notion | [notion.so/my-integrations](https://notion.so/my-integrations) | Internal integration |

---

## 5. Database Schema for Tool Management

### Extended tool_connections Table

```sql
-- Tool connections (in your existing schema)
CREATE TABLE IF NOT EXISTS tool_connections (
    id TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL,              -- 'gmail', 'slack'
    account_alias TEXT NOT NULL,          -- 'work', 'personal'
    connection_type TEXT NOT NULL,        -- 'composio', 'api_key', 'mcp'

    -- Composio-specific
    composio_connection_id TEXT,          -- Composio's connection ID
    composio_entity_id TEXT,              -- User's entity ID
    composio_auth_config_id TEXT,         -- Custom OAuth config (for white-label)

    -- Status
    status TEXT DEFAULT 'active',         -- active, expired, revoked, error
    last_error TEXT,
    error_code TEXT,

    -- Tool configuration (NEW)
    enabled_tools TEXT,                   -- JSON array of enabled tool slugs
    tool_preferences TEXT,                -- JSON: {"default_label": "work", etc}

    -- OAuth metadata
    scopes TEXT,                          -- JSON array of granted scopes
    expires_at TEXT,
    last_refreshed_at TEXT,
    last_used_at TEXT,

    -- Account info
    account_email TEXT,
    account_name TEXT,
    account_avatar_url TEXT,

    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(tool_name, account_alias)
);
```

### New: Tool Catalog Table

```sql
-- Cache of available tools (refresh periodically from Composio)
CREATE TABLE IF NOT EXISTS tool_catalog (
    id TEXT PRIMARY KEY,
    toolkit_name TEXT NOT NULL,           -- 'gmail', 'slack'
    tool_slug TEXT NOT NULL,              -- 'GMAIL_SEND_EMAIL'
    tool_name TEXT NOT NULL,              -- 'Send Email'
    description TEXT,
    category TEXT,                        -- 'messages', 'drafts'

    -- Schema (for UI generation)
    input_schema TEXT,                    -- JSON schema
    output_schema TEXT,

    -- Classification
    is_read_only INTEGER DEFAULT 0,
    is_destructive INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0,         -- Premium tools cost 3x
    requires_scopes TEXT,                 -- JSON array

    -- Recommendations
    is_recommended INTEGER DEFAULT 0,     -- For butler defaults
    default_enabled INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,

    metadata TEXT,
    last_synced_at TEXT DEFAULT (datetime('now')),

    UNIQUE(toolkit_name, tool_slug)
);

-- Index for fast lookup
CREATE INDEX idx_tool_catalog_toolkit ON tool_catalog(toolkit_name);
CREATE INDEX idx_tool_catalog_recommended ON tool_catalog(is_recommended);
```

### New: User Tool Preferences Table

```sql
-- Per-user tool enablement preferences
CREATE TABLE IF NOT EXISTS user_tool_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,                -- Or just 'default' for single-user
    toolkit_name TEXT NOT NULL,
    tool_slug TEXT NOT NULL,

    -- Preference
    is_enabled INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,           -- For ordering in UI

    -- Customization
    custom_description TEXT,              -- User's note about this tool
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    UNIQUE(user_id, toolkit_name, tool_slug)
);
```

---

## 6. UI Design Patterns for Tool Configuration

### Pattern 1: Connection Setup Flow

```
┌────────────────────────────────────────────────────────┐
│ Connect Your Apps                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Gmail   │  │  Slack   │  │ Calendar │            │
│  │    📧    │  │    💬    │  │    📅    │            │
│  │ Connected│  │ Connect  │  │ Connected│            │
│  │    ✓     │  │    →     │  │    ✓     │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  GitHub  │  │  Notion  │  │  Linear  │            │
│  │    🐙    │  │    📝    │  │    📊    │            │
│  │ Connect  │  │ Connect  │  │ Connect  │            │
│  │    →     │  │    →     │  │    →     │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Pattern 2: Tool Selection Within App

```
┌────────────────────────────────────────────────────────┐
│ Gmail Configuration                     [Disconnect]   │
├────────────────────────────────────────────────────────┤
│ Connected as: sid@example.com                          │
│ Status: ✓ Active                                       │
├────────────────────────────────────────────────────────┤
│ Enabled Capabilities (4 of 46)                         │
│                                                        │
│ ◉ Read & Search                                        │
│   ├ ☑ Fetch emails                                     │
│   ├ ☑ Search emails                                    │
│   └ ☐ Get email threads                                │
│                                                        │
│ ◉ Send & Draft                                         │
│   ├ ☑ Send email                                       │
│   ├ ☑ Create draft                                     │
│   └ ☐ Send draft                                       │
│                                                        │
│ ○ Organization (collapsed)                             │
│ ○ Attachments (collapsed)                              │
│ ○ Labels (collapsed)                                   │
├────────────────────────────────────────────────────────┤
│ ⚡ Performance: Excellent (4 tools)                    │
│    Recommended: 3-6 tools per app                      │
└────────────────────────────────────────────────────────┘
```

### Pattern 3: Quick Presets

```
┌────────────────────────────────────────────────────────┐
│ Gmail Quick Setup                                      │
├────────────────────────────────────────────────────────┤
│ Choose a preset or customize:                          │
│                                                        │
│ ○ Basic (Recommended)                                  │
│   Read, search, and send emails                        │
│   4 tools • Best for personal assistant               │
│                                                        │
│ ○ Full Access                                          │
│   All email capabilities including labels & threads   │
│   12 tools • Higher token usage                       │
│                                                        │
│ ○ Read Only                                            │
│   Only read and search, no sending                    │
│   2 tools • Safest option                             │
│                                                        │
│ ○ Custom                                               │
│   Choose exactly which capabilities to enable          │
│                                                        │
│                              [Continue with Basic →]   │
└────────────────────────────────────────────────────────┘
```

### Pattern 4: Multi-Account Management

```
┌────────────────────────────────────────────────────────┐
│ Your Gmail Accounts                                    │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📧 Work Gmail                              Primary │ │
│ │    sid.dani@company.com                           │ │
│ │    4 tools enabled • Last used: 2 hours ago      │ │
│ │    [Configure] [Disconnect]                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📧 Personal Gmail                                  │ │
│ │    sid.personal@gmail.com                         │ │
│ │    4 tools enabled • Last used: 1 day ago        │ │
│ │    [Configure] [Set as Primary] [Disconnect]      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│                      [+ Add Another Gmail Account]     │
└────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic tool connections working

Tasks:
- [ ] Add Composio MCP server to config
- [ ] Set up Composio API key in environment
- [ ] Create `tool-connect` skill for OAuth flows
- [ ] Connect Gmail (work account)
- [ ] Connect Google Calendar
- [ ] Test basic tool execution

**Database:**
- [ ] Create `tool_connections` table
- [ ] Create `tool_catalog` table
- [ ] Seed catalog with P0 tools

### Phase 2: Multi-Account (Week 3-4)

**Goal:** Support multiple accounts per app

Tasks:
- [ ] Implement account alias system
- [ ] Connect Gmail (personal)
- [ ] Connect Slack (multiple workspaces)
- [ ] Build account selection logic
- [ ] Create `tool-status` skill

**UI:**
- [ ] Settings → Connected Apps page
- [ ] Account connection flow
- [ ] Account switcher in toolbar

### Phase 3: Tool Selection (Week 5-6)

**Goal:** User-configurable tool access

Tasks:
- [ ] Build tool preset system
- [ ] Implement per-app tool selection UI
- [ ] Create tool recommendation engine
- [ ] Build `enabled_tools` filtering in router

**UI:**
- [ ] Tool configuration modal
- [ ] Preset selection cards
- [ ] Tool usage analytics

### Phase 4: White-Label (Week 7-8)

**Goal:** Custom OAuth for production

Tasks:
- [ ] Create Google OAuth app
- [ ] Create Slack OAuth app
- [ ] Create GitHub OAuth app
- [ ] Register custom auth configs in Composio
- [ ] Test white-labeled OAuth flows

**Result:** "Orion Butler" appears in all OAuth consents

### Phase 5: Polish (Week 9+)

**Goal:** Production-ready

Tasks:
- [ ] Error handling for expired tokens
- [ ] Automatic token refresh
- [ ] Connection health monitoring
- [ ] Usage analytics dashboard
- [ ] Rate limit handling

---

## 8. Pricing Considerations

### Composio Pricing (as of Jan 2025)

| Plan | Price | Tool Calls/Month | Rate Limit |
|------|-------|------------------|------------|
| **Free** | $0 | 20,000 | 100/min |
| **Ridiculously Cheap** | $29/mo | 200,000 | 5,000/min |
| **Serious Business** | $229/mo | 2,000,000 | 5,000/min |
| **Enterprise** | Custom | Custom | Custom |

### Cost Optimization

1. **Cache tool schemas** - Don't fetch on every request
2. **Batch operations** - Use RUBE_MULTI_EXECUTE for parallel calls
3. **Limit tool count** - Fewer tools = smaller prompts = fewer tokens
4. **Premium tools** - Search/scraping cost 3x, use sparingly

### Expected Usage (Single User Butler)

| Activity | Calls/Day | Calls/Month |
|----------|-----------|-------------|
| Inbox triage (Gmail) | 50-100 | 1,500-3,000 |
| Calendar checks | 20-30 | 600-900 |
| Slack messages | 30-50 | 900-1,500 |
| Task management | 10-20 | 300-600 |
| **Total** | **110-200** | **3,300-6,000** |

**Recommendation:** Start with Free tier (20K/month), upgrade to $29 plan if usage grows.

---

## 9. Key Decisions Summary

| Question | Answer |
|----------|--------|
| How many tools total? | 850+ apps, 11,000+ individual tools |
| Enable all tools per app? | **NO** - Curate to 3-6 per app |
| How to enable tools? | SDK: `get_tools(actions=[...])` |
| How do users connect? | OAuth redirect via `initiate()` |
| White-label possible? | Yes - Custom Auth Configs |
| What user provides? | Nothing but OAuth consent click |
| What you provide | Composio API key, OAuth app credentials |
| Database design | Extended `tool_connections` + `tool_catalog` |
| UI pattern | Connection cards + Tool selection modal |
| Pricing for MVP | Free tier ($0) sufficient |

---

---

## 10. GitHub Deep Dive: SDK API Reference

### Key SDK Classes (from source code)

**Main Entry Point: `Composio`**

```python
from composio import Composio

composio = Composio(
    api_key="your_key",           # Or COMPOSIO_API_KEY env var
    environment="production",      # or "staging"
    base_url=None,                # Custom API URL
    timeout=None,                 # Request timeout
    max_retries=3,                # Retry count
    allow_tracking=True,          # Usage analytics
    toolkit_versions="latest",    # Or specific version
)

# Available namespaces:
composio.tools          # Tool operations
composio.toolkits       # Toolkit discovery
composio.auth_configs   # OAuth app management
composio.connected_accounts  # User connections
composio.triggers       # Event triggers/webhooks
composio.mcp           # MCP server integration
composio.experimental.tool_router  # RUBE-style routing
```

### Tools API

```python
# Get tools by toolkit (returns Tool objects with full schemas)
tools = composio.tools.get(
    user_id="user123",
    toolkits=["GITHUB", "GMAIL"],      # Multiple toolkits
    search="send email",               # Semantic search
    scopes=["read", "write"],          # Filter by scope
    limit=20,                          # Max results
)

# Execute a tool directly
response = composio.tools.execute(
    user_id="user123",
    slug="GMAIL_SEND_EMAIL",
    arguments={
        "to": "recipient@example.com",
        "subject": "Hello",
        "body": "Message body"
    },
    version="20251023_00",  # Optional version pinning
)

# Proxy API call (direct API access through Composio)
proxy_response = composio.tools.proxy(
    endpoint="/repos/owner/repo/issues/1",
    method="GET",
    connected_account_id="ac_1234",
    parameters=[
        {"name": "Accept", "value": "application/json", "type": "header"}
    ]
)
```

### Auth Configs API (White-Label)

```python
# List all auth configs
configs = composio.auth_configs.list()

# Create with Composio managed auth (quick start)
config = composio.auth_configs.create(
    toolkit="github",
    options={
        "type": "use_composio_managed_auth",
    }
)

# Create with custom OAuth (white-label)
config = composio.auth_configs.create(
    toolkit="gmail",
    options={
        "name": "My Gmail Auth",
        "type": "use_custom_auth",
        "auth_scheme": "OAUTH2",
        "credentials": {
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET",
            "oauth_redirect_uri": "https://backend.composio.dev/api/v3/toolkits/auth/callback"
        }
    }
)

# Update auth config with tool restrictions
composio.auth_configs.update(
    config.id,
    options={
        "type": "custom",
        "credentials": {"client_id": "...", "client_secret": "..."},
        "tool_access_config": {
            "tools_for_connected_account_creation": ["GMAIL_SEND_EMAIL", "GMAIL_FETCH_EMAILS"]
        }
    }
)

# Enable/disable/delete
composio.auth_configs.enable(config.id)
composio.auth_configs.disable(config.id)
composio.auth_configs.delete(config.id)
```

### Connected Accounts API

```python
from composio.types import auth_scheme

# OAuth connection flow
connection_request = composio.connected_accounts.initiate(
    user_id="user123",
    auth_config_id="ac_xyz",
    config={"auth_scheme": "OAUTH2"},
    callback_url="https://yourapp.com/callback"
)
print(connection_request.redirect_url)  # Send user here

# Wait for OAuth to complete
connected_account = connection_request.wait_for_connection(timeout=60)

# API Key connection (no redirect needed)
connection = composio.connected_accounts.initiate(
    user_id="user123",
    auth_config_id="ac_xyz",
    config=auth_scheme.api_key(
        options={"api_key": "user_api_key_here"}
    )
)

# Other auth schemes
auth_scheme.oauth1(options={...})
auth_scheme.oauth2(options={...})
auth_scheme.basic(options={"username": "...", "password": "..."})
auth_scheme.composio_link(options={...})  # Composio hosted

# List/manage connections
connections = composio.connected_accounts.list()
connection = composio.connected_accounts.get(nanoid="conn_id")
composio.connected_accounts.enable(nanoid)
composio.connected_accounts.disable(nanoid)
composio.connected_accounts.delete(nanoid)
```

### Triggers API (Event-Driven)

```python
# Create trigger for new GitHub commits
trigger = composio.triggers.create(
    slug="GITHUB_COMMIT_EVENT",
    user_id="user123",  # Or connected_account_id
    trigger_config={
        "repo": "my-repo",
        "owner": "my-org"
    }
)

# Subscribe to trigger events
subscription = composio.triggers.subscribe()

@subscription.handle(toolkit="GITHUB")
def handle_github_event(data):
    print("New commit:", data)

@subscription.handle(toolkit="SLACK")
def handle_slack_event(data):
    print("New message:", data)

subscription.wait_forever()

# Manage triggers
composio.triggers.enable(trigger_id="...")
composio.triggers.disable(trigger_id="...")
composio.triggers.delete(trigger_id="...")
```

### Modifiers (Pre/Post Processing)

```python
from composio import before_execute, after_execute, schema_modifier

# Modify inputs before tool execution
@before_execute(tools=["GMAIL_SEND_EMAIL"])
def inject_signature(tool, toolkit, params):
    params["arguments"]["body"] += "\n\n--\nSent via Orion Butler"
    return params

# Modify outputs after tool execution
@after_execute(tools=["GMAIL_FETCH_EMAILS"])
def summarize_emails(tool, toolkit, response):
    # Reduce token usage by summarizing
    return {
        **response,
        "data": {"count": len(response["data"]), "preview": response["data"][:3]}
    }

# Modify tool schema shown to LLM
@schema_modifier(tools=["NOTION_CREATE_PAGE"])
def simplify_schema(tool, toolkit, schema):
    # Hide complex fields from LLM
    schema.input_schema.pop("advanced_options", None)
    return schema

# Apply modifiers
response = composio.tools.execute(
    user_id="user123",
    slug="GMAIL_SEND_EMAIL",
    arguments={...},
    modifiers=[inject_signature, summarize_emails]
)

tools = composio.tools.get(
    user_id="user123",
    toolkits=["NOTION"],
    modifiers=[simplify_schema]
)
```

### User ID Best Practices (from docs)

```python
# WRONG: Using 'default' in production
tools = composio.tools.get(user_id="default", ...)  # NEVER in production!

# RIGHT: Use unique user identifiers

# Pattern 1: Individual users (B2C)
user_id = user.database_id  # e.g., "550e8400-e29b-41d4-a716-446655440000"

# Pattern 2: Organization-shared (B2B)
user_id = organization.id   # All team members share connections

# Pattern 3: Multiple accounts per user
# Each connection gets unique ID, select with connected_account_id
response = composio.tools.execute(
    user_id="user123",
    slug="GMAIL_SEND_EMAIL",
    connected_account_id="work_gmail_id",  # Specific account
    arguments={...}
)
```

### Redirect URI Configuration

```
# Standard Composio callback (used in auth config)
https://backend.composio.dev/api/v3/toolkits/auth/callback

# For white-label, configure YOUR domain in OAuth provider:
https://yourapp.com/api/composio-redirect

# Then redirect to Composio:
@app.get("/api/composio-redirect")
def composio_redirect(request):
    composio_callback = "https://backend.composio.dev/api/v3/toolkits/auth/callback"
    return redirect(f"{composio_callback}?{request.query_string}")
```

---

## 11. Key Code Patterns from GitHub

### Pattern: Tool Selection at Runtime

```python
# Butler tool selection based on task
def get_tools_for_task(task_type: str, user_id: str):
    tool_sets = {
        "email_triage": ["GMAIL_FETCH_EMAILS", "GMAIL_SEARCH_EMAILS"],
        "email_reply": ["GMAIL_SEND_EMAIL", "GMAIL_CREATE_EMAIL_DRAFT"],
        "calendar": ["GOOGLECALENDAR_LIST_EVENTS", "GOOGLECALENDAR_CREATE_EVENT"],
        "research": ["COMPOSIO_SEARCH_WEB", "PERPLEXITY_SEARCH"],
    }

    tools = composio.tools.get(
        user_id=user_id,
        tools=tool_sets.get(task_type, [])
    )
    return tools
```

### Pattern: Multi-Account Selection

```python
def select_account(user_id: str, toolkit: str, context: dict):
    """Select appropriate account based on context."""
    connections = composio.connected_accounts.list(
        user_id=user_id,
        toolkit=toolkit
    )

    # Logic: work email for work domains, personal otherwise
    if toolkit == "gmail":
        recipient = context.get("recipient", "")
        if "@company.com" in recipient:
            return next(c for c in connections if "work" in c.account_email)
        return next(c for c in connections if "work" not in c.account_email)

    # Default: most recently connected
    return connections[0] if connections else None
```

### Pattern: Error Handling

```python
from composio import exceptions

try:
    result = composio.tools.execute(
        user_id="user123",
        slug="GMAIL_SEND_EMAIL",
        arguments={...}
    )
except exceptions.ApiKeyNotProvidedError:
    # Missing COMPOSIO_API_KEY
    raise ConfigError("Composio API key not set")
except exceptions.ComposioSDKTimeoutError:
    # OAuth wait timeout
    raise UserError("Connection timed out - please try again")
except exceptions.NotFoundError:
    # Tool or connection not found
    raise NotFoundError("Tool not available")
except exceptions.InvalidParams as e:
    # Bad arguments
    raise ValidationError(f"Invalid parameters: {e}")
```

---

## Sources

- [Composio GitHub](https://github.com/ComposioHQ/composio) - SDK source code
- [Python SDK: sdk.py](https://github.com/ComposioHQ/composio/blob/master/python/composio/sdk.py)
- [Python SDK: tools.py](https://github.com/ComposioHQ/composio/blob/master/python/composio/core/models/tools.py)
- [Python SDK: auth_configs.py](https://github.com/ComposioHQ/composio/blob/master/python/composio/core/models/auth_configs.py)
- [Python SDK: connected_accounts.py](https://github.com/ComposioHQ/composio/blob/master/python/composio/core/models/connected_accounts.py)
- [Examples: auth_configs.py](https://github.com/ComposioHQ/composio/blob/master/python/examples/auth_configs.py)
- [Examples: tools.py](https://github.com/ComposioHQ/composio/blob/master/python/examples/tools.py)
- [Examples: modifiers.py](https://github.com/ComposioHQ/composio/blob/master/python/examples/modifiers.py)
- [Examples: triggers.py](https://github.com/ComposioHQ/composio/blob/master/python/examples/triggers.py)
- [Docs: custom-auth-configs.mdx](https://github.com/ComposioHQ/composio/blob/master/fern/pages/src/authentication/custom-auth-configs.mdx)
- [Docs: user-management.mdx](https://github.com/ComposioHQ/composio/blob/master/fern/pages/src/authentication/user-management.mdx)
- [Docs: authenticating-tools.mdx](https://github.com/ComposioHQ/composio/blob/master/fern/pages/src/tools-and-triggers/authenticating-tools.mdx)
- [Composio Documentation](https://docs.composio.dev/)
- [Composio Toolkits Browser](https://composio.dev/toolkits)
- [Composio Pricing](https://composio.dev/pricing)
