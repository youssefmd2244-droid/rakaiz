import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { inboxMessages } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";
import { memListSortedDesc, memInsert, memUpdate, memDelete, memDeleteMany, memDeleteAll } from "@/db/memory-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const messages = hasDatabase()
      ? await (async () => {
          await seedDatabase();
          return db.select().from(inboxMessages).orderBy(desc(inboxMessages.createdAt));
        })()
      : memListSortedDesc("inbox_messages", "createdAt");

    const filtered = type && type !== "all" 
      ? messages.filter((m) => m.type === type) 
      : messages;

    return NextResponse.json({ ok: true, messages: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, email, phone, company, subject, message, details } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Basic input hygiene for a public form (protects the database from oversized / malformed payloads)
    const cap = (value: unknown, max: number) =>
      typeof value === "string" ? value.trim().slice(0, max) : null;
    if (typeof name !== "string" || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid name or email" }, { status: 400 });
    }

    const payload = {
      type: ["contact", "quote", "doc_access", "newsletter"].includes(type) ? type : "contact",
      name: cap(name, 200) || "-",
      email: cap(email, 200) as string,
      phone: cap(phone, 50) || null,
      company: cap(company, 200) || null,
      subject: cap(subject, 300) || "New Submission",
      message: cap(message, 5000) || "",
      details: details || {},
      status: "unread",
    };

    if (!hasDatabase()) {
      const item = memInsert("inbox_messages", payload, { starred: false });
      return NextResponse.json({ ok: true, message: "Submission received successfully", id: item.id });
    }

    await seedDatabase();
    const inserted = await db.insert(inboxMessages).values(payload).returning();

    return NextResponse.json({ ok: true, message: "Submission received successfully", id: inserted[0]?.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, starred, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (starred !== undefined) updateData.starred = starred;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    if (!hasDatabase()) {
      memUpdate("inbox_messages", id, updateData);
      return NextResponse.json({ ok: true, message: "Message updated" });
    }

    await seedDatabase();
    await db.update(inboxMessages).set(updateData).where(eq(inboxMessages.id, id));

    return NextResponse.json({ ok: true, message: "Message updated" });
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
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (!hasDatabase()) {
      if (all === "true") {
        memDeleteAll("inbox_messages");
        return NextResponse.json({ ok: true, message: "All inbox messages permanently deleted" });
      }
      if (id) {
        memDelete("inbox_messages", parseInt(id));
        return NextResponse.json({ ok: true, message: "Message deleted" });
      }
      const body = await req.json().catch(() => ({}));
      if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
        memDeleteMany("inbox_messages", body.ids);
        return NextResponse.json({ ok: true, message: `${body.ids.length} messages deleted` });
      }
      return NextResponse.json({ error: "Invalid delete parameters" }, { status: 400 });
    }

    await seedDatabase();

    if (all === "true") {
      await db.delete(inboxMessages);
      return NextResponse.json({ ok: true, message: "All inbox messages permanently deleted" });
    }

    if (id) {
      await db.delete(inboxMessages).where(eq(inboxMessages.id, parseInt(id)));
      return NextResponse.json({ ok: true, message: "Message deleted" });
    }

    const body = await req.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      await db.delete(inboxMessages).where(inArray(inboxMessages.id, body.ids));
      return NextResponse.json({ ok: true, message: `${body.ids.length} messages deleted` });
    }

    return NextResponse.json({ error: "Invalid delete parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
