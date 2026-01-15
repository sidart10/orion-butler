// Database client placeholder
// Will handle connection to PostgreSQL via Tauri

export interface DatabaseClient {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

// Placeholder implementation
export function createDatabaseClient(): DatabaseClient {
  return {
    async query<T>(_sql: string, _params?: unknown[]): Promise<T[]> {
      // TODO: Implement with postgres connection
      console.log("Database query not yet implemented");
      return [];
    },
    async execute(_sql: string, _params?: unknown[]): Promise<void> {
      // TODO: Implement with postgres connection
      console.log("Database execute not yet implemented");
    },
  };
}
