import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { RoadmapEngine } from "@/lib/engines/RoadmapEngine";
import { Lock } from "lucide-react";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Please sign in to view your personalized roadmap.</div>;

  const subjects = await RoadmapEngine.generate(session.user.id);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your GATE Mastery Roadmap</h1>
        <p className="text-gray-500">ROI-prioritized topics based on your strengths and exam weightage.</p>
      </div>

      <div className="space-y-16">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
                {subject.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{subject.name}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Core Subject</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subject.topics.map((topic) => {
                const isCompleted = topic.userProgress?.[0]?.status === 'Completed';
                const isUnlocked = topic.isUnlocked || topic.prerequisites.length === 0;

                return (
                  <div key={topic.id} className="relative group">
                    <div className={`h-full p-6 border-2 rounded-2xl transition-all ${
                      isCompleted ? 'border-green-200 bg-green-50/30' :
                      !isUnlocked ? 'border-gray-100 bg-gray-50/50 opacity-75' :
                      'border-white bg-white shadow-sm hover:shadow-xl hover:-translate-y-1'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className={`font-bold text-lg ${!isUnlocked ? 'text-gray-400' : 'text-gray-900'}`}>
                               {topic.name}
                             </h3>
                             {!isUnlocked && <Lock size={14} className="text-gray-400" />}
                          </div>
                          <div className="flex gap-2">
                             <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">
                               ROI: {topic.roiScore.toFixed(1)}
                             </span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tight ${
                          topic.difficultyTier === 'Foundational' ? 'bg-green-100 text-green-700' :
                          topic.difficultyTier === 'Core' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {topic.difficultyTier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                           <span className="text-xs text-gray-500 font-medium">{topic._count.pyqs} PYQs Available</span>
                        </div>

                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                            <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-[10px]">✓</span>
                            Mastered
                          </span>
                        ) : !isUnlocked ? (
                          <span className="text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full">Prerequisites Needed</span>
                        ) : (
                          <Link
                            href={`/topic/${topic.slug}`}
                            className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-sm"
                          >
                            Start Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
