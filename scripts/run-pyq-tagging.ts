import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function main() {
  console.log('Running PYQ Tagging Job with Gemini...');
  const pyqs = await prisma.pYQ.findMany({
    include: { metadata: true }
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (const pyq of pyqs) {
    if (pyq.metadata) continue;

    console.log(`Tagging PYQ #${pyq.id}...`);

    const prompt = `
      Given this GATE PYQ, return JSON:
      Question: ${pyq.question}
      Options: ${JSON.stringify(pyq.options)}
      Answer: ${pyq.answer}

      Format:
      {
        "subtopic": "string",
        "conceptTags": ["string"],
        "difficulty": 0.1 to 1.0,
        "questionType": "conceptual|numerical|application",
        "commonMistake": "string",
        "oneLineExplanation": "string"
      }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
        const data = JSON.parse(jsonStr);

        await prisma.pYQMetadata.create({
          data: {
            pyqId: pyq.id,
            subtopic: data.subtopic || "General",
            conceptTags: JSON.stringify(data.conceptTags || []),
            globalDifficulty: data.difficulty || 0.5,
            questionType: data.questionType || "conceptual",
            commonMistake: data.commonMistake,
            oneLineExplanation: data.oneLineExplanation
          }
        });
    } catch (e) {
        console.error(`Failed to tag PYQ ${pyq.id}:`, e);
    }
  }
  console.log('PYQ Tagging completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
