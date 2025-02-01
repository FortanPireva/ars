import 'server-only';
import { DrizzleConfig } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL environment variable");
}

// Base configuration for Drizzle
const config = {
  schema,
  casing: 'snake_case',
} satisfies DrizzleConfig<typeof schema>;

// Connection options
const connectionOptions = {
  prepare: false,
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
};

// Create admin client that bypasses RLS
const adminClient = postgres(process.env.POSTGRES_URL, connectionOptions);
export const db = drizzle(adminClient, config);

// Create RLS-protected client for regular users
const createRlsClient = (url: string) => {
  if (!url) throw new Error("Database URL is required");
  const client = postgres(url, connectionOptions);
  return drizzle(client, config);
};

// Export both admin and RLS clients
export { createRlsClient };

// For use in edge functions/middleware
export const createEdgeClient = (url: string) => {
  if (!url) throw new Error("Database URL is required");
  const client = postgres(url, { 
    ...connectionOptions,
    max: 1, // Always use single connection in edge
  });
  return drizzle(client, config);
};
