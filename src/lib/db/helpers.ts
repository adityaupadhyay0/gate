import prisma from "@/lib/db/prisma";

export async function getSubjects() {
  return await prisma.subject.findMany({
    include: {
      topics: {
        orderBy: {
          dependencyOrder: 'asc'
        }
      }
    }
  });
}

export async function getTopicBySlug(slug: string) {
  return await prisma.topic.findUnique({
    where: { slug },
    include: {
      subject: true,
      pyqs: true,
      summaries: true,
      resources: true
    }
  });
}
