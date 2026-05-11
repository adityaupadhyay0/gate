import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  // Session check to prevent unauthorized usage and cost drain
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pyqId, question, options, answer, userAnswer } = await req.json();

    // Fetch grounding context if pyqId is provided
    let groundingContext = "";
    if (pyqId) {
      const pyq = await prisma.pYQ.findUnique({
        where: { id: pyqId },
        include: {
          metadata: true,
          topic: {
            include: {
              summaries: true,
              resources: true,
            },
          },
        },
      });

      if (pyq) {
        groundingContext = `
          --- GROUNDING CONTEXT ---
          Expert Hint: ${pyq.metadata?.oneLineExplanation || "N/A"}
          Core Concepts: ${pyq.topic.summaries?.coreConcepts || "N/A"}
          Key Formulas: ${pyq.topic.summaries?.keyFormulas || "N/A"}
          Typical Mistakes: ${pyq.topic.summaries?.typicalMistakes || "N/A"}
          Recommended Reading: ${pyq.topic.resources?.recommendedBookChapters || "N/A"}
          --------------------------
        `;
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As a GATE CSE Expert, explain the following PYQ in a structured, professional manner using Markdown.

      ${groundingContext}

      Question: ${question}
      Options: ${JSON.stringify(options)}
      Correct Answer: ${answer}
      User's Answer: ${userAnswer}

      Requirements:
      1. Concept Overview: Use the provided "Core Concepts" and "Expert Hint" to frame the problem.
      2. Technical Derivation: Show the step-by-step derivation or logical reasoning. Use LaTeX for math if needed.
      3. Common Pitfalls: Specifically address the "Typical Mistakes" provided in the context and explain why they are tempting.
      4. Suggested Deep Dive: Use the "Recommended Reading" to suggest specific textbook sections for further study.
      5. Tone: Use concise, elite technical language suitable for a Rank 1 aspirant.

      Structure the response with clear H3 headers: ### Concept Overview, ### Technical Derivation, ### Common Pitfalls, ### Suggested Deep Dive.
    `;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
