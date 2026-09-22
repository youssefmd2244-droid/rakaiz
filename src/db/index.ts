import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Lazy PostgreSQL connection.
 *
 * The pool is created on the first query (not at import time) so that
 * `next build` on Vercel does not crash when DATABASE_URL is only available
 * at runtime. It is also tuned for serverless functions (small pool, short idle time).
 */

const globalForDb = globalThis as typeof globalThis & {
  __rakaizPgPool?: Pool;
};

/**
 * Connection string from the environment. `DATABASE_URL` is the main name; the other names are
 * what Vercel's Neon / Supabase / Postgres integrations create automatically.
 */
export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    undefined
  );
}

function createPool(): Pool {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. On Vercel add it in: Project → Settings → Environment Variables."
    );
  }

  const isLocal = /(@|\/\/)(localhost|127\.0\.0\.1)(:|\/|$)/.test(databaseUrl);

  // Managed Postgres providers (Neon, Supabase, Render, Railway...) all require SSL, but some of them
  // use certificates that Node does not trust by default. We therefore remove ssl-related query
  // parameters from the URL (they would override the options below) and configure SSL explicitly.
  // Set DB_SSL=disable to turn SSL off completely.
  const connectionString = databaseUrl
    .replace(/([?&])(sslmode|ssl|sslrootcert|sslcert|sslkey|uselibpqcompat|channel_binding)=[^&]*/gi, "$1")
    .replace(/[?&]+$/, "")
    .replace(/\?&/, "?")
    .replace(/&&+/g, "&");

  const useSsl = !isLocal && process.env.DB_SSL !== "disable";

  return new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    // At least 2 connections: one can be held by the setup lock while seeding uses another.
    max: Math.max(2, Number(process.env.DB_POOL_MAX || 3)),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function hasDatabase(): boolean {
  return !!getDatabaseUrl();
}

export function getPool(): Pool {
  if (!globalForDb.__rakaizPgPool) {
    globalForDb.__rakaizPgPool = createPool();
  }
  return globalForDb.__rakaizPgPool;
}

const createDb = () => drizzle(getPool());
type Database = ReturnType<typeof createDb>;

let cachedDb: Database | undefined;

export function getDb(): Database {
  if (!cachedDb) {
    cachedDb = createDb();
  }
  return cachedDb;
}

function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const real = resolve() as unknown as Record<string | symbol, unknown>;
      const value = real[prop];
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
    },
  });
}

export const pool: Pool = lazy(getPool);
export const db: Database = lazy(getDb);
