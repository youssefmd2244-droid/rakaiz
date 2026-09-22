import { getPool } from "./index";

/**
 * Creates every table if it does not exist yet, so the site works on a brand-new
 * (empty) PostgreSQL database with no manual migration step.
 * Mirrors ./schema.ts exactly. Safe to run many times.
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  category_ar text NOT NULL,
  category_en text NOT NULL,
  category_key text NOT NULL DEFAULT 'commercial',
  short_desc_ar text NOT NULL,
  short_desc_en text NOT NULL,
  full_desc_ar text NOT NULL,
  full_desc_en text NOT NULL,
  location_ar text NOT NULL,
  location_en text NOT NULL,
  client_ar text NOT NULL,
  client_en text NOT NULL,
  scope_ar text NOT NULL,
  scope_en text NOT NULL,
  area text NOT NULL,
  year text NOT NULL,
  status_ar text NOT NULL DEFAULT 'مكتمل',
  status_en text NOT NULL DEFAULT 'Completed',
  hero_image text NOT NULL,
  gallery jsonb DEFAULT '[]'::jsonb,
  key_facts jsonb DEFAULT '[]'::jsonb,
  featured boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  category_ar text NOT NULL DEFAULT 'خدمات المقاولات',
  category_en text NOT NULL DEFAULT 'Contracting Services',
  short_desc_ar text NOT NULL,
  short_desc_en text NOT NULL,
  full_desc_ar text NOT NULL,
  full_desc_en text NOT NULL,
  features_ar jsonb DEFAULT '[]'::jsonb,
  features_en jsonb DEFAULT '[]'::jsonb,
  icon text NOT NULL DEFAULT 'Building2',
  image text NOT NULL DEFAULT '/images/about-facade-geometric.jpg',
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
  id serial PRIMARY KEY,
  year text NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  desc_ar text NOT NULL,
  desc_en text NOT NULL,
  highlight_ar text,
  highlight_en text,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS partners (
  id serial PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  category_ar text,
  category_en text,
  logo_url text NOT NULL,
  website_url text,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS certificates (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  authority_ar text NOT NULL,
  authority_en text NOT NULL,
  doc_number text NOT NULL,
  issue_date text NOT NULL,
  expiry_date text NOT NULL,
  is_hijri boolean DEFAULT false,
  verified_url text,
  qr_code_url text,
  details_ar jsonb DEFAULT '{}'::jsonb,
  details_en jsonb DEFAULT '{}'::jsonb,
  file_url text,
  badge text DEFAULT 'رسمي ومعتمد',
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS contracts (
  id serial PRIMARY KEY,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  counterparty_ar text NOT NULL,
  counterparty_en text NOT NULL,
  contract_type_ar text NOT NULL,
  contract_type_en text NOT NULL,
  date_term_ar text NOT NULL,
  date_term_en text NOT NULL,
  blurred_preview_url text NOT NULL,
  private_file_url text NOT NULL,
  is_protected boolean DEFAULT true,
  notes_ar text,
  notes_en text,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS inbox_messages (
  id serial PRIMARY KEY,
  type text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  subject text,
  message text,
  details jsonb DEFAULT '{}'::jsonb,
  attachment_url text,
  status text NOT NULL DEFAULT 'unread',
  starred boolean DEFAULT false,
  internal_notes text,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'super_admin',
  must_change_password boolean DEFAULT true,
  last_login_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id serial PRIMARY KEY,
  key text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS media_files (
  id serial PRIMARY KEY,
  mime text NOT NULL,
  size integer NOT NULL,
  data bytea NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id serial PRIMARY KEY,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details text,
  performed_by text DEFAULT 'admin',
  created_at timestamp DEFAULT now() NOT NULL
);
`;

// Arbitrary constant used to serialize schema creation / seeding across
// concurrent serverless instances.
export const SETUP_LOCK_ID = 727_001;

/**
 * Runs `task` while holding a transaction-level Postgres advisory lock.
 * (Transaction-level locks are released automatically and work with connection poolers such as
 * PgBouncer, Neon and Supabase, unlike session-level locks.)
 */
export async function withSetupLock<T>(task: () => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [SETUP_LOCK_ID]);
    const result = await task();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureSchema(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [SETUP_LOCK_ID]);
    await client.query(SCHEMA_SQL);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
