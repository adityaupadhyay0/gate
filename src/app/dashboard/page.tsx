import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, Award, Zap, Calendar, Activity, ArrowRight, Brain, AlertCircle, Target as TargetIcon } from "lucide-react";
import { RevisionEngine } from "@/lib/engines/RevisionEngine";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const completedTopicsCount = await prisma.userProgress.count({
    where: { userId, status: "Completed" }
  });

  const totalTopicsCount = await prisma.topic.count();

  const totalAttempts = await prisma.attempt.count({
    where: { userId }
  });

  const correctAttempts = await prisma.attempt.count({
    where: { userId, isCorrect: true }
  });

  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  const revisionQueue = await RevisionEngine.getQueue(userId);

  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        include: {
          userProgress: { where: { userId } }
        }
      }
    }
  });

  const subjectProgress = subjects.map(s => {
    const completed = s.topics.filter(t => t.userProgress[0]?.status === 'Completed').length;
    return {
      name: s.name,
      percentage: s.topics.length > 0 ? (completed / s.topics.length) * 100 : 0,
      completed,
      total: s.topics.length
    };
  });

  const recentAttempts = await prisma.attempt.findMany({
    where: { userId },
    take: 5,
    orderBy: { attemptedAt: 'desc' },
    include: { pyq: { include: { topic: { include: { subject: true } } } } }
  });

  const weakConcepts = await prisma.mistakeLog.groupBy({
    by: ['pyqId'],
    where: { userId },
    _count: { _all: true },
    orderBy: { _count: { pyqId: 'desc' } },
    take: 3
  });

  const weakConceptsDetails = await Promise.all(weakConcepts.map(async (wc) => {
    const pyq = await prisma.pYQ.findUnique({
      where: { id: wc.pyqId },
      include: { topic: { include: { subject: true } } }
    });
    return {
      concept: pyq?.topic.name,
      subject: pyq?.topic.subject.name,
      count: wc._count._all
    };
  }));

  const overallCoverage = totalTopicsCount > 0 ? (completedTopicsCount / totalTopicsCount) : 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-3">Aspirant Dashboard</p>
              <h1 className="text-4xl font-jakarta font-black text-slate-900 tracking-tight">
                Welcome back, {session.user.name?.split(' ')[0]}
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <div>
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight">Active Streak</p>
                   <p className="text-xl font-black text-slate-900 leading-none">0 Days</p>
                </div>
              </div>
              <div className="bg-brand-600 px-6 py-3 rounded-2xl text-white shadow-lg shadow-brand-200 flex items-center gap-3">
                 <Award className="w-5 h-5" />
                 <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-tight">Estimated Rank</p>
                    <p className="text-xl font-black leading-none">#--</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Syllabus Coverage', value: `${completedTopicsCount}/${totalTopicsCount}`, icon: TargetIcon, color: 'brand' },
            { label: 'Total Attempts', value: totalAttempts, icon: Activity, color: 'slate' },
            { label: 'Global Accuracy', value: `${accuracy.toFixed(1)}%`, icon: TrendingUp, color: 'emerald' },
            { label: 'Revision Due', value: `${revisionQueue.length} PYQs`, icon: Brain, color: 'rose' },
          ].map((stat, i) => (
            <div key={i} className="premium-card !p-8 flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-jakarta font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight">Syllabus Health Map</h2>
                 <Link href="/roadmap" className="text-xs font-bold text-brand-600 hover:underline">View Roadmap</Link>
              </div>
              <div className="premium-card space-y-8">
                 {subjectProgress.map((subject, i) => (
                   <div key={subject.name} className="space-y-2">
                     <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-slate-700">{subject.name}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase">{Math.round(subject.percentage)}% Completed</span>
                     </div>
                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner-soft">
                       <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${subject.percentage}%` }}></div>
                     </div>
                   </div>
                 ))}
              </div>
            </section>

            <section>
               <h2 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight mb-6">Recent Activity</h2>
               <div className="premium-card divide-y divide-slate-100 !p-0 overflow-hidden">
                  {recentAttempts.length > 0 ? recentAttempts.map(attempt => (
                    <div key={attempt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${attempt.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                             {attempt.isCorrect ? '✓' : '×'}
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">Attempted {attempt.pyq.topic.name}</p>
                             <p className="text-xs text-slate-400 font-medium">{attempt.pyq.topic.subject.name} • {new Date(attempt.attemptedAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${attempt.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                         {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                       </span>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-slate-400 font-medium italic">No recent activity found.</div>
                  )}
               </div>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight mb-6">Revision Queue</h2>
              <div className="premium-card border-rose-100 bg-rose-50/10">
                 <div className="flex items-center gap-3 text-rose-600 mb-4">
                    <Brain className="w-6 h-6" />
                    <span className="font-jakarta font-black text-xl">{revisionQueue.length} Needs Attention</span>
                 </div>
                 <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                   Based on your memory decay and mistake patterns, these items are at risk of being forgotten.
                 </p>
                 <Link href="/revision" className="btn-primary w-full bg-rose-600 hover:bg-rose-700 shadow-rose-200">
                    Start Revision Session
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-jakarta font-black text-slate-900 tracking-tight mb-6">Weak Concepts</h2>
              <div className="space-y-3">
                 {weakConceptsDetails.length > 0 ? weakConceptsDetails.map((item, i) => (
                   <div key={i} className="premium-card !p-4 border-l-4 border-l-rose-500">
                      <div className="flex items-start gap-3">
                         <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                         <div>
                            <p className="font-black text-slate-900 leading-tight">{item.concept}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">{item.subject}</p>
                            <p className="text-[10px] font-black text-rose-600 bg-rose-50 inline-block px-2 py-0.5 rounded uppercase tracking-tighter">
                              {item.count} mistakes logged
                            </p>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-6 text-slate-400 text-sm italic">No significant weak concepts yet.</div>
                 )}
              </div>
            </section>

            <section className={`premium-card ${overallCoverage >= 0.8 ? 'bg-brand-600' : 'bg-slate-900'} text-white`}>
               <h3 className="text-lg font-jakarta font-black mb-2 flex items-center gap-2">
                 <Zap className={`w-4 h-4 ${overallCoverage >= 0.8 ? 'text-white' : 'text-brand-400'}`} />
                 Rank Mode
               </h3>
               {overallCoverage >= 0.8 ? (
                 <>
                   <p className="text-xs text-brand-100 font-medium mb-6 leading-relaxed">
                     Congratulations! You have achieved critical syllabus coverage. Precision Mode is now active.
                   </p>
                   <Link href="/dashboard/rank-mode" className="btn-secondary !bg-white !text-brand-600 !border-none !py-2 w-full text-center">
                      Enter Rank Optimizer
                   </Link>
                 </>
               ) : (
                 <>
                   <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                     Unlocked when all core subjects reach 80% coverage.
                   </p>
                   <div className="w-full bg-slate-800 h-2 rounded-full mb-2">
                     <div className="bg-brand-500 h-full transition-all" style={{ width: `${overallCoverage * 100}%` }}></div>
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{Math.round(overallCoverage * 100)}% UNLOCKED</p>
                 </>
               )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
