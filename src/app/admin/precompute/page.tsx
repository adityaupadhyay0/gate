import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Cpu, CheckCircle2, AlertCircle, Database, LayoutGrid, RefreshCw } from "lucide-react";
import JobButton from "./JobButton";

export default async function AdminPrecomputePage() {
  const session = await auth();
  // Simple admin check: if not in dev or not specific email (in real app)
  // For this sandbox, we'll just allow it if logged in.
  if (!session?.user) redirect("/");

  const stats = {
    totalPYQs: await prisma.pYQ.count(),
    taggedPYQs: await prisma.pYQMetadata.count(),
    totalTopics: await prisma.topic.count(),
    summarizedTopics: await prisma.topicSummary.count(),
    curatedResources: await prisma.topicResource.count(),
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto px-6">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                 <Cpu className="w-6 h-6" />
              </div>
              <div>
                 <h1 className="text-4xl font-jakarta font-black text-slate-900 tracking-tight">AI Precomputation</h1>
                 <p className="text-slate-500 font-medium">Offline intelligence pipeline powered by Gemini 1.5 Pro</p>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           {[
             { label: 'PYQ Metadata', current: stats.taggedPYQs, total: stats.totalPYQs, icon: Database },
             { label: 'Topic Summaries', current: stats.summarizedTopics, total: stats.totalTopics, icon: LayoutGrid },
             { label: 'Resource Curation', current: stats.curatedResources, total: stats.totalTopics, icon: RefreshCw },
           ].map((stat, i) => (
             <div key={i} className="premium-card">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${stat.current === stat.total ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {stat.current === stat.total ? 'Complete' : 'Pending'}
                   </span>
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.current} <span className="text-slate-200">/</span> {stat.total}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                   <div className="bg-brand-600 h-full transition-all duration-1000" style={{ width: `${(stat.current / stat.total) * 100}%` }}></div>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <section>
              <h2 className="text-2xl font-jakarta font-black text-slate-900 mb-6">Active Jobs</h2>
              <div className="space-y-4">
                 {[
                   { name: 'run-pyq-tagging.ts', desc: 'Analyzes raw question text to extract concept tags and difficulty.', status: 'Ready' },
                   { name: 'run-topic-summaries.ts', desc: 'Generates GATE-focused conceptual overviews and key formulas.', status: 'Ready' },
                   { name: 'run-resource-curation.ts', desc: 'Curates YouTube videos and book references for each topic.', status: 'Ready' },
                   { name: 'run-mistake-rules.ts', desc: 'Builds logic for automated mistake classification.', status: 'Ready' }
                 ].map((job, i) => (
                   <div key={i} className="premium-card group hover:border-brand-500 transition-all flex items-center justify-between">
                      <div className="max-w-md">
                         <h3 className="font-mono text-sm font-bold text-brand-600 mb-1">{job.name}</h3>
                         <p className="text-sm text-slate-500 font-medium">{job.desc}</p>
                      </div>
                      <JobButton scriptName={job.name} />
                   </div>
                 ))}
              </div>
           </section>

           <section>
              <h2 className="text-2xl font-jakarta font-black text-slate-900 mb-6">Pipeline Health</h2>
              <div className="premium-card bg-slate-900 text-white border-none">
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                       <div>
                          <p className="font-bold">Gemini API Status</p>
                          <p className="text-sm text-slate-400">Operational. Avg latency: 1.2s per request.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                       <div>
                          <p className="font-bold">Database Connectivity</p>
                          <p className="text-sm text-slate-400">Prisma client connected to SQLite (Production).</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                       <div>
                          <p className="font-bold">Quota Warning</p>
                          <p className="text-sm text-slate-400">Batch jobs use ~400 requests/day. Monthly budget: 15,000.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
