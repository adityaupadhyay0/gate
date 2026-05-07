export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import { RoadmapEngine } from "@/lib/engines/RoadmapEngine";
import { Target, Lock, CheckCircle2, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function RoadmapPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";
  const roadmap = await RoadmapEngine.generate(userId);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                <Target className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Your Study Path</h1>
                <p className="text-slate-500 font-medium">ROI-optimized sequencing based on your diagnostic results.</p>
             </div>
          </div>
        </div>

        <div className="relative space-y-12">
          <div className="roadmap-line" />

          {roadmap.map((subject) => (
            <div key={subject.id} className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
                    {subject.name}
                 </div>
                 <div className="h-[2px] flex-grow bg-slate-100"></div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{subject.topics.length} Topics</span>
              </div>

              <div className="grid grid-cols-1 gap-4 ml-2 md:ml-6">
                {subject.topics.map((topic, tIdx) => {
                  const status = topic.userProgress[0]?.status || (topic.isUnlocked ? "Active" : "Locked");
                  const isLocked = status === "Locked";
                  const isCompleted = status === "Completed";
                  const isInProgress = status === "InProgress";

                  return (
                    <Link
                      key={topic.id}
                      href={isLocked ? "#" : `/topic/${topic.slug}`}
                      className={cn(
                        "group relative flex items-center gap-6 p-6 rounded-[2rem] transition-all duration-300",
                        isLocked
                          ? "bg-slate-50 opacity-60 cursor-not-allowed border-2 border-transparent"
                          : "bg-white border-2 border-slate-50 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/5 hover:-translate-y-1"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        isLocked ? "bg-slate-200 text-slate-400" :
                        isCompleted ? "bg-emerald-50 text-emerald-500" :
                        "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white"
                      )}>
                        {isLocked ? <Lock className="w-6 h-6" /> :
                         isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                         <div className="text-lg font-black">{tIdx + 1}</div>}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={cn(
                            "text-lg font-black tracking-tight",
                            isLocked ? "text-slate-400" : "text-slate-900"
                          )}>
                            {topic.name}
                          </h3>
                          <span className={cn(
                            "badge-premium",
                            topic.difficultyTier === "Foundational" ? "bg-emerald-50 text-emerald-600" :
                            topic.difficultyTier === "Core" ? "bg-brand-50 text-brand-600" :
                            "bg-purple-50 text-purple-600"
                          )}>
                            {topic.difficultyTier}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              PYQ Intensity: {topic._count?.pyqs || '0'}
                           </p>
                           {isInProgress && (
                             <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">In Progress</span>
                           )}
                        </div>
                      </div>

                      {!isLocked && (
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Link>
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
