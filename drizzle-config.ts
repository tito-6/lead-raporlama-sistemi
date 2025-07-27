import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg", // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://postgres:password@localhost:5432/leadtrackerpro",
  },
  tablesFilter: ["!_*"], // Use this to include/exclude specific tables
});
