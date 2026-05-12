export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { Activity, Flame, ShieldAlert, TrendingUp, Zap, Calendar, Grid3X3, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MasteryHeatmap from "@/components/MasteryHeatmap";
import { BenchmarkingEngine } from "@/lib/engines/BenchmarkingEngine";
import { MistakeAnalyzer } from "@/lib/engines/MistakeAnalyzer";
import ConceptualBlockers from "@/components/ConceptualBlockers";
import { unstable_cache } from "next/cache";

const getCachedSubjects = (userId: string) => unstable_cache(
  async () => prisma.subject.findMany({
    include: {
      topics: {
        include: {
          userProgress: { where: { userId } },
        }
      }
    }
  }),
  [`subjects-${userId}`],
  { revalidate: 3600, tags: [`user-progress-${userId}`] }
)();

const getCachedBenchmark = (userId: string) => unstable_cache(
  async () => BenchmarkingEngine.getStats(userId),
  [`benchmark-${userId}`],
  { revalidate: 3600, tags: [`user-progress-${userId}`] }
)();

const getCachedUser = (userId: string) => unstable_cache(
  async () => prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true }
  }),
  [`user-streak-${userId}`],
  { revalidate: 3600, tags: [`user-streak-${userId}`] }
)();

const getCachedMistakes = (userId: string) => unstable_cache(
  async () => MistakeAnalyzer.run(userId),
  [`mistakes-${userId}`],
  { revalidate: 3600, tags: [`user-mistakes-${userId}`] }
)();

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  const [subjects, benchmarkStats, user, mistakeAnalysis] = await Promise.all([
    getCachedSubjects(userId),
    getCachedBenchmark(userId),
    getCachedUser(userId),
    getCachedMistakes(userId)
  ]);

  const heatmapData = subjects.map(s => ({
    id: s.id,
    name: s.name,
    topics: s.topics.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      coverageScore: t.userProgress[0]?.coverageScore || 0
    }))
  }));

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
             <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Command Center</h1>
             <p className="text-slate-500 font-medium">Real-time health map of your GATE preparation.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Session: 2025
             </div>
             <Link href="/dashboard/analytics" className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
             </Link>
             <Link href="/dashboard/rank-mode" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-colors">
                Optimizing for Rank 1
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           {[
             { label: "Overall Mastery", value: `${benchmarkStats.userAverage}%`, icon: Activity, color: "text-brand-600", bg: "bg-brand-50" },
             { label: "Revision Streak", value: `${user?.currentStreak || 0} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
             { label: "Critical Weaknesses", value: "8 Topics", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
             { label: "Rank Estimation", value: benchmarkStats.estimatedRank, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
           ].map((stat, i) => (
             <div key={i} className="glass-card p-6 flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-3">
              <Zap className="w-6 h-6 text-brand-500" />
              Subject Health Map
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {subjects.map((subject) => {
                const completedCount = subject.topics.filter(t => t.userProgress[0]?.status === "Completed").length;
                const progress = (completedCount / subject.topics.length) * 100;

                return (
                  <Link key={subject.id} href="/roadmap" className="premium-card group">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{subject.name}</h3>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{completedCount}/{subject.topics.length}</span>
                    </div>

                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                      <div
                        className="absolute inset-y-0 left-0 bg-brand-600 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden">
                      {subject.topics.slice(0, 8).map(topic => {
                        const status = topic.userProgress[0]?.status || "Locked";
                        return (
                          <div
                            key={topic.id}
                            className={cn(
                              "w-2.5 h-2.5 rounded-full flex-shrink-0",
                              status === "Completed" ? "bg-emerald-500" :
                              status === "InProgress" ? "bg-brand-500 animate-pulse" :
                              "bg-slate-200"
                            )}
                            title={topic.name}
                          />
                        )
                      })}
                      {subject.topics.length > 8 && <span className="text-[10px] font-bold text-slate-300">+{subject.topics.length - 8}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <aside className="space-y-8 sticky top-32">
            <div className="glass-card p-10">
               <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-8 flex items-center gap-3">
               <Grid3X3 className="w-6 h-6 text-emerald-500" />
               Mastery Heatmap
               </h2>
               <MasteryHeatmap subjects={heatmapData} />
            </div>

            {mistakeAnalysis && (
               <div className="glass-card p-10">
                  <ConceptualBlockers blockers={mistakeAnalysis.topBlockers} />
               </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
