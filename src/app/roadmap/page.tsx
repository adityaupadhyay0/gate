import { auth } from "@/lib/auth/auth";
import { RoadmapEngine } from "@/lib/engines/RoadmapEngine";
import { Target, Lock, CheckCircle2, ArrowRight, Star, BarChart3, Binary } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import RoadmapSearch from "@/components/RoadmapSearch";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id || "guest";
  let roadmap = await RoadmapEngine.generate(userId);

  const query = searchParams?.q?.toLowerCase();
  if (query) {
    roadmap = roadmap.map(subject => ({
      ...subject,
      topics: subject.topics.filter(topic =>
        topic.name.toLowerCase().includes(query) ||
        topic.difficultyTier.toLowerCase().includes(query)
      )
    })).filter(subject => subject.topics.length > 0);
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50/50">
      {/* Quick Navigation Sidebar */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 z-50">
        {roadmap.map((subject) => (
          <a
            key={subject.id}
            href={`#subject-${subject.id}`}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black hover:bg-brand-600 hover:text-white hover:scale-110 transition-all shadow-sm group relative"
          >
            {subject.name.substring(0, 2).toUpperCase()}
            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
               {subject.name}
            </div>
          </a>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-glow">
                <Target className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900">Aspirant Roadmap</h1>
                <p className="text-slate-500 font-medium text-lg">Your deterministic path to Rank 1.</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
             <RoadmapSearch />
             <div className="glass-card px-6 py-3 flex items-center gap-4 border-slate-200">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                <div className="h-8 w-[1px] bg-slate-100" />
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Total Intensity</p>
                   <p className="text-sm font-bold text-slate-900">High Volume</p>
                </div>
             </div>
          </div>
        </div>

        <div className="relative space-y-16">
          <div className="roadmap-line ml-4 md:ml-8" />

          {roadmap.map((subject) => (
            <div key={subject.id} id={`subject-${subject.id}`} className="relative z-10 scroll-mt-32">
              <div className="flex items-center gap-4 mb-10">
                 <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl">
                    {subject.name}
                 </div>
                 <div className="h-[2px] flex-grow bg-brand-500/10"></div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1 rounded-full">{subject.topics.length} Modules</span>
              </div>

              <div className="grid grid-cols-1 gap-6 ml-4 md:ml-12">
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
                        "group relative flex flex-col md:flex-row md:items-center gap-8 p-8 rounded-[2.5rem] transition-all duration-500",
                        isLocked
                          ? "bg-white/40 grayscale pointer-events-none border border-transparent shadow-none"
                          : "bg-white border-2 border-slate-50 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 active:scale-[0.98]"
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-all duration-500",
                        isLocked ? "bg-slate-100 text-slate-400" :
                        isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-12" :
                        "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white"
                      )}>
                        {isLocked ? <Lock className="w-7 h-7" /> :
                         isCompleted ? <CheckCircle2 className="w-8 h-8" /> :
                         <div className="text-2xl font-black">{tIdx + 1}</div>}
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className={cn(
                            "text-xl font-black tracking-tight",
                            isLocked ? "text-slate-400" : "text-slate-900"
                          )}>
                            {topic.name}
                          </h3>
                          <div className="flex gap-2">
                              <span className={cn(
                                "badge-premium border",
                                topic.difficultyTier === "Foundational" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                topic.difficultyTier === "Core" ? "bg-brand-50 text-brand-600 border-brand-100" :
                                "bg-purple-50 text-purple-600 border-purple-100"
                              )}>
                                {topic.difficultyTier}
                              </span>
                              <span className="badge-premium bg-slate-900 text-white flex items-center gap-1">
                                 <Binary className="w-2.5 h-2.5" />
                                 Years: 15+
                              </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-6">
                           <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              PYQ Load: <span className="text-slate-900 ml-1">{topic._count?.pyqs || '0'} Real</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              Class: Theoretical + Numerical
                           </div>
                           {isInProgress && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-brand-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                In Progress
                             </div>
                           )}
                        </div>
                      </div>

                      {!isLocked && (
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all group-hover:rotate-45">
                           <ArrowRight className="w-6 h-6" />
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
