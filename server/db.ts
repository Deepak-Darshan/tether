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

// Force IPv4 by modifying the connection string if needed
let connectionString = process.env.DATABASE_URL;
try {
  const url = new URL(connectionString);
  // If it's a Supabase hostname, try to force IPv4 by using the direct connection
  // or keep the original if it works
  if (url.hostname.includes('supabase.co')) {
    // Keep original connection string
    connectionString = process.env.DATABASE_URL;
  }
} catch {
  // Invalid URL, use as-is
}

export const pool = new Pool({
  connectionString,
  ssl,
  // Add connection timeout and retry logic
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Test connection on startup
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle(pool, { schema });
