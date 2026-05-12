import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export class FlashcardService {
  static async generateForTopic(topicId: string) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        summaries: true,
        pyqs: { take: 5, include: { metadata: true } }
      }
    });

    if (!topic) throw new Error("Topic not found");

    // Check if flashcards already exist
    const existing = await prisma.flashcard.count({ where: { topicId } });
    if (existing > 0) return;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As a GATE CSE Expert, generate 5 high-quality active recall flashcards for the topic: "${topic.name}".

      Context:
      ${topic.summaries?.coreConcepts ? `- Core Concepts: ${topic.summaries.coreConcepts}` : ""}
      ${topic.summaries?.typicalMistakes ? `- Common Mistakes: ${topic.summaries.typicalMistakes}` : ""}

      Requirements:
      1. Each flashcard must have a 'front' (question/concept) and 'back' (concise technical answer/explanation).
      2. Focus on conceptual depth and typical GATE patterns.
      3. Return ONLY a JSON array of objects with 'front' and 'back' keys.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Basic JSON extraction from AI response
      const jsonStr = text.match(/\[.*\]/s)?.[0] || "[]";
      const cards = JSON.parse(jsonStr);

      if (cards.length > 0) {
        await prisma.flashcard.createMany({
          data: cards.map((c: any) => ({
            topicId,
            front: c.front,
            back: c.back
          }))
        });
      }
    } catch (error) {
      console.error("Flashcard Generation Error:", error);
      // Fallback: Create mock cards if AI fails or no key
      await prisma.flashcard.create({
        data: {
          topicId,
          front: `What is the core definition of ${topic.name}?`,
          back: `The fundamental concept of ${topic.name} involves analyzing the underlying principles and their applications in GATE CSE.`
        }
      });
    }
  }

  static async getFlashcards(topicId: string) {
    return await prisma.flashcard.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
