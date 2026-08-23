import { NextResponse } from "next/server";
import { db } from "@/db";
import { slides, voteSessions, voteOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/slides - 创建课件页面（含投票自动创建）
export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, pageNumber, title, type, config } = body;

  // 创建幻灯片
  const slide = await db.insert(slides).values({
    sessionId,
    pageNumber,
    title,
    type,
    config,
  }).returning();

  const newSlide = slide[0];

  // 如果是投票页，自动创建投票session和选项
  if (type === "vote" && config?.options && Array.isArray(config.options)) {
    const voteSession = await db.insert(voteSessions).values({
      slideId: newSlide.id,
      title: config.question || title || "投票",
      voteType: config.voteType || "single",
    }).returning();

    const voteSessionId = voteSession[0].id;

    // 插入选项
    for (let i = 0; i < config.options.length; i++) {
      await db.insert(voteOptions).values({
        voteSessionId,
        label: config.options[i],
        sortOrder: i,
      });
    }

    // 更新slide config，加入voteSessionId
    await db.update(slides)
      .set({ config: { ...config, voteSessionId } })
      .where(eq(slides.id, newSlide.id));

    newSlide.config = { ...config, voteSessionId };
  }

  return NextResponse.json(newSlide);
}

// GET /api/slides?sessionId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const allSlides = await db.select().from(slides).where(eq(slides.sessionId, sessionId));
  return NextResponse.json(allSlides);
}
