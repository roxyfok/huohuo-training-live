import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";

// POST /api/sessions - 创建新场次
export async function POST(request: Request) {
  const body = await request.json();
  const { title, slug } = body;

  const session = await db.insert(sessions).values({
    title,
    slug,
  }).returning();

  return NextResponse.json(session[0]);
}

// GET /api/sessions - 获取所有场次
export async function GET() {
  const allSessions = await db.select().from(sessions);
  return NextResponse.json(allSessions);
}
