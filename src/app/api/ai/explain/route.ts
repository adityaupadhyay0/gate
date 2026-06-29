import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { PromptEngine } from "@/lib/engines/PromptEngine";
import { RateLimitService } from "@/lib/services/RateLimitService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Rate limit configuration: 20 requests per 24 hours
const AI_EXPLAIN_LIMIT = 20;
const AI_EXPLAIN_WINDOW = 24;

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
    AI_EXPLAIN_WINDOW
  );

  const headers = {
    "X-RateLimit-Limit": AI_EXPLAIN_LIMIT.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(rateLimit.reset.getTime() / 1000).toString(),
  };

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Daily AI usage limit reached. Resets at ${rateLimit.reset.toLocaleString()}.` },
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
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500, headers }
    );
  }
}
