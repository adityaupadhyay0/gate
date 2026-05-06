import prisma from "@/lib/db/prisma";

export class DiagnosticEngine {
  /**
   * Hybrid Benchmarking System
   * 70% Fixed "Anchor Set" for global comparability
   * 30% Adaptive Edge Set for signal amplification
   */
  static async getTestQuestions() {
    // 1. Get Anchor Set (Fixed 10 questions)
    // In a real system, these would be specific IDs. For now, we take 10 consistent ones.
    const anchorQuestions = await prisma.pYQ.findMany({
      take: 10,
      orderBy: { id: 'asc' }, // Deterministic for benchmarking
      include: {
        topic: {
          include: { subject: true }
        }
      }
    });

    // 2. Get Adaptive Edge Set (5 questions)
    // We'll pick from subjects not covered well in the anchor set or just random ones for now.
    const adaptiveQuestions = await prisma.pYQ.findMany({
      take: 5,
      skip: 50, // Skip anchor pool
      orderBy: { id: 'desc' },
      include: {
        topic: {
          include: { subject: true }
        }
      }
    });

    return [...anchorQuestions, ...adaptiveQuestions];
  }

  static async processResults(userId: string, answers: { pyqId: string, isCorrect: boolean }[]) {
    const strengthMap: Record<string, number> = {};
    const weakAreas: string[] = [];

    // Simple scoring logic
    for (const answer of answers) {
      const pyq = await prisma.pYQ.findUnique({
        where: { id: answer.pyqId },
        include: { topic: { include: { subject: true } } }
      });

      if (!pyq) continue;

      const subjectName = pyq.topic.subject.name;
      if (!strengthMap[subjectName]) strengthMap[subjectName] = 0;

      if (answer.isCorrect) {
        strengthMap[subjectName] += 100 / 3; // Approx 3 questions per subject
      } else {
        weakAreas.push(pyq.topic.name);
      }
    }

    // Normalize and store
    await prisma.user.update({
      where: { id: userId },
      data: {
        diagnosticResult: JSON.stringify({ strengthMap, weakAreas }),
        onboardingComplete: true
      }
    });

    return { strengthMap, weakAreas };
  }
}
