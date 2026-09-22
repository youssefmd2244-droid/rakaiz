/**
 * In-memory fallback data store.
 *
 * Used only when DATABASE_URL is NOT configured, so the admin control panel
 * (and the public site's settings-driven sections) still open and work
 * normally instead of showing "DATABASE_URL is required" errors everywhere.
 *
 * Important: this data lives in server memory only. It works fine while the
 * server/function instance stays warm, but it is NOT persistent — it resets
 * on redeploys or when the serverless function cold-starts. For permanent
 * storage, connect a real database (Vercel → Project → Settings →
 * Environment Variables → DATABASE_URL) as described on the login screen.
 */

import bcrypt from "bcryptjs";

type Row = Record<string, any> & { id?: number };

interface MemoryDb {
  tables: Record<string, Row[]>;
  nextId: Record<string, number>;
  settings: Record<string, any>;
  media: Map<number, { mime: string; size: number; data: Buffer }>;
  nextMediaId: number;
}

const globalForMemory = globalThis as typeof globalThis & {
  __rakaizMemoryDb?: MemoryDb;
};

function store(): MemoryDb {
  if (!globalForMemory.__rakaizMemoryDb) {
    globalForMemory.__rakaizMemoryDb = {
      tables: {},
      nextId: {},
      settings: {},
      media: new Map(),
      nextMediaId: 1,
    };
    void seedDefaultAdmin();
  }
  return globalForMemory.__rakaizMemoryDb;
}

async function seedDefaultAdmin() {
  const s = globalForMemory.__rakaizMemoryDb!;
  const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "2004", 10);
  s.tables["admin_users"] = [
    {
      id: 1,
      username: "admin",
      passwordHash,
      role: "super_admin",
      mustChangePassword: false,
      lastLoginAt: null,
      createdAt: new Date(),
    },
  ];
  s.nextId["admin_users"] = 2;
}

/* ---------------------------- generic tables ---------------------------- */

export function memList(table: string, sortKey?: string): Row[] {
  const rows = store().tables[table] || [];
  if (sortKey) {
    return [...rows].sort((a, b) => (a[sortKey] ?? 0) - (b[sortKey] ?? 0));
  }
  return [...rows];
}

export function memListSortedDesc(table: string, sortKey: string): Row[] {
  const rows = store().tables[table] || [];
  return [...rows].sort((a, b) => new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime());
}

export function memInsert(table: string, data: Row, defaults: Row = {}): Row {
  const s = store();
  if (!s.tables[table]) s.tables[table] = [];
  if (s.nextId[table] === undefined) {
    const existingMax = s.tables[table].reduce((max, r) => Math.max(max, r.id || 0), 0);
    s.nextId[table] = existingMax + 1;
  }
  const id = s.nextId[table]++;
  const row: Row = {
    ...defaults,
    ...data,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  s.tables[table].push(row);
  return row;
}

export function memUpdate(table: string, id: number | undefined, data: Row): Row | null {
  if (id === undefined) return null;
  const s = store();
  const rows = s.tables[table] || [];
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...data, id, updatedAt: new Date() };
  return rows[idx];
}

export function memDelete(table: string, id: number): void {
  const s = store();
  if (!s.tables[table]) return;
  s.tables[table] = s.tables[table].filter((r) => r.id !== id);
}

export function memDeleteMany(table: string, ids: number[]): void {
  const s = store();
  if (!s.tables[table]) return;
  s.tables[table] = s.tables[table].filter((r) => r.id === undefined || !ids.includes(r.id));
}

export function memDeleteAll(table: string): void {
  const s = store();
  s.tables[table] = [];
}

export function memFindOne(table: string, matcher: (row: Row) => boolean): Row | null {
  const rows = store().tables[table] || [];
  return rows.find(matcher) || null;
}

/* ------------------------------- settings -------------------------------- */

export function memGetAllSettings(): Record<string, any> {
  return { ...store().settings };
}

export function memSetSetting(key: string, data: any): void {
  store().settings[key] = data;
}

/* --------------------------------- media --------------------------------- */

export function memInsertMedia(mime: string, size: number, data: Buffer): number {
  const s = store();
  const id = s.nextMediaId++;
  s.media.set(id, { mime, size, data });
  return id;
}

export function memGetMedia(id: number): { mime: string; data: Buffer } | null {
  const s = store();
  return s.media.get(id) || null;
}

export function memListMedia(): Array<{ id: number; url: string; mime: string; size: number; createdAt: Date }> {
  const s = store();
  return Array.from(s.media.entries())
    .map(([id, m]) => ({ id, url: `/api/media/${id}`, mime: m.mime, size: m.size, createdAt: new Date() }))
    .sort((a, b) => b.id - a.id);
}

export function memDeleteMedia(id: number): void {
  store().media.delete(id);
}
