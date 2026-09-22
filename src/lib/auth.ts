import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "rakaiz_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export interface AdminSession {
  username: string;
  role: string;
  mustChangePassword?: boolean;
}

/**
 * Secret used to sign the admin session cookie.
 * Set SESSION_SECRET in Vercel (Project → Settings → Environment Variables) (any long random string). If it is missing we
 * derive a stable secret from DATABASE_URL so the site still works safely.
 */
function getSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (databaseUrl) {
    return createHash("sha256").update(`rakaiz-session:${databaseUrl}`).digest("hex");
  }
  // Static fallback so the admin panel still works even before a database /
  // SESSION_SECRET is configured on Vercel (used together with the master
  // password login in /api/auth).
  return "rakaiz-static-session-secret-2004";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encode(session: AdminSession): string {
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): AdminSession | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data || typeof data.username !== "string") return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return {
      username: data.username,
      role: data.role,
      mustChangePassword: data.mustChangePassword,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  try {
    return decode(sessionToken);
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encode(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
