import { NextRequest, NextResponse } from "next/server";
import { getPool, hasDatabase } from "@/db";
import { seedDatabase } from "@/db/seed";
import { getAdminSession } from "@/lib/auth";
import { memGetMedia, memDeleteMedia } from "@/db/memory-store";

export const dynamic = "force-dynamic";

/** Public: serves an uploaded file (with cache headers and Range support for videos). */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let mime: string;
    let data: Buffer;

    if (!hasDatabase()) {
      const found = memGetMedia(Number(id));
      if (!found) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      mime = found.mime;
      data = found.data;
    } else {
      await seedDatabase();
      const result = await getPool().query("SELECT mime, data FROM media_files WHERE id = $1", [Number(id)]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      mime = result.rows[0].mime;
      data = result.rows[0].data;
    }
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };

    const range = req.headers.get("range");
    const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
    if (match && (match[1] || match[2])) {
      let start = match[1] ? parseInt(match[1], 10) : data.length - parseInt(match[2], 10);
      let end = match[1] && match[2] ? parseInt(match[2], 10) : data.length - 1;
      start = Math.max(0, start);
      end = Math.min(end, data.length - 1);
      if (start > end) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.length}` } });
      }
      const chunk = data.subarray(start, end + 1);
      return new Response(new Uint8Array(chunk), {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${data.length}`,
          "Content-Length": String(chunk.length),
        },
      });
    }

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: { ...headers, "Content-Length": String(data.length) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** Admin only: permanently delete an uploaded file. */
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!hasDatabase()) {
      memDeleteMedia(Number(id));
      return NextResponse.json({ ok: true });
    }

    await seedDatabase();
    await getPool().query("DELETE FROM media_files WHERE id = $1", [Number(id)]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
