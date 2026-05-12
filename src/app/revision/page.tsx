export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth/auth";
import { RevisionEngine } from "@/lib/engines/RevisionEngine";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Calendar, ArrowRight, History, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

export default async function RevisionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const queue = await RevisionEngine.getQueue(session.user.id);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider mb-4">
                <Brain className="w-4 h-4" />
                Spaced Repetition Active
              </div>
              <h1 className="text-5xl font-jakarta font-black text-slate-900 mb-4 tracking-tight">
                Revision <span className="text-rose-600">Surety</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Our algorithm predicts your memory decay. Items appear here exactly when your probability of recall drops below 80%.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/revision/flashcards" className="btn-secondary bg-white hover:bg-slate-50 border-slate-200 px-8 shadow-sm">
                Active Recall Cards
                <Sparkles className="w-4 h-4 text-brand-500" />
              </Link>
              {queue.length > 0 && (
                <button className="btn-primary bg-slate-900 hover:bg-black px-10 shadow-xl shadow-slate-200">
                  Start Revision Session
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight">Today&apos;s Queue</h2>
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{queue.length} PYQs Pending</span>
            </div>

            {queue.length === 0 ? (
              <div className="premium-card py-24 text-center border-dashed border-2 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                   <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-jakarta font-black text-slate-900 mb-2">Crystal Clear Memory.</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm">You&apos;ve completed all revisions for today. Your conceptual retention is at its peak.</p>
                <Link href="/roadmap" className="btn-primary">
                  Continue Learning
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map(item => (
                  <div key={item.id} className="premium-card group hover:border-rose-200 transition-all">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                          item.currentRetrievability < 0.8 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {Math.round(item.currentRetrievability * 100)}%
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.pyq.topic.subject.name}</p>
                          <h3 className="text-xl font-jakarta font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
                            {item.pyq.topic.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                               <History className="w-3.5 h-3.5" />
                               Last seen {new Date(item.attemptedAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">PYQ #{item.pyq.id.slice(-4)}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/topic/${item.pyq.topic.slug}`}
                        className="btn-secondary py-2 px-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Review Item
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
             <div className="premium-card bg-slate-900 text-white border-none shadow-2xl shadow-brand-100">
                <h3 className="text-xl font-jakarta font-black mb-6">Retention Stats</h3>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                         <span>Recall Probability</span>
                         <span className="text-brand-400">High</span>
                      </div>
                      <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                         <div className="bg-brand-500 h-full w-[85%]"></div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Critical</p>
                         <p className="text-2xl font-black text-rose-500">{queue.filter(i => i.currentRetrievability < 0.8).length}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Warning</p>
                         <p className="text-2xl font-black text-amber-500">{queue.filter(i => i.currentRetrievability >= 0.8).length}</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/10">
                      <div className="flex items-start gap-3">
                         <Sparkles className="w-5 h-5 text-brand-400 shrink-0" />
                         <p className="text-xs text-slate-400 font-medium leading-relaxed">
                           Our system has identified that you struggle with <strong>Conceptual</strong> errors in Digital Logic. We&apos;ve prioritized those in today&apos;s queue.
                         </p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="premium-card">
                <h3 className="text-lg font-jakarta font-black text-slate-900 mb-4">Upcoming Reviews</h3>
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium italic">Subject {i}</span>
                        <span className="font-bold text-slate-900">Tomorrow</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
