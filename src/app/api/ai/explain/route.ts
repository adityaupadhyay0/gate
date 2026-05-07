import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  // Session check to prevent unauthorized usage and cost drain
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { question, options, answer, userAnswer } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As a GATE CSE Expert, explain the following PYQ in a structured, step-by-step manner.

      Question: ${question}
      Options: ${JSON.stringify(options)}
      Correct Answer: ${answer}
      User's Answer: ${userAnswer}

      Requirements:
      1. Explain the core concept involved.
      2. Show the step-by-step derivation or logical reasoning.
      3. If the user was wrong, gently explain why the user's answer might be a common pitfall.
      4. Use concise, technical language suitable for a Rank 1 aspirant.

      Return as plain text with clear line breaks.
    `;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI Explanation Error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
