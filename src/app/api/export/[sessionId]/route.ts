import { NextResponse } from "next/server";
import { db } from "@/db";
import { inputs, votes, voteOptions, voteSessions, slides } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const sessionId = params.sessionId;

  const sessionSlides = await db.select().from(slides).where(eq(slides.sessionId, sessionId));

  const voteSlides = sessionSlides.filter((s) => s.type === "vote");
  const voteReports = [];

  for (const slide of voteSlides) {
    const vs = await db.select().from(voteSessions).where(eq(voteSessions.slideId, slide.id));
    if (vs.length === 0) continue;

    const vsId = vs[0].id;
    const options = await db.select().from(voteOptions).where(eq(voteOptions.voteSessionId, vsId));

    const optionResults = [];
    for (const opt of options) {
      const countResult = await db
        .select({ count: count() })
        .from(votes)
        .where(eq(votes.optionId, opt.id));
      optionResults.push({
        label: opt.label,
        count: countResult[0]?.count || 0,
      });
    }

    voteReports.push({
      title: slide.title || vs[0].title,
      type: vs[0].voteType,
      options: optionResults,
    });
  }

  const inputSlides = sessionSlides.filter((s) => s.type === "input" || s.type === "video");
  const inputReports = [];

  for (const slide of inputSlides) {
    const slideInputs = await db
      .select()
      .from(inputs)
      .where(eq(inputs.slideId, slide.id))
      .orderBy(inputs.createdAt);

    if (slideInputs.length > 0) {
      inputReports.push({
        title: slide.title || "学员输入",
        type: slide.type,
        count: slideInputs.length,
        contents: slideInputs.map((i) => ({
          author: i.authorName,
          content: i.content,
          time: i.createdAt,
        })),
      });
    }
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    votes: voteReports,
    inputs: inputReports,
  });
}
