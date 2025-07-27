import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Database connection string
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:password@localhost:5432/leadtrackerpro";

// For migrations and queries
const migrationClient = postgres(connectionString, { max: 1 });
const queryClient = postgres(connectionString);

// Create the database connection
export const db = drizzle(queryClient, { schema });

// Run migrations (to be used during app initialization)
export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    // Close migration client
    await migrationClient.end();
  }
}
