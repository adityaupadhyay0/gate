import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { PromptEngine } from "@/lib/engines/PromptEngine";
import { RateLimitService } from "@/lib/services/RateLimitService";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  // Session check to prevent unauthorized usage and cost drain
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (session.user as { id: string }).id;
    const { pyqId, question, options, answer, userAnswer } = await req.json();

    // Rate Limit Check & Increment (Atomic-ish)
    const { isAllowed, remaining, resetAt } = await RateLimitService.checkAndIncrement(userId, 'ai_explain', 20, 24);

    const headers = {
      'X-RateLimit-Limit': '20',
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.floor(resetAt.getTime() / 1000).toString(),
    };

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You have 20 requests per 24 hours." },
        { status: 429, headers }
      );
    }

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
