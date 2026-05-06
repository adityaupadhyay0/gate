import prisma from "@/lib/db/prisma";

export async function getROISortedTopics(userId: string) {
  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        include: {
          _count: { select: { pyqs: true } },
          userProgress: { where: { userId } }
        }
      }
    }
  });

  const allTopics = subjects.flatMap(s => s.topics.map(t => {
    const pyqWeight = t._count.pyqs;
    const progress = t.userProgress[0];
    const coverage = progress?.coverageScore || 0;
    const status = progress?.status || 'Locked';

    // ROI = (PYQ weight * (1 - coverage)) / complexity_factor
    const complexityFactor = t.difficultyTier === 'Advanced' ? 1.5 : t.difficultyTier === 'Core' ? 1.2 : 1.0;
    const roi = (pyqWeight * (1 - coverage)) / complexityFactor;

    return {
      ...t,
      subjectName: s.name,
      roi,
      coverage,
      status
    };
  }));

  return allTopics.sort((a, b) => b.roi - a.roi);
}

export async function generate30DaySprint(userId: string) {
  const topics = await getROISortedTopics(userId);
  const sprintPlan = [];

  for (let i = 0; i < 30; i++) {
    const topic = topics[i % topics.length]; // Simplified logic for demo
    sprintPlan.push({
      day: i + 1,
      topicName: topic.name,
      task: `Solve 10 high-ROI PYQs from ${topic.name}`,
      hours: topic.difficultyTier === 'Advanced' ? 4 : 2
    });
  }

  return sprintPlan;
}
