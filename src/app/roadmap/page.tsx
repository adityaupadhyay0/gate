import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";

export default async function RoadmapPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        orderBy: {
          dependencyOrder: 'asc'
        },
        include: {
          userProgress: userId ? { where: { userId } } : false
        }
      }
    }
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">GATE Roadmap Preview</h1>
      <div className="space-y-12">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Subject</span>
              <h2 className="text-2xl font-bold text-gray-800">{subject.name}</h2>
            </div>

            <div className="ml-4 border-l-4 border-gray-100 pl-8 space-y-6 relative">
              {subject.topics.map((topic, index) => (
                <div key={topic.id} className="relative">
                  <div className="absolute -left-[38px] top-4 w-4 h-4 rounded-full border-4 border-white bg-blue-600 ring-4 ring-gray-100"></div>
                  <div className={`p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow ${
                    index > 0 && !subject.topics[index-1].userProgress?.[0] ? 'opacity-60 grayscale' : ''
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{topic.name}</h3>
                        {index > 0 && !subject.topics[index-1].userProgress?.[0] && <span>🔒</span>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        topic.difficultyTier === 'Foundational' ? 'bg-green-100 text-green-700' :
                        topic.difficultyTier === 'Core' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {topic.difficultyTier}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{topic.slug.length % 15 + 5} PYQs Available</span>
                      <span>•</span>
                      {topic.userProgress?.[0]?.status === 'Completed' ? (
                        <span className="text-green-600 font-bold">Completed</span>
                      ) : index > 0 && !subject.topics[index-1].userProgress?.[0] ? (
                        <span className="text-gray-400">Locked</span>
                      ) : (
                        <Link href={`/topic/${topic.slug}`} className="text-blue-600 font-bold hover:underline">Start Learning</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
