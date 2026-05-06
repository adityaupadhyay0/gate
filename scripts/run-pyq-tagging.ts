import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Running PYQ Tagging Job...');
  const pyqs = await prisma.pYQ.findMany({
    include: { metadata: true }
  });

  for (const pyq of pyqs) {
    if (pyq.metadata) continue;

    // Simulate Gemini Call
    const metadata = {
      subtopic: "General",
      conceptTags: JSON.stringify(["Logic", "Basics"]),
      globalDifficulty: Math.random(),
      questionType: "conceptual",
      commonMistake: "Misinterpreting the question",
      oneLineExplanation: "This is a precomputed explanation for " + pyq.question.substring(0, 20)
    };

    await prisma.pYQMetadata.create({
      data: {
        pyqId: pyq.id,
        ...metadata
      }
    });
  }
  console.log('PYQ Tagging completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
