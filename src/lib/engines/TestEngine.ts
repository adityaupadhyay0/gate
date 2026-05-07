import prisma from "@/lib/db/prisma";

export class TestEngine {
  static async generateSectional(subjectId: string, userId: string) {
    // 25-30 questions
    // 50% easy / 30% medium / 20% hard

    const pyqs = await prisma.pYQ.findMany({
      where: { topic: { subjectId } },
      include: { metadata: true }
    });

    const easy = pyqs.filter(p => (p.metadata?.globalDifficulty || 0.5) <= 0.33);
    const medium = pyqs.filter(p => (p.metadata?.globalDifficulty || 0.5) > 0.33 && (p.metadata?.globalDifficulty || 0.5) <= 0.66);
    const hard = pyqs.filter(p => (p.metadata?.globalDifficulty || 0.5) > 0.66);

    const selected = [
      ...this.getRandom(easy, 15),
      ...this.getRandom(medium, 9),
      ...this.getRandom(hard, 6)
    ].slice(0, 30);

    return selected;
  }

  static getRandom(arr: any[], n: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  static scoreTest(answers: { pyqId: string, userAnswer: string, correctStore: string, type: string, marks: number }[]) {
    let score = 0;
    let attempted = 0;
    let correct = 0;

    for (const ans of answers) {
      if (!ans.userAnswer) continue;
      attempted++;

      if (ans.userAnswer === ans.correctStore) {
        score += ans.marks;
        correct++;
      } else {
        // Negative marking: −0.33 for MCQ, 0 for NAT
        if (ans.type === 'MCQ') {
          score -= (ans.marks === 1 ? 0.33 : 0.66);
        }
      }
    }

    return { score, attempted, correct, total: answers.length };
  }

  static async generateMock(userId: string) {
    // 65 questions total
    // General Aptitude: 10 Q
    // CS Subjects: 55 Q

    const csPyqs = await prisma.pYQ.findMany({
      where: { topic: { subject: { NOT: { slug: 'ga' } } } },
      include: { metadata: true }
    });

    const gaPyqs = await prisma.pYQ.findMany({
      where: { topic: { subject: { slug: 'ga' } } },
      include: { metadata: true }
    });

    const selectedGa = this.getRandom(gaPyqs, 10);
    const selectedCs = this.getRandom(csPyqs, 55);

    return [...selectedGa, ...selectedCs];
  }
}
