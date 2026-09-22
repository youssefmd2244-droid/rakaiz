import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { siteSettings, activityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";
import { sanitizeIconCode } from "@/lib/iconcode";
import { sanitizeShowcase } from "@/lib/iconcode-showcase";
import { sanitizeSiteMedia } from "@/lib/site-content";
import { memGetAllSettings, memSetSetting } from "@/db/memory-store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const session = await getAdminSession();
    const PUBLIC_KEYS = ["general", "contact", "iconcode", "iconcode_showcase", "about_gallery", "site_blocks", "site_media"];

    if (!hasDatabase()) {
      const all = memGetAllSettings();
      const settingsMap: Record<string, any> = {};
      for (const key of Object.keys(all)) {
        if (session || PUBLIC_KEYS.includes(key)) settingsMap[key] = all[key];
      }
      return NextResponse.json({ ok: true, settings: settingsMap });
    }

    await seedDatabase();
    const allSettings = await db.select().from(siteSettings);
    const settingsMap: Record<string, any> = {};
    for (const s of allSettings) {
      // Visitors only receive public settings; integration keys stay admin-only.
      if (session || PUBLIC_KEYS.includes(s.key)) {
        settingsMap[s.key] = s.data;
      }
    }
    return NextResponse.json({ ok: true, settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { key } = body;
    let data = body.data;
    if (!key || !data) {
      return NextResponse.json({ error: "Key and data required" }, { status: 400 });
    }
    // Icon Code contact channels: validate structure and limit sizes before saving
    if (key === "iconcode") {
      data = sanitizeIconCode(data);
    }
    if (key === "iconcode_showcase" || key === "about_gallery" || key === "site_blocks") {
      data = sanitizeShowcase(data);
    }
    if (key === "site_media") {
      data = sanitizeSiteMedia(data);
    }

    if (!hasDatabase()) {
      memSetSetting(key, data);
      return NextResponse.json({ ok: true, message: "Settings updated successfully" });
    }

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);

    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({
          data,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({
        key,
        data,
      });
    }

    await db.insert(activityLogs).values({
      action: "SETTINGS_UPDATED",
      entity: "site_settings",
      details: `Updated settings for section: ${key}`,
      performedBy: session.username,
    });

    return NextResponse.json({ ok: true, message: "Settings updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
