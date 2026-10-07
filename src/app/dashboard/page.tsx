export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { AnalyticsService } from "@/lib/services/AnalyticsService";
import MasteryHeatmap from "@/components/dashboard/MasteryHeatmap";
import { Activity, Flame, ShieldAlert, TrendingUp, Zap, Calendar, Users, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  // Fetch real-time analytics with peer benchmarking
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
    {
      label: "Overall Mastery",
      value: `${stats.overallMastery}%`,
      subValue: "Syllabus Coverage",
      icon: Activity,
      color: "text-brand-600",
      bg: "bg-brand-50"
    },
    {
      label: "Revision Streak",
      value: `${stats.revisionStreak} Days`,
      subValue: "Active Retention Engine",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      label: "Critical Weaknesses",
      value: `${stats.criticalWeaknessesCount} Topics`,
      subValue: "Focus Priority",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      label: "Rank Estimation",
      value: stats.rankEstimation,
      subValue: `Top ${stats.topPercentile}%`,
      subValueHighlight: true,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
  ];

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20 px-4 md:px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-2">Command Center</h1>
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
             <div key={i} className="glass-card p-5 md:p-6 flex items-start gap-4 md:gap-5">
                <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                   <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">{stat.label}</p>
                   <p className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 truncate">{stat.value}</p>
                   <p className={cn(
                     "text-[11px] font-semibold mt-1",
                     stat.subValueHighlight ? "text-emerald-600 font-black" : "text-slate-500"
                   )}>
                     {stat.subValue}
                   </p>
                </div>
             </div>
           ))}
        </div>

        {/* Global Peer Benchmarking Section */}
        <div className="glass-card p-6 md:p-8 mb-8 md:mb-12 bg-gradient-to-br from-white via-slate-50 to-brand-50/20 border border-slate-200/80 shadow-sm rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-black tracking-tighter text-slate-900">Global Peer Benchmarking</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Live Cohort
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Estimated rank and percentile calibrated against current GATE aspirants.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/80 backdrop-blur p-3 rounded-2xl border border-slate-200/60 shadow-xs shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Percentile</p>
                <p className="text-xl font-black tracking-tighter text-emerald-600">Top {stats.topPercentile}%</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Benchmark Score</p>
                <p className="text-xl font-black tracking-tighter text-slate-900">{stats.benchmarkScore}<span className="text-xs text-slate-400 font-semibold">/100</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>Cohort Standing ({stats.totalCandidates} Aspirants)</span>
              <span className="text-emerald-600 font-black">Ahead of {stats.peerPercentile}% of Candidates</span>
            </div>
            <div className="relative h-3 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(5, stats.peerPercentile)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 pt-1">
              <span>0th Percentile</span>
              <span>50th Percentile (Median)</span>
              <span className="text-emerald-600">99th Percentile (Rank 1 Zone)</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
           <Zap className="w-5 h-5 md:w-6 md:h-6 text-brand-500" />
           Subject Health Map
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {subjects.map((subject) => {
             const completedCount = subject.topics.filter(t => t.userProgress[0]?.status === "Completed").length;
             const progress = subject.topics.length > 0 ? (completedCount / subject.topics.length) * 100 : 0;

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
