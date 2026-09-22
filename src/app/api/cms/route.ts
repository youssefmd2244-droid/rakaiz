import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { projects, services, achievements, partners, certificates, contracts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";
import { memList, memInsert, memUpdate, memDelete } from "@/db/memory-store";

export const dynamic = "force-dynamic";

const TABLES = ["projects", "services", "achievements", "partners", "certificates", "contracts"] as const;
type TableName = (typeof TABLES)[number];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") as TableName | null;

    if (!table || !TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table specified" }, { status: 400 });
    }

    if (!hasDatabase()) {
      const session = await getAdminSession();
      const data = memList(table, "sortOrder");
      if (table === "contracts") {
        const sanitized = data.map((item) => ({
          ...item,
          privateFileUrl: session ? item.privateFileUrl : null,
        }));
        return NextResponse.json({ ok: true, data: sanitized });
      }
      return NextResponse.json({ ok: true, data });
    }

    await seedDatabase();

    if (table === "projects") {
      const data = await db.select().from(projects).orderBy(asc(projects.sortOrder));
      return NextResponse.json({ ok: true, data });
    }
    if (table === "services") {
      const data = await db.select().from(services).orderBy(asc(services.sortOrder));
      return NextResponse.json({ ok: true, data });
    }
    if (table === "achievements") {
      const data = await db.select().from(achievements).orderBy(asc(achievements.sortOrder));
      return NextResponse.json({ ok: true, data });
    }
    if (table === "partners") {
      const data = await db.select().from(partners).orderBy(asc(partners.sortOrder));
      return NextResponse.json({ ok: true, data });
    }
    if (table === "certificates") {
      const data = await db.select().from(certificates).orderBy(asc(certificates.sortOrder));
      return NextResponse.json({ ok: true, data });
    }
    if (table === "contracts") {
      const session = await getAdminSession();
      const data = await db.select().from(contracts).orderBy(asc(contracts.sortOrder));
      // If not logged in as admin, omit the actual privateFileUrl for absolute security
      const sanitized = data.map((item) => ({
        ...item,
        privateFileUrl: session ? item.privateFileUrl : null,
      }));
      return NextResponse.json({ ok: true, data: sanitized });
    }

    return NextResponse.json({ error: "Invalid table specified" }, { status: 400 });
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

    const { table, data } = await req.json();
    if (!table || !TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    if (!hasDatabase()) {
      const item = memInsert(table, data, { published: true, sortOrder: 0, featured: true });
      return NextResponse.json({ ok: true, item });
    }

    await seedDatabase();

    if (table === "projects") {
      const result = await db.insert(projects).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }
    if (table === "services") {
      const result = await db.insert(services).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }
    if (table === "achievements") {
      const result = await db.insert(achievements).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }
    if (table === "partners") {
      const result = await db.insert(partners).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }
    if (table === "certificates") {
      const result = await db.insert(certificates).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }
    if (table === "contracts") {
      const result = await db.insert(contracts).values(data).returning();
      return NextResponse.json({ ok: true, item: result[0] });
    }

    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { table, id, data } = await req.json();
    if (!table || !TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    if (!hasDatabase()) {
      memUpdate(table, id, data);
      return NextResponse.json({ ok: true, message: "Updated" });
    }

    await seedDatabase();

    if (table === "projects") {
      await db.update(projects).set(data).where(eq(projects.id, id));
      return NextResponse.json({ ok: true, message: "Project updated" });
    }
    if (table === "services") {
      await db.update(services).set(data).where(eq(services.id, id));
      return NextResponse.json({ ok: true, message: "Service updated" });
    }
    if (table === "achievements") {
      await db.update(achievements).set(data).where(eq(achievements.id, id));
      return NextResponse.json({ ok: true, message: "Achievement updated" });
    }
    if (table === "partners") {
      await db.update(partners).set(data).where(eq(partners.id, id));
      return NextResponse.json({ ok: true, message: "Partner updated" });
    }
    if (table === "certificates") {
      await db.update(certificates).set(data).where(eq(certificates.id, id));
      return NextResponse.json({ ok: true, message: "Certificate updated" });
    }
    if (table === "contracts") {
      await db.update(contracts).set(data).where(eq(contracts.id, id));
      return NextResponse.json({ ok: true, message: "Contract updated" });
    }

    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") as TableName | null;
    const id = parseInt(searchParams.get("id") || "0");

    if (!table || !TABLES.includes(table) || !id) {
      return NextResponse.json({ error: "Table and ID required" }, { status: 400 });
    }

    if (!hasDatabase()) {
      memDelete(table, id);
      return NextResponse.json({ ok: true, message: "Deleted successfully" });
    }

    await seedDatabase();

    if (table === "projects") await db.delete(projects).where(eq(projects.id, id));
    else if (table === "services") await db.delete(services).where(eq(services.id, id));
    else if (table === "achievements") await db.delete(achievements).where(eq(achievements.id, id));
    else if (table === "partners") await db.delete(partners).where(eq(partners.id, id));
    else if (table === "certificates") await db.delete(certificates).where(eq(certificates.id, id));
    else if (table === "contracts") await db.delete(contracts).where(eq(contracts.id, id));

    return NextResponse.json({ ok: true, message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
