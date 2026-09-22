import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ ok: true, message: "Database verified & seeded" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
