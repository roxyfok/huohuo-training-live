import { NextResponse } from "next/server";
import { db } from "@/db";
import { inputs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// POST /api/inputs - 提交键入内容
export async function POST(request: Request) {
  const body = await request.json();
  const { slideId, inputType, authorName, content } = body;

  const input = await db.insert(inputs).values({
    slideId,
    inputType,
    authorName,
    content,
  }).returning();

  return NextResponse.json(input[0]);
}

// GET /api/inputs?slideId=xxx - 获取某页面的所有键入
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slideId = searchParams.get("slideId");

  if (!slideId) {
    return NextResponse.json({ error: "slideId required" }, { status: 400 });
  }

  const allInputs = await db
    .select()
    .from(inputs)
    .where(eq(inputs.slideId, slideId))
    .orderBy(desc(inputs.createdAt));

  return NextResponse.json(allInputs);
}
