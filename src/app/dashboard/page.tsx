export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { AnalyticsService } from "@/lib/services/AnalyticsService";
import MasteryHeatmap from "@/components/dashboard/MasteryHeatmap";
import { Activity, Flame, ShieldAlert, TrendingUp, Zap, Calendar, Users, Target, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn, formatOrdinal } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  // Fetch real-time analytics
  const stats = await AnalyticsService.getOverallStats(userId);

  const calibrationLabel = stats.isCalibrated ? "Engine Active" : `Calibration: ${stats.calibrationProgress}/50`;

  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        include: {
          userProgress: { where: { userId } }
        }
      }
    }
  });

  const dashboardMetrics = [
    { label: "Overall Mastery", value: `${stats.overallMastery}%`, icon: Activity, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Revision Streak", value: `${stats.revisionStreak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Critical Weaknesses", value: `${stats.criticalWeaknessesCount} Topics`, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
    { label: "Percentile", value: stats.peerStats ? formatOrdinal(stats.peerStats.percentile) : "Calibrating...", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20 px-4 md:px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">Command Center</h1>
             <p className="text-slate-500 font-medium text-sm md:text-base">Real-time health map of your GATE preparation.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className="bg-brand-50 text-brand-600 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Session: 2025
             </div>
             <div className={cn(
                "px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                stats.isCalibrated ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500"
             )}>
                <Zap className={cn("w-4 h-4", stats.isCalibrated ? "fill-emerald-600" : "")} />
                {calibrationLabel}
             </div>
             <Link href="/dashboard/rank-mode" className="w-full md:w-auto text-center bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-colors">
                Optimizing for Rank 1
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
           {dashboardMetrics.map((stat, i) => (
             <div key={i} className="glass-card p-5 md:p-6 flex items-center gap-4 md:gap-5">
                <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                   <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                   <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">{stat.label}</p>
                   <p className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {stats.peerStats && (
          <div className="mb-8 md:mb-12">
             <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mb-6 flex items-center gap-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
                Peer Benchmarking
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 border-l-4 border-l-emerald-500">
                   <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Standing</span>
                   </div>
                   <p className="text-3xl font-black text-slate-900 mb-1">{stats.rankEstimation}</p>
                   <p className="text-sm text-slate-500 font-medium">Rank #{stats.peerStats.rank} of {stats.peerStats.totalUsers} aspirants</p>
                </div>

                <div className="premium-card p-6 border-l-4 border-l-brand-500">
                   <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="w-5 h-5 text-brand-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery vs. Peers</span>
                   </div>
                   <div className="flex items-end gap-4">
                      <div>
                         <p className="text-3xl font-black text-brand-600">{stats.overallMastery}%</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">You</p>
                      </div>
                      <div className="h-10 w-px bg-slate-100 mb-2"></div>
                      <div>
                         <p className="text-3xl font-black text-slate-400">{stats.peerStats.averageMastery}%</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Peer Avg</p>
                      </div>
                   </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-l-orange-500">
                   <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Strength</span>
                   </div>
                   <div className="flex items-end gap-4">
                      <div>
                         <p className="text-3xl font-black text-orange-600">{Math.round(stats.peerStats.percentile)}%</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Percentile</p>
                      </div>
                      <div className="h-10 w-px bg-slate-100 mb-2"></div>
                      <div>
                         <p className="text-3xl font-black text-slate-400">{stats.peerStats.averageDiagnosticScore}%</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">Peer Avg</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
           <Zap className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
           Subject Health Map
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {subjects.map((subject) => {
             const completedCount = subject.topics.filter(t => t.userProgress[0]?.status === "Completed").length;
             const progress = (completedCount / subject.topics.length) * 100;

             return (
               <Link key={subject.id} href="/roadmap" className="premium-card group hover:scale-[1.02] transition-transform duration-300 p-6">
                  <div className="flex justify-between items-start mb-6">
                     <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-tight">{subject.name}</h3>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 ml-2">{completedCount}/{subject.topics.length}</span>
                  </div>

                  <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-8">
                     <div
                        className="absolute inset-y-0 left-0 bg-brand-600 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Topic Mastery Heatmap</span>
                        <span className="text-brand-600">{Math.round(progress)}% Coverage</span>
                     </div>
                     <MasteryHeatmap topics={subject.topics} />
                  </div>
               </Link>
             )
          })}
        </div>
      </div>
    </div>
  );
}
