import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function main() {
  console.log('Running Topic Summary Job with Gemini...');
  const topics = await prisma.topic.findMany({
    include: { summaries: true, subject: true }
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  for (const topic of topics) {
    if (topic.summaries) continue;

    console.log(`Generating summary for ${topic.name}...`);

    const prompt = `
      Generate a GATE-focused summary for: ${topic.name} in ${topic.subject.name}.
      Return JSON:
      {
        "coreConcepts": ["string"],
        "commonExamPatterns": ["string"],
        "keyFormulas": ["string"],
        "mostTestedSubtopics": ["string"],
        "typicalMistakes": ["string"]
      }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
        const data = JSON.parse(jsonStr);

        await prisma.topicSummary.create({
          data: {
            topicId: topic.id,
            coreConcepts: JSON.stringify(data.coreConcepts || []),
            commonExamPatterns: JSON.stringify(data.commonExamPatterns || []),
            keyFormulas: JSON.stringify(data.keyFormulas || []),
            mostTestedSubtopics: JSON.stringify(data.mostTestedSubtopics || []),
            typicalMistakes: JSON.stringify(data.typicalMistakes || [])
          }
        });
    } catch (e) {
        console.error(`Failed to summarize ${topic.name}:`, e);
    }
  }
  console.log('Topic Summaries completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
