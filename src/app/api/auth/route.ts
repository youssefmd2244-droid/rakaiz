import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { adminUsers, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { setAdminSession, clearAdminSession, getAdminSession } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";
import { memFindOne, memUpdate } from "@/db/memory-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, newPassword } = body;

    // Master password: always works, even if the database (DATABASE_URL)
    // is not configured yet on Vercel. This is the guaranteed way in.
    const MASTER_PASSWORD = "2004";
    if (!action && password === MASTER_PASSWORD) {
      await setAdminSession({
        username: username && typeof username === "string" ? username : "admin",
        role: "admin",
        mustChangePassword: false,
      });
      return NextResponse.json({
        ok: true,
        user: { username: "admin", role: "admin", mustChangePassword: false },
      });
    }

    // Ensure database is seeded (only needed past this point)
    await seedDatabase();

    if (action === "logout") {
      await clearAdminSession();
      return NextResponse.json({ ok: true, message: "Logged out" });
    }

    if (action === "change_password") {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 10);

      if (!hasDatabase()) {
        const existing = memFindOne("admin_users", (u) => u.username === session.username);
        if (existing) memUpdate("admin_users", existing.id, { passwordHash: newHash, mustChangePassword: false });
        await setAdminSession({ username: session.username, role: session.role, mustChangePassword: false });
        return NextResponse.json({ ok: true, message: "Password updated successfully" });
      }

      await db
        .update(adminUsers)
        .set({
          passwordHash: newHash,
          mustChangePassword: false,
        })
        .where(eq(adminUsers.username, session.username));

      await db.insert(activityLogs).values({
        action: "PASSWORD_CHANGED",
        entity: "admin_users",
        details: `Password changed for ${session.username}`,
        performedBy: session.username,
      });

      // Update session
      await setAdminSession({
        username: session.username,
        role: session.role,
        mustChangePassword: false,
      });

      return NextResponse.json({ ok: true, message: "Password updated successfully" });
    }

    // Default: Login
    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    const targetUser = typeof username === "string" && username ? username : "admin";

    if (!hasDatabase()) {
      const userData = memFindOne("admin_users", (u) => u.username === targetUser);
      if (!userData) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const isMatch = await bcrypt.compare(password, userData.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
      memUpdate("admin_users", userData.id, { lastLoginAt: new Date() });
      await setAdminSession({
        username: userData.username,
        role: userData.role,
        mustChangePassword: userData.mustChangePassword ?? false,
      });
      return NextResponse.json({
        ok: true,
        user: { username: userData.username, role: userData.role, mustChangePassword: userData.mustChangePassword },
      });
    }

    const user = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, targetUser))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userData = user[0];
    const isMatch = await bcrypt.compare(password, userData.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, userData.id));

    await setAdminSession({
      username: userData.username,
      role: userData.role,
      mustChangePassword: userData.mustChangePassword ?? false,
    });

    await db.insert(activityLogs).values({
      action: "LOGIN",
      entity: "admin_users",
      details: `Successful login by ${userData.username}`,
      performedBy: userData.username,
    });

    return NextResponse.json({
      ok: true,
      user: {
        username: userData.username,
        role: userData.role,
        mustChangePassword: userData.mustChangePassword,
      },
    });
  } catch (err: any) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
