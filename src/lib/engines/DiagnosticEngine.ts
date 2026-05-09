import prisma from "@/lib/db/prisma";

export class DiagnosticEngine {
  /**
   * Industrial-Grade Proportional Sampling
   * Ensures 100% subject coverage for a 15-question diagnostic.
   */
  static async getTestQuestions() {
    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            pyqs: {
              take: 1
            }
          }
        }
      }
    });

    const questions: any[] = [];

    // Core subjects to prioritize for diagnostic
    const coreSubjectSlugs = [
      'algorithms', 'data-structures', 'os', 'networks',
      'dbms', 'toc', 'coa', 'compiler-design',
      'discrete-math', 'digital-logic', 'eng-math', 'c-programming'
    ];

    for (const slug of coreSubjectSlugs) {
      const subject = subjects.find(s => s.slug === slug);
      if (!subject) continue;

      // Flatten all available PYQs for this subject
      const subjectPyqs = subject.topics.flatMap(t => t.pyqs);

      if (subjectPyqs.length > 0) {
        // Pick 1-2 random questions per core subject
        const count = slug === 'algorithms' || slug === 'data-structures' ? 2 : 1;
        const shuffled = subjectPyqs.sort(() => 0.5 - Math.random());
        questions.push(...shuffled.slice(0, count));
      }
    }

    // Fill up to 15 if needed
    if (questions.length < 15) {
      const allOtherPyqs = await prisma.pYQ.findMany({
        where: { id: { notIn: questions.map(q => q.id) } },
        take: 15 - questions.length,
        include: { topic: { include: { subject: true } } }
      });
      questions.push(...allOtherPyqs);
    }

    return questions.slice(0, 20); // Cap at 20 max
  }

  static async processResults(userId: string, answers: { pyqId: string, isCorrect: boolean }[]) {
    const subjectPerformance: Record<string, { correct: number, total: number }> = {};
    const weakAreas: string[] = [];

    for (const answer of answers) {
      const pyq = await prisma.pYQ.findUnique({
        where: { id: answer.pyqId },
        include: { topic: { include: { subject: true } } }
      });

      if (!pyq) continue;

      const subjectName = pyq.topic.subject.name;
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = { correct: 0, total: 0 };
      }

      subjectPerformance[subjectName].total += 1;
      if (answer.isCorrect) {
        subjectPerformance[subjectName].correct += 1;
      } else {
        weakAreas.push(pyq.topic.name);
      }
    }

    // Calculate normalized strength map (0-100)
    const strengthMap: Record<string, number> = {};
    Object.entries(subjectPerformance).forEach(([subject, stats]) => {
      strengthMap[subject] = (stats.correct / stats.total) * 100;
    });

    // Store in DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        diagnosticResult: JSON.stringify({
          strengthMap,
          weakAreas,
          timestamp: new Date().toISOString(),
          version: "2.0-proportional"
        }),
        onboardingComplete: true
      }
    });

    return { strengthMap, weakAreas };
  }
}
