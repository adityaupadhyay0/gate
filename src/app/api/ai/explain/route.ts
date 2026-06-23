import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { PromptEngine } from "@/lib/engines/PromptEngine";
import { RateLimitService } from "@/lib/services/RateLimitService";
import { AI_CONFIG } from "@/lib/config/ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  // Session check to prevent unauthorized usage and cost drain
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const { limit, windowHours, key, model: aiModel } = AI_CONFIG.explain;

  const limitResult = await RateLimitService.checkAndIncrement(
    session.user.id,
    key,
    limit,
    windowHours
  );

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": limitResult.remaining.toString(),
    "X-RateLimit-Reset": Math.floor(limitResult.resetAt.getTime() / 1000).toString(),
  };

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: `Daily AI explanation limit reached (${limit} requests/${windowHours}h). Please try again later.` },
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

    const model = genAI.getGenerativeModel({ model: aiModel });

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
