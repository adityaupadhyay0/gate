import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import {
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  ChevronLeft,
  Zap,
  Brain
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest";

  // 1. Fetch Subject Mastery & ROI
  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        include: {
          userProgress: { where: { userId } },
          resources: true
        }
      }
    }
  });

  const subjectStats = subjects.map(s => {
    const totalTopics = s.topics.length;
    const completedTopics = s.topics.filter(t => t.userProgress[0]?.status === "Completed").length;
    const mastery = Math.round((completedTopics / totalTopics) * 100);

    // ROI Calculation: Average Learning Gain / Time Spent (from resources)
    const avgGain = s.topics.reduce((acc, t) => acc + (t.resources?.learningGain || 0), 0) / totalTopics;
    const avgTime = s.topics.reduce((acc, t) => acc + (t.resources?.totalTimeSpent || 0), 0) / totalTopics;
    const roi = avgTime > 0 ? (avgGain / avgTime) * 100 : 0;

    return { name: s.name, mastery, roi: Math.round(roi * 10) / 10 };
  });

  // 2. Mistake Distribution (Aggregation)
  const mistakeLogs = await prisma.mistakeLog.findMany({
    where: { userId },
    select: { mistakeType: true }
  });

  const mistakeTypes = {
    'Conceptual': mistakeLogs.filter(l => l.mistakeType === 'Conceptual').length,
    'TimePressure': mistakeLogs.filter(l => l.mistakeType === 'TimePressure').length,
    'Silly': mistakeLogs.filter(l => l.mistakeType === 'Silly').length,
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Command Center
          </Link>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">Advanced Analytics</h1>
          <p className="text-slate-500 font-medium mt-2">Deep-dive into your Rank 1 trajectory.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           {/* ROI Matrix */}
           <div className="lg:col-span-2 glass-card p-10">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900">Subject ROI Analysis</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Learning Gain vs. Time Investment</p>
                 </div>
                 <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                    <Zap className="w-6 h-6" />
                 </div>
              </div>

              <div className="space-y-8">
                 {subjectStats.slice(0, 6).map((stat, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <span className="font-bold text-slate-700">{stat.name}</span>
                          <span className="text-xs font-black text-brand-600 uppercase tracking-widest">ROI: {stat.roi}x</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 transition-all duration-1000"
                            style={{ width: `${Math.min(100, stat.roi * 20)}%` }}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Error Distribution */}
           <div className="glass-card p-10">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-black text-slate-900">Error Profile</h2>
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                    <Brain className="w-6 h-6" />
                 </div>
              </div>

              <div className="space-y-8">
                 {Object.entries(mistakeTypes).map(([type, count], i) => (
                    <div key={i} className="flex items-center gap-6">
                       <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                          type === 'Conceptual' ? "bg-red-50 text-red-600" :
                          type === 'TimePressure' ? "bg-orange-50 text-orange-600" :
                          "bg-slate-50 text-slate-400"
                       )}>
                          {count}
                       </div>
                       <div>
                          <p className="text-sm font-black uppercase tracking-widest text-slate-900">{type}</p>
                          <p className="text-xs font-bold text-slate-400">Total occurrences detected</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] text-white">
                 <h4 className="text-xs font-black uppercase tracking-widest text-brand-400 mb-2">AI Diagnosis</h4>
                 <p className="text-sm font-medium leading-relaxed opacity-80">
                    Your '{Object.entries(mistakeTypes).sort((a,b) => b[1]-a[1])[0][0]}' errors are the primary bottleneck. Focus on foundational concepts in OS and Networks.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
