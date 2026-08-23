import { NextResponse } from "next/server";
import { db } from "@/db";
import { voteSessions, voteOptions, votes } from "@/db/schema";
import { eq, count } from "drizzle-orm";

// POST /api/votes - 提交投票
export async function POST(request: Request) {
  const body = await request.json();
  const { voteSessionId, optionIds, voterHash } = body;

  // 删除该用户之前的投票（允许修改）
  await db.delete(votes).where(eq(votes.voterHash, voterHash));

  // 插入新投票
  for (const optionId of optionIds) {
    await db.insert(votes).values({
      voteSessionId,
      optionId,
      voterHash,
    });
  }

  return NextResponse.json({ success: true });
}

// GET /api/votes?sessionId=xxx - 获取投票结果
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const voteSessionId = searchParams.get("voteSessionId");

  if (!voteSessionId) {
    return NextResponse.json({ error: "voteSessionId required" }, { status: 400 });
  }

  const options = await db.select().from(voteOptions).where(eq(voteOptions.voteSessionId, voteSessionId));

  const results = [];
  for (const option of options) {
    const result = await db.select({ count: count() }).from(votes).where(eq(votes.optionId, option.id));
    results.push({
      ...option,
      count: result[0].count,
    });
  }

  const totalResult = await db.select({ count: count() }).from(votes).where(eq(votes.voteSessionId, voteSessionId));

  return NextResponse.json({
    options: results,
    total: totalResult[0].count,
  });
}
