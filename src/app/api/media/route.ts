import { NextRequest, NextResponse } from "next/server";
import { getPool, hasDatabase } from "@/db";
import { getAdminSession } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";
import { memInsertMedia, memListMedia } from "@/db/memory-store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Vercel serverless functions accept request bodies up to 4.5MB, so files are limited to 4MB.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];

/** Admin only: upload an image (or a small video) and get back a URL like /api/media/12 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم (صور JPG / PNG / WEBP / GIF أو فيديو MP4 / WEBM)" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "حجم الملف أكبر من 4 ميجا. للفيديوهات الكبيرة استخدم رابط (يوتيوب أو رابط مباشر)." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasDatabase()) {
      const id = memInsertMedia(file.type, buffer.length, buffer);
      return NextResponse.json({ ok: true, url: `/api/media/${id}`, mime: file.type });
    }

    await seedDatabase();
    const result = await getPool().query(
      "INSERT INTO media_files (mime, size, data) VALUES ($1, $2, $3) RETURNING id",
      [file.type, buffer.length, buffer]
    );

    return NextResponse.json({ ok: true, url: `/api/media/${result.rows[0].id}`, mime: file.type });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** Admin only: list every uploaded file (newest first) for the media library. */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasDatabase()) {
      return NextResponse.json({ ok: true, files: memListMedia() });
    }

    await seedDatabase();
    const result = await getPool().query(
      "SELECT id, mime, size, created_at FROM media_files ORDER BY id DESC LIMIT 500"
    );
    const files = result.rows.map((r) => ({
      id: Number(r.id),
      url: `/api/media/${r.id}`,
      mime: r.mime as string,
      size: Number(r.size),
      createdAt: r.created_at,
    }));
    return NextResponse.json({ ok: true, files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
