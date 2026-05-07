import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { RoadmapEngine } from "@/lib/engines/RoadmapEngine";
import { Lock, CheckCircle2, ChevronRight, Zap, Target } from "lucide-react";

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-jakarta font-black mb-4">Your Roadmap is Waiting.</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Sign in to generate your personalized, ROI-prioritized learning path for GATE 2025.</p>
        <Link href="/" className="btn-primary inline-flex">Return Home</Link>
      </div>
    );
  }

  const subjects = await RoadmapEngine.generate(session.user.id);

  return (
    <div className="roadmap-gradient min-h-screen pb-20">
      <div className="container mx-auto px-6 pt-12">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-black uppercase tracking-wider mb-4">
            <Target className="w-4 h-4" />
            Deterministic Path
          </div>
          <h1 className="text-5xl font-jakarta font-black text-slate-900 mb-4 tracking-tight">
            The Mastery <span className="text-brand-600">Roadmap</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            We&apos;ve calculated the shortest path to Rank 1 by balancing exam weight, your current weak areas, and subject dependencies.
          </p>
        </div>

        <div className="space-y-24">
          {subjects.map((subject, sIdx) => (
            <div key={subject.id} className="relative">
              {/* Timeline Line */}
              {sIdx < subjects.length - 1 && (
                <div className="absolute left-7 top-20 bottom-0 w-1 bg-gradient-to-b from-brand-100 to-transparent -z-10"></div>
              )}

              <div className="flex items-start gap-8 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-premium flex items-center justify-center border border-slate-100 shrink-0">
                  <span className="text-2xl font-black text-brand-600">{sIdx + 1}</span>
                </div>
                <div className="pt-2">
                  <h2 className="text-3xl font-jakarta font-black text-slate-900 mb-1">{subject.name}</h2>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{subject.topics.length} Topics</span>
                    <span>•</span>
                    <span>{subject.topics.reduce((acc, t) => acc + t._count.pyqs, 0)} Total PYQs</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-0 lg:ml-20">
                {subject.topics.map((topic) => {
                  const isCompleted = topic.userProgress?.[0]?.status === 'Completed';
                  const isUnlocked = topic.isUnlocked || topic.prerequisites.length === 0;

                  return (
                    <div key={topic.id} className="group">
                      <div className={`premium-card h-full flex flex-col border-2 transition-all duration-300 ${
                        isCompleted ? 'border-green-100 bg-green-50/20' :
                        !isUnlocked ? 'border-slate-50 bg-slate-50/50 opacity-60' :
                        'border-white hover:border-brand-200'
                      }`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                               <h3 className={`font-jakarta font-bold text-xl tracking-tight ${!isUnlocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                 {topic.name}
                               </h3>
                               {!isUnlocked && <Lock size={16} className="text-slate-300" />}
                               {isCompleted && <CheckCircle2 size={20} className="text-green-500" />}
                            </div>
                            <div className="flex flex-wrap gap-2">
                               <span className="inline-flex items-center gap-1 text-[10px] bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md font-black uppercase tracking-wider">
                                 <Zap className="w-3 h-3" />
                                 ROI: {topic.roiScore.toFixed(1)}
                               </span>
                               <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider ${
                                topic.difficultyTier === 'Foundational' ? 'bg-emerald-50 text-emerald-700' :
                                topic.difficultyTier === 'Core' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {topic.difficultyTier}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                          <div className="text-sm font-bold text-slate-500">
                             {topic._count.pyqs} <span className="text-slate-300">PYQs</span>
                          </div>

                          {isCompleted ? (
                            <div className="text-green-600 font-bold text-sm">Mastered</div>
                          ) : !isUnlocked ? (
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Prerequisites needed</div>
                          ) : (
                            <Link
                              href={`/topic/${topic.slug}`}
                              className="btn-primary py-2 px-4 text-xs group/btn"
                            >
                              Start Learning
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
    </div>
  );
}
