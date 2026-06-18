import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { PromptEngine } from "@/lib/engines/PromptEngine";
import { RateLimitService } from "@/lib/services/RateLimitService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const AI_EXPLAIN_LIMIT = 20;
const WINDOW_HOURS = 24;

export async function POST(req: Request) {
  // Session check to prevent unauthorized usage and cost drain
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const rateLimit = await RateLimitService.checkAndIncrement(
    session.user.id,
    "ai_explain",
    AI_EXPLAIN_LIMIT,
    WINDOW_HOURS
  );

  const headers = {
    "X-RateLimit-Limit": rateLimit.limit.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(rateLimit.resetAt.getTime() / 1000).toString(),
  };

  if (rateLimit.isLimited) {
    return NextResponse.json(
      { error: "Daily AI explanation limit reached. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const { pyqId, question, options, answer, userAnswer } = await req.json();

    // Fetch grounded context from DB
    let metadata = null;
    let summary = null;

    if (pyqId) {
      const pyq = await prisma.pYQ.findUnique({
        where: { id: pyqId },
        include: {
          metadata: true,
          topic: {
            include: {
              summaries: true
            }
          }
        }
      });
      metadata = pyq?.metadata;
      summary = pyq?.topic?.summaries;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = PromptEngine.generateExplanationPrompt({
      question,
      options,
      answer,
      userAnswer,
      metadata,
      summary
    });

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation }, { headers });
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
