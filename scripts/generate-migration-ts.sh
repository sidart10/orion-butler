#!/bin/bash
# Generates a TypeScript export of the migration SQL for runtime use
# This allows us to import SQL as a string without Vite/Webpack plugins

set -e

MIGRATIONS_DIR="src/db/migrations"
TS_FILE="$MIGRATIONS_DIR/sql.ts"

# Find the latest migration file
SQL_FILE=$(ls -t "$MIGRATIONS_DIR"/*.sql 2>/dev/null | head -n 1)

if [ -z "$SQL_FILE" ]; then
  echo "Error: No SQL migration files found in $MIGRATIONS_DIR"
  exit 1
fi

echo "// Auto-generated from $SQL_FILE - do not edit manually" > "$TS_FILE"
echo "// Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$TS_FILE"
echo "" >> "$TS_FILE"
echo "export const initialSchema = \`" >> "$TS_FILE"
# Escape backticks in SQL to prevent template literal issues
sed 's/`/\\`/g' "$SQL_FILE" >> "$TS_FILE"
echo "\`;" >> "$TS_FILE"

echo "Generated $TS_FILE from $SQL_FILE"
