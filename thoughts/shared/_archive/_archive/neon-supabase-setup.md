# Orion Backend: Neon/Supabase Simple Setup

**Date:** 2026-01-13
**Status:** Recommended for MVP
**Alternative:** See `gcp-production-stack.md` for future production scale

---

## Decision: Neon + Upstash

After analysis, the simplest path for Orion MVP:

| Component | Service | Why |
|-----------|---------|-----|
| **PostgreSQL + pgvector** | Neon | 2-minute setup, free tier, serverless |
| **Redis (if needed)** | Upstash | Serverless Redis, free tier, no setup |
| **Embeddings** | Voyage AI | 1024-dim, $0.10/1M tokens |

**Total setup time:** ~10 minutes
**Monthly cost:** $0 (free tiers) → ~$20-40 when scaling

---

## Part 1: Neon Setup (PostgreSQL + pgvector)

### Step 1: Create Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" → Sign in with GitHub
3. Click "Create Project"
   - Name: `orion-butler`
   - Region: `US East (Ohio)` or closest to you
   - PostgreSQL version: `16`

### Step 2: Get Connection String

After project creation, you'll see the connection string:

```
postgresql://neondb_owner:xxxx@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Copy this! This is your `DATABASE_URL`.

### Step 3: Apply Schema

```bash
# Set the connection string
export DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Enable extensions (pgvector is pre-installed on Neon)
psql "$DATABASE_URL" << 'SQL'
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SQL

# Apply the Continuous Claude schema
psql "$DATABASE_URL" < docker/init-schema.sql

# Verify
psql "$DATABASE_URL" -c "\dt"
```

Expected output:
```
              List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | archival_memory | table | neondb_owner
 public | file_claims     | table | neondb_owner
 public | handoffs        | table | neondb_owner
 public | sessions        | table | neondb_owner
```

### Step 4: Test It

```bash
# Test insert
psql "$DATABASE_URL" << 'SQL'
INSERT INTO sessions (id, project, working_on)
VALUES ('test-session', 'orion', 'testing neon setup');
SQL

# Test query
psql "$DATABASE_URL" -c "SELECT * FROM sessions;"

# Test vector extension
psql "$DATABASE_URL" << 'SQL'
INSERT INTO archival_memory (session_id, content, embedding)
VALUES ('test', 'This is a test learning', '[0.1, 0.2, 0.3]'::vector(3));
SELECT id, session_id, content FROM archival_memory;
SQL

# Clean up test data
psql "$DATABASE_URL" << 'SQL'
DELETE FROM sessions WHERE id = 'test-session';
DELETE FROM archival_memory WHERE session_id = 'test';
SQL
```

---

## Part 2: Configure Orion to Use Neon

### Option A: Environment Variable (Recommended)

Create/update `~/.claude/.env`:

```bash
# Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
OPC_POSTGRES_URL="${DATABASE_URL}"

# Embedding provider
VOYAGE_API_KEY="your-voyage-api-key"
EMBEDDING_PROVIDER="voyage"
EMBEDDING_MODEL="voyage-3"

# Optional: Other API keys
PERPLEXITY_API_KEY="your-perplexity-key"
BRAINTRUST_API_KEY="your-braintrust-key"
```

### Option B: Project-specific .env

Create `orion/.env`:

```bash
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Verify Connection from Hooks

```bash
# Test that recall_learnings.py works with Neon
cd opc && PYTHONPATH=. uv run python scripts/core/recall_learnings.py \
  --query "test query" --k 3

# Should connect to Neon and return results (or empty if no data yet)
```

---

## Part 3: Upstash Redis (Optional)

Only set up if you need Redis for:
- Agent blackboard messaging
- Rate limiting
- Hot cache

### Step 1: Create Account

1. Go to [https://upstash.com](https://upstash.com)
2. Sign in with GitHub
3. Click "Create Database"
   - Name: `orion-cache`
   - Region: Same as Neon (e.g., `US-East-1`)
   - Type: `Regional` (free tier)

### Step 2: Get Connection Details

From the dashboard, copy:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Or for standard Redis protocol:
- `redis://default:xxxx@us1-xxxx.upstash.io:6379`

### Step 3: Add to Environment

```bash
# Add to ~/.claude/.env
REDIS_URL="redis://default:xxxx@us1-xxx.upstash.io:6379"
UPSTASH_REDIS_REST_URL="https://us1-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxx"
```

### Step 4: Test Connection

```python
# Quick test
import redis
r = redis.from_url(os.environ["REDIS_URL"])
r.set("test", "hello")
print(r.get("test"))  # b'hello'
r.delete("test")
```

---

## Part 4: Skip Redis (Simpler MVP)

For MVP, you can skip Redis entirely and use in-memory caching:

```python
# opc/scripts/core/simple_cache.py
from cachetools import TTLCache
from functools import lru_cache

# In-memory cache with 5-minute TTL
_memory_cache = TTLCache(maxsize=1000, ttl=300)

def cache_get(key: str):
    return _memory_cache.get(key)

def cache_set(key: str, value, ttl: int = 300):
    _memory_cache[key] = value

def cache_delete(key: str):
    _memory_cache.pop(key, None)
```

This works fine for:
- Single-user personal assistant
- Local development
- MVP testing

Add Redis later when you need:
- Multi-device sync
- Persistent cache across restarts
- Agent blackboard (multi-agent coordination)

---

## Part 5: Migration from Docker (opc-postgres)

### Current Docker State (as of 2026-01-13)

Container: `opc-postgres` on port 5434
Database: `continuous_claude` with user `claude`

| Table | Rows | Migrate? |
|-------|------|----------|
| `archival_memory` | 5 | ✅ Yes - your learnings |
| `handoffs` | 0 | ⏭️ Skip |
| `sessions` | 0 | ⏭️ Skip |
| `file_claims` | 0 | ⏭️ Skip |
| Others | 0 | ⏭️ Skip |

### Step-by-Step Migration

```bash
# 1. Create export directory
mkdir -p /tmp/orion-migration

# 2. Export archival_memory data (SQL format)
docker exec opc-postgres pg_dump -U claude -d continuous_claude \
  --data-only \
  --table=archival_memory \
  -f /tmp/archival_memory.sql
docker cp opc-postgres:/tmp/archival_memory.sql /tmp/orion-migration/

# 3. Also export as CSV backup
docker exec opc-postgres psql -U claude -d continuous_claude -c \
  "COPY archival_memory TO '/tmp/archival_memory.csv' WITH CSV HEADER;"
docker cp opc-postgres:/tmp/archival_memory.csv /tmp/orion-migration/

# 4. Verify export
cat /tmp/orion-migration/archival_memory.sql | head -20
```

### After Creating Neon Project

```bash
# Set Neon connection
export NEON_URL="postgresql://neondb_owner:xxxx@ep-xxx.neon.tech/neondb?sslmode=require"

# Apply schema first
psql "$NEON_URL" << 'SQL'
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SQL
psql "$NEON_URL" < docker/init-schema.sql

# Import the data
psql "$NEON_URL" < /tmp/orion-migration/archival_memory.sql

# Verify migration
psql "$NEON_URL" -c "SELECT COUNT(*) FROM archival_memory;"
# Expected: 5

psql "$NEON_URL" -c "SELECT id, session_id, LEFT(content, 50) FROM archival_memory;"
```

### Update Environment

```bash
# Edit ~/.claude/.env
# Comment out old Docker connection:
# DATABASE_URL="postgresql://claude:claude_dev@localhost:5434/continuous_claude"

# Add new Neon connection:
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx.neon.tech/neondb?sslmode=require"
OPC_POSTGRES_URL="${DATABASE_URL}"
```

### Test Recall Works

```bash
cd opc && PYTHONPATH=. uv run python scripts/core/recall_learnings.py \
  --query "health check" --k 3
# Should return your migrated learnings
```

### Cleanup (Optional)

```bash
# Keep Docker as backup for a while
docker stop opc-postgres

# Remove when confident (after 1-2 weeks)
# docker rm opc-postgres
# docker volume rm opc_postgres_data
```

---

## Part 6: Free Tier Limits

### Neon Free Tier

| Limit | Value |
|-------|-------|
| Storage | 0.5 GB |
| Compute | 191 hours/month |
| Branches | 10 |
| Projects | 1 |

**What this means:**
- ~500MB of data (plenty for personal use)
- Database auto-suspends after 5 min idle (300ms cold start)
- Can have dev/staging/prod branches

### Upstash Free Tier

| Limit | Value |
|-------|-------|
| Commands | 10,000/day |
| Storage | 256 MB |
| Connections | 1,000 concurrent |

**What this means:**
- 10K Redis commands/day (plenty for personal use)
- Enough for hot cache + rate limiting

---

## Part 7: Monitoring

### Neon Dashboard

- Query insights (slow queries)
- Storage usage
- Connection count
- Compute hours used

URL: https://console.neon.tech/app/projects/YOUR_PROJECT

### Upstash Dashboard

- Command count
- Memory usage
- Latency metrics

URL: https://console.upstash.com

---

## Comparison: Before vs After

| Aspect | Docker (Before) | Neon (After) |
|--------|-----------------|--------------|
| Setup time | 5-10 min | 2 min |
| Maintenance | You manage | Managed |
| Backups | Manual | Automatic |
| Cost | $0 (your machine) | $0 (free tier) |
| Scaling | Manual | Automatic |
| Multi-device | ❌ Local only | ✅ Anywhere |
| Cold start | None | 300ms after idle |
| Data persistence | Docker volume | Cloud |

---

## Quick Reference

### Connection Strings

```bash
# PostgreSQL (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# Redis (Upstash) - if using
REDIS_URL="redis://default:pass@us1-xxx.upstash.io:6379"
```

### Common Commands

```bash
# Connect to Neon
psql "$DATABASE_URL"

# Check table sizes
psql "$DATABASE_URL" -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"

# Check memory count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM archival_memory;"

# Test recall
cd opc && uv run python scripts/core/recall_learnings.py --query "your query"
```

---

## Next Steps

1. ✅ Create Neon account and project
2. ✅ Apply schema
3. ✅ Set DATABASE_URL in environment
4. ✅ Test connection from scripts
5. ⏭️ (Optional) Set up Upstash if Redis needed
6. ⏭️ (Optional) Migrate existing data from Docker
7. 🚀 Start building Orion features!

---

## Future: When to Move to GCP

Move to GCP when:
- Need Redis for complex agent coordination
- Need Cloud Run for background services
- Need enterprise features (HA, audit logging)
- Outgrow Neon free tier significantly

See: `thoughts/shared/plans/gcp-production-stack.md`
