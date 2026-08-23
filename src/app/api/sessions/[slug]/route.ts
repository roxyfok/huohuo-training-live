import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/sessions/:slug - 更新场次信息（当前页码等）
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const body = await request.json();

  const updated = await db
    .update(sessions)
    .set(body)
    .where(eq(sessions.slug, slug))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(updated[0]);
}
