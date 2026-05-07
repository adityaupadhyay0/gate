export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import { RankOptimizer } from "@/lib/engines/RankOptimizer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Target, TrendingUp, Calendar, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

export default async function RankModePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const plan = await RankOptimizer.generateSprintPlan(session.user.id);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-brand-600 py-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-6">
                <Zap className="w-4 h-4 fill-white" />
                Rank Optimization Active
             </div>
             <h1 className="text-6xl font-jakarta font-black mb-6 tracking-tight">Precision <span className="text-brand-200">Sprints.</span></h1>
             <p className="text-xl text-brand-100 font-medium leading-relaxed">
               The syllabus is covered. Now, we optimize for every single mark. We focus on High-ROI topics and memory-critical PYQs to maximize your percentile.
             </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-jakarta font-black text-slate-900">Your 30-Day High-ROI Sprint</h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Phase 1: Precision Focus</span>
                 </div>

                 <div className="space-y-4">
                    {plan.priorityTargets.map((topic, i) => (
                      <div key={topic.id} className="premium-card group hover:border-brand-500 transition-all flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                               {i + 1}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-0.5">{topic.subject.name}</p>
                               <h3 className="text-xl font-jakarta font-bold text-slate-900">{topic.name}</h3>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-slate-400 font-medium">ROI Score: <span className="text-slate-900 font-bold">{Math.round(topic.roiScore)}</span></span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <span className="text-xs text-slate-400 font-medium">{topic._count.pyqs} PYQs Remaining</span>
                               </div>
                            </div>
                         </div>
                         <Link href={`/topic/${topic.slug}`} className="btn-primary py-2 px-4 text-xs opacity-0 group-hover:opacity-100 transition-all">
                            Solve Targets
                         </Link>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           <div className="space-y-8">
              <div className="premium-card bg-slate-900 text-white">
                 <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-jakarta font-black">Rank Projection</h3>
                 </div>

                 <div className="space-y-8">
                    <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Projected Improvement</p>
                       <p className="text-5xl font-black text-emerald-400">+{plan.estimatedRankImprovement}</p>
                       <p className="text-xs text-slate-400 mt-2 font-medium">Rank slots gained through precision sprint.</p>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                       <div className="flex items-center gap-3 mb-4">
                          <Calendar className="w-5 h-5 text-brand-400" />
                          <p className="text-sm font-bold">Exam Countdown</p>
                       </div>
                       <p className="text-3xl font-black">{plan.daysToExam} Days Left</p>
                    </div>
                 </div>
              </div>

              <div className="premium-card">
                 <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-brand-600" />
                    <h3 className="text-xl font-jakarta font-black text-slate-900">Critical Revision</h3>
                 </div>
                 <div className="space-y-4">
                    {plan.revisionTargets.map((item) => (
                      <Link key={item.id} href={`/topic/${item.pyq.topic.slug}`} className="block group">
                         <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-rose-200 group-hover:bg-rose-50 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-rose-600">{item.pyq.topic.name}</p>
                            <div className="flex justify-between items-end">
                               <span className="text-sm font-bold text-slate-700">Recall Probability</span>
                               <span className="text-sm font-black text-rose-600">{Math.round(item.currentRetrievability * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                               <div className="bg-rose-500 h-full" style={{ width: `${item.currentRetrievability * 100}%` }}></div>
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                 <div className="flex gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                       <p className="font-bold text-amber-900 text-sm mb-1">Rank 1 Strategy</p>
                       <p className="text-xs text-amber-700 font-medium leading-relaxed">
                         Avoid new topics. Focus on the 10 High-ROI targets above. Every mark in these topics is worth 500 rank positions at this stage.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
