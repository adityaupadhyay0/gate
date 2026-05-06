import prisma from "@/lib/db/prisma";

export class DiagnosticEngine {
  static async getTestQuestions() {
    // Covers 5-6 subjects, 2-3 questions each (Total ~12-15)
    const subjects = await prisma.subject.findMany({
      take: 6,
      include: {
        topics: {
          take: 3,
          include: {
            pyqs: {
              take: 1
            }
          }
        }
      }
    });

    const questions = subjects.flatMap(s =>
      s.topics.flatMap(t => t.pyqs)
    ).filter(Boolean).slice(0, 15);

    return questions;
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
