import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Running Topic Summary Job...');
  const topics = await prisma.topic.findMany({
    include: { summaries: true }
  });

  for (const topic of topics) {
    if (topic.summaries) continue;

    const summary = {
      coreConcepts: JSON.stringify(["Concept A", "Concept B"]),
      commonExamPatterns: JSON.stringify(["Pattern 1", "Pattern 2"]),
      keyFormulas: JSON.stringify(["Formula X = Y + Z"]),
      mostTestedSubtopics: JSON.stringify(["Subtopic Alpha"]),
      typicalMistakes: JSON.stringify(["Mistake A", "Mistake B"])
    };

    await prisma.topicSummary.create({
      data: {
        topicId: topic.id,
        ...summary
      }
    });
  }
  console.log('Topic Summaries completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
