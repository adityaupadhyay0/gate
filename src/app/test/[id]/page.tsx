import prisma from "@/lib/db/prisma";
import TestPlayer from "./TestPlayer";
import { notFound } from "next/navigation";

export default async function TestPage({ params }: { params: { id: string } }) {
  // In real app, 'id' might be a subjectId or a testId
  // For demo, using it as subject slug
  const subject = await prisma.subject.findUnique({
    where: { slug: params.id },
    include: {
      topics: {
        include: {
          pyqs: {
            take: 5
          }
        }
      }
    }
  });

  if (!subject) notFound();

  const questions = subject.topics.flatMap(t => t.pyqs).slice(0, 30);

  return <TestPlayer questions={questions} />;
}
