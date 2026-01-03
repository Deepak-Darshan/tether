import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enable SSL for Supabase or other hosted Postgres when requested.
// For local Postgres, leave DATABASE_SSL unset or false.
let ssl: pg.ClientConfig["ssl"] | undefined;
try {
  const url = new URL(process.env.DATABASE_URL);
  const isSupabase = /\.supabase\.co$/i.test(url.hostname);
  const wantSsl = process.env.DATABASE_SSL === "true" || isSupabase;
  if (wantSsl) {
    // Supabase requires SSL; their cert chain may not be trusted by default.
    // Using rejectUnauthorized:false is common for Supabase connections.
    ssl = { rejectUnauthorized: false } as unknown as pg.ClientConfig["ssl"]; 
  }
} catch {
  // If DATABASE_URL isn't a valid URL, skip SSL inference.
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});
export const db = drizzle(pool, { schema });
